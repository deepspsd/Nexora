"""
Redis Caching Layer for Nexora
Caches expensive AI operations to improve performance
"""

import os
import json
import logging
import hashlib
from typing import Optional, Any, Callable
from functools import wraps
import asyncio

logger = logging.getLogger(__name__)

# Try to import redis, but make it optional
try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not available. Caching will be disabled.")


class CacheManager:
    """Manages Redis caching with fallback to no-cache"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.enabled = False
        
        if REDIS_AVAILABLE:
            try:
                redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
                self.redis_client = redis.from_url(
                    redis_url,
                    encoding="utf-8",
                    decode_responses=True
                )
                self.enabled = True
                logger.info("Redis cache initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to connect to Redis: {e}. Caching disabled.")
                self.enabled = False
        else:
            logger.info("Redis not installed. Running without cache.")
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.enabled or not self.redis_client:
            return None
        
        try:
            value = await self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: int = 3600):
        """Set value in cache with TTL (default 1 hour)"""
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            serialized = json.dumps(value)
            await self.redis_client.setex(key, ttl, serialized)
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    async def delete(self, key: str):
        """Delete key from cache"""
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            await self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    async def clear_pattern(self, pattern: str):
        """Clear all keys matching pattern"""
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            keys = await self.redis_client.keys(pattern)
            if keys:
                await self.redis_client.delete(*keys)
            return True
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return False
    
    def generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate cache key from arguments"""
        # Create a deterministic hash from arguments
        key_data = f"{prefix}:{str(args)}:{str(sorted(kwargs.items()))}"
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        return f"{prefix}:{key_hash}"


# Global cache instance
cache = CacheManager()


def cached(prefix: str, ttl: int = 3600):
    """
    Decorator to cache function results
    
    Usage:
        @cached("idea_validation", ttl=86400)  # Cache for 24 hours
        async def validate_idea(idea: str):
            # expensive operation
            return result
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = cache.generate_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_result = await cache.get(cache_key)
            if cached_result is not None:
                logger.info(f"Cache hit for {prefix}")
                return cached_result
            
            # Execute function
            logger.info(f"Cache miss for {prefix}, executing function")
            result = await func(*args, **kwargs)
            
            # Store in cache
            await cache.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator


# Convenience functions for common cache operations
async def cache_ai_response(operation: str, prompt: str, response: Any, ttl: int = 3600):
    """Cache AI response"""
    key = cache.generate_key(f"ai:{operation}", prompt)
    await cache.set(key, response, ttl)


async def get_cached_ai_response(operation: str, prompt: str) -> Optional[Any]:
    """Get cached AI response"""
    key = cache.generate_key(f"ai:{operation}", prompt)
    return await cache.get(key)


async def clear_user_cache(user_id: str):
    """Clear all cache for a specific user"""
    await cache.clear_pattern(f"user:{user_id}:*")
