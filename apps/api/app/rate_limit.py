import redis
import time
import hashlib
from typing import Optional
from fastapi import Request, HTTPException, status
from .config import settings

# Redis client for rate limiting
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


def get_client_ip(request: Request) -> str:
    """Get client IP address, handling proxies"""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    return request.client.host if request.client else "unknown"


def hash_ip(ip: str) -> str:
    """Hash IP for privacy while maintaining rate limiting"""
    return hashlib.sha256(ip.encode()).hexdigest()[:16]


def check_rate_limit(
    request: Request,
    key_prefix: str,
    max_requests: int = 10,
    window_seconds: int = 60,
    skip_on_error: bool = True
) -> bool:
    """
    Check rate limit for a request
    Returns True if allowed, raises HTTPException if exceeded
    """
    try:
        ip = get_client_ip(request)
        ip_hash = hash_ip(ip)
        key = f"rate_limit:{key_prefix}:{ip_hash}"
        
        current = redis_client.get(key)
        if current is None:
            # First request in window
            redis_client.setex(key, window_seconds, "1")
            return True
        
        if int(current) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Max {max_requests} requests per {window_seconds} seconds."
            )
        
        # Increment counter
        redis_client.incr(key)
        return True
        
    except redis.RedisError:
        if skip_on_error:
            return True  # Allow request if Redis is down
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Rate limiting service unavailable"
        )