from pathlib import Path
import config

database_location = Path(config.database_location)
drive_location = Path(config.drive_location)
verbose_check = config.server_verbose

def check_paths():
    if verbose_check:
        print("📁 Starting path checks...")

    # Check database location
    if not database_location.exists():
        if verbose_check:
            print(f"⚠️ Database location does not exist: {database_location}")
    else:
        if verbose_check:
            print(f"✅ Database location exists: {database_location}")
            db_file_path = database_location / config.database_name
            if db_file_path.exists():
                print(f"   ✔️ Found database file: {db_file_path.name}")
            else:
                print(f"   ⚠️ Database file not found: {config.database_name}")

            try:
                first_items = [item.name for item in database_location.iterdir()][:3]
                print(f"   📁 Contents (first 3): {', '.join(first_items) or 'empty'}")
            except Exception as e:
                print(f"   ❌ Error reading contents: {e}")

    # Check drive location
    if not drive_location.exists():
        if verbose_check:
            print(f"⚠️ Drive location does not exist: {drive_location}")
    else:
        if verbose_check:
            print(f"✅ Drive location exists: {drive_location}")
            try:
                first_items = [item.name for item in drive_location.iterdir()][:3]
                print(f"   📁 Contents (first 3): {', '.join(first_items) or 'empty'}")
            except Exception as e:
                print(f"   ❌ Error reading contents: {e}")

    if verbose_check:
        print("📁 Path check completed.")