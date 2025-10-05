"""
NEXORA Backend - FastAPI Application
=====================================

Main FastAPI application with MVP Agent integration.
"""

import os
import asyncio
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Import MVP Agent
from MVP_Agent import MVPNexoraAgent, WinsurfResponse

# Import Idea Validation API
from idea_validation_api import router as idea_validation_router

# Import Business Planning Agent
from business_planning_agent import BusinessPlanningAgent, BusinessPlanResponse

# Import Market Research Agent
from market_research_agent import MarketResearchAgent

# Import Pitch Deck Agent
from pitch_deck_agent import PitchDeckAgent

# Import Database
import database as db

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize agents
mvp_agent = None
business_planning_agent = None
market_research_agent = None
pitch_deck_agent = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    global mvp_agent, business_planning_agent, market_research_agent, pitch_deck_agent
    
    # Startup
    logger.info("Starting up NEXORA API...")
    
    # Initialize database
    try:
        if db.initialize_pool():
            logger.info("Database connection pool initialized")
            db.create_tables()
            logger.info("Database tables created/verified")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
    
    try:
        mvp_agent = MVPNexoraAgent()
        logger.info("MVP Nexora Agent initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize MVP Agent: {str(e)}")
    
    try:
        business_planning_agent = BusinessPlanningAgent()
        logger.info("Business Planning Agent initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Business Planning Agent: {str(e)}")
    
    try:
        market_research_agent = MarketResearchAgent()
        logger.info("Market Research Agent initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Market Research Agent: {str(e)}")
    
    try:
        pitch_deck_agent = PitchDeckAgent()
        logger.info("Pitch Deck Agent initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Pitch Deck Agent: {str(e)}")
    
    logger.info("NEXORA API startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down NEXORA API...")
    # Add any cleanup code here if needed
    logger.info("NEXORA API shutdown complete")

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="NEXORA API",
    description="AI-Powered Startup Generation Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS with security best practices
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://192.168.29.184:3000",  # Your local IP
    # Add production domains here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if os.getenv('ENVIRONMENT') == 'production' else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Include routers
app.include_router(idea_validation_router)

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class MVPDevelopmentRequest(BaseModel):
    """MVP Development request model"""
    productName: str = Field(..., description="Name of the product")
    productIdea: str = Field(..., description="Detailed product idea/specification")
    coreFeatures: List[str] = Field(default=[], description="List of core features")
    targetPlatform: str = Field(default="web", description="Target platform")
    techStack: List[str] = Field(default=[], description="Technology stack preferences")
    projectType: str = Field(default="web-app", description="Type of project")
    generateMultipleFiles: bool = Field(default=True, description="Generate multiple files")
    includeComponents: bool = Field(default=True, description="Include components")
    defaultLanguage: str = Field(default="react", description="Default language")
    userId: Optional[str] = Field(None, description="User ID")
    scrapeUrls: Optional[List[str]] = Field(None, description="URLs to scrape for reference")
    userSubscription: str = Field(default="free", description="User subscription tier")


class MVPRefineRequest(BaseModel):
    """MVP Refinement request model"""
    currentHtml: str = Field(..., description="Current HTML/code")
    feedback: str = Field(..., description="User feedback for refinement")
    userId: Optional[str] = Field(None, description="User ID")
    userSubscription: str = Field(default="free", description="User subscription tier")


class ChatRequest(BaseModel):
    """Chat request model"""
    message: str = Field(..., description="User message")
    context: Optional[str] = Field(None, description="Conversation context")
    userId: Optional[str] = Field(None, description="User ID")


class ScrapeUrlRequest(BaseModel):
    """URL scraping request model"""
    url: str = Field(..., description="URL to scrape")
    formats: List[str] = Field(default=["markdown", "html"], description="Output formats")


class SearchWebRequest(BaseModel):
    """Web search request model"""
    query: str = Field(..., description="Search query")
    maxResults: int = Field(default=10, description="Maximum results")


class E2BSandboxRequest(BaseModel):
    """E2B Sandbox creation request"""
    template: str = Field(default="base", description="Sandbox template")


class ExecuteCodeRequest(BaseModel):
    """Code execution request"""
    sandboxId: str = Field(..., description="Sandbox ID")
    code: str = Field(..., description="Code to execute")
    language: str = Field(default="javascript", description="Programming language")


