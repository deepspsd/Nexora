"""
Environment Variables Validation
=================================

Validates required environment variables at startup.
"""

import os
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


# Required environment variables
REQUIRED_ENV_VARS = {
    "critical": [
        "JWT_SECRET",  # Security
    ],
    "database": [
        "DB_HOST",
        "DB_USER", 
        "DB_PASSWORD",
        "DB_NAME"
    ],
    "ai_models": [
        # At least one AI API key required
    ]
}

# Optional but recommended
RECOMMENDED_ENV_VARS = [
    "SENTRY_DSN",
    "REDIS_HOST",
    "E2B_API_KEY",
    "FIRECRAWL_API_KEY"
]


def validate_environment() -> Dict[str, List[str]]:
    """
    Validate required environment variables
    
    Returns:
        Dict with 'missing_critical', 'missing_database', 'missing_ai', 'missing_recommended'
    """
    results = {
        "missing_critical": [],
        "missing_database": [],
        "missing_ai": [],
        "missing_recommended": []
    }
    
    # Check critical vars
    for var in REQUIRED_ENV_VARS["critical"]:
        if not os.getenv(var):
            results["missing_critical"].append(var)
            logger.error(f"❌ Missing critical environment variable: {var}")
    
    # Check database vars
    for var in REQUIRED_ENV_VARS["database"]:
        if not os.getenv(var):
            results["missing_database"].append(var)
            logger.warning(f"⚠️ Missing database environment variable: {var}")
    
    # Check AI model keys (at least one required)
    ai_keys = ["HF_TOKEN", "GROQ_API_KEY", "KIMI_API_KEY"]
    has_ai_key = any(os.getenv(key) for key in ai_keys)
    if not has_ai_key:
        results["missing_ai"] = ai_keys
        logger.error(f"❌ No AI API keys found! Need at least one of: {', '.join(ai_keys)}")
    
    # Check recommended vars
    for var in RECOMMENDED_ENV_VARS:
        if not os.getenv(var):
            results["missing_recommended"].append(var)
            logger.info(f"ℹ️ Optional environment variable not set: {var}")
    
    return results


def check_environment_on_startup():
    """
    Check environment variables on startup and log warnings/errors
    
    Raises:
        RuntimeError: If critical environment variables are missing
    """
    logger.info("🔍 Validating environment variables...")
    
    results = validate_environment()
    
    # Critical errors
    if results["missing_critical"]:
        error_msg = f"Missing critical environment variables: {', '.join(results['missing_critical'])}"
        logger.error(f"❌ {error_msg}")
        raise RuntimeError(error_msg)
    
    # Database warnings
    if results["missing_database"]:
        logger.warning(f"⚠️ Database not configured. Missing: {', '.join(results['missing_database'])}")
        logger.warning("⚠️ Application will run without database persistence")
    
    # AI warnings
    if results["missing_ai"]:
        logger.error(f"❌ No AI API keys configured!")
        logger.error(f"❌ Please set at least one: {', '.join(results['missing_ai'])}")
        raise RuntimeError("No AI API keys configured")
    
    # Recommended info
    if results["missing_recommended"]:
        logger.info(f"ℹ️ Optional features not configured: {', '.join(results['missing_recommended'])}")
    
    logger.info("✅ Environment validation complete")
    return results
