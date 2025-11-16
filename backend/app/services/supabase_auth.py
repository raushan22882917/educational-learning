"""
Supabase Authentication Service
Integrates with Supabase's built-in auth system
"""
from supabase import create_client, Client
from typing import Optional, Dict
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend/.env
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://yywloststuzctrihcrwh.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# Lazy-loaded Supabase client
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """Get or create Supabase client"""
    global _supabase_client
    if _supabase_client is None and SUPABASE_KEY:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase_client


class SupabaseAuthService:
    """Service for Supabase authentication operations"""
    
    @staticmethod
    def sign_up(email: str, password: str, user_metadata: Optional[Dict] = None) -> Dict:
        """
        Sign up a new user with Supabase Auth
        
        Args:
            email: User's email
            password: User's password
            user_metadata: Additional user metadata (full_name, etc.)
            
        Returns:
            Dict with user and session data
        """
        if not supabase:
            raise ValueError("Supabase client not initialized. Check SUPABASE_ANON_KEY.")
        
        response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": user_metadata or {}
            }
        })
        
        return {
            "user": response.user,
            "session": response.session
        }
    
    @staticmethod
    def sign_in(email: str, password: str) -> Dict:
        """
        Sign in an existing user
        
        Args:
            email: User's email
            password: User's password
            
        Returns:
            Dict with user and session data
        """
        supabase = get_supabase_client()
        if not supabase:
            raise ValueError("Supabase client not initialized. Check SUPABASE_ANON_KEY.")
        
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        return {
            "user": response.user,
            "session": response.session
        }
    
    @staticmethod
    def sign_out(access_token: str) -> None:
        """
        Sign out the current user
        
        Args:
            access_token: User's access token
        """
        if not supabase:
            raise ValueError("Supabase client not initialized. Check SUPABASE_ANON_KEY.")
        
        supabase.auth.sign_out()
    
    @staticmethod
    def get_user(access_token: str) -> Optional[Dict]:
        """
        Get user information from access token
        
        Args:
            access_token: User's access token
            
        Returns:
            User data if valid, None otherwise
        """
        if not supabase:
            raise ValueError("Supabase client not initialized. Check SUPABASE_ANON_KEY.")
        
        try:
            response = supabase.auth.get_user(access_token)
            return response.user
        except Exception:
            return None
    
    @staticmethod
    def refresh_session(refresh_token: str) -> Dict:
        """
        Refresh an access token using a refresh token
        
        Args:
            refresh_token: User's refresh token
            
        Returns:
            Dict with new session data
        """
        if not supabase:
            raise ValueError("Supabase client not initialized. Check SUPABASE_ANON_KEY.")
        
        response = supabase.auth.refresh_session(refresh_token)
        
        return {
            "user": response.user,
            "session": response.session
        }
