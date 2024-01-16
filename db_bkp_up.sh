#!/bin/bash

# Example: 
# /bin/bash /var/www/db_bkp_up.sh test

# ----------

log() {
  echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] $1"
}

# ----------

# Checking arg: db name
if [ -z "$1" ]; then
  log "DB Name is't set"
  exit 1
fi

# ----------

db_name="$1"
db_local_user=''
db_local_password=''

# (replace: local_path and user@ip:path)
backup_dir="local_path"
server_path="user@ip:path/$db_name.sql"

# ----------

log "Fetch backup file $db_name.sql to $backup_dir/$db_name.sql"
rsync -avzP $server_path $backup_dir/$db_name.sql

# Checking DB and Create if not exists
if mysql -u $db_local_user -p$db_local_password -e "USE $db_name" 2>/dev/null; then
  log "DB [ $db_name ] exists. skiping step."
else
  log "Create DB $db_name"
  mysqladmin -u $db_local_user -p$db_local_password create $db_name

  log "Up backup $db_name.sql to $db_name"
  pv $backup_dir/$db_name.sql | mysql -u$db_local_user -p$db_local_password $db_name
  log "DB $db_name successfully update."
fi
