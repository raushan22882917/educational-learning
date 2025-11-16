from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from .api import auth, sessions, progress, recommendations, quiz, step_learning
from .database import engine, Base
from .models import user, session, progress as progress_model, quiz as quiz_model, profile
from .exceptions import (
    APIException,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    NotFoundError,
    AIServiceError,
    RateLimitError,
    DatabaseError,
    CircuitBreakerOpenError
)
import traceback

app = FastAPI(title="AI Learning Platform API")

# Configure CORS - must be before other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Initialize database tables on startup
@app.on_event("startup")
async def startup_event():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")


# Exception handlers with CORS headers
def create_error_response(request: Request, status_code: int, error_code: str, detail: str, metadata: dict = None):
    """Create a standardized error response with CORS headers."""
    content = {
        "error": error_code,
        "detail": detail,
        "status_code": status_code
    }
    if metadata:
        content["metadata"] = metadata
    
    return JSONResponse(
        status_code=status_code,
        content=content,
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Credentials": "true",
        }
    )


@app.exception_handler(APIException)
async def api_exception_handler(request: Request, exc: APIException):
    """Handle custom API exceptions."""
    print(f"API Exception: {exc.error_code} - {exc.detail}")
    return create_error_response(
        request,
        exc.status_code,
        exc.error_code,
        exc.detail,
        exc.metadata
    )


@app.exception_handler(AuthenticationError)
async def authentication_error_handler(request: Request, exc: AuthenticationError):
    """Handle authentication errors."""
    print(f"Authentication Error: {exc.detail}")
    return create_error_response(
        request,
        exc.status_code,
        exc.error_code,
        exc.detail,
        exc.metadata
    )


@app.exception_handler(AuthorizationError)
async def authorization_error_handler(request: Request, exc: AuthorizationError):
    """Handle authorization errors."""
    print(f"Authorization Error: {exc.detail}")
    return create_error_response(
        request,
        exc.status_code,
        exc.error_code,
        exc.detail,
        exc.metadata
    )


@app.exception_handler(NotFoundError)
async def not_found_error_handler(request: Request, exc: NotFoundError):
    """Handle resource not found errors."""
    print(f"Not Found Error: {exc.detail}")
    return create_error_response(
        request,
        exc.status_code,
        exc.error_code,
        exc.detail,
        exc.metadata
    )


@app.exception_handler(AIServiceError)
async def ai_service_error_handler(request: Request, exc: AIServiceError):
    """Handle AI service errors."""
    print(f"AI Service Error: {exc.detail}")
    return create_error_response(
        request,
        exc.status_code,
        exc.error_code,
        exc.detail,
        exc.metadata
    )


@app.exception_handler(CircuitBreakerOpenError)
async def circuit_breaker_error_handler(request: Request, exc: CircuitBreakerOpenError):
    """Handle circuit breaker open errors."""
    print(f"Circuit Breaker Open: {exc.detail}")
    return create_error_response(
        request,
        exc.status_code,
        exc.error_code,
        exc.detail,
        exc.metadata
    )


@app.exception_handler(RateLimitError)
async def rate_limit_error_handler(request: Request, exc: RateLimitError):
    """Handle rate limit errors."""
    print(f"Rate Limit Error: {exc.detail}")
    response = create_error_response(
        request,
        exc.status_code,
        exc.error_code,
        exc.detail,
        exc.metadata
    )
    # Add Retry-After header
    if exc.metadata and "retry_after" in exc.metadata:
        response.headers["Retry-After"] = str(exc.metadata["retry_after"])
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle FastAPI validation errors."""
    print(f"Validation Error: {exc.errors()}")
    errors = exc.errors()
    detail = "Invalid request data"
    if errors:
        detail = f"{errors[0]['msg']} in {'.'.join(str(loc) for loc in errors[0]['loc'])}"
    
    return create_error_response(
        request,
        422,
        "VALIDATION_ERROR",
        detail,
        {"errors": errors}
    )


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors."""
    print(f"Database Error: {str(exc)}")
    traceback.print_exc()
    return create_error_response(
        request,
        500,
        "DATABASE_ERROR",
        "A database error occurred. Please try again later."
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all other unhandled exceptions."""
    print(f"Unhandled Exception: {exc}")
    traceback.print_exc()
    return create_error_response(
        request,
        500,
        "INTERNAL_SERVER_ERROR",
        "An unexpected error occurred. Please try again later."
    )

# Include routers
app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(progress.router)
app.include_router(recommendations.router)
app.include_router(quiz.router)
app.include_router(step_learning.router)

@app.get("/")
async def root():
    return {"message": "AI Learning Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
