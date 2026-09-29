# Deployment Guide — Trattoria Gusto on Yegara Host cPanel

Target: https://trattoria.kaldisbunnaet.com
Server: Yegara Host cPanel (`kaldisbunnaet.com`)
Stack: Laravel 12 + React (Inertia / Vite)
Repo: https://github.com/tsina-tefe/trattoria_gusto
Project folder on server: `~/trattoria-gusto/`
Document root: `/home/kaldisbp/trattoria-gusto/public`

## Critical rules

- Live site `kaldisbunnaet.com` runs from `~/public_html/`. Do not touch that folder.
- Test site `test.kaldisbunnaet.com` runs from `~/test.kaldis-system/`. Do not touch that folder.
- Do not reuse SSH keys, database credentials, or GitHub secrets from those projects. Create new ones for Trattoria.
- The new project must live at `~/trattoria-gusto/`, completely outside both existing project folders.

## Fixes applied to the original plan

1. **Clone the repo before creating the subdomain.** If cPanel creates `~/trattoria-gusto` first, `git clone` into that path fails because the directory already exists.
2. **PHP must be 8.2+**, not just “8.x”. `composer.json` requires `^8.2`. Set MultiPHP for the subdomain **and** use that same binary in Terminal.
3. **Laravel 12 env keys.** Use `CACHE_STORE`, `BROADCAST_CONNECTION`, and `QUEUE_CONNECTION`. The old `CACHE_DRIVER` / `BROADCAST_DRIVER` names are ignored.
4. **First deploy must build the frontend.** `public/build` is gitignored. Without `npm ci && npm run build` (or the GitHub Actions SCP step), CSS/JS 404.
5. **Delete `public/hot` on the server.** If that file exists, Laravel tries to load the Vite dev server and assets fail.
6. **Do not use `git pull` in CI.** `git fetch` + `git reset --hard origin/main` updates code without failing on a dirty tree. Gitignored `.env` is kept.
7. **SCP the whole `public/build` folder.** `public/build/*` with `strip_components: 2` flattens hashed files out of `assets/` and breaks Vite.
8. **Route closures were converted to `PageController`** so `php artisan route:cache` works.
9. **Do not run `php artisan db:seed` on production as-is.** `DatabaseSeeder` creates `admin@example.com` / `password`. Seed permissions/roles separately, then create an admin with a strong password.
10. **`.env.example` is required.** `.github/workflows/tests.yml` copies it on every push to `main`.

---

## Step 1 — Clean the repo (already done in git)

Debug dumps were removed from the repo root and gitignored. `.env.example`, `.github/workflows/deploy.yml`, and this guide were added.

---

## Step 2 — Open cPanel Terminal and verify tools

Do this **before** creating the subdomain.

```bash
php -v          # Must be 8.2 or higher
composer --version
node -v         # Must be 20.x
npm -v
git --version
```

If PHP is 8.1 or lower, switch CLI to 8.2+ (names vary by host):

```bash
ls /usr/local/bin/ea-php8* 2>/dev/null
# then, for example:
export PATH="/opt/cpanel/ea-php82/root/usr/bin:$PATH"
php -v
```

If Node/npm are missing:

```bash
source ~/.bashrc
nvm use 20
node -v
```

Confirm you are **not** in `public_html` or `test.kaldis-system`:

```bash
pwd
ls ~
```

---

## Step 3 — Generate a NEW SSH deploy key (do not reuse existing)

```bash
ssh-keygen -t ed25519 -C "trattoria-deploy" -f ~/.ssh/trattoria_deploy -N ""
cat ~/.ssh/trattoria_deploy.pub
```

Add the **public** key to GitHub:

1. https://github.com/tsina-tefe/trattoria_gusto → Settings → Deploy keys → Add deploy key
2. Title: `Yegara cPanel - Trattoria`
3. Paste the public key
4. Leave **Allow write access** unchecked

Configure SSH on the server (append only; do not overwrite other Host entries):

