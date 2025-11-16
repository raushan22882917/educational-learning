"""
Authentication service for handling user authentication, password hashing, and JWT tokens.
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session
from ..models.user import User
from ..models.profile import Profile
import os
from dotenv import load_dotenv

load_dotenv()

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here_change_in_production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))


class AuthService:
    """
    Service class for authentication operations including password hashing,
    JWT token generation, and user verification.
    """

    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash a plain text password using bcrypt.
        
        Args:
            password: Plain text password to hash
            
        Returns:
            Hashed password string
        """
        # Convert password to bytes and hash
        # Using rounds=10 for faster hashing (default is 12)
        # Still secure but 4x faster
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt(rounds=10)
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a plain text password against a hashed password.
        
        Args:
            plain_password: Plain text password to verify
            hashed_password: Hashed password to compare against
            
        Returns:
            True if password matches, False otherwise
        """
        try:
            # Convert to bytes
            password_bytes = plain_password.encode('utf-8')
            hashed_bytes = hashed_password.encode('utf-8')
            
            # Verify using bcrypt
            return bcrypt.checkpw(password_bytes, hashed_bytes)
        except Exception as e:
            print(f"Password verification error: {e}")
            return False

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """
        Create a JWT access token.
        
        Args:
            data: Dictionary containing claims to encode in the token
            expires_delta: Optional custom expiration time delta
            
        Returns:
            Encoded JWT token string
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        
        return encoded_jwt

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """
        Create a JWT refresh token with longer expiration time.
        
        Args:
            data: Dictionary containing claims to encode in the token
            
        Returns:
            Encoded JWT refresh token string
        """
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=7)  # Refresh tokens last 7 days
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """
        Verify and decode a JWT token.
        
        Args:
            token: JWT token string to verify
            
        Returns:
            Decoded token payload if valid, None otherwise
        """
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user by email and password.
        Supports both custom auth and Supabase Auth.
        
        Args:
            db: Database session
            email: User's email address
            password: Plain text password
            
        Returns:
            User object if authentication successful, None otherwise
        """
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            return None
        
        # Check if this is a Supabase Auth user
        if user.hashed_password == "$supabase_auth$":
            # Authenticate with Supabase
            try:
                from .supabase_auth import SupabaseAuthService
                result = SupabaseAuthService.sign_in(email, password)
                if result and result.get("user"):
                    # Update last active
                    user.last_active = datetime.utcnow()
                    db.commit()
                    return user
                return None
            except Exception as e:
                print(f"Supabase auth error: {e}")
                return None
        else:
            # Use custom password verification
            if not AuthService.verify_password(password, user.hashed_password):
                return None
            
            return user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """
        Retrieve a user by email address.
        
        Args:
            db: Database session
            email: User's email address
            
        Returns:
            User object if found, None otherwise
        """
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """
        Retrieve a user by username.
        
        Args:
            db: Database session
            username: User's username
            
        Returns:
            User object if found, None otherwise
        """
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """
        Retrieve a user by ID.
        
        Args:
            db: Database session
            user_id: User's UUID
            
        Returns:
            User object if found, None otherwise
        """
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def create_user(db: Session, email: str, username: str, password: str, full_name: Optional[str] = None) -> User:
        """
        Create a new user with hashed password and profile.
        
        Args:
            db: Database session
            email: User's email address
            username: User's username
            password: Plain text password
            full_name: Optional full name for profile
            
        Returns:
            Created User object
        """
        hashed_password = AuthService.hash_password(password)
        user = User(
            email=email,
            username=username,
            hashed_password=hashed_password
        )
        db.add(user)
        db.flush()  # Flush to get user.id before creating profile
        
        # Create profile for the user
        profile = Profile(
            user_id=user.id,
            full_name=full_name or username
        )
        db.add(profile)
        
        db.commit()
        db.refresh(user)
        
        return user

    @staticmethod
    def refresh_access_token(refresh_token: str) -> Optional[str]:
        """
        Generate a new access token from a valid refresh token.
        
        Args:
            refresh_token: JWT refresh token string
            
        Returns:
            New access token if refresh token is valid, None otherwise
        """
        payload = AuthService.verify_token(refresh_token)
        
        if not payload or payload.get("type") != "refresh":
            return None
        
        # Create new access token with user data
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        access_token = AuthService.create_access_token(data={"sub": user_id})
        return access_token
