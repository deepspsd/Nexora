"""
API Version 1 - Stable Endpoints
Maintains backward compatibility
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger(__name__)

# Create v1 router
router = APIRouter(prefix="/api/v1", tags=["v1"])

# Import agents (will be injected)
mvp_builder_agent = None
idea_validation_agent = None
business_planning_agent = None
market_research_agent = None
pitch_deck_agent = None


def set_agents(mvp, idea, business, market, pitch):
    """Set agent instances"""
    global mvp_builder_agent, idea_validation_agent, business_planning_agent
    global market_research_agent, pitch_deck_agent
    
    mvp_builder_agent = mvp
    idea_validation_agent = idea
    business_planning_agent = business
    market_research_agent = market
    pitch_deck_agent = pitch


# Health check
@router.get("/health")
async def health_check():
    """API v1 health check"""
    return {
        "status": "ok",
        "version": "1.0.0",
        "message": "API v1 is running"
    }


# Placeholder for future v1-specific endpoints
# These will maintain backward compatibility even when v2 changes
