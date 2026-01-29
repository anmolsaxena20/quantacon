"""
Main FastAPI application for Desert Pulse Workout Generator.
Combines all routers and handles startup/shutdown events.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import routers
from routes.auth import router as auth_router
from routes.generate import router as generate_router
from routes.complete import router as complete_router
from routes.report import router as report_router

# Import database functions
from data_layer.mongo import init_db, close_db, ping_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    print("🚀 Starting Desert Pulse API...")
    await init_db()

    # Check database connection
    if await ping_db():
        print("✓ Database connection established")
    else:
        print("✗ Database connection failed")

    yield

    # Shutdown
    print("👋 Shutting down Desert Pulse API...")
    await close_db()


# Create FastAPI app
app = FastAPI(
    title="Desert Pulse - AI Workout Generator",
    description="Personalized workout generation with adaptive AI",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(generate_router)
app.include_router(complete_router)
app.include_router(report_router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Desert Pulse - AI Workout Generator",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """
    Detailed health check including database status.
    """
    db_healthy = await ping_db()

    return {
        "status": "healthy" if db_healthy else "degraded",
        "database": "connected" if db_healthy else "disconnected",
        "service": "Desert Pulse API"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )