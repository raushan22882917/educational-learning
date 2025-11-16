"""
Authentication API endpoints for user registration, login, logout, and user info.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..services.auth import AuthService
from ..models.user import User

router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()


# Pydantic models for request/response
class RegisterRequest(BaseModel):
    """Request model for user registration."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    """Request model for user login."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Response model for authentication tokens."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Response model for user information."""
    id: str
    email: str
    username: str
    created_at: datetime
    last_active: Optional[datetime]
    preferences: dict

    class Config:
        from_attributes = True


class RefreshTokenRequest(BaseModel):
    """Request model for token refresh."""
    refresh_token: str


# Dependency to get current user from JWT token
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to extract and verify the current user from JWT token.
    
    Args:
        credentials: HTTP Bearer token credentials
        db: Database session
        
    Returns:
        Current authenticated User object
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    payload = AuthService.verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = AuthService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last active timestamp
    user.last_active = datetime.utcnow()
    db.commit()
    
    return user


class AuthResponseWithUser(BaseModel):
    """Response model for authentication with user data."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


@router.post("/register", response_model=AuthResponseWithUser, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new user account.
    
    Args:
        request: Registration request with email, username, and password
        db: Database session
        
    Returns:
        Access and refresh tokens for the new user along with user data
        
    Raises:
        HTTPException: If email or username already exists
    """
    # Check if email already exists
    existing_user = AuthService.get_user_by_email(db, request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = AuthService.get_user_by_username(db, request.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user with profile
    user = AuthService.create_user(
        db=db,
        email=request.email,
        username=request.username,
        password=request.password,
        full_name=request.full_name
    )
    
    # Generate tokens
    access_token = AuthService.create_access_token(data={"sub": str(user.id)})
    refresh_token = AuthService.create_refresh_token(data={"sub": str(user.id)})
    
    return AuthResponseWithUser(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            username=user.username,
            created_at=user.created_at,
            last_active=user.last_active,
            preferences=user.preferences or {}
        )
    )


@router.post("/login", response_model=AuthResponseWithUser)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return access tokens.
    
    Args:
        request: Login request with email and password
        db: Database session
        
    Returns:
        Access and refresh tokens for the authenticated user along with user data
        
    Raises:
        HTTPException: If credentials are invalid
    """
    user = AuthService.authenticate_user(db, request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate tokens
    access_token = AuthService.create_access_token(data={"sub": str(user.id)})
    refresh_token = AuthService.create_refresh_token(data={"sub": str(user.id)})
    
    return AuthResponseWithUser(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            username=user.username,
            created_at=user.created_at,
            last_active=user.last_active,
            preferences=user.preferences or {}
        )
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout the current user.
    
    Note: Since we're using JWT tokens, actual logout is handled client-side
    by removing the token. This endpoint is provided for consistency and
    can be extended to implement token blacklisting if needed.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get information about the current authenticated user.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User information
    """
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        created_at=current_user.created_at,
        last_active=current_user.last_active,
        preferences=current_user.preferences or {}
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """
    Refresh an access token using a valid refresh token.
    
    Args:
        request: Refresh token request
        
    Returns:
        New access token and the same refresh token
        
    Raises:
        HTTPException: If refresh token is invalid
    """
    access_token = AuthService.refresh_access_token(request.refresh_token)
    
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=request.refresh_token
    )