class BusinessPlanRequest(BaseModel):
    """Business plan creation request"""
    idea: str = Field(..., description="Business idea description", min_length=10)
    industry: Optional[str] = Field("", description="Industry/sector")
    target_market: Optional[str] = Field("", description="Target market description")
    business_model: Optional[str] = Field("", description="Business model type")
    region: Optional[str] = Field("United States", description="Geographic region")
    budget: Optional[float] = Field(10000, description="Marketing budget", ge=0)
    export_formats: Optional[List[str]] = Field(["pdf", "docx"], description="Export formats")
    userId: Optional[str] = Field(None, description="User ID")


class UserRegistrationRequest(BaseModel):
    """User registration request"""
    email: str = Field(..., description="User email")
    name: str = Field(..., description="User name")
    password: str = Field(..., description="User password", min_length=6)


class UserLoginRequest(BaseModel):
    """User login request"""
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_user_subscription(user_id: Optional[str]) -> str:
    """Get user subscription tier (placeholder - integrate with your auth system)"""
    # TODO: Integrate with actual user database
    return "free"  # Default to free tier


async def verify_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Verify JWT token (placeholder - integrate with your auth system)"""
    # TODO: Implement actual JWT verification
    if authorization and authorization.startswith("Bearer "):
        return authorization.replace("Bearer ", "")
    return None


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "status": "ok",
        "message": "NEXORA API is running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "mvp_agent": "initialized" if mvp_agent else "not initialized",
        "business_planning_agent": "initialized" if business_planning_agent else "not initialized",
        "database": "connected" if db.test_connection() else "disconnected",
        "timestamp": datetime.now().isoformat()
    }


# ============================================================================
# USER AUTHENTICATION ENDPOINTS
# ============================================================================

@app.post("/api/auth/register")
async def register_user(request: UserRegistrationRequest):
    """Register a new user"""
    try:
        import uuid
        import hashlib
        
        # Check if user already exists
        existing_user = db.get_user_by_email(request.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        user_id = str(uuid.uuid4())
        password_hash = hashlib.sha256(request.password.encode()).hexdigest()
        
        if db.create_user(user_id, request.email, request.name, password_hash):
            return {
                "status": "success",
                "message": "User registered successfully",
                "user": {
                    "id": user_id,
                    "email": request.email,
                    "name": request.name,
                    "credits": 20
                }
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create user")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/auth/login")
async def login_user(request: UserLoginRequest):
    """Login user"""
    try:
        import hashlib
        
        # Get user
        user = db.get_user_by_email(request.email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Verify password
        password_hash = hashlib.sha256(request.password.encode()).hexdigest()
        if user['password_hash'] != password_hash:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return {
            "status": "success",
            "message": "Login successful",
            "user": {
                "id": user['id'],
                "email": user['email'],
                "name": user['name'],
                "credits": user['credits'],
                "subscription_tier": user['subscription_tier']
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/user/{user_id}")
async def get_user_info(user_id: str):
    """Get user information"""
    try:
        user = db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "status": "success",
            "user": {
                "id": user['id'],
                "email": user['email'],
                "name": user['name'],
                "credits": user['credits'],
                "subscription_tier": user['subscription_tier'],
                "created_at": user['created_at'].isoformat() if user.get('created_at') else None
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mvpDevelopment")
async def mvp_development(
    request: MVPDevelopmentRequest,
    token: Optional[str] = Depends(verify_token)
):
    """
    Main MVP Development endpoint
    
    Generates a complete full-stack application based on user specifications.
    """
    try:
        if not mvp_agent:
            raise HTTPException(status_code=503, detail="MVP Agent not initialized")
        
        logger.info(f"MVP Development request: {request.productName}")
        
        # Build comprehensive user request
        user_request = f"""
Build a {request.projectType} called "{request.productName}".

Description: {request.productIdea}

Core Features:
{chr(10).join(f"- {feature}" for feature in request.coreFeatures)}

Target Platform: {request.targetPlatform}
Tech Stack: {', '.join(request.techStack) if request.techStack else 'Use best practices'}

