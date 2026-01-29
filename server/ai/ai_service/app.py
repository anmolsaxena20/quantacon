"""
Desert Pulse - Complete FastAPI Application
Main application file with all routes and features integrated.
Version: 2.0 - All Advanced Features Working
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import all route modules
from routes import auth, generate, complete, coach, report, notifications

# Import database connection
from data_layer.mongo import init_db, ping_db, close_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    logger.info("="*70)
    logger.info("🚀 Starting Desert Pulse API - Rhythm of the Body")
    logger.info("="*70)

    # Initialize database
    logger.info("📦 Initializing database...")
    try:
        await init_db()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")

    # Test database connection
    logger.info("🔌 Testing database connection...")
    try:
        is_connected = await ping_db()
        if is_connected:
            logger.info("✅ Database connection verified")
        else:
            logger.warning("⚠️  Database connection test failed")
    except Exception as e:
        logger.warning(f"⚠️  Database connection test error: {e}")

    # Test Gemini API
    logger.info("🤖 Testing Gemini AI connection...")
    try:
        from ai_logic.gemini_client_enhanced import test_gemini_connection
        is_gemini_ok = await test_gemini_connection()
        if is_gemini_ok:
            logger.info("✅ Gemini AI connected successfully")
            logger.info(f"   API Key: AIzaSyAjNBTQD7hHFXkLDOuDL86p_MyQHTS13bk")
            logger.info(f"   Model: {os.getenv('GEMINI_MODEL', 'gemini-2.5-flash-exp')}")
        else:
            logger.warning("⚠️  Gemini AI connection failed - fallback mode active")
    except Exception as e:
        logger.warning(f"⚠️  Gemini connection test error: {e}")

    logger.info("="*70)
    logger.info("✅ Desert Pulse API is ready!")
    logger.info("📍 API Documentation: http://localhost:8000/docs")
    logger.info("📍 Health Check: http://localhost:8000/health")
    logger.info("📍 Features List: http://localhost:8000/features")
    logger.info("="*70)

    yield

    # Shutdown
    logger.info("="*70)
    logger.info("👋 Shutting down Desert Pulse API...")
    logger.info("="*70)
    try:
        await close_db()
        logger.info("✅ Database connection closed")
    except Exception as e:
        logger.error(f"❌ Error closing database: {e}")


# Create FastAPI app
app = FastAPI(
    title="Desert Pulse - AI Fitness Coach",
    description="""
    # Desert Pulse: Rhythm of the Body
    
    An intelligent, adaptive fitness application inspired by the Fremen philosophy from Dune:
    **discipline, balance, and adaptation**.
    
    ## 🎯 Core Features
    - **Adaptive Difficulty**: ML-based workout intensity adjustment
    - **AI Workout Generator**: Gemini-powered personalized workouts
    - **AI Coach**: Conversational exercise guidance
    - **Progress Tracking**: Comprehensive history and analytics
    - **Weekly Reports**: Detailed insights and recommendations
    - **Smart Notifications**: Reminders and achievements
    
    ## 🤖 AI-Powered Features
    - Context-aware workout generation
    - Injury-specific modifications
    - Form coaching and tips
    - Motivational messaging
    - Pattern recognition
    - Trend detection
    
    ## 🚀 Quick Start
    1. **Login**: `POST /auth/login` with your name
    2. **Generate Workout**: `POST /workout/generate` with your preferences
    3. **Get AI Coach**: `POST /coach/guidance` for exercise help
    4. **Complete Workout**: `POST /workout/complete` to track progress
    5. **View Report**: `GET /report/weekly/{user_id}` for insights
    
    ## 🔗 Useful Endpoints
    - `/docs` - Interactive API documentation
    - `/health` - System health check
    - `/features` - Feature list
    - `/stats` - System statistics
    """,
    version="2.0.0",
    lifespan=lifespan,
    contact={
        "name": "Desert Pulse Team",
        "email": "support@desertpulse.ai"
    },
    license_info={
        "name": "MIT",
    }
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production: ["https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router)
app.include_router(generate.router)
app.include_router(complete.router)
app.include_router(coach.router)
app.include_router(report.router)
app.include_router(notifications.router)

logger.info("✅ All routers registered")


@app.get("/", tags=["Root"])
async def root():
    """
    API root endpoint with comprehensive information.
    """
    return {
        "name": "Desert Pulse - AI Fitness Coach",
        "tagline": "Rhythm of the Body",
        "version": "2.0.0",
        "description": "Adaptive fitness application inspired by Fremen philosophy",
        "philosophy": "Discipline, balance, and adaptation - never waste energy, never overexert",
        "status": "operational",
        "api_key_configured": "AIzaSyBFWXtXCBEmKUhPgX6duMcVevf0EWW0sFE" [:20] + "...",
        "links": {
            "documentation": "/docs",
            "alternative_docs": "/redoc",
            "health_check": "/health",
            "features": "/features",
            "statistics": "/stats"
        },
        "quick_start": {
            "step_1": "POST /auth/login - Create your account",
            "step_2": "POST /workout/generate - Get AI-powered workout",
            "step_3": "POST /coach/guidance - Get exercise coaching",
            "step_4": "POST /workout/complete - Track completion",
            "step_5": "GET /report/weekly/{user_id} - View progress"
        }
    }


@app.get("/health", tags=["System"])
async def health_check():
    """
    Comprehensive health check endpoint for system monitoring.

    Returns the health status of:
    - Overall system
    - MongoDB database
    - Gemini AI service
    """
    from datetime import datetime, timezone

    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "2.0.0",
        "components": {}
    }

    # Test database
    try:
        db_status = await ping_db()
        health_status["components"]["database"] = {
            "status": "healthy" if db_status else "unhealthy",
            "type": "MongoDB",
            "message": "Connected" if db_status else "Connection failed"
        }
    except Exception as e:
        health_status["components"]["database"] = {
            "status": "error",
            "type": "MongoDB",
            "error": str(e)
        }
        health_status["status"] = "degraded"

    # Test Gemini API
    try:
        from ai_logic.gemini_client_enhanced import test_gemini_connection
        ai_status = await test_gemini_connection()
        health_status["components"]["ai_service"] = {
            "status": "healthy" if ai_status else "unhealthy",
            "type": "Google Gemini",
            "model": os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            "api_key_partial": "AIzaSyAjNBTQD7hHFXkLDOuDL86p_MyQHTS13bk",
            "message": "Connected" if ai_status else "Connection failed"
        }
        if not ai_status:
            health_status["status"] = "degraded"
    except Exception as e:
        health_status["components"]["ai_service"] = {
            "status": "error",
            "type": "Google Gemini",
            "error": str(e)
        }
        health_status["status"] = "degraded"

    return health_status


@app.get("/features", tags=["System"])
async def list_features():
    """
    List all available features and endpoints with descriptions.
    """
    return {
        "application": "Desert Pulse - AI Fitness Coach",
        "version": "2.0.0",
        "features": {
            "authentication": {
                "status": "✅ Active",
                "endpoints": [
                    "POST /auth/login - Create or login user",
                    "GET /auth/user/{user_id} - Get user profile"
                ],
                "description": "Simple name-based authentication"
            },
            "workout_generation": {
                "status": "✅ Active",
                "ai_powered": True,
                "endpoints": [
                    "POST /workout/generate - Generate personalized workout",
                    "GET /workout/test - Test workout generation"
                ],
                "description": "AI-powered adaptive workout generation using Gemini",
                "features": [
                    "Context-aware generation",
                    "Injury-specific modifications",
                    "Time and location adaptation",
                    "Goal-oriented programming"
                ]
            },
            "workout_tracking": {
                "status": "✅ Active",
                "endpoints": [
                    "POST /workout/complete - Record workout completion",
                    "GET /workout/history/{user_id} - View workout history"
                ],
                "description": "Track progress and build workout history"
            },
            "ai_coach": {
                "status": "✅ Active",
                "ai_powered": True,
                "endpoints": [
                    "POST /coach/guidance - Get exercise coaching",
                    "POST /coach/motivate - Get motivational message",
                    "GET /coach/exercises - List available exercises"
                ],
                "description": "Conversational AI coach for exercise form and motivation",
                "features": [
                    "Step-by-step instructions",
                    "Form tips and corrections",
                    "Breathing cues",
                    "Injury modifications",
                    "Motivational support"
                ]
            },
            "reports_analytics": {
                "status": "✅ Active",
                "endpoints": [
                    "POST /report/weekly - Generate weekly report",
                    "GET /report/weekly/{user_id} - Get weekly report",
                    "GET /report/stats/{user_id} - Get user statistics"
                ],
                "description": "Comprehensive progress reports and analytics"
            },
            "notifications": {
                "status": "✅ Active",
                "endpoints": [
                    "POST /notifications/preferences - Set notification preferences",
                    "GET /notifications/preferences/{user_id} - Get preferences",
                    "POST /notifications/send - Send notification",
                    "GET /notifications/list/{user_id} - List notifications",
                    "POST /notifications/mark-read/{notification_id} - Mark as read",
                    "POST /notifications/mark-all-read/{user_id} - Mark all as read",
                    "DELETE /notifications/delete/{notification_id} - Delete notification"
                ],
                "description": "Smart notification system with reminders and alerts"
            }
        }
    }


@app.get("/stats", tags=["System"])
async def system_stats():
    """
    Get system-wide statistics and metrics.
    """
    from data_layer.mongo import db

    try:
        # Count documents
        users_count = await db["users"].count_documents({})
        workouts_count = await db["workout_sessions"].count_documents({})
        completed_workouts = await db["workout_sessions"].count_documents({"completed": True})
        notifications_count = await db["notifications"].count_documents({})

        return {
            "status": "operational",
            "system_stats": {
                "total_users": users_count,
                "total_workouts": workouts_count,
                "completed_workouts": completed_workouts,
                "completion_rate": round(completed_workouts / workouts_count * 100, 1) if workouts_count > 0 else 0,
                "total_notifications": notifications_count
            },
            "database": {
                "name": "desert_pulse",
                "collections": [
                    "users",
                    "ai_state",
                    "workout_sessions",
                    "notifications",
                    "user_preferences"
                ]
            }
        }
    except Exception as e:
        logger.error(f"Error retrieving stats: {e}")
        return {
            "status": "error",
            "error": str(e)
        }


@app.get("/ping", tags=["System"])
async def ping():
    """Simple ping endpoint for uptime monitoring."""
    return {"status": "pong", "timestamp": "2025-01-30"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")

    logger.info(f"Starting server on {host}:{port}")

    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )