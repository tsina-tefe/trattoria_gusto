# Plesk Deployment Guide - Offline-First Laravel App

## Prerequisites

Before deploying to Plesk, ensure:
- ✅ Node.js installed on Plesk server (v18 or higher)
- ✅ Composer installed on Plesk server
- ✅ PHP 8.1 or higher
- ✅ MySQL/MariaDB database
- ✅ SSL certificate (required for Service Workers/PWA)

## Important Notes for Plesk Deployment

### 1. **SSL Certificate is MANDATORY**
- Service Workers and PWA features **only work on HTTPS**
- You must have a valid SSL certificate
- Let's Encrypt is fine and free
- Without HTTPS, offline features will NOT work

### 2. **Build Assets Locally First**
- Build assets on your local machine before uploading
- Plesk servers often have limited resources for npm builds
- Upload the `public/build` folder with all assets

### 3. **Environment Configuration**
- Different `.env` settings for production
- Database credentials will change
- APP_URL must match your domain
- APP_ENV should be `production`

---

## Pre-Deployment Checklist

### Step 1: Build Assets Locally

On your local machine:

```bash
cd "C:\wamp64\www\company-system-main PWA is done\company-system-main"

# Install dependencies (if not already done)
npm install

# Build for production
npm run build

# Verify build completed
dir public\build
```

You should see:
- `public/build/manifest.json`
- `public/build/manifest.webmanifest`
- `public/build/sw.js`
- `public/build/assets/` folder with all JS/CSS files

### Step 2: Prepare Production Environment File

Create a new `.env.production` file with these settings:

```env
APP_NAME="Kaldis Coffee"
APP_ENV=production
APP_KEY=base64:YOUR_KEY_HERE
APP_DEBUG=false
APP_TIMEZONE=UTC
APP_URL=https://yourdomain.com

APP_LOCALE=en
APP_FALLBACK_LOCALE=en

LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync

CACHE_STORE=file
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

MAIL_MAILER=log

# Important for Plesk
ASSET_URL=https://yourdomain.com
```

---

## Deployment Steps

### Step 1: Upload Files to Plesk

#### Option A: Via Git (Recommended)

1. **Push your code to Git repository** (GitHub, GitLab, Bitbucket)
2. **In Plesk:**
   - Go to "Git" section
   - Click "Add Repository"
   - Enter repository URL
   - Set deployment directory to `httpdocs` or `public_html`
   - Enable "Deploy" option

#### Option B: Via FTP/File Manager

1. **Connect via FTP or Plesk File Manager**
2. **Upload all files EXCEPT:**
   - `node_modules/` (too large, not needed)
   - `vendor/` (will be installed on server)
   - `.env` (will create on server)
   - `storage/` subfolders (will be created)
   
3. **Make sure to upload:**
   - ✅ `public/build/` folder with all assets
   - ✅ All Laravel files
   - ✅ `composer.json` and `composer.lock`
   - ✅ `package.json` (for reference)

### Step 2: Configure Document Root in Plesk

**IMPORTANT:** Laravel's document root should be `public/` folder

1. **In Plesk, go to:** Hosting Settings
2. **Find:** "Document Root"
3. **Change to:** `/httpdocs/public` or `/public_html/public`
4. **Save**

### Step 3: Set Up Database

1. **In Plesk, go to:** Databases
2. **Create new database:**
   - Database name: `kaldis_coffee`
   - User: Create new user with strong password
   - Grant all privileges
3. **Note down:** Database name, username, and password

### Step 4: Configure Environment File

1. **In Plesk File Manager:**
   - Navigate to your Laravel root (not public)
   - Create new file: `.env`
   - Copy contents from `.env.production`
   - Update:
     ```env
     APP_URL=https://yourdomain.com
     DB_DATABASE=your_actual_database_name
     DB_USERNAME=your_actual_database_user
     DB_PASSWORD=your_actual_database_password
     ```

2. **Generate APP_KEY:**
   - Via SSH: `php artisan key:generate`
   - Or manually generate and add to `.env`

### Step 5: Install Dependencies via SSH

**Connect to Plesk via SSH and run:**