```bash
cat >> ~/.ssh/config << 'EOF'

Host github-trattoria
    HostName github.com
    User git
    IdentityFile ~/.ssh/trattoria_deploy
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new
EOF
chmod 600 ~/.ssh/config ~/.ssh/trattoria_deploy
```

Test:

```bash
ssh -T github-trattoria
```

Expected: `Hi tsina-tefe/trattoria_gusto! You've successfully authenticated...`

---

## Step 4 — Clone the repo (before creating the subdomain)

```bash
cd ~
# Abort if this prints anything other than "does not exist"
ls ~/trattoria-gusto 2>/dev/null && echo "STOP: folder already exists" || echo "does not exist"
git clone git@github-trattoria:tsina-tefe/trattoria_gusto.git trattoria-gusto
cd ~/trattoria-gusto
ls
```

If cPanel already created an **empty** `~/trattoria-gusto` stub:

```bash
cd ~/trattoria-gusto
ls -A   # should be empty or only a default index.html
git clone git@github-trattoria:tsina-tefe/trattoria_gusto.git .
```

Do **not** clone into `public_html` or `test.kaldis-system`.

---

## Step 5 — Create the subdomain in cPanel

cPanel → **Domains** → **Create A New Domain**

- Domain: `trattoria.kaldisbunnaet.com`
- Document root: `/home/kaldisbp/trattoria-gusto/public`
- Save

Then cPanel → **MultiPHP Manager**:

- Select `trattoria.kaldisbunnaet.com`
- PHP version **8.2 or 8.3** (not 8.0/8.1)
- Enable typical Laravel extensions: `mbstring`, `xml`, `pdo`, `pdo_mysql`, `curl`, `openssl`, `tokenizer`, `json`, `fileinfo`, `bcmath`

---

## Step 6 — Create the database in cPanel

cPanel → **MySQL Databases**

1. Create database: `trattoria_db` → actual name `kaldisbp_trattoria_db`
2. Create user: `trattoria_user` → actual name `kaldisbp_trattoria_user` → generate a strong password
3. Add the user to the database with **ALL PRIVILEGES**

Do not reuse the live or test database users.

---

## Step 7 — Create `.env`

```bash
cd ~/trattoria-gusto
cp .env.example .env
nano .env
```

Use **these Laravel 12 keys** (not the old `CACHE_DRIVER` / `BROADCAST_DRIVER` names):

```env
APP_NAME="Trattoria Gusto"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://trattoria.kaldisbunnaet.com

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=kaldisbp_trattoria_db
DB_USERNAME=kaldisbp_trattoria_user
DB_PASSWORD=PASTE_THE_PASSWORD_HERE

BROADCAST_CONNECTION=log
CACHE_STORE=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MAIL_MAILER=log
MAIL_FROM_ADDRESS="noreply@trattoria.kaldisbunnaet.com"
MAIL_FROM_NAME="${APP_NAME}"

VITE_APP_NAME="${APP_NAME}"
```

Leave `APP_KEY` blank until the next step. File cache/session/queue avoid extra Redis setup on cPanel.

---

## Step 8 — First manual deployment

