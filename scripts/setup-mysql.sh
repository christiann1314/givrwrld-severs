#!/usr/bin/env bash
set -euo pipefail

# GIVRwrld MySQL Setup Script
# Run: sudo bash scripts/setup-mysql.sh

echo "🚀 GIVRwrld MySQL Setup"
echo "======================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Please run as root (sudo)"
  exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ============ Step 1: Install MySQL 8 ============
echo "📦 Step 1: Installing MySQL 8..."
apt-get update -y
apt-get install -y mysql-server mysql-client

# ============ Step 2: Secure MySQL ============
echo ""
echo "🔒 Step 2: Securing MySQL..."
echo "⚠️  You will be prompted to set a root password and configure security options"
mysql_secure_installation || {
  echo "⚠️  mysql_secure_installation failed or was skipped. Continuing..."
}

# ============ Step 3: Apply Configuration ============
echo ""
echo "⚙️  Step 3: Applying MySQL configuration..."
if [ -f "$PROJECT_ROOT/mysql/conf.d/z-givrwrld.cnf" ]; then
  cp "$PROJECT_ROOT/mysql/conf.d/z-givrwrld.cnf" /etc/mysql/mysql.conf.d/z-givrwrld.cnf
  echo "✅ Configuration copied to /etc/mysql/mysql.conf.d/z-givrwrld.cnf"
else
  echo "⚠️  Configuration file not found at mysql/conf.d/z-givrwrld.cnf"
  echo "   Creating default configuration..."
  mkdir -p /etc/mysql/mysql.conf.d
  cat > /etc/mysql/mysql.conf.d/z-givrwrld.cnf <<'EOF'
[mysqld]
bind-address = 127.0.0.1
innodb_buffer_pool_size = 2G
innodb_flush_log_at_trx_commit = 1
innodb_log_file_size = 1G
max_connections = 400
table_open_cache = 4000
tmp_table_size = 256M
max_heap_table_size = 256M
slow_query_log = 1
long_query_time = 1
log_bin = mysql-bin
server_id = 1
binlog_format = ROW
gtid_mode = ON
enforce_gtid_consistency = ON
EOF
fi

# Restart MySQL
echo "🔄 Restarting MySQL..."
systemctl restart mysql
systemctl enable mysql

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
for i in {1..30}; do
  if mysqladmin ping -h 127.0.0.1 --silent; then
    echo "✅ MySQL is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ MySQL failed to start"
    exit 1
  fi
  sleep 1
done

# ============ Step 4: Create Databases and Users ============
echo ""
echo "👥 Step 4: Creating databases and users..."
echo "⚠️  IMPORTANT: Edit sql/grants.sql and replace all 'REPLACE_ME_*' passwords with strong random passwords!"
read -p "Have you updated sql/grants.sql with strong passwords? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "⚠️  Please edit sql/grants.sql first, then run this script again"
  exit 1
fi

if [ -f "$PROJECT_ROOT/sql/grants.sql" ]; then
  mysql -u root < "$PROJECT_ROOT/sql/grants.sql"
  echo "✅ Databases and users created"
else
  echo "❌ sql/grants.sql not found"
  exit 1
fi

# ============ Step 5: Import Core Schema ============
echo ""
echo "📊 Step 5: Importing app_core schema..."
if [ -f "$PROJECT_ROOT/sql/app_core.sql" ]; then
  mysql -u root app_core < "$PROJECT_ROOT/sql/app_core.sql"
  echo "✅ app_core schema imported"
else
  echo "❌ sql/app_core.sql not found"
  exit 1
fi

# ============ Step 6: Setup Backup Timer ============
echo ""
echo "💾 Step 6: Setting up backup system..."
if [ -f "$PROJECT_ROOT/systemd/mysql-backup.service" ] && [ -f "$PROJECT_ROOT/systemd/mysql-backup.timer" ]; then
  cp "$PROJECT_ROOT/systemd/mysql-backup.service" /etc/systemd/system/
  cp "$PROJECT_ROOT/systemd/mysql-backup.timer" /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable mysql-backup.timer
  systemctl start mysql-backup.timer
  echo "✅ Backup timer enabled"
else
  echo "⚠️  Backup service files not found, skipping..."
fi

# ============ Step 7: Verify Installation ============
echo ""
echo "✅ Step 7: Verifying installation..."
mysql -u root -e "SHOW DATABASES LIKE 'app_core';" | grep -q app_core && echo "✅ app_core database exists" || echo "❌ app_core database missing"
mysql -u root -e "SHOW DATABASES LIKE 'panel';" | grep -q panel && echo "✅ panel database exists" || echo "❌ panel database missing"
mysql -u root -e "SELECT User, Host FROM mysql.user WHERE User IN ('app_rw','panel_rw','provisioning_rw','backup_ro');" && echo "✅ Users created" || echo "❌ Users missing"

echo ""
echo "🎉 MySQL setup complete!"
echo ""
echo "📋 Next Steps:"
echo "  1. Update passwords in sql/grants.sql (if not done already)"
echo "  2. Configure Pterodactyl to use MySQL (see README.md)"
echo "  3. Run panel migrations: php artisan migrate"
echo "  4. Insert secrets into app_core.secrets table (see README.md)"
echo "  5. Sync Pterodactyl catalog: bash scripts/sync-ptero-catalog.sh"
echo ""