```bash
# Navigate to your Laravel directory
cd /var/www/vhosts/yourdomain.com/httpdocs

# Install Composer dependencies
composer install --optimize-autoloader --no-dev

# Set proper permissions
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Run migrations
php artisan migrate --force

# Seed database if needed
php artisan db:seed --force

# Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Link storage
php artisan storage:link
```

### Step 6: Set Proper Permissions

```bash
# Set ownership (replace 'username' with your Plesk user)
chown -R username:psacln .

# Set directory permissions
find . -type d -exec chmod 755 {} \;

# Set file permissions
find . -type f -exec chmod 644 {} \;

# Make storage and cache writable
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# If using www-data
chown -R www-data:www-data storage bootstrap/cache
```

### Step 7: Configure PHP Settings in Plesk

1. **In Plesk, go to:** PHP Settings
2. **Set these values:**
   - `memory_limit`: 256M or higher
   - `max_execution_time`: 60
   - `upload_max_filesize`: 20M
   - `post_max_size`: 20M
   - `max_input_vars`: 5000

### Step 8: Enable SSL/HTTPS

1. **In Plesk, go to:** SSL/TLS Certificates
2. **Install certificate:**
   - Option 1: Let's Encrypt (free, automatic renewal)
   - Option 2: Upload your own certificate
3. **Enable:**
   - ✅ "Secure the domain"
   - ✅ "Redirect from HTTP to HTTPS"

**This is CRITICAL - Service Workers require HTTPS!**

### Step 9: Configure .htaccess for Laravel

The `.htaccess` in `public/` folder should have:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]

    # Force HTTPS (important for PWA)
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# MIME types for PWA
<IfModule mod_mime.c>
    AddType application/manifest+json .webmanifest
    AddType application/javascript .js
</IfModule>

# Cache control for assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/manifest+json "access plus 1 week"
</IfModule>
```

---

## Post-Deployment Configuration

### 1. Test the Application

1. **Visit:** `https://yourdomain.com`
2. **Check:**
   - ✅ Site loads without errors
   - ✅ Login works
   - ✅ Database connections work
   - ✅ Images and assets load

### 2. Verify PWA Features

1. **Open browser DevTools (F12)**
2. **Go to Console tab**
3. **Look for:**
   - ✅ "Service Worker registered"
   - ✅ "App is ready for offline use"
   - ✅ "Sync service initialized"
4. **Check Application tab:**
   - ✅ Service Workers → Should show "sw.js" activated
   - ✅ Manifest → Should show app details
   - ✅ Storage → IndexedDB → Should see "KaldisOfflineDB"

### 3. Test Offline Functionality

1. **Navigate to Inventory Counts → Create**
2. **Open DevTools → Network tab → Set to "Offline"**
3. **Enter some counts**
4. **Verify:**
   - ✅ Offline banner appears
   - ✅ "Saved offline" messages show
   - ✅ Data saved to IndexedDB
5. **Set back to "Online"**
6. **Verify:**
   - ✅ Automatic sync starts
   - ✅ Data appears in database

### 4. Set Up Cron Jobs (Optional but Recommended)

If you need scheduled tasks:

1. **In Plesk, go to:** Scheduled Tasks (Cron)
2. **Add new task:**
   ```bash
   * * * * * cd /var/www/vhosts/yourdomain.com/httpdocs && php artisan schedule:run >> /dev/null 2>&1
   ```

### 5. Enable Error Logging

In Plesk:
1. **Go to:** Logs
2. **Enable:** Error log
3. **Monitor for:** PHP errors, Laravel errors

---

## Important Files to Check After Deployment

### 1. Check Service Worker
Visit: `https://yourdomain.com/build/sw.js`
- Should return JavaScript code (not 404)

### 2. Check PWA Manifest
Visit: `https://yourdomain.com/build/manifest.webmanifest`
- Should return JSON with app details

### 3. Check Assets
Visit: `https://yourdomain.com/build/manifest.json`
- Should return Vite manifest

---

## Troubleshooting Common Plesk Issues

### Issue 1: 500 Internal Server Error

**Solutions:**
1. Check `.env` file exists and is configured
2. Run: `php artisan key:generate`
3. Check file permissions: `chmod -R 775 storage bootstrap/cache`
4. Check error logs in Plesk
5. Make sure document root is set to `public/` folder

