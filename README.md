# Gratitude Network

A social platform for sharing gratitude and building positive communities.

## Features
- User authentication with OAuth support
- Gratitude post creation with photo sharing
- Social interactions (hearts, comments, follows)
- Real-time feed with algorithmic content discovery
- Mobile-responsive design

## Tech Stack
- **Frontend:** Next.js, TypeScript, Chakra UI
- **Backend:** FastAPI, PostgreSQL, Redis
- **Infrastructure:** Docker, JWT authentication

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- Python 3.9+

### Installation
```bash
# Clone repository
git clone https://github.com/danhazan/gratitude-network.git
cd gratitude-network

# Start services
docker-compose up -d

# Install dependencies
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# Start development servers
npm run dev  # Frontend on http://localhost:3000
python -m uvicorn app.main:app --reload  # Backend on http://localhost:8000
```

## Development Workflow
- `main` branch: Production-ready code
- `development` branch: Integration and testing
- `feature/*` branches: Individual feature development

## Contributing
1. Create feature branch from `development`
2. Make changes and test thoroughly
3. Create pull request to `development`
4. After review, merge to `main`
