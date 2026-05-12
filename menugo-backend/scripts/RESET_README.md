Reset Database (keep platform admin)
==================================

This script truncates most tables in your database and recreates a single platform admin user.

Usage
-----

1. Ensure your `menugo-backend/.env` (or environment) contains a valid DB connection:

   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

2. (Required safety) Set `FORCE_RESET=true` in env to allow the script to run.

3. Optionally set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to override defaults.

4. Run from repo root:

```bash
cd menugo-backend
node scripts/resetDatabaseKeepAdmin.js
```

Or with explicit env on one line (Windows PowerShell example):

```powershell
$env:FORCE_RESET='true'; $env:ADMIN_EMAIL='haymanotwondmagegn3@gmail.com'; $env:ADMIN_PASSWORD='Admin@123??'; node .\scripts\resetDatabaseKeepAdmin.js
```

Full wipe (remove everything including users)
------------------------------------------------

If you want to remove all users as well (complete wipe), set `FULL_RESET=true` or pass `--full`.

PowerShell example (full wipe):

```powershell
$env:FORCE_RESET='true'; $env:FULL_RESET='true'; node .\scripts\resetDatabaseKeepAdmin.js
```

Or single-line bash:

```bash
FORCE_RESET=true FULL_RESET=true node scripts/resetDatabaseKeepAdmin.js
```

WARNING: `FULL_RESET=true` will remove the platform admin too. Use only when you truly want a complete reset.

Warnings
--------

- This permanently removes data. Back up your database first.
- The script skips `SequelizeMeta`/`migrations` but otherwise truncates tables.