### Issue 2: Service Worker Not Working

**Solutions:**
1. Verify site is HTTPS (not HTTP)
2. Check `sw.js` file exists: `/public/build/sw.js`
3. Check browser console for errors
4. Clear browser cache and reload
5. Check MIME type is set correctly in `.htaccess`

### Issue 3: Assets Not Loading (404)

**Solutions:**
1. Verify `public/build/` folder was uploaded
2. Check file permissions: `chmod -R 755 public/build`
3. Verify `.env` has correct `ASSET_URL`
4. Clear Laravel cache: `php artisan cache:clear`

### Issue 4: Database Connection Failed

**Solutions:**
1. Check `.env` database credentials
2. Verify database exists in Plesk
3. Check user has proper permissions
4. Try `DB_HOST=localhost` instead of `127.0.0.1`

### Issue 5: Offline Sync Not Working

**Solutions:**
1. Verify HTTPS is enabled
2. Check service worker is registered (DevTools → Application)
3. Check IndexedDB permissions in browser
4. Verify sync API routes are accessible:
   - `POST /sync/inventory-counts`
   - `POST /sync/evaluations`
5. Check Laravel logs for sync errors

### Issue 6: Storage Permissions

**Solutions:**
```bash
# If using PHP-FPM
chown -R www-data:www-data storage bootstrap/cache

# If using Apache
chown -R apache:apache storage bootstrap/cache

# If using Plesk user
chown -R username:psacln storage bootstrap/cache
```

---

## Security Checklist

Before going live:

- [ ] Set `APP_DEBUG=false` in `.env`
- [ ] Set `APP_ENV=production` in `.env`
- [ ] Use strong `APP_KEY`
- [ ] Use strong database password
- [ ] Enable HTTPS with valid SSL
- [ ] Set secure session cookies
- [ ] Remove `.git` folder from public access
- [ ] Disable directory listing
- [ ] Set proper file permissions (755 for dirs, 644 for files)
- [ ] Enable Plesk firewall
- [ ] Keep Laravel and dependencies updated
- [ ] Enable CSRF protection (already enabled)
- [ ] Review and test all permissions

---

## Performance Optimization for Plesk

### 1. Enable OPcache
In Plesk PHP Settings:
- `opcache.enable=1`
- `opcache.memory_consumption=128`
- `opcache.max_accelerated_files=10000`

### 2. Cache Configuration
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3. Optimize Composer Autoloader
```bash
composer install --optimize-autoloader --no-dev
```

### 4. Enable Gzip Compression
Add to `.htaccess`:
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

---

## Updating the Application

When you need to update:

1. **Build assets locally:**
   ```bash
   npm run build
   ```

2. **Upload changed files via FTP/Git**

3. **Via SSH, run:**
   ```bash
   composer install --optimize-autoloader --no-dev
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan queue:restart  # if using queues
   ```

4. **Clear browser cache** (Ctrl+F5)

---

## Monitoring

### What to Monitor:

1. **Server Resources:**
   - CPU usage
   - Memory usage
   - Disk space

2. **Application Logs:**
   - Laravel log: `storage/logs/laravel.log`
   - Plesk error log
   - PHP error log

3. **Database:**
   - Connection errors
   - Slow queries
   - Storage size

4. **Offline Sync:**
   - Sync failures in logs
   - User reports of data loss
   - IndexedDB quota issues

---

## Support Resources

- **Plesk Documentation:** https://docs.plesk.com/
- **Laravel Deployment:** https://laravel.com/docs/deployment
- **Service Workers:** https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

---

## Final Checklist Before Going Live

- [ ] Build assets locally and upload
- [ ] Configure `.env` with production settings
- [ ] Set document root to `public/` folder
- [ ] Install Composer dependencies
- [ ] Run database migrations
- [ ] Set proper file permissions
- [ ] Enable SSL/HTTPS
- [ ] Test application loads
- [ ] Test user authentication
- [ ] Test offline functionality
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Monitor error logs
- [ ] Create database backups
- [ ] Document admin credentials securely

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Production URL:** https://yourdomain.com  
**Status:** ⬜ Ready for Deployment / ⬜ Deployed / ⬜ Tested

---

Good luck with your deployment! 🚀
