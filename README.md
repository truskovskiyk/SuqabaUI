# Suqaba Web UI

A modern web interface for Suqaba - the first simulation software with built-in Certified Error Verification. This project provides a React-based frontend and FastAPI backend for managing FEM simulations with automated mesh generation and error-driven adaptive meshing.

## Features

### Core Capabilities
- **Automated Mesh Generation**: No more manual meshing and time-consuming convergence studies
- **Certified Error Verification**: Strict and effective bounds on discretization error
- **Quality Oracle**: Confidence indicator for simulation results
- **Cloud-native Platform**: Access to computing resources via SaaS model
- **Error-driven Adaptive Meshing**: Mesh refinement based on certified error estimation

### Web Interface Features
- **User Authentication**: Secure login and registration system
- **Simulation Management**: Create, monitor, and manage FEM simulations
- **File Upload**: Support for STEP, IGES, and FEM input files
- **Real-time Monitoring**: Track job status (queued, processing, completed)
- **Results Visualization**: View simulation results and Quality Oracle metrics
- **Responsive Design**: Modern, mobile-friendly interface

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for components and styling
- **React Router** for navigation
- **Axios** for API communication
- **React Query** for state management
- **React Dropzone** for file uploads
- **Three.js** for 3D visualization (planned)

### Backend
- **FastAPI** with Python 3.11+
- **SQLAlchemy** for database ORM
- **PostgreSQL** for data storage
- **JWT** for authentication
- **Celery** for background tasks
- **Redis** for caching and task queue

## Project Structure

```
suqaba-web-ui/
├── web-ui/                    # React frontend
│   ├── public/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts (auth, etc.)
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   └── utils/             # Utility functions
│   └── package.json
├── backend/                   # FastAPI backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── core/              # Core functionality
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   └── services/          # Business logic
│   ├── main.py                # FastAPI app entry point
│   └── requirements.txt
└── README.md
```

## Prerequisites

- **Node.js** 16+ and npm/yarn
- **Python** 3.11+
- **PostgreSQL** 12+
- **Redis** 6+ (optional, for caching and background tasks)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd suqaba-web-ui
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env file with your database and other configuration
```

#### Environment Variables (.env)

```env
# Database
DATABASE_URL=postgresql://username:password@localhost/suqaba_db

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Suqaba API
SUQABA_API_URL=https://api.suqaba.com
SUQABA_WEB_URL=https://suqaba.com

# CORS
ALLOWED_HOSTS=["http://localhost:3000"]

# File Storage
UPLOAD_DIR=uploads
MAX_FILE_SIZE=104857600  # 100MB

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

#### Database Setup

```bash
# Create PostgreSQL database
createdb suqaba_db

# Run database migrations (if using Alembic)
alembic upgrade head
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd web-ui

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env file with API URL
```

#### Frontend Environment Variables (.env)

```env
REACT_APP_API_URL=http://localhost:8000/api
```

## Running the Application

### 1. Start the Backend

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

The backend API will be available at `http://localhost:8000`

### 2. Start the Frontend

```bash
cd web-ui
npm start
```

The frontend will be available at `http://localhost:3000`

### 3. Access the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account or login with existing credentials
3. Start creating and managing your FEM simulations!

## API Documentation

The FastAPI backend automatically generates interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Integration with Suqaba Solver

This web UI integrates with the existing Suqaba FEM solver through:

1. **Authentication**: Users can link their Suqaba.com accounts
2. **Job Submission**: Simulations are submitted to the Suqaba cloud platform
3. **Status Monitoring**: Real-time updates on simulation progress
4. **Results Retrieval**: Download and visualize simulation results
5. **Quality Oracle**: Access to certified error verification metrics

### Suqaba Account Setup

1. Create an account at [suqaba.com/signup](https://suqaba.com/signup)
2. In the web UI, go to Profile and link your Suqaba account
3. Your authentication token will be securely stored for API access

## Supported File Formats

### Input Files
- **STEP** (.step, .stp) - CAD geometry files
- **IGES** (.iges, .igs) - CAD geometry files  
- **FEM Input** (.inp, .dat) - Finite element mesh files

### Output Files
- **Results** - Displacement and stress fields
- **Quality Certificate** - Error verification report
- **Mesh Data** - Refined mesh information

## Development

### Frontend Development

```bash
cd web-ui

# Start development server with hot reload
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Backend Development

```bash
cd backend

# Start with auto-reload
uvicorn main:app --reload

# Run tests
pytest

# Format code
black .
isort .
```

### Adding New Features

1. **Frontend**: Add new pages in `src/pages/` and components in `src/components/`
2. **Backend**: Add new routes in `app/api/routes/` and models in `app/models/`
3. **Database**: Create migrations with Alembic for schema changes

## Deployment

### Production Deployment

1. **Frontend**: Build and deploy to static hosting (Vercel, Netlify, etc.)
2. **Backend**: Deploy to cloud platform (AWS, GCP, Heroku, etc.)
3. **Database**: Use managed PostgreSQL service
4. **Environment**: Update environment variables for production

### Docker Deployment (Optional)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- **Documentation**: [Suqaba Tutorials](https://youtube.com/playlist?list=PLDs89bTacmzVPuK0SwfxOo5KqCiULLm3x)
- **Suqaba Website**: [suqaba.com](https://suqaba.com)
- **Issues**: Create an issue on GitHub for bug reports or feature requests
- **Email**: support@suqaba.com for Suqaba solver-related questions

## Acknowledgments

- **FreeCAD Project**: This UI builds upon the excellent FreeCAD platform
- **Suqaba Team**: For providing the innovative certified error verification solver
- **Open Source Community**: For the amazing tools and libraries that make this possible

---

**Note**: This web UI is designed to complement the existing Suqaba solver and FreeCAD integration. For the full desktop experience with 3D modeling capabilities, please refer to the main Suqaba distribution.
