"""Custom exception classes for the AI Learning Platform."""

from typing import Optional, Any


class APIException(Exception):
    """Base exception for API errors."""
    
    def __init__(
        self, 
        status_code: int, 
        detail: str, 
        error_code: Optional[str] = None,
        metadata: Optional[dict[str, Any]] = None
    ):
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code or f"ERROR_{status_code}"
        self.metadata = metadata or {}
        super().__init__(self.detail)


class AuthenticationError(APIException):
    """Raised when authentication fails."""
    
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=401,
            detail=detail,
            error_code="AUTH_FAILED"
        )


class AuthorizationError(APIException):
    """Raised when user lacks permission."""
    
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(
            status_code=403,
            detail=detail,
            error_code="FORBIDDEN"
        )


class ValidationError(APIException):
    """Raised when input validation fails."""
    
    def __init__(self, detail: str, field: Optional[str] = None):
        metadata = {"field": field} if field else {}
        super().__init__(
            status_code=422,
            detail=detail,
            error_code="VALIDATION_ERROR",
            metadata=metadata
        )


class NotFoundError(APIException):
    """Raised when a resource is not found."""
    
    def __init__(self, resource: str, identifier: Optional[str] = None):
        detail = f"{resource} not found"
        if identifier:
            detail += f": {identifier}"
        super().__init__(
            status_code=404,
            detail=detail,
            error_code="NOT_FOUND",
            metadata={"resource": resource, "identifier": identifier}
        )


class AIServiceError(APIException):
    """Raised when AI service (Gemini/Wolfram) fails."""
    
    def __init__(
        self, 
        detail: str = "AI service temporarily unavailable",
        service: Optional[str] = None,
        retry_after: Optional[int] = None
    ):
        metadata = {}
        if service:
            metadata["service"] = service
        if retry_after:
            metadata["retry_after"] = retry_after
            
        super().__init__(
            status_code=503,
            detail=detail,
            error_code="AI_SERVICE_ERROR",
            metadata=metadata
        )


class RateLimitError(APIException):
    """Raised when rate limit is exceeded."""
    
    def __init__(self, retry_after: int = 60):
        super().__init__(
            status_code=429,
            detail=f"Rate limit exceeded. Please try again in {retry_after} seconds.",
            error_code="RATE_LIMIT_EXCEEDED",
            metadata={"retry_after": retry_after}
        )


class DatabaseError(APIException):
    """Raised when database operation fails."""
    
    def __init__(self, detail: str = "Database operation failed"):
        super().__init__(
            status_code=500,
            detail=detail,
            error_code="DATABASE_ERROR"
        )


class CircuitBreakerOpenError(APIException):
    """Raised when circuit breaker is open."""
    
    def __init__(self, service: str):
        super().__init__(
            status_code=503,
            detail=f"{service} is temporarily unavailable due to repeated failures. Please try again later.",
            error_code="CIRCUIT_BREAKER_OPEN",
            metadata={"service": service}
        )
