"""
Quick Password Reset Script
"""

import bcrypt
import database

# User details
email = "deepak@gmail.com"
new_password = "deepak"

# Initialize database
if not database.initialize_pool():
    print("❌ Failed to connect to database")
    exit(1)

print("✅ Database connected")

# Check if user exists
try:
    user = database.execute_query(
        "SELECT * FROM users WHERE email = %s",
        (email,),
        fetch_one=True,
        fetch_all=False
    )
except Exception as e:
    print(f"❌ Error querying database: {e}")
    exit(1)

if not user:
    print(f"❌ User not found: {email}")
    exit(1)

print(f"✅ Found user: {email}")
print(f"   User ID: {user['id']}")
print(f"   Name: {user['name']}")

# Hash the new password with bcrypt directly
password_bytes = new_password.encode('utf-8')
salt = bcrypt.gensalt()
new_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
print(f"✅ Generated new bcrypt hash: {new_hash[:50]}...")

# Update password in database
try:
    database.execute_query(
        "UPDATE users SET password_hash = %s WHERE email = %s",
        (new_hash, email),
        fetch_one=False,
        fetch_all=False
    )
    print(f"✅ Password updated successfully!")
    print(f"\n📧 Email: {email}")
    print(f"🔑 Password: {new_password}")
    print(f"\nYou can now login with these credentials.")
except Exception as e:
    print(f"❌ Error updating password: {e}")
    exit(1)
