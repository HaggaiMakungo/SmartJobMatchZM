"""
Create users table in database
"""
from app.db.session import engine
from app.db.base import Base
from app.models import User

print("Creating users table...")
Base.metadata.create_all(bind=engine, tables=[User.__table__])
print("✓ Users table created successfully!")
