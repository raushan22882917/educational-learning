"""
Redis caching service for frequently accessed data and AI responses.
Provides caching for user data, Gemini AI responses, and other frequently accessed resources.
"""

import os
import json
import hashlib
import redis
from typing import Any, Optional, Callable
from datetime import timedelta
from functools import wraps


class CacheServiceError(Exception):
    """Custom exception for cache service errors."""
    pass


class CacheService:
    """
    Service class for Redis caching operations.
    Provides methods for caching user data, AI responses, and implementing cache strategies.
    """
    
    def __init__(self, redis_url: Optional[str] = None):
        """
        Initialize the cache service.
        
        Args:
            redis_url: Redis connection URL (defaults to environment variable)
        """
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379/0")
        
        # Initialize Redis connection
        try:
            self.redis_client = redis.from_url(
                self.redis_url,
                decode_responses=True,
                socket_connect_timeout=5
            )
            # Test connection
            self.redis_client.ping()
        except Exception as e:
            raise CacheServiceError(f"Failed to connect to Redis: {str(e)}")
        
        # Default TTL values (in seconds)
        self.DEFAULT_TTL = 3600  # 1 hour
        self.USER_DATA_TTL = 1800  # 30 minutes
        self.AI_RESPONSE_TTL = 7200  # 2 hours
        self.PROGRESS_TTL = 900  # 15 minutes
        self.RECOMMENDATIONS_TTL = 1800  # 30 minutes
    
    def _generate_cache_key(self, prefix: str, *args, **kwargs) -> str:
        """
        Generate a cache key from prefix and arguments.
        
        Args:
            prefix: Key prefix (e.g., 'user', 'ai_response')
            *args: Positional arguments to include in key
            **kwargs: Keyword arguments to include in key
            
        Returns:
            Generated cache key
        """
        # Combine all arguments into a string
        key_parts = [str(arg) for arg in args]
        
        # Add sorted kwargs
        if kwargs:
            sorted_kwargs = sorted(kwargs.items())
            key_parts.extend([f"{k}:{v}" for k, v in sorted_kwargs])
        
        # Create hash for long keys
        if len(key_parts) > 3 or any(len(str(part)) > 50 for part in key_parts):
            combined = ":".join(key_parts)
            hash_suffix = hashlib.md5(combined.encode()).hexdigest()[:12]
            return f"{prefix}:{hash_suffix}"
        
        # Use direct key for short keys
        key_suffix = ":".join(key_parts) if key_parts else "default"
        return f"{prefix}:{key_suffix}"
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get a value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            # Log error but don't raise - cache failures should be graceful
            print(f"Cache get error for key {key}: {str(e)}")
            return None
    
    def set(
        self, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None
    ) -> bool:
        """
        Set a value in cache with optional TTL.
        
        Args:
            key: Cache key
            value: Value to cache (must be JSON serializable)
            ttl: Time to live in seconds (defaults to DEFAULT_TTL)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            ttl = ttl or self.DEFAULT_TTL
            serialized = json.dumps(value)
            self.redis_client.setex(key, ttl, serialized)
            return True
        except Exception as e:
            print(f"Cache set error for key {key}: {str(e)}")
            return False
    
    def delete(self, key: str) -> bool:
        """
        Delete a value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.redis_client.delete(key)
            return True
        except Exception as e:
            print(f"Cache delete error for key {key}: {str(e)}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching a pattern.
        
        Args:
            pattern: Key pattern (e.g., 'user:*')
            
        Returns:
            Number of keys deleted
        """
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            print(f"Cache delete pattern error for pattern {pattern}: {str(e)}")
            return 0
    
    def exists(self, key: str) -> bool:
        """
        Check if a key exists in cache.
        
        Args:
            key: Cache key
            
        Returns:
            True if key exists, False otherwise
        """
        try:
            return self.redis_client.exists(key) > 0
        except Exception:
            return False
    
    # User data caching methods
    
    def get_user_data(self, user_id: str) -> Optional[dict]:
        """
        Get cached user data.
        
        Args:
            user_id: User ID
            
        Returns:
            Cached user data or None
        """
        key = self._generate_cache_key("user_data", user_id)
        return self.get(key)
    
    def set_user_data(self, user_id: str, user_data: dict) -> bool:
        """
        Cache user data.
        
        Args:
            user_id: User ID
            user_data: User data dictionary
            
        Returns:
            True if successful
        """
        key = self._generate_cache_key("user_data", user_id)
        return self.set(key, user_data, self.USER_DATA_TTL)
    
    def invalidate_user_data(self, user_id: str) -> bool:
        """
        Invalidate cached user data.
        
        Args:
            user_id: User ID
            
        Returns:
            True if successful
        """
        key = self._generate_cache_key("user_data", user_id)
        return self.delete(key)
    
    # Progress data caching methods
    
    def get_user_progress(self, user_id: str) -> Optional[dict]:
        """
        Get cached user progress data.
        
        Args:
            user_id: User ID
            
        Returns:
            Cached progress data or None
        """
        key = self._generate_cache_key("progress", user_id)
        return self.get(key)
    
    def set_user_progress(self, user_id: str, progress_data: dict) -> bool:
        """
        Cache user progress data.
        
        Args:
            user_id: User ID
            progress_data: Progress data dictionary
            
        Returns:
            True if successful
        """
        key = self._generate_cache_key("progress", user_id)
        return self.set(key, progress_data, self.PROGRESS_TTL)
    
    def invalidate_user_progress(self, user_id: str) -> bool:
        """
        Invalidate cached user progress data.
        
        Args:
            user_id: User ID
            
        Returns:
            True if successful
        """
        key = self._generate_cache_key("progress", user_id)
        return self.delete(key)
    
    # AI response caching methods
    
    def get_ai_response(
        self, 
        prompt_type: str, 
        prompt_hash: str
    ) -> Optional[str]:
        """
        Get cached AI response.
        
        Args:
            prompt_type: Type of prompt (e.g., 'tutor', 'explanation', 'quiz')
            prompt_hash: Hash of the prompt content
            
        Returns:
            Cached AI response or None
        """
        key = self._generate_cache_key("ai_response", prompt_type, prompt_hash)
        return self.get(key)
    
    def set_ai_response(
        self, 
        prompt_type: str, 
        prompt_hash: str, 
        response: str
    ) -> bool:
        """
        Cache AI response.
        
        Args:
            prompt_type: Type of prompt
            prompt_hash: Hash of the prompt content
            response: AI response to cache
            
        Returns:
            True if successful
        """
        key = self._generate_cache_key("ai_response", prompt_type, prompt_hash)
        return self.set(key, response, self.AI_RESPONSE_TTL)
    
    def generate_prompt_hash(self, prompt: str) -> str:
        """
        Generate a hash for a prompt to use as cache key.
        
        Args:
            prompt: Prompt text
            
        Returns:
            MD5 hash of the prompt
        """
        return hashlib.md5(prompt.encode()).hexdigest()
    
    # Recommendations caching methods
    
    def get_recommendations(self, user_id: str) -> Optional[list]:
        """
        Get cached recommendations.
        
        Args:
            user_id: User ID
            
        Returns:
            Cached recommendations or None
        """
        key = self._generate_cache_key("recommendations", user_id)
        return self.get(key)
    
    def set_recommendations(self, user_id: str, recommendations: list) -> bool:
        """
        Cache recommendations.
        
        Args:
            user_id: User ID
            recommendations: List of recommendations
            
        Returns:
            True if successful
        """
        key = self._generate_cache_key("recommendations", user_id)
        return self.set(key, recommendations, self.RECOMMENDATIONS_TTL)
    
    def invalidate_recommendations(self, user_id: str) -> bool:
        """
        Invalidate cached recommendations.
        
        Args:
            user_id: User ID
            
        Returns:
            True if successful
        """
        key = self._generate_cache_key("recommendations", user_id)
        return self.delete(key)
    
    # Cache invalidation strategies
    
    def invalidate_user_cache(self, user_id: str) -> int:
        """
        Invalidate all cached data for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Number of keys deleted
        """
        patterns = [
            f"user_data:{user_id}",
            f"progress:{user_id}",
            f"recommendations:{user_id}"
        ]
        
        total_deleted = 0
        for pattern in patterns:
            if self.delete(pattern):
                total_deleted += 1
        
        return total_deleted
    
    def clear_all_cache(self) -> bool:
        """
        Clear all cache data (use with caution).
        
        Returns:
            True if successful
        """
        try:
            self.redis_client.flushdb()
            return True
        except Exception as e:
            print(f"Cache clear error: {str(e)}")
            return False


# Singleton instance for easy access
_cache_service_instance: Optional[CacheService] = None


def get_cache_service() -> CacheService:
    """
    Get or create a singleton instance of CacheService.
    
    Returns:
        CacheService instance
    """
    global _cache_service_instance
    if _cache_service_instance is None:
        _cache_service_instance = CacheService()
    return _cache_service_instance


# Decorator for caching function results
def cached(
    ttl: Optional[int] = None,
    key_prefix: str = "func",
    cache_service: Optional[CacheService] = None
):
    """
    Decorator to cache function results.
    
    Args:
        ttl: Time to live in seconds
        key_prefix: Prefix for cache key
        cache_service: Optional CacheService instance
        
    Returns:
        Decorated function
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Get cache service
            cache = cache_service or get_cache_service()
            
            # Generate cache key from function name and arguments
            key = cache._generate_cache_key(
                f"{key_prefix}:{func.__name__}",
                *args,
                **kwargs
            )
            
            # Try to get from cache
            cached_result = cache.get(key)
            if cached_result is not None:
                return cached_result
            
            # Call function and cache result
            result = func(*args, **kwargs)
            cache.set(key, result, ttl)
            
            return result
        
        return wrapper
    return decorator