Requirements:
- Generate multiple files with proper structure
- Include reusable components
- Modern, responsive UI with Tailwind CSS
- Complete functionality with all features
- Professional code quality
        """.strip()
        
        # Get user subscription
        subscription = request.userSubscription or get_user_subscription(request.userId)
        
        # Build MVP using the agent
        response: WinsurfResponse = await mvp_agent.build_mvp(
            user_request=user_request,
            scrape_urls=request.scrapeUrls,
            user_subscription=subscription
        )
        
        # Format response for frontend
        formatted_response = mvp_agent.format_response(response)
        
        # Extract HTML for live preview (if available)
        live_preview_html = None
        if response.files:
            # Find index.html or main HTML file
            for file_info in response.files:
                if 'index.html' in file_info.path.lower() or file_info.path.endswith('.html'):
                    # Read the actual file content
                    try:
                        from pathlib import Path
                        import tempfile
                        # The files are in a temp directory, we need to reconstruct the path
                        # For now, use the preview_url or e2b_embed
                        live_preview_html = response.e2b_embed
                    except:
                        pass
                    break
        
        # Return response in format expected by frontend
        return {
            "status": "success",
            "data": {
                "livePreviewHtml": live_preview_html or response.e2b_embed,
                "html": live_preview_html or response.e2b_embed,
                "winsurf_response": formatted_response["winsurf_response"],
                "preview_url": response.preview_url,
                "artifact_zip": response.artifact_zip,
                "files": [
                    {
                        "path": f.path,
                        "preview": f.preview,
                        "size": f.size,
                        "language": f.language
                    }
                    for f in response.files
                ],
                "build_status": response.build.status,
                "test_status": response.tests.status,
                "next_steps": response.next_steps
            }
        }
    
    except Exception as e:
        logger.error(f"Error in MVP development: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mvp/refine")
async def mvp_refine(
    request: MVPRefineRequest,
    token: Optional[str] = Depends(verify_token)
):
    """
    Refine existing MVP based on user feedback
    """
    try:
        if not mvp_agent:
            raise HTTPException(status_code=503, detail="MVP Agent not initialized")
        
        logger.info(f"MVP Refinement request")
        
        # Build refinement request
        user_request = f"""
Modify the existing application based on this feedback:

{request.feedback}

Current code:
```html
{request.currentHtml[:1000]}...
```

