import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Runtime "mo:core/Runtime";

// Specify the migration module in the with-clause

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

  public type OutstandingAmount = {
    schoolId : Text;
    amount : Nat;
    timestamp : Int;
  };

  public type PackingClass = {
    #preSchool;
    #class1;
    #class2;
    #class3;
    #class4;
    #class5;
  };

  module PackingClass {
    public func toText(pClass : PackingClass) : Text {
      switch (pClass) {
        case (#preSchool) { "Pre-School" };
        case (#class1) { "Class 1" };
        case (#class2) { "Class 2" };
        case (#class3) { "Class 3" };
        case (#class4) { "Class 4" };
        case (#class5) { "Class 5" };
      };
    };
  };

  public type PackingTheme = {
    #themeA;
    #themeB;
    #themeC;
    #themeD;
    #themeE;
  };

  module PackingTheme {
    public func toText(theme : PackingTheme) : Text {
      switch (theme) {
        case (#themeA) { "Theme A" };
        case (#themeB) { "Theme B" };
        case (#themeC) { "Theme C" };
        case (#themeD) { "Theme D" };
        case (#themeE) { "Theme E" };
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

  public type PackingCount = {
    classType : PackingClass;
    theme : PackingTheme;
    totalCount : Nat;
    packedCount : Nat;
    addOnCount : Nat;
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

  // Extended types for consolidated school details
  public type SectionMetadata = {
    section : Text;
    lastUpdatedBy : ?Principal;
    lastUpdatedByName : Text;
    lastUpdatedTimestamp : ?Int;
  };

  public type ConsolidatedSchoolModuleData = {
    school : School;
    outstandingAmount : Nat;
    packingStatus : ?PackingStatus;
    packingCounts : [PackingCount];
    trainingVisits : [TrainingVisit];
    academicQueries : [AcademicQuery];
    sectionMetadata : [SectionMetadata];
    lastActionByModule : [(Text, ?Principal, Text, ?Int)];
  };

  public type AcademicQueryExtended = {
    id : Text;
    schoolId : Text;
    raisedBy : Principal;
    queries : Text;
    response : ?Text;
    status : { #open; #resolved };
    createdTimestamp : Int;
    lastUpdateTimestamp : Int;
    lastUpdatedByName : Text;
  };

  // ============================================================================
  // PERSISTENT STORAGE
  // ============================================================================

  let schools = Map.empty<Text, School>();
  let staffProfiles = Map.empty<Principal, StaffProfile>();
  let outstandingAmounts = Map.empty<Text, OutstandingAmount>();
  let packingCounts = Map.empty<Text, PackingCount>();
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
  // CONSOLIDATED SCHOOL DETAILS FOR ADMIN
  // ============================================================================

  func getLastUpdateForSection(schoolId : Text, moduleName : Text) : ?AuditLog {
    let logs = auditLogs.values().toArray();

    let matchingLogs = logs.filter(
      func(log) {
        log.entityId == schoolId and log.entityType == moduleName;
      }
    );

    if (matchingLogs.size() == 0) { null } else {
      ?matchingLogs[0];
    };
  };

  func getLastActionByModule(schoolId : Text) : [(Text, ?Principal, Text, ?Int)] {
    let modules = [
      "School",
      "OutstandingAmount",
      "PackingStatus",
      "PackingCount",
      "TrainingVisit",
      "AcademicQuery",
    ];

    modules.map(
      func(moduleName) {
        let lastUpdate = getLastUpdateForSection(schoolId, moduleName);
        switch (lastUpdate) {
          case (null) {
            (moduleName, null, "", null);
          };
          case (?log) {
            (moduleName, ?log.initiator, getUserName(log.initiator), ?log.timestamp);
          };
        };
      }
    );
  };

  func getUserName(principal : Principal) : Text {
    switch (staffProfiles.get(principal)) {
      case (null) { "Unknown" };
      case (?profile) { profile.fullName };
    };
  };

  func getSectionMetadata(schoolId : Text, section : Text) : SectionMetadata {
    switch (getLastUpdateForSection(schoolId, section)) {
      case (?log) {
        {
          section;
          lastUpdatedBy = ?log.initiator;
          lastUpdatedByName = getUserName(log.initiator);
          lastUpdatedTimestamp = ?log.timestamp;
        };
      };
      case (null) {
        {
          section;
          lastUpdatedBy = null;
          lastUpdatedByName = "";
          lastUpdatedTimestamp = null;
        };
      };
    };
  };

  public query ({ caller }) func getConsolidatedSchoolDetails(schoolId : Text) : async ?ConsolidatedSchoolModuleData {
    requireAdmin(caller);

    switch (schools.get(schoolId)) {
      case (null) { null };
      case (?school) {
        let outstanding = switch (outstandingAmounts.get(schoolId)) {
          case (null) { 0 };
          case (?amount) { amount.amount };
        };

        let packingStatus = packingStatuses.get(schoolId);

        let packingCountsArray = packingCounts.values().toArray();
        let filteredPackingCounts = packingCountsArray.filter(
          func(count) {
            count.classType == #preSchool or
            count.classType == #class1 or
            count.classType == #class2 or
            count.classType == #class3 or
            count.classType == #class4 or
            count.classType == #class5
          }
        );

        let trainingArray = trainingVisits.values().toArray();
        let filteredTraining = trainingArray.filter(func(visit) { visit.schoolId == schoolId });

        let academicArray = academicQueries.values().toArray();
        let filteredAcademic = academicArray.filter(func(queries) { queries.schoolId == schoolId });

        let sectionMetadata : [SectionMetadata] = [
          getSectionMetadata(schoolId, "School"),
          getSectionMetadata(schoolId, "OutstandingAmount"),
          getSectionMetadata(schoolId, "PackingStatus"),
          getSectionMetadata(schoolId, "PackingCount"),
          getSectionMetadata(schoolId, "TrainingVisit"),
          getSectionMetadata(schoolId, "AcademicQuery"),
        ];

        let lastActionByModule = getLastActionByModule(schoolId);

        ?{
          school;
          outstandingAmount = outstanding;
          packingStatus;
          packingCounts = filteredPackingCounts;
          trainingVisits = filteredTraining;
          academicQueries = filteredAcademic;
          sectionMetadata;
          lastActionByModule;
        };
      };
    };
  };

  public query ({ caller }) func getAcademicQueriesBySchoolWithMetadata(schoolId : Text) : async [AcademicQueryExtended] {
    requireAdmin(caller);

    let filtered = academicQueries.values().filter(
      func(q) { q.schoolId == schoolId }
    );

    let extended = filtered.map(
      func(q) {
        {
          q with
          lastUpdatedByName = getLastUpdatedName(q.id, "AcademicQuery");
        };
      }
    );

    extended.toArray();
  };

  func getLastUpdatedName(entityId : Text, entityType : Text) : Text {
    let logs = auditLogs.values().toArray();

    switch (logs.find(
      func(log) { log.entityId == entityId and log.entityType == entityType }
    )) {
      case (null) { "Unknown" };
      case (?log) { getUserName(log.initiator) };
    };
  };

  func getLastEntityUpdateForSection(schoolId : Text, section : Text) : ?AuditLog {
    let logs = auditLogs.values().toArray();

    let matchingLogs = logs.filter(
      func(log) {
        log.entityId == schoolId and log.entityType == section;
      }
    );

    if (matchingLogs.size() == 0) { null } else {
      ?matchingLogs[0];
    };
  };

  // ============================================================================
  // USER PROFILE FUNCTIONS (Required by frontend)
  // ============================================================================

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized staff can access profiles");
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

    // Automatically grant minimum required permission for user profile endpoints
    AccessControl.assignRole(accessControlState, caller, principal, #user);

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
  // REPAIR OPERATION (Admin only)
  // ============================================================================

  public shared ({ caller }) func repairStaffProfilePermissions() : async Nat {
    requireAdmin(caller);

    var repairedCount : Nat = 0;

    for ((principal, profile) in staffProfiles.entries()) {
      // Check if the staff member already has at least #user permission
      let hasUserPermission = AccessControl.hasPermission(accessControlState, principal, #user);

      if (not hasUserPermission) {
        // Grant the minimum required #user permission
        AccessControl.assignRole(accessControlState, caller, principal, #user);
        repairedCount += 1;
      };
    };

    if (repairedCount > 0) {
      logAudit(
        caller,
        "REPAIR_STAFF_PERMISSIONS",
        "Staff",
        "bulk",
        "Backfilled missing permissions for " # repairedCount.toText() # " staff profiles"
      );
    };

    repairedCount;
  };

  // ============================================================================
  // SCHOOL MANAGEMENT (Admin + Marketing, read access for others)
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
    requireAnyRole(caller, [#admin, #marketing]);

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
    requireAnyRole(caller, [#admin, #marketing]);

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
  // OUTSTANDING AMOUNTS (Admin sets, Marketing/Accounts view)
  // ============================================================================

  public shared ({ caller }) func setOutstandingAmount(schoolId : Text, amount : Nat) : async () {
    requireAdmin(caller);

    if (not schools.containsKey(schoolId)) {
      Runtime.trap("School not found");
    };

    let outstanding : OutstandingAmount = {
      schoolId;
      amount;
      timestamp = Time.now();
    };

    outstandingAmounts.add(schoolId, outstanding);

    logAudit(
      caller,
      "SET_OUTSTANDING_AMOUNT",
      "OutstandingAmount",
      schoolId,
      "Set outstanding amount: " # amount.toText()
    );
  };

  public query ({ caller }) func getOutstandingAmount(schoolId : Text) : async Nat {
    requireAnyRole(caller, [#admin, #marketing, #accounts]);
    switch (outstandingAmounts.get(schoolId)) {
      case (null) { 0 };
      case (?outstanding) { outstanding.amount };
    };
  };

  public query ({ caller }) func hasOutstandingAmount(schoolId : Text) : async Bool {
    requireAnyRole(caller, [#admin, #marketing, #accounts]);
    outstandingAmounts.containsKey(schoolId);
  };

  public query ({ caller }) func getOutstandingAmountsBySchoolIds(schoolIds : [Text]) : async [(Text, Nat)] {
    requireAnyRole(caller, [#admin, #marketing, #accounts]);
    schoolIds.map(
      func(schoolId) {
        let amount = switch (outstandingAmounts.get(schoolId)) {
          case (null) { 0 };
          case (?outstanding) { outstanding.amount };
        };
        (schoolId, amount);
      }
    );
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

  public shared ({ caller }) func createOrUpdatePackingCount(
    schoolId : Text,
    pClass : PackingClass,
    theme : PackingTheme,
    totalCount : Nat,
    packedCount : Nat,
    addOnCount : Nat,
  ) : async () {
    requireRole(caller, #packing);

    if (not schools.containsKey(schoolId)) {
      Runtime.trap("School not found");
    };

    let key = schoolId # "_" # PackingClass.toText(pClass) # "_" # PackingTheme.toText(theme);
    let now = Time.now();

    let count : PackingCount = switch (packingCounts.get(key)) {
      case (null) {
        {
          classType = pClass;
          theme;
          totalCount;
          packedCount;
          addOnCount;
          createdTimestamp = now;
          lastUpdateTimestamp = now;
        };
      };
      case (?existing) {
        {
          existing with
          totalCount;
          packedCount;
          addOnCount;
          lastUpdateTimestamp = now;
        };
      };
    };

    packingCounts.add(key, count);

    logAudit(
      caller,
      "UPDATE_PACKING_COUNT",
      "PackingCount",
      schoolId,
      "Updated count for class " # PackingClass.toText(pClass) # " and theme " # PackingTheme.toText(theme)
    );
  };

  public query ({ caller }) func getPackingStatus(schoolId : Text) : async PackingStatus {
    requireAnyRole(caller, [#packing, #marketing, #accounts]);
    switch (packingStatuses.get(schoolId)) {
      case (null) { Runtime.trap("Packing status not found") };
      case (?status) { status };
    };
  };

  public query ({ caller }) func getPackingCount(
    schoolId : Text,
    pClass : PackingClass,
    theme : PackingTheme,
  ) : async PackingCount {
    requireAnyRole(caller, [#packing, #marketing, #accounts]);
    let key = schoolId # "_" # PackingClass.toText(pClass) # "_" # PackingTheme.toText(theme);

    switch (packingCounts.get(key)) {
      case (null) { Runtime.trap("Packing count not found") };
      case (?count) { count };
    };
  };

  public query ({ caller }) func getPackingCountsBySchool(schoolId : Text) : async [PackingCount] {
    requireAnyRole(caller, [#packing, #marketing, #accounts]);
    let filtered = packingCounts.values().filter(
      func(count) {
        count.classType == #preSchool or
        count.classType == #class1 or
        count.classType == #class2 or
        count.classType == #class3 or
        count.classType == #class4 or
        count.classType == #class5
      }
    );
    filtered.toArray();
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

  // Added new updateTrainingVisit operation
  public shared ({ caller }) func updateTrainingVisit(
    id : Text,
    schoolId : Text,
    visitDate : Int,
    reason : Text,
    visitingPerson : Text,
    contactPersonMobile : Text,
    observations : Text,
    classroomObservationProof : ?Storage.ExternalBlob,
  ) : async () {
    requireRole(caller, #training);

    if (not schools.containsKey(schoolId)) {
      Runtime.trap("School not found");
    };

    switch (trainingVisits.get(id)) {
      case (null) { Runtime.trap("Training visit record not found") };
      case (?existing) {
        let updatedVisit : TrainingVisit = {
          existing with
          schoolId;
          visitDate;
          reason;
          visitingPerson;
          contactPersonMobile;
          observations;
          classroomObservationProof;
        };
        trainingVisits.add(id, updatedVisit);

        logAudit(
          caller,
          "UPDATE_TRAINING_VISIT",
          "TrainingVisit",
          id,
          "Updated training visit for school " # schoolId # " by " # visitingPerson
        );
      };
    };
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
  // ACADEMIC QUERIES (Training creates, Academic responds)
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
      "CREATE_ACADEMIC_QUERIES",
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
          "RESPOND_ACADEMIC_QUERIES",
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
