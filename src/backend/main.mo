import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Runtime "mo:core/Runtime";

actor {
  include MixinStorage();

  // Authorization mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ============================================================================
  // TYPE DEFINITIONS
  // ============================================================================

  public type School = {
    id : Text;
    name : Text;
    address : Text;
    city : Text;
    state : Text;
    contactPerson : Text;
    contactNumber : Text;
    email : Text;
    website : ?Text;
    studentCount : Nat;
    createdTimestamp : Int;
    lastUpdateTimestamp : Int;
  };

  public type StaffRole = {
    #marketing;
    #accounts;
    #packing;
    #training;
    #academic;
    #admin;
  };

  module StaffRole {
    public func toText(role : StaffRole) : Text {
      switch (role) {
        case (#marketing) { "marketing" };
        case (#accounts) { "accounts" };
        case (#packing) { "packing" };
        case (#training) { "training" };
        case (#academic) { "academic" };
        case (#admin) { "admin" };
      };
    };
  };

  public type StaffProfile = {
    principal : Principal;
    fullName : Text;
    role : StaffRole;
    department : Text;
    contactNumber : Text;
    email : Text;
    createdTimestamp : Int;
  };

  public type UserProfile = {
    fullName : Text;
    role : StaffRole;
    department : Text;
    contactNumber : Text;
    email : Text;
  };

  public type Payment = {
    id : Text;
    schoolId : Text;
    amount : Nat;
    dueDate : Int;
    paid : Bool;
    paymentProof : ?Storage.ExternalBlob;
    createdTimestamp : Int;
    lastUpdateTimestamp : Int;
  };

  public type PackingStatus = {
    schoolId : Text;
    kitCount : Nat;
    addOnCount : Nat;
    packed : Bool;
    dispatched : Bool;
    dispatchDetails : ?Text;
    currentTheme : Text;
    createdTimestamp : Int;
    lastUpdateTimestamp : Int;
  };

  public type TrainingVisit = {
    id : Text;
    schoolId : Text;
    visitDate : Int;
    reason : Text;
    visitingPerson : Text;
    contactPersonMobile : Text;
    observations : Text;
    classroomObservationProof : ?Storage.ExternalBlob;
    createdTimestamp : Int;
  };

  public type AcademicQuery = {
    id : Text;
    schoolId : Text;
    raisedBy : Principal;
    queries : Text;
    response : ?Text;
    status : { #open; #resolved };
    createdTimestamp : Int;
    lastUpdateTimestamp : Int;
  };

  public type AuditLog = {
    id : Text;
    initiator : Principal;
    action : Text;
    entityType : Text;
    entityId : Text;
    timestamp : Int;
    details : Text;
  };

  module AuditLog {
    public func compare(a : AuditLog, b : AuditLog) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  public type FilterCriteria = {
    filterInitiator : ?Principal;
    filterEntityType : ?Text;
    filterEntityId : ?Text;
    filterDateRange : ?(Int, Int);
  };

  // ============================================================================
  // PERSISTENT STORAGE
  // ============================================================================

  let schools = Map.empty<Text, School>();
  let staffProfiles = Map.empty<Principal, StaffProfile>();
  let payments = Map.empty<Text, Payment>();
  let packingStatuses = Map.empty<Text, PackingStatus>();
  let trainingVisits = Map.empty<Text, TrainingVisit>();
  let academicQueries = Map.empty<Text, AcademicQuery>();
  let auditLogs = Map.empty<Text, AuditLog>();

  var auditLogCounter : Nat = 0;
  var queriesCounter : Nat = 0;
  var visitCounter : Nat = 0;
  var paymentCounter : Nat = 0;

  // ============================================================================
  // AUTHORIZATION HELPERS
  // ============================================================================

  func getStaffRole(principal : Principal) : ?StaffRole {
    switch (staffProfiles.get(principal)) {
      case (null) { null };
      case (?profile) { ?profile.role };
    };
  };

  func requireStaffRole(caller : Principal) : StaffRole {
    switch (getStaffRole(caller)) {
      case (null) { Runtime.trap("Unauthorized: No staff profile found") };
      case (?role) { role };
    };
  };

  func requireAdmin(caller : Principal) {
    let role = requireStaffRole(caller);
    if (role != #admin) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func requireRole(caller : Principal, allowedRole : StaffRole) {
    let role = requireStaffRole(caller);
    if (role != allowedRole and role != #admin) {
      Runtime.trap("Unauthorized: Insufficient permissions for this action");
    };
  };

  func requireAnyRole(caller : Principal, allowedRoles : [StaffRole]) {
    let role = requireStaffRole(caller);
    if (role == #admin) {
      return;
    };
    let hasRole = allowedRoles.find(func(r) { r == role });
    switch (hasRole) {
      case (null) { Runtime.trap("Unauthorized: Insufficient permissions for this action") };
      case (?_) {};
    };
  };

  // ============================================================================
  // AUDIT LOGGING
  // ============================================================================

  func logAudit(initiator : Principal, action : Text, entityType : Text, entityId : Text, details : Text) {
    auditLogCounter += 1;
    let id = auditLogCounter.toText();
    let entry : AuditLog = {
      id;
      initiator;
      action;
      entityType;
      entityId;
      timestamp = Time.now();
      details;
    };
    auditLogs.add(id, entry);
  };

  // ============================================================================
  // USER PROFILE FUNCTIONS (Required by frontend)
  // ============================================================================

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (staffProfiles.get(caller)) {
      case (null) { null };
      case (?profile) {
        ?{
          fullName = profile.fullName;
          role = profile.role;
          department = profile.department;
          contactNumber = profile.contactNumber;
          email = profile.email;
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (staffProfiles.get(user)) {
      case (null) { null };
      case (?profile) {
        ?{
          fullName = profile.fullName;
          role = profile.role;
          department = profile.department;
          contactNumber = profile.contactNumber;
          email = profile.email;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    switch (staffProfiles.get(caller)) {
      case (null) {
        Runtime.trap("Staff profile must be created by admin first");
      };
      case (?existingProfile) {
        let updatedProfile : StaffProfile = {
          existingProfile with
          fullName = profile.fullName;
          department = profile.department;
          contactNumber = profile.contactNumber;
          email = profile.email;
        };
        staffProfiles.add(caller, updatedProfile);
      };
    };
  };

  // ============================================================================
  // STAFF MANAGEMENT (Admin only)
  // ============================================================================

  public shared ({ caller }) func createStaffProfile(
    principal : Principal,
    fullName : Text,
    role : StaffRole,
    department : Text,
    contactNumber : Text,
    email : Text,
  ) : async () {
    requireAdmin(caller);

    if (staffProfiles.containsKey(principal)) {
      Runtime.trap("Staff profile already exists for this principal");
    };

    let profile : StaffProfile = {
      principal;
      fullName;
      role;
      department;
      contactNumber;
      email;
      createdTimestamp = Time.now();
    };

    staffProfiles.add(principal, profile);

    logAudit(
      caller,
      "CREATE_STAFF",
      "Staff",
      principal.toText(),
      "Created staff profile for " # fullName # " with role " # StaffRole.toText(role)
    );
  };

  public shared ({ caller }) func updateStaffProfile(
    principal : Principal,
    fullName : Text,
    role : StaffRole,
    department : Text,
    contactNumber : Text,
    email : Text,
  ) : async () {
    requireAdmin(caller);

    switch (staffProfiles.get(principal)) {
      case (null) { Runtime.trap("Staff profile not found") };
      case (?existing) {
        let updated : StaffProfile = {
          existing with
          fullName;
          role;
          department;
          contactNumber;
          email;
        };
        staffProfiles.add(principal, updated);

        logAudit(
          caller,
          "UPDATE_STAFF",
          "Staff",
          principal.toText(),
          "Updated staff profile for " # fullName
        );
      };
    };
  };

  public query ({ caller }) func getStaffProfile(principal : Principal) : async StaffProfile {
    requireAdmin(caller);
    switch (staffProfiles.get(principal)) {
      case (null) { Runtime.trap("Staff profile not found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func listAllStaff() : async [StaffProfile] {
    requireAdmin(caller);
    staffProfiles.values().toArray();
  };

  // ============================================================================
  // SCHOOL MANAGEMENT (Marketing + read access for others)
  // ============================================================================

  public shared ({ caller }) func createSchool(
    id : Text,
    name : Text,
    address : Text,
    city : Text,
    state : Text,
    contactPerson : Text,
    contactNumber : Text,
    email : Text,
    website : ?Text,
    studentCount : Nat,
  ) : async () {
    requireRole(caller, #marketing);

    if (schools.containsKey(id)) {
      Runtime.trap("School with this ID already exists");
    };

    let now = Time.now();
    let school : School = {
      id;
      name;
      address;
      city;
      state;
      contactPerson;
      contactNumber;
      email;
      website;
      studentCount;
      createdTimestamp = now;
      lastUpdateTimestamp = now;
    };

    schools.add(id, school);

    logAudit(
      caller,
      "CREATE_SCHOOL",
      "School",
      id,
      "Created school: " # name
    );
  };

  public shared ({ caller }) func updateSchool(
    id : Text,
    name : Text,
    address : Text,
    city : Text,
    state : Text,
    contactPerson : Text,
    contactNumber : Text,
    email : Text,
    website : ?Text,
    studentCount : Nat,
  ) : async () {
    requireRole(caller, #marketing);

    switch (schools.get(id)) {
      case (null) { Runtime.trap("School not found") };
      case (?existing) {
        let updated : School = {
          existing with
          name;
          address;
          city;
          state;
          contactPerson;
          contactNumber;
          email;
          website;
          studentCount;
          lastUpdateTimestamp = Time.now();
        };
        schools.add(id, updated);

        logAudit(
          caller,
          "UPDATE_SCHOOL",
          "School",
          id,
          "Updated school: " # name
        );
      };
    };
  };

  public query ({ caller }) func getSchool(id : Text) : async School {
    let _ = requireStaffRole(caller);
    switch (schools.get(id)) {
      case (null) { Runtime.trap("School not found") };
      case (?school) { school };
    };
  };

  public query ({ caller }) func listAllSchools() : async [School] {
    let _ = requireStaffRole(caller);
    schools.values().toArray();
  };

  // ============================================================================
  // PAYMENT MANAGEMENT (Accounts only)
  // ============================================================================

  public shared ({ caller }) func createPayment(
    schoolId : Text,
    amount : Nat,
    dueDate : Int,
  ) : async Text {
    requireRole(caller, #accounts);

    if (not schools.containsKey(schoolId)) {
      Runtime.trap("School not found");
    };

    paymentCounter += 1;
    let id = "PAY-" # paymentCounter.toText();
    let now = Time.now();

    let payment : Payment = {
      id;
      schoolId;
      amount;
      dueDate;
      paid = false;
      paymentProof = null;
      createdTimestamp = now;
      lastUpdateTimestamp = now;
    };

    payments.add(id, payment);

    logAudit(
      caller,
      "CREATE_PAYMENT",
      "Payment",
      id,
      "Created payment for school " # schoolId # ", amount: " # amount.toText()
    );

    id;
  };

  public shared ({ caller }) func updatePayment(
    id : Text,
    amount : Nat,
    dueDate : Int,
    paid : Bool,
  ) : async () {
    requireRole(caller, #accounts);

    switch (payments.get(id)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?existing) {
        let updated : Payment = {
          existing with
          amount;
          dueDate;
          paid;
          lastUpdateTimestamp = Time.now();
        };
        payments.add(id, updated);

        logAudit(
          caller,
          "UPDATE_PAYMENT",
          "Payment",
          id,
          "Updated payment, paid status: " # (if (paid) { "true" } else { "false" })
        );
      };
    };
  };

  public shared ({ caller }) func uploadPaymentProof(
    paymentId : Text,
    proof : Storage.ExternalBlob,
  ) : async () {
    requireRole(caller, #accounts);

    switch (payments.get(paymentId)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?existing) {
        let updated : Payment = {
          existing with
          paymentProof = ?proof;
          lastUpdateTimestamp = Time.now();
        };
        payments.add(paymentId, updated);

        logAudit(
          caller,
          "UPLOAD_PAYMENT_PROOF",
          "Payment",
          paymentId,
          "Uploaded payment proof"
        );
      };
    };
  };

  public query ({ caller }) func getPayment(id : Text) : async Payment {
    requireAnyRole(caller, [#accounts, #marketing]);
    switch (payments.get(id)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?payment) { payment };
    };
  };

  public query ({ caller }) func listPaymentsBySchool(schoolId : Text) : async [Payment] {
    requireAnyRole(caller, [#accounts, #marketing]);
    let filtered = payments.values().filter(func(p) { p.schoolId == schoolId });
    filtered.toArray();
  };

  // ============================================================================
  // PACKING MANAGEMENT (Packing only)
  // ============================================================================

  public shared ({ caller }) func createOrUpdatePackingStatus(
    schoolId : Text,
    kitCount : Nat,
    addOnCount : Nat,
    packed : Bool,
    dispatched : Bool,
    dispatchDetails : ?Text,
    currentTheme : Text,
  ) : async () {
    requireRole(caller, #packing);

    if (not schools.containsKey(schoolId)) {
      Runtime.trap("School not found");
    };

    let now = Time.now();
    let action = if (packingStatuses.containsKey(schoolId)) { "UPDATE" } else { "CREATE" };

    let status : PackingStatus = switch (packingStatuses.get(schoolId)) {
      case (null) {
        {
          schoolId;
          kitCount;
          addOnCount;
          packed;
          dispatched;
          dispatchDetails;
          currentTheme;
          createdTimestamp = now;
          lastUpdateTimestamp = now;
        };
      };
      case (?existing) {
        {
          existing with
          kitCount;
          addOnCount;
          packed;
          dispatched;
          dispatchDetails;
          currentTheme;
          lastUpdateTimestamp = now;
        };
      };
    };

    packingStatuses.add(schoolId, status);

    logAudit(
      caller,
      action # "_PACKING_STATUS",
      "PackingStatus",
      schoolId,
      "Packing status updated: packed=" # (if (packed) { "true" } else { "false" }) # 
      ", dispatched=" # (if (dispatched) { "true" } else { "false" })
    );
  };

  public query ({ caller }) func getPackingStatus(schoolId : Text) : async PackingStatus {
    requireAnyRole(caller, [#packing, #marketing, #accounts]);
    switch (packingStatuses.get(schoolId)) {
      case (null) { Runtime.trap("Packing status not found") };
      case (?status) { status };
    };
  };

  public query ({ caller }) func listAllPackingStatuses() : async [PackingStatus] {
    requireAnyRole(caller, [#packing, #marketing]);
    packingStatuses.values().toArray();
  };

  // ============================================================================
  // TRAINING VISITS (Training only)
  // ============================================================================

  public shared ({ caller }) func createTrainingVisit(
    schoolId : Text,
    visitDate : Int,
    reason : Text,
    visitingPerson : Text,
    contactPersonMobile : Text,
    observations : Text,
    classroomObservationProof : ?Storage.ExternalBlob,
  ) : async Text {
    requireRole(caller, #training);

    if (not schools.containsKey(schoolId)) {
      Runtime.trap("School not found");
    };

    visitCounter += 1;
    let id = "VISIT-" # visitCounter.toText();

    let visit : TrainingVisit = {
      id;
      schoolId;
      visitDate;
      reason;
      visitingPerson;
      contactPersonMobile;
      observations;
      classroomObservationProof;
      createdTimestamp = Time.now();
    };

    trainingVisits.add(id, visit);

    logAudit(
      caller,
      "CREATE_TRAINING_VISIT",
      "TrainingVisit",
      id,
      "Created training visit for school " # schoolId # " by " # visitingPerson
    );

    id;
  };

  public query ({ caller }) func getTrainingVisit(id : Text) : async TrainingVisit {
    requireAnyRole(caller, [#training, #academic]);
    switch (trainingVisits.get(id)) {
      case (null) { Runtime.trap("Training visit not found") };
      case (?visit) { visit };
    };
  };

  public query ({ caller }) func listTrainingVisitsBySchool(schoolId : Text) : async [TrainingVisit] {
    requireAnyRole(caller, [#training, #academic]);
    let filtered = trainingVisits.values().filter(func(v) { v.schoolId == schoolId });
    filtered.toArray();
  };

  // ============================================================================
  // ACADEMIC queries (Training creates, Academic responds)
  // ============================================================================

  public shared ({ caller }) func createAcademicQuery(
    schoolId : Text,
    queries : Text,
  ) : async Text {
    requireRole(caller, #training);

    if (not schools.containsKey(schoolId)) {
      Runtime.trap("School not found");
    };

    queriesCounter += 1;
    let id = "queries-" # queriesCounter.toText();
    let now = Time.now();

    let academicQuery : AcademicQuery = {
      id;
      schoolId;
      raisedBy = caller;
      queries;
      response = null;
      status = #open;
      createdTimestamp = now;
      lastUpdateTimestamp = now;
    };

    academicQueries.add(id, academicQuery);

    logAudit(
      caller,
      "CREATE_ACADEMIC_queries",
      "AcademicQuery",
      id,
      "Created academic queries for school " # schoolId
    );

    id;
  };

  public shared ({ caller }) func respondToAcademicQuery(
    id : Text,
    response : Text,
    status : { #open; #resolved },
  ) : async () {
    requireRole(caller, #academic);

    switch (academicQueries.get(id)) {
      case (null) { Runtime.trap("Academic queries not found") };
      case (?existing) {
        let updated : AcademicQuery = {
          existing with
          response = ?response;
          status;
          lastUpdateTimestamp = Time.now();
        };
        academicQueries.add(id, updated);

        logAudit(
          caller,
          "RESPOND_ACADEMIC_queries",
          "AcademicQuery",
          id,
          "Responded to academic queries, status: " # 
          (if (status == #resolved) { "resolved" } else { "open" })
        );
      };
    };
  };

  public query ({ caller }) func getAcademicQuery(id : Text) : async AcademicQuery {
    requireAnyRole(caller, [#training, #academic]);
    switch (academicQueries.get(id)) {
      case (null) { Runtime.trap("Academic queries not found") };
      case (?queries) { queries };
    };
  };

  public query ({ caller }) func listAcademicQueriesBySchool(schoolId : Text) : async [AcademicQuery] {
    requireAnyRole(caller, [#training, #academic]);
    let filtered = academicQueries.values().filter(func(q) { q.schoolId == schoolId });
    filtered.toArray();
  };

  public query ({ caller }) func listAllAcademicQueries() : async [AcademicQuery] {
    requireAnyRole(caller, [#training, #academic]);
    academicQueries.values().toArray();
  };

  // ============================================================================
  // AUDIT LOG (Admin only)
  // ============================================================================

  public query ({ caller }) func getAuditLog(entryId : Text) : async AuditLog {
    requireAdmin(caller);
    switch (auditLogs.get(entryId)) {
      case (null) { Runtime.trap("Audit log entry not found") };
      case (?entry) { entry };
    };
  };

  public query ({ caller }) func listAllAuditLogs() : async [AuditLog] {
    requireAdmin(caller);
    let logs = auditLogs.values().toArray();
    logs.sort();
  };

  public query ({ caller }) func getFilteredAuditLogs(criteria : FilterCriteria) : async [AuditLog] {
    requireAdmin(caller);

    let filtered = auditLogs.values().filter(
      func(log) {
        let initiatorMatch = switch (criteria.filterInitiator) {
          case (null) { true };
          case (?initiator) { initiator == log.initiator };
        };
        let entityTypeMatch = switch (criteria.filterEntityType) {
          case (null) { true };
          case (?entityType) { entityType == log.entityType };
        };
        let entityIdMatch = switch (criteria.filterEntityId) {
          case (null) { true };
          case (?entityId) { entityId == log.entityId };
        };
        let dateRangeMatch = switch (criteria.filterDateRange) {
          case (null) { true };
          case (?(start, end)) {
            log.timestamp >= start and log.timestamp <= end;
          };
        };
        initiatorMatch and entityTypeMatch and entityIdMatch and dateRangeMatch;
      }
    );

    let logs = filtered.toArray();
    logs.sort();
  };
};
