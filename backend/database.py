"""
Database Configuration and Connection Management
MySQL Database on Aiven Cloud
"""

import os
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from dotenv import load_dotenv
from contextlib import contextmanager
import mysql.connector
from mysql.connector import pooling, Error

load_dotenv()

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT', 16883)),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
    'ssl_disabled': True,  # Disable SSL for local development
    'ssl_verify_cert': False,
    'ssl_verify_identity': False,
}

# Connection pool configuration
POOL_CONFIG = {
    'pool_name': 'nexora_pool',
    'pool_size': 20,  # Increased from 5 for better performance
    'pool_reset_session': True,
}

# Global connection pool
connection_pool: Optional[pooling.MySQLConnectionPool] = None


def initialize_pool():
    """Initialize the MySQL connection pool"""
    global connection_pool
    
    # Check if database credentials are configured
    if not DB_CONFIG.get('host') or not DB_CONFIG.get('user'):
        logger.warning("Database credentials not configured. Running without database.")
        return False
    
    try:
        connection_pool = pooling.MySQLConnectionPool(
            **DB_CONFIG,
            **POOL_CONFIG
        )
        logger.info("Database connection pool initialized successfully")
        return True
    except Error as e:
        logger.error(f"Error initializing connection pool: {e}")
        connection_pool = None
        return False


def get_connection():
    """Get a connection from the pool"""
    global connection_pool
    
    if connection_pool is None:
        if not initialize_pool():
            raise Error("Failed to initialize connection pool")
    
    if connection_pool is None:
        raise Error("Connection pool is not available")
    
    try:
        connection = connection_pool.get_connection()
        return connection
    except Error as e:
        logger.error(f"Error getting connection from pool: {e}")
        raise


@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    connection = None
    try:
        connection = get_connection()
        yield connection
        connection.commit()
    except Error as e:
        if connection:
            connection.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        if connection and connection.is_connected():
            connection.close()


def execute_query(query: str, params: tuple = None, fetch_one: bool = False, fetch_all: bool = True):
    """Execute a database query"""
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(query, params or ())
            
            if fetch_one:
                result = cursor.fetchone()
            elif fetch_all:
                result = cursor.fetchall()
            else:
                result = cursor.rowcount
            
            return result
        finally:
            cursor.close()


def create_indexes():
    """Create database indexes for performance"""
    global connection_pool
    
    if connection_pool is None:
        logger.warning("Skipping index creation - database not available")
        return False
    
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
        "CREATE INDEX IF NOT EXISTS idx_projects_user_created ON projects(user_id, created_at DESC)",
        "CREATE INDEX IF NOT EXISTS idx_generations_user_type ON generations(user_id, type, created_at DESC)",
        "CREATE INDEX IF NOT EXISTS idx_activities_user_created ON activities(user_id, created_at DESC)",
    ]
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            for index_sql in indexes:
                cursor.execute(index_sql)
            conn.commit()
            logger.info("Database indexes created successfully")
            return True
        except Error as e:
            logger.error(f"Error creating indexes: {e}")
            return False
        finally:
            cursor.close()


def create_tables():
    """Create necessary database tables"""
    global connection_pool
    
    # If pool is not initialized, skip table creation
    if connection_pool is None:
        logger.warning("Skipping table creation - database not available")
        return False
    
    tables = {
        'users': """
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                credits INT DEFAULT 20,
                subscription_tier VARCHAR(50) DEFAULT 'free',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_subscription (subscription_tier)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """,
        
        'projects': """
            CREATE TABLE IF NOT EXISTS projects (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                type VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'active',
                data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_type (type),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """,
        
        'generations': """
            CREATE TABLE IF NOT EXISTS generations (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                project_id VARCHAR(36),
                type VARCHAR(50) NOT NULL,
                input_data JSON,
                output_data JSON,
                status VARCHAR(50) DEFAULT 'pending',
                credits_used INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
                INDEX idx_user_id (user_id),
                INDEX idx_project_id (project_id),
                INDEX idx_type (type),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """,
        
        'activities': """
            CREATE TABLE IF NOT EXISTS activities (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                metadata JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_type (type),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """,
        
        'subscriptions': """
            CREATE TABLE IF NOT EXISTS subscriptions (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                plan_id VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'active',
                stripe_subscription_id VARCHAR(255),
                current_period_start TIMESTAMP,
                current_period_end TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_status (status),
                INDEX idx_stripe_id (stripe_subscription_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
    }
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            for table_name, create_statement in tables.items():
                cursor.execute(create_statement)
                logger.info(f"Table '{table_name}' created or already exists")
            
            conn.commit()
            logger.info("All database tables created successfully")
            
            # Create indexes for performance
            create_indexes()
            
            return True
        except Error as e:
            logger.error(f"Error creating tables: {e}")
            conn.rollback()
            return False
        finally:
            cursor.close()


def test_connection():
    """Test database connection"""
    global connection_pool
    
    # If pool is not initialized, return False
    if connection_pool is None:
        return False
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            cursor.close()
            
            if result:
                logger.info("Database connection test successful")
                return True
            return False
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False


# User Management Functions
def create_user(user_id: str, email: str, name: str, password_hash: str) -> bool:
    """Create a new user"""
    query = """
        INSERT INTO users (id, email, name, password_hash)
        VALUES (%s, %s, %s, %s)
    """
    try:
        execute_query(query, (user_id, email, name, password_hash), fetch_all=False)
        logger.info(f"User created: {email}")
        return True
    except Error as e:
        logger.error(f"Error creating user: {e}")
        return False


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email"""
    query = "SELECT * FROM users WHERE email = %s"
    try:
        result = execute_query(query, (email,), fetch_one=True)
        return result
    except Error as e:
        logger.error(f"Error getting user: {e}")
        return None


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    query = "SELECT * FROM users WHERE id = %s"
    try:
        result = execute_query(query, (user_id,), fetch_one=True)
        return result
    except Error as e:
        logger.error(f"Error getting user: {e}")
        return None


def update_user_credits(user_id: str, credits: int) -> bool:
    """Update user credits"""
    query = "UPDATE users SET credits = %s WHERE id = %s"
    try:
        execute_query(query, (credits, user_id), fetch_all=False)
        return True
    except Error as e:
        logger.error(f"Error updating credits: {e}")
        return False


# Initialize on module import
if __name__ == "__main__":
    # Test the connection
    if test_connection():
        print("✅ Database connection successful")
        # Create tables
        if create_tables():
            print("✅ Database tables created successfully")
        else:
            print("❌ Failed to create database tables")
    else:
        print("❌ Database connection failed")
