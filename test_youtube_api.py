"""
Test script for YouTube Notebook API
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpassword123"
TEST_USERNAME = "testuser"

def register_or_login():
    """Register or login to get access token"""
    # Try to register
    register_data = {
        "email": TEST_EMAIL,
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
    
    if response.status_code == 201:
        print("✅ Registered new user")
        return response.json()["access_token"]
    
    # If registration fails, try login
    login_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    
    if response.status_code == 200:
        print("✅ Logged in existing user")
        return response.json()["access_token"]
    
    print("❌ Failed to authenticate")
    print(response.text)
    return None

def test_youtube_endpoint(token):
    """Test the YouTube complete notebook endpoint"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test with a short educational video
    data = {
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "include_transcript": True
    }
    
    print("\n🔄 Testing YouTube notebook endpoint...")
    print(f"URL: {BASE_URL}/api/youtube/complete-notebook")
    print(f"Video: {data['url']}")
    
    response = requests.post(
        f"{BASE_URL}/api/youtube/complete-notebook",
        headers=headers,
        json=data
    )
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ Success!")
        result = response.json()
        if result.get("success"):
            data = result.get("data", {})
            print(f"\n📊 Generated Content:")
            print(f"  - Video: {data.get('video_metadata', {}).get('title', 'N/A')}")
            print(f"  - Has Transcript: {data.get('has_transcript', False)}")
            print(f"  - Notes: {len(data.get('notes', ''))} characters")
            print(f"  - Summary: {len(data.get('summary', ''))} characters")
            print(f"  - Flashcards: {len(data.get('flashcards', []))} cards")
            print(f"  - Key Points: {len(data.get('key_points', []))} points")
            print(f"  - Quiz: {len(data.get('quiz', []))} questions")
            print(f"  - Study Guide: {'✓' if data.get('study_guide') else '✗'}")
            print(f"  - Insights: {len(data.get('insights', []))} insights")
            print(f"  - Connections: {len(data.get('connections', []))} connections")
            print(f"  - Timeline: {len(data.get('timeline', []))} events")
            print(f"  - Audio Overview: {'✓' if data.get('audio_overview') else '✗'}")
            print(f"  - Briefing: {'✓' if data.get('briefing_doc') else '✗'}")
    else:
        print("❌ Failed!")
        print(f"Response: {response.text}")

def main():
    print("🚀 YouTube Notebook API Test\n")
    print("=" * 50)
    
    # Step 1: Authenticate
    token = register_or_login()
    if not token:
        return
    
    # Step 2: Test YouTube endpoint
    test_youtube_endpoint(token)
    
    print("\n" + "=" * 50)
    print("✅ Test complete!")

if __name__ == "__main__":
    main()