Please make the requested changes while maintaining the existing structure and functionality.
        """.strip()
        
        # Get user subscription
        subscription = request.userSubscription or get_user_subscription(request.userId)
        
        # Build refined MVP
        response: WinsurfResponse = await mvp_agent.build_mvp(
            user_request=user_request,
            scrape_urls=None,
            user_subscription=subscription
        )
        
        # Format response
        formatted_response = mvp_agent.format_response(response)
        
        return {
            "status": "success",
            "data": {
                "livePreviewHtml": response.e2b_embed,
                "html": response.e2b_embed,
                "winsurf_response": formatted_response["winsurf_response"],
                "preview_url": response.preview_url,
                "artifact_zip": response.artifact_zip,
                "next_steps": response.next_steps
            }
        }
    
    except Exception as e:
        logger.error(f"Error in MVP refinement: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
async def chat(
    request: ChatRequest,
    token: Optional[str] = Depends(verify_token)
):
    """
    Chat endpoint for conversational AI
    """
    try:
        if not mvp_agent:
            raise HTTPException(status_code=503, detail="MVP Agent not initialized")
        
        # Use DeepSeek for chat responses
        response = await mvp_agent.deepseek.generate_code(
            prompt=request.message,
            system_prompt="You are Nexora AI, a helpful assistant for building applications. Be concise and helpful.",
            temperature=0.7,
            max_tokens=1000
        )
        
        return {
            "status": "success",
            "response": response,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/scrape-url")
async def scrape_url(request: ScrapeUrlRequest):
    """
    Scrape URL using FireCrawl
    """
    try:
        if not mvp_agent:
            raise HTTPException(status_code=503, detail="MVP Agent not initialized")
        
        result = await mvp_agent.firecrawl.scrape_url(
            url=request.url,
            formats=request.formats
        )
        
        return {
            "status": "success",
            "data": result
        }
    
    except Exception as e:
        logger.error(f"Error scraping URL: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search-web")
async def search_web(request: SearchWebRequest):
    """
    Search web using FireCrawl
    """
    try:
        if not mvp_agent:
            raise HTTPException(status_code=503, detail="MVP Agent not initialized")
        
        # Note: FireCrawl doesn't have a direct search API in our implementation
        # This would need to be implemented based on FireCrawl's actual API
        return {
            "status": "success",
            "message": "Web search not yet implemented",
            "query": request.query
        }
    
    except Exception as e:
        logger.error(f"Error searching web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/e2b/create-sandbox")
async def create_e2b_sandbox(request: E2BSandboxRequest):
    """
    Create E2B sandbox
    """
    try:
        if not mvp_agent:
            raise HTTPException(status_code=503, detail="MVP Agent not initialized")
        
        sandbox = await mvp_agent.e2b.create_sandbox(template=request.template)
        
        return {
            "status": "success",
            "data": sandbox
        }
    
    except Exception as e:
        logger.error(f"Error creating E2B sandbox: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/e2b/execute-code")
async def execute_code(request: ExecuteCodeRequest):
    """
    Execute code in E2B sandbox
    """
    try:
        if not mvp_agent:
            raise HTTPException(status_code=503, detail="MVP Agent not initialized")
        
        result = await mvp_agent.e2b.execute_command(
            sandbox_id=request.sandboxId,
            command=f"echo '{request.code}' | {request.language}"
        )
        
        return {
            "status": "success",
            "data": result
        }
    
    except Exception as e:
        logger.error(f"Error executing code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# BUSINESS PLANNING API ENDPOINTS
# ============================================================================

@app.post("/api/business-plan/create")
async def create_business_plan(
    request: BusinessPlanRequest,
    token: Optional[str] = Depends(verify_token)
):
    """
    Create a complete business plan
    
    Generates:
    - Lean Canvas (all 9 blocks)
    - Financial projections (3-year)
    - Team composition
    - Marketing strategy
    - Investor summary
    - Regulatory compliance analysis
    - AI co-founder feedback
    - Exports to PDF/DOCX
    """
    try:
        if not business_planning_agent:
            raise HTTPException(status_code=503, detail="Business Planning Agent not initialized")
        
        logger.info(f"Creating business plan for: {request.idea[:50]}...")
        
        # Create business plan
        business_plan: BusinessPlanResponse = await business_planning_agent.create_business_plan(
            idea=request.idea,
            industry=request.industry or "",
            target_market=request.target_market or "",
            business_model=request.business_model or "",
            region=request.region or "United States",
            budget=request.budget or 10000,
            export_formats=request.export_formats or ["pdf", "docx"]
        )
        
        # Format response
        formatted_response = business_planning_agent.format_response(business_plan)
        
        return {
            "status": "success",
            "data": formatted_response
        }
    
    except Exception as e:
        logger.error(f"Error creating business plan: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/business-plan/lean-canvas")
async def generate_lean_canvas(
    request: BaseModel,
    token: Optional[str] = Depends(verify_token)
):
    """Generate Lean Canvas only"""
    try:
        if not business_planning_agent:
            raise HTTPException(status_code=503, detail="Business Planning Agent not initialized")
        
        idea = request.dict().get("idea", "")
        target_market = request.dict().get("target_market", "")
        business_model = request.dict().get("business_model", "")
        
        lean_canvas = await business_planning_agent.generate_lean_canvas(
            idea=idea,
            target_market=target_market,
            business_model=business_model
        )
        
        from dataclasses import asdict
        return {
            "status": "success",
            "data": asdict(lean_canvas)
        }
    
    except Exception as e:
        logger.error(f"Error generating lean canvas: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/business-plan/financials")
async def estimate_financials(
    request: BaseModel,
    token: Optional[str] = Depends(verify_token)
):
    """Estimate financial projections"""
    try:
        if not business_planning_agent:
            raise HTTPException(status_code=503, detail="Business Planning Agent not initialized")
        
        idea = request.dict().get("idea", "")
        business_model = request.dict().get("business_model", "")
        target_market_size = request.dict().get("target_market_size", "")
        
        financials = await business_planning_agent.estimate_financials(
            idea=idea,
            business_model=business_model,
            target_market_size=target_market_size
        )
        
        from dataclasses import asdict
        return {
            "status": "success",
            "data": asdict(financials)
        }
    
    except Exception as e:
        logger.error(f"Error estimating financials: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/business-plan/team")
async def map_team_roles(
    request: BaseModel,
    token: Optional[str] = Depends(verify_token)
):
    """Map team roles and composition"""
    try:
        if not business_planning_agent:
            raise HTTPException(status_code=503, detail="Business Planning Agent not initialized")
        
        idea = request.dict().get("idea", "")
        business_model = request.dict().get("business_model", "")
        stage = request.dict().get("stage", "pre-seed")
        
        team = await business_planning_agent.map_team_roles(
            idea=idea,
            business_model=business_model,
            stage=stage
        )
        
        from dataclasses import asdict
        return {
            "status": "success",
            "data": asdict(team)
        }
    
    except Exception as e:
        logger.error(f"Error mapping team roles: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/business-plan/marketing")
async def build_marketing_strategy(
    request: BaseModel,
    token: Optional[str] = Depends(verify_token)
):
    """Build marketing strategy"""
    try:
        if not business_planning_agent:
            raise HTTPException(status_code=503, detail="Business Planning Agent not initialized")
        
        idea = request.dict().get("idea", "")
        target_audience = request.dict().get("target_audience", "")
        budget = request.dict().get("budget", 10000)
        
        marketing = await business_planning_agent.build_marketing_strategy(
            idea=idea,
            target_audience=target_audience,
            budget=budget
        )
        
        from dataclasses import asdict
        return {
            "status": "success",
            "data": asdict(marketing)
        }
    
    except Exception as e:
        logger.error(f"Error building marketing strategy: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/business-plan/compliance")
async def check_compliance(
    request: BaseModel,
    token: Optional[str] = Depends(verify_token)
):
    """Check regulatory compliance"""
    try:
        if not business_planning_agent:
            raise HTTPException(status_code=503, detail="Business Planning Agent not initialized")
        
        idea = request.dict().get("idea", "")
        industry = request.dict().get("industry", "")
        region = request.dict().get("region", "United States")
        
        compliance = await business_planning_agent.check_regulatory_compliance(
            idea=idea,
            industry=industry,
            region=region
        )
        
        from dataclasses import asdict
        return {
            "status": "success",
            "data": asdict(compliance)
        }
    
    except Exception as e:
        logger.error(f"Error checking compliance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/business-plan/health")
async def business_plan_health():
    """Health check for Business Planning Agent"""
    return {
        "status": "ok",
        "agent": "initialized" if business_planning_agent else "not initialized",
        "timestamp": datetime.now().isoformat()
    }


# ============================================================================
# MARKET RESEARCH API ENDPOINTS
# ============================================================================

@app.post("/api/market-research/research")
async def conduct_market_research(
    request: BaseModel,
    token: Optional[str] = Depends(verify_token)
):
    """Conduct comprehensive market research"""
    try:
        if not market_research_agent:
            raise HTTPException(status_code=503, detail="Market Research Agent not initialized")
        
        data = request.dict()
        result = await market_research_agent.conduct_research(
            industry=data.get("industry", ""),
            target_segment=data.get("target_segment", ""),
            product_description=data.get("product_description", ""),
            geographic_scope=data.get("geographic_scope", "Global")
        )
        
        return {
            "status": "success",
            "data": result
        }
    
    except Exception as e:
        logger.error(f"Error in market research: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/market-research/competitors")
async def discover_competitors(
    request: BaseModel,
    token: Optional[str] = Depends(verify_token)
):
    """Discover competitors in the market"""
    try:
        if not market_research_agent:
            raise HTTPException(status_code=503, detail="Market Research Agent not initialized")
        
        data = request.dict()
        competitors = await market_research_agent.discover_competitors(
            industry=data.get("industry", ""),
            target_segment=data.get("target_segment", ""),
            limit=data.get("limit", 10)
        )
        
        return {
            "status": "success",
            "competitors": competitors
        }
    
    except Exception as e:
        logger.error(f"Error discovering competitors: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/market-research/health")
async def market_research_health():
    """Health check for Market Research Agent"""
    return {
        "status": "ok",
        "agent": "initialized" if market_research_agent else "not initialized",
        "timestamp": datetime.now().isoformat()
    }


# ============================================================================
# PITCH DECK API ENDPOINTS
# ============================================================================

@app.post("/api/pitch-deck/generate")
async def generate_pitch_deck(
    request: BaseModel,
    token: Optional[str] = Depends(verify_token)
):
    """Generate a complete pitch deck"""
    try:
        if not pitch_deck_agent:
            raise HTTPException(status_code=503, detail="Pitch Deck Agent not initialized")
        
        data = request.dict()
        pitch_deck = await pitch_deck_agent.generate_slides(
            business_idea=data.get("business_idea", ""),
            business_name=data.get("business_name", ""),
            target_market=data.get("target_market", ""),
            funding_ask=data.get("funding_ask", 0)
        )
        
        return {
            "status": "success",
            "data": pitch_deck
        }
    
    except Exception as e:
        logger.error(f"Error generating pitch deck: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pitch-deck/voiceover")
async def generate_voiceover(
    request: BaseModel,
    token: Optional[str] = Depends(verify_token)
):
    """Generate voiceover for pitch deck"""
    try:
        if not pitch_deck_agent:
            raise HTTPException(status_code=503, detail="Pitch Deck Agent not initialized")
        
        data = request.dict()
        voiceover = await pitch_deck_agent.generate_voiceover(
            slides_content=data.get("slides_content", []),
            voice_style=data.get("voice_style", "professional")
        )
        
        return {
            "status": "success",
            "data": voiceover
        }
    
    except Exception as e:
        logger.error(f"Error generating voiceover: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/pitch-deck/health")
async def pitch_deck_health():
    """Health check for Pitch Deck Agent"""
    return {
        "status": "ok",
        "agent": "initialized" if pitch_deck_agent else "not initialized",
        "timestamp": datetime.now().isoformat()
    }


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail,
            "timestamp": datetime.now().isoformat()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error",
            "timestamp": datetime.now().isoformat()
        }
    )


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
