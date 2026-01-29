# Routes package initialization
"""
API routes for Desert Pulse workout generator.
"""
# Change this in routes/__init__.py:
from routes.auth import router as auth_router
from routes.generate import router as generate_router
from routes.complete import router as complete_router
from routes.report import router as report_router

__all__ = [
    "auth_router",
    "generate_router",
    "complete_router",
    "report_router"
]