# TUTOR - AI Learning Platform

An intelligent learning platform powered by Gemini AI that provides personalized tutoring, interactive learning experiences, and now includes a powerful YouTube Learning Notebook feature.

## 🌟 Features

### Core Learning Features
- **AI Tutor** - Interactive conversations with Gemini AI
- **Adaptive Learning** - Personalized learning paths
- **Progress Tracking** - Monitor your learning journey
- **Quiz System** - Test your knowledge
- **Wolfram Integration** - Mathematical computations and visualizations

### 🎥 NEW: YouTube Learning Notebook with NotebookLM Features
Transform any YouTube video into comprehensive learning materials with AI-powered insights:

**Core Features:**
- **📝 Detailed Notes** - Structured study notes with key concepts
- **📄 Smart Summaries** - Quick overviews in multiple lengths
- **🎴 Flashcards** - Interactive study cards for memorization
- **🎯 Key Points** - Essential takeaways highlighted
- **❓ Interactive Quiz** - Test your understanding with instant feedback

**🌟 NotebookLM-Inspired Features:**
- **📚 Study Guide** - Comprehensive learning materials with prerequisites, concepts, and practice questions
- **💡 AI Insights** - Intelligent analysis revealing patterns, surprises, and deeper meanings
- **🔗 Topic Connections** - Discover how content relates to other subjects and fields
- **⏱️ Content Timeline** - Chronological breakdown of key moments
- **🎙️ Audio Overview** - Conversational script for podcast-style learning
- **📋 Executive Briefing** - Professional summary document for quick reference

[Learn more about YouTube Notebook →](YOUTUBE_NOTEBOOK.md)
[NotebookLM Features Guide →](NOTEBOOKLM_FEATURES.md)

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL (Supabase)
- Redis

### Installation

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run migrations
alembic upgrade head

# Start server
python -m uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

### YouTube Notebook Setup
```bash
# Install additional dependency
pip install youtube-transcript-api

# Optional: Add YouTube API key to .env
YOUTUBE_API_KEY=your_key_here

# Access at http://localhost:3000/notebook
```

[Detailed Setup Guide →](SETUP_YOUTUBE_NOTEBOOK.md)

## 📚 Documentation

- [YouTube Notebook Guide](YOUTUBE_NOTEBOOK.md) - Complete feature documentation
- [Quick Start Guide](YOUTUBE_NOTEBOOK_QUICKSTART.md) - Get started in 2 minutes
- [Architecture](YOUTUBE_NOTEBOOK_ARCHITECTURE.md) - Technical architecture details
- [Setup Guide](SETUP_YOUTUBE_NOTEBOOK.md) - Detailed installation instructions

## 🛠️ Technology Stack

### Backend
- FastAPI - Modern Python web framework
- SQLAlchemy - Database ORM
- Alembic - Database migrations
- Redis - Caching layer
- Google Gemini AI - AI/ML capabilities
- Wolfram Alpha - Mathematical computations
- youtube-transcript-api - Video transcript extraction

### Frontend
- Next.js 14 - React framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- Zustand - State management
- Axios - HTTP client

## 🎯 Key Features

### Learning Experience
- Personalized AI tutoring
- Step-by-step explanations
- Interactive problem solving
- Progress tracking and analytics
- Achievement system

### YouTube Notebook
- Automatic content extraction
- AI-powered note generation
- Interactive flashcards
- Knowledge testing with quizzes
- Export and sharing capabilities

### User Management
- Secure authentication
- User profiles
- Learning preferences
- Session history

## 📱 Usage

### Starting a Learning Session
1. Navigate to `/learn`
2. Choose a topic or start a new session
3. Interact with the AI tutor
4. Complete quizzes to test knowledge

### Using YouTube Notebook
1. Navigate to `/notebook`
2. Paste a YouTube video URL
3. Click "Generate Notebook"
4. Explore notes, flashcards, and quiz

## 🔧 Configuration

### Required Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379/0
GEMINI_API_KEY=your_gemini_key
WOLFRAM_APP_ID=your_wolfram_id
YOUTUBE_API_KEY=your_youtube_key  # Optional
SECRET_KEY=your_secret_key
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📈 Performance

- Response time: < 2s for most operations
- YouTube processing: 30-60s per video
- Caching: Redis for improved performance
- Scalable architecture

## 🔒 Security

- JWT authentication
- Secure password hashing
- API key protection
- Input validation
- Rate limiting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini AI for AI capabilities
- Wolfram Alpha for mathematical computations
- YouTube for educational content
- Open source community

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Check the documentation
- Review troubleshooting guides

## 🗺️ Roadmap

- [ ] Mobile app
- [ ] Offline mode
- [ ] Collaborative learning
- [ ] More AI models
- [ ] Advanced analytics
- [ ] Playlist processing for YouTube Notebook
- [ ] Export to PDF/Anki
- [ ] Spaced repetition system

---

Built with ❤️ using AI and modern web technologies