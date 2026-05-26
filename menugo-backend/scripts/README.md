soft_delete_roles.js — Safe script to soft-delete users by role

Usage:

- Make sure your backend config/env is set to point to the database.
- Run from project root:

    node ./menugo-backend/scripts/soft_delete_roles.js

Behavior:

- Targets roles: `restaurant_admin`, `waiter` (can be modified in the script)
- Skips emails listed in `EXCLUDE_EMAILS` inside the script
- Skips `restaurant_admin` users who still own restaurants (to avoid orphaning)
- For each deleted user: sets `deleted_at`, sets `is_active=false`, and revokes `UserSession` entries
- Prints a summary at the end

Important:

- This performs soft-deletes only. Back up your DB before running on production.
