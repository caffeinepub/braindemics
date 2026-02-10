# Specification

## Summary
**Goal:** Ensure the Demo/Preview Mode role switcher dropdown and the Training Visit create/edit form container use solid white backgrounds in light mode, while keeping existing dark-mode styling intact.

**Planned changes:**
- Update the Demo/Preview Mode role switcher SelectTrigger and opened dropdown surface to render with a solid white background in light mode only (no transparency), without changing role-switching behavior.
- Update the Training Visits Log Visit and Edit Training Visit dialog form container to render with a solid white background in light mode only (no transparency), preserving existing dark-mode tokens and behavior.
- Limit styling changes to the relevant pages/components and avoid modifying immutable UI component files or introducing global background changes.

**User-visible outcome:** In light mode, the Demo/Preview role switcher and Training Visit form dialogs appear on solid white surfaces for improved readability, while dark mode continues to look and behave as before.