```bash
cd ~/trattoria-gusto
chmod -R 775 storage bootstrap/cache
composer install --no-dev --optimize-autoloader --no-interaction
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force --class=PermissionSeeder
php artisan db:seed --force --class=RoleSeeder
php artisan db:seed --force --class=ExpenseItemSeeder
php artisan db:seed --force --class=EvaluationCategorySeeder
rm -f public/hot
npm ci
npm run build
php artisan storage:link || true
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Create the first admin **with a strong password** (do not use `DatabaseSeeder`; it would create `admin@example.com` / `password`):

```bash
php artisan tinker
```

```php
$branch = App\Models\Branch::firstOrCreate(
    ['branch_code' => 'HQ-001'],
    ['name' => 'Head Office', 'status' => 'active', 'is_sales_generating' => false]
);
$department = App\Models\Department::firstOrCreate(
    ['name' => 'Administration'],
    ['is_active' => true, 'is_active_on_weekly_budget' => false]
);
$position = App\Models\Position::firstOrCreate(
    ['title' => 'System Administrator'],
    ['level' => 'Team']
);
$employee = App\Models\Employee::firstOrCreate(
    ['employee_code' => 'EMP-0001'],
    [
        'first_name' => 'Admin',
        'last_name' => 'User',
        'email' => 'admin@trattoria.kaldisbunnaet.com',
        'gender' => 'male',
        'hire_date' => now()->toDateString(),
        'branch_id' => $branch->id,
        'department_id' => $department->id,
        'position_id' => $position->id,
        'status' => 'active',
    ]
);
$user = App\Models\User::firstOrCreate(
    ['email' => 'admin@trattoria.kaldisbunnaet.com'],
    [
        'name' => 'Admin User',
        'employee_id' => $employee->id,
        'password' => bcrypt('REPLACE_WITH_A_STRONG_PASSWORD'),
    ]
);
$user->assignRole('Administrator');
```

If a migration fails, it is usually foreign-key order or a dropped column. Fix the migration locally, push, `git fetch && git reset --hard origin/main` on the server, and re-run `php artisan migrate --force`.

---

## Step 9 — Generate a NEW SSH key for GitHub Actions (do not reuse existing)

This key lets GitHub Actions log in as `kaldisbp`. It is a **different** key from the GitHub deploy key in Step 3.

```bash
ssh-keygen -t ed25519 -C "trattoria-github-actions" -f ~/.ssh/trattoria_actions -N ""
cat ~/.ssh/trattoria_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys ~/.ssh/trattoria_actions
cat ~/.ssh/trattoria_actions
```

Copy the **entire private key**, including the `BEGIN` / `END` lines.

Get the server IP:

```bash
curl -s ifconfig.me; echo
```

Add these **4 new secrets** in https://github.com/tsina-tefe/trattoria_gusto → Settings → Secrets and variables → Actions:

| Secret name       | Value                                      |
|-------------------|--------------------------------------------|
| `SSH_HOST`        | Server IP from `curl -s ifconfig.me`       |
| `SSH_USERNAME`    | `kaldisbp`                                 |
| `SSH_PRIVATE_KEY` | Private key from `cat ~/.ssh/trattoria_actions` |
| `SSH_PORT`        | `22`                                       |

These secrets belong to the `trattoria_gusto` repo only. Create them even if another repo already has similarly named secrets.

The Actions key is a new key, but it still logs in as `kaldisbp`, so it *could* reach other home folders. The workflow only `cd`s into `~/trattoria-gusto`. Never change it to touch `public_html` or `test.kaldis-system`.

---

## Step 10 — GitHub Actions workflow

`.github/workflows/deploy.yml` is already in the repo. After the secrets in Step 9 exist, re-run the latest workflow (or push a tiny commit) so it can SSH.

What it does on every push to `main`:

1. Builds Vite assets on GitHub (Node 20)
2. SSHs in, `git fetch` + `reset --hard origin/main`, composer, migrate, caches
3. SCPs `public/build` to `/home/kaldisbp/trattoria-gusto/public/build`

The first run **will fail** if secrets are missing. That is expected. Add secrets, then re-run.

---

## Step 11 — SSL certificate

cPanel → **SSL/TLS Status** (or SSL/TLS Certificates → Status)

1. Find `trattoria.kaldisbunnaet.com`
2. Click **Run AutoSSL**
3. Wait 2–5 minutes. If it fails, DNS may not have propagated; wait 30 minutes and retry.

---

## Step 12 — Verify

- https://trattoria.kaldisbunnaet.com loads the login page
- No 404s for JS/CSS in browser DevTools (Network tab)
- SSL padlock is visible
- GitHub Actions deploy workflow is green
- A small change pushed to `main` appears on the live subdomain within a couple of minutes
- https://kaldisbunnaet.com still works (untouched)
- https://test.kaldisbunnaet.com still works (untouched)

If CSS/JS 404: confirm `public/build/manifest.json` exists on the server and `public/hot` does not.

```bash
ls ~/trattoria-gusto/public/build/manifest.json
ls ~/trattoria-gusto/public/hot   # must not exist
```
