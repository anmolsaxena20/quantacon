# Routes package initialization
"""
API routes for Desert Pulse workout generator.
"""
# Change this in api/__init__.py:
from api.auth import router as auth_router
from api.generate import router as generate_router
from api.complete import router as complete_router
from api.report import router as report_router

__all__ = [
    "auth_router",
    "generate_router",
    "complete_router",
    "report_router"
]