"""
NEXORA Backend - FastAPI Application
=====================================

Main FastAPI application with MVP Agent integration.
"""

import os
import asyncio
import logging
import uuid
from typing import Optional, Dict, Any, List
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Import MVP Builder Agent
from mvp_builder_agent import (
    MVPBuilderAgent,
    CodeGenerationRequest, 
    WebsiteScrapingRequest, 
    SandboxCreateRequest, 
    FileUpdateRequest,
    AIModel
)

# Import Idea Validation Agent
from idea_validation_agent import IdeaValidationAgent
from idea_validation_api import router as idea_validation_router

# Import Business Planning Agent
from business_planning_agent import BusinessPlanningAgent, BusinessPlanResponse, router as business_planning_router

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

# Global variables
mvp_builder_agent = None

# Initialize agents
idea_validation_agent = None
business_planning_agent = None
market_research_agent = None
pitch_deck_agent = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    global mvp_agent, idea_validation_agent, business_planning_agent, market_research_agent, pitch_deck_agent
    
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
    
    global mvp_builder_agent
    try:
        mvp_builder_agent = MVPBuilderAgent()
        logger.info("✓ MVP Builder Agent initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize MVP Agent: {str(e)}")
    
    try:
        idea_validation_agent = IdeaValidationAgent()
        logger.info("✓ Idea Validation Agent initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Idea Validation Agent: {str(e)}")
    
    try:
        business_planning_agent = BusinessPlanningAgent()
        logger.info("✓ Business Planning Agent initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Business Planning Agent: {str(e)}")
    
    try:
        market_research_agent = MarketResearchAgent()
        logger.info("✓ Market Research Agent initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Market Research Agent: {str(e)}")
    
    try:
        pitch_deck_agent = PitchDeckAgent()
        logger.info("✓ Pitch Deck Agent initialized successfully")
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
app.include_router(business_planning_router)

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================



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
    sandboxId: str = Field(..., description="Sandbox ID")
    code: str = Field(..., description="Code to execute")
    language: str = Field(default="javascript", description="Programming language")


class UserRegistrationRequest(BaseModel):
    """User registration request"""
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password", min_length=6)
    name: str = Field(..., description="User name")


class UserLoginRequest(BaseModel):
    """User login request"""
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password", min_length=6)


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
    # Check database connection safely
    db_status = "disconnected"
    try:
        if db and db.test_connection():
            db_status = "connected"
    except Exception as e:
        logger.warning(f"Database health check failed: {str(e)}")
        db_status = f"error: {str(e)[:50]}"
    
    return {
        "status": "ok",
        "agents": {
            "mvp_agent": "initialized" if mvp_agent else "not initialized",
            "idea_validation_agent": "initialized" if idea_validation_agent else "not initialized",
            "business_planning_agent": "initialized" if business_planning_agent else "not initialized",
            "market_research_agent": "initialized" if market_research_agent else "not initialized",
            "pitch_deck_agent": "initialized" if pitch_deck_agent else "not initialized",
        },
        "database": db_status,
        "timestamp": datetime.now().isoformat()
    }


# ============================================================================
# USER AUTHENTICATION ENDPOINTS
# ============================================================================

# Add routes without /api prefix for frontend compatibility
@app.post("/auth/login")
async def login_user_compat(request: UserLoginRequest):
    """Login user - compatibility route"""
    return await login_user(request)

@app.post("/auth/register")
async def register_user_compat(request: UserRegistrationRequest):
    """Register user - compatibility route"""
    return await register_user(request)

@app.get("/auth/user/{user_id}")
async def get_user_info_compat(user_id: str):
    """Get user info - compatibility route"""
    return await get_user_info(user_id)

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
            logger.warning(f"Login attempt for non-existent user: {request.email}")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        password_hash = hashlib.sha256(request.password.encode()).hexdigest()
        if user.get('password_hash') != password_hash:
            logger.warning(f"Invalid password attempt for user: {request.email}")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Store user info in response
        user_data = {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "credits": user.get('credits', 0),
            "subscription_tier": user.get('subscription_tier', 'free')
        }
        
        logger.info(f"User logged in successfully: {request.email}")
        
        return {
            "status": "success",
            "message": "Login successful",
            "user": user_data,
            "token": "dummy-token-" + user['id']  # Add a simple token for now
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred during login")


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












@app.post("/api/chat")
async def chat(
    request: ChatRequest,
    token: Optional[str] = Depends(verify_token)
):
    """
    Chat endpoint for conversational AI with smart intent detection
    """
    try:
        if not mvp_agent:
            raise HTTPException(status_code=503, detail="MVP Agent not initialized")
        
        message_lower = request.message.lower().strip()
        
        # Detect conversational greetings and casual messages
        greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening']
        casual_phrases = ['how are you', 'what can you do', 'help', 'who are you', 'what are you']
        
        is_greeting = any(message_lower.startswith(g) for g in greetings)
        is_casual = any(phrase in message_lower for phrase in casual_phrases)
        
        # Build keywords that indicate MVP generation intent
        build_keywords = ['build', 'create', 'make', 'develop', 'generate', 'design', 'app', 'website', 'application']
        is_build_request = any(keyword in message_lower for keyword in build_keywords)
        
        # Determine system prompt based on intent
        if is_greeting or is_casual:
            system_prompt = """You are Nexora AI, a friendly AI assistant specialized in building MVPs and applications.

Respond warmly and professionally. Introduce yourself and explain what you can do:
- Build full-stack web applications
- Create mobile apps
- Generate business plans
- Validate startup ideas
- Create pitch decks

Keep responses concise (2-3 sentences max)."""
        
        elif is_build_request:
            system_prompt = """You are Nexora AI, an expert MVP builder. The user wants to build something.

Ask clarifying questions to understand:
1. What type of application? (web app, mobile app, etc.)
2. Main features needed?
3. Target users?
4. Tech stack preferences?

Be helpful and guide them to provide details for MVP generation."""
        
        else:
            system_prompt = """You are Nexora AI, a helpful assistant for building applications.

Provide helpful, concise responses. If the user seems interested in building something, guide them toward MVP generation."""
        
        # Use DeepSeek for chat responses
        response = await mvp_agent.deepseek.generate_code(
            prompt=request.message,
            system_prompt=system_prompt,
            temperature=0.8,  # More creative for conversation
            max_tokens=500,
            timeout=30,
            max_retries=2
        )
        
        return {
            "status": "success",
            "response": response,
            "intent": "greeting" if is_greeting else ("build" if is_build_request else "general"),
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


# Business Planning endpoints are now handled by the business_planning_router


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

class PitchDeckCreateRequest(BaseModel):
    """Pitch deck creation request"""
    business_idea: str = Field(..., description="Business idea description")
    business_name: str = Field(default="", description="Business name")
    target_market: str = Field(default="", description="Target market")
    funding_ask: float = Field(default=0, description="Funding ask amount")
    brand_tone: str = Field(default="professional", description="Brand tone")
    include_voiceover: bool = Field(default=True, description="Include voiceover")
    include_demo_script: bool = Field(default=True, description="Include demo script")
    include_qa: bool = Field(default=True, description="Include Q&A")


class PitchDeckSlidesRequest(BaseModel):
    """Pitch deck slides generation request"""
    business_idea: str = Field(..., description="Business idea description")
    business_name: str = Field(default="", description="Business name")
    target_market: str = Field(default="", description="Target market")
    funding_ask: float = Field(default=0, description="Funding ask amount")


class VoiceoverRequest(BaseModel):
    """Voiceover generation request"""
    slides: Dict[str, Any] = Field(..., description="Slides data")
    voice_style: str = Field(default="professional", description="Voice style")


class DemoScriptRequest(BaseModel):
    """Demo script generation request"""
    slides: Dict[str, Any] = Field(..., description="Slides data")
    target_duration_minutes: float = Field(default=5.0, description="Target duration")


class InvestorQARequest(BaseModel):
    """Investor Q&A generation request"""
    business_idea: str = Field(..., description="Business idea")
    slides: Dict[str, Any] = Field(..., description="Slides data")
    num_questions: int = Field(default=10, description="Number of questions")


class DesignThemeRequest(BaseModel):
    """Design theme selection request"""
    business_idea: str = Field(..., description="Business idea")
    brand_tone: str = Field(default="professional", description="Brand tone")


@app.post("/api/pitch-deck/create")
async def create_pitch_deck(
    request: PitchDeckCreateRequest,
    token: Optional[str] = Depends(verify_token)
):
    """Create a complete pitch deck with all features"""
    try:
        if not pitch_deck_agent:
            raise HTTPException(status_code=503, detail="Pitch Deck Agent not initialized")
        
        logger.info(f"Creating pitch deck for: {request.business_name or request.business_idea[:50]}")
        
        # Create complete pitch deck
        pitch_deck = await pitch_deck_agent.create_pitch_deck(
            business_idea=request.business_idea,
            business_name=request.business_name,
            target_market=request.target_market,
            funding_ask=request.funding_ask,
            brand_tone=request.brand_tone,
            include_voiceover=request.include_voiceover,
            include_demo_script=request.include_demo_script,
            include_qa=request.include_qa
        )
        
        # Convert to dict for JSON serialization
        from dataclasses import asdict
        pitch_deck_dict = asdict(pitch_deck)
        
        return {
            "status": "success",
            "data": pitch_deck_dict
        }
    
    except Exception as e:
        logger.error(f"Error creating pitch deck: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pitch-deck/slides")
async def generate_pitch_deck_slides(
    request: PitchDeckSlidesRequest,
    token: Optional[str] = Depends(verify_token)
):
    """Generate pitch deck slides only"""
    try:
        if not pitch_deck_agent:
            raise HTTPException(status_code=503, detail="Pitch Deck Agent not initialized")
        
        slides = await pitch_deck_agent.generate_slides(
            business_idea=request.business_idea,
            business_name=request.business_name,
            target_market=request.target_market,
            funding_ask=request.funding_ask
        )
        
        from dataclasses import asdict
        slides_dict = asdict(slides)
        
        return {
            "status": "success",
            "data": slides_dict
        }
    
    except Exception as e:
        logger.error(f"Error generating slides: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pitch-deck/voiceover")
async def generate_voiceover(
    request: VoiceoverRequest,
    token: Optional[str] = Depends(verify_token)
):
    """Generate voiceover for pitch deck slides"""
    try:
        if not pitch_deck_agent:
            raise HTTPException(status_code=503, detail="Pitch Deck Agent not initialized")
        
        # Convert dict back to slides object
        from pitch_deck_agent import PitchDeckSlides, SlideContent
        
        slides_data = request.slides
        slides = PitchDeckSlides(
            title_slide=SlideContent(**slides_data.get("title_slide", {})),
            problem_slide=SlideContent(**slides_data.get("problem_slide", {})),
            solution_slide=SlideContent(**slides_data.get("solution_slide", {})),
            market_slide=SlideContent(**slides_data.get("market_slide", {})),
            product_slide=SlideContent(**slides_data.get("product_slide", {})),
            business_model_slide=SlideContent(**slides_data.get("business_model_slide", {})),
            traction_slide=SlideContent(**slides_data.get("traction_slide", {})),
            competition_slide=SlideContent(**slides_data.get("competition_slide", {})),
            team_slide=SlideContent(**slides_data.get("team_slide", {})),
            financials_slide=SlideContent(**slides_data.get("financials_slide", {})),
            ask_slide=SlideContent(**slides_data.get("ask_slide", {})),
            closing_slide=SlideContent(**slides_data.get("closing_slide", {}))
        )
        
        voiceovers = await pitch_deck_agent.generate_voiceovers(slides)
        
        from dataclasses import asdict
        voiceovers_dict = [asdict(v) for v in voiceovers]
        
        return {
            "status": "success",
            "data": voiceovers_dict
        }
    
    except Exception as e:
        logger.error(f"Error generating voiceover: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pitch-deck/demo-script")
async def generate_demo_script(
    request: DemoScriptRequest,
    token: Optional[str] = Depends(verify_token)
):
    """Generate demo script for pitch deck"""
    try:
        if not pitch_deck_agent:
            raise HTTPException(status_code=503, detail="Pitch Deck Agent not initialized")
        
        # Convert dict back to slides object
        from pitch_deck_agent import PitchDeckSlides, SlideContent
        
        slides_data = request.slides
        slides = PitchDeckSlides(
            title_slide=SlideContent(**slides_data.get("title_slide", {})),
            problem_slide=SlideContent(**slides_data.get("problem_slide", {})),
            solution_slide=SlideContent(**slides_data.get("solution_slide", {})),
            market_slide=SlideContent(**slides_data.get("market_slide", {})),
            product_slide=SlideContent(**slides_data.get("product_slide", {})),
            business_model_slide=SlideContent(**slides_data.get("business_model_slide", {})),
            traction_slide=SlideContent(**slides_data.get("traction_slide", {})),
            competition_slide=SlideContent(**slides_data.get("competition_slide", {})),
            team_slide=SlideContent(**slides_data.get("team_slide", {})),
            financials_slide=SlideContent(**slides_data.get("financials_slide", {})),
            ask_slide=SlideContent(**slides_data.get("ask_slide", {})),
            closing_slide=SlideContent(**slides_data.get("closing_slide", {}))
        )
        
        demo_script = await pitch_deck_agent.generate_demo_script(
            slides=slides,
            target_duration_minutes=request.target_duration_minutes
        )
        
        from dataclasses import asdict
        script_dict = asdict(demo_script)
        
        return {
            "status": "success",
            "data": script_dict
        }
    
    except Exception as e:
        logger.error(f"Error generating demo script: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pitch-deck/investor-qa")
async def generate_investor_qa(
    request: InvestorQARequest,
    token: Optional[str] = Depends(verify_token)
):
    """Generate investor Q&A questions"""
    try:
        if not pitch_deck_agent:
            raise HTTPException(status_code=503, detail="Pitch Deck Agent not initialized")
        
        # Convert dict back to slides object
        from pitch_deck_agent import PitchDeckSlides, SlideContent
        
        slides_data = request.slides
        slides = PitchDeckSlides(
            title_slide=SlideContent(**slides_data.get("title_slide", {})),
            problem_slide=SlideContent(**slides_data.get("problem_slide", {})),
            solution_slide=SlideContent(**slides_data.get("solution_slide", {})),
            market_slide=SlideContent(**slides_data.get("market_slide", {})),
            product_slide=SlideContent(**slides_data.get("product_slide", {})),
            business_model_slide=SlideContent(**slides_data.get("business_model_slide", {})),
            traction_slide=SlideContent(**slides_data.get("traction_slide", {})),
            competition_slide=SlideContent(**slides_data.get("competition_slide", {})),
            team_slide=SlideContent(**slides_data.get("team_slide", {})),
            financials_slide=SlideContent(**slides_data.get("financials_slide", {})),
            ask_slide=SlideContent(**slides_data.get("ask_slide", {})),
            closing_slide=SlideContent(**slides_data.get("closing_slide", {}))
        )
        
        investor_qa = await pitch_deck_agent.generate_investor_qa(
            business_idea=request.business_idea,
            slides=slides,
            num_questions=request.num_questions
        )
        
        from dataclasses import asdict
        qa_dict = [asdict(qa) for qa in investor_qa]
        
        return {
            "status": "success",
            "data": qa_dict
        }
    
    except Exception as e:
        logger.error(f"Error generating investor Q&A: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pitch-deck/design-theme")
async def select_design_theme(
    request: DesignThemeRequest,
    token: Optional[str] = Depends(verify_token)
):
    """Select design theme for pitch deck"""
    try:
        if not pitch_deck_agent:
            raise HTTPException(status_code=503, detail="Pitch Deck Agent not initialized")
        
        theme = await pitch_deck_agent.select_design_theme(
            business_idea=request.business_idea,
            brand_tone=request.brand_tone
        )
        
        from dataclasses import asdict
        theme_dict = asdict(theme)
        
        return {
            "status": "success",
            "data": theme_dict
        }
    
    except Exception as e:
        logger.error(f"Error selecting design theme: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/pitch-deck/export/{deck_id}/pptx")
async def export_pitch_deck_pptx(deck_id: str):
    """Export pitch deck to PPTX format"""
    try:
        if not pitch_deck_agent:
            raise HTTPException(status_code=503, detail="Pitch Deck Agent not initialized")
        
        # For now, return a placeholder response
        # In a real implementation, you would retrieve the deck by ID and export it
        return {
            "status": "success",
            "message": "PPTX export functionality will be implemented with deck storage",
            "deck_id": deck_id
        }
    
    except Exception as e:
        logger.error(f"Error exporting PPTX: {str(e)}")
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
# MVP BUILDER API ENDPOINTS
# ============================================================================

@app.post("/api/mvp-builder/generate-code-stream")
async def generate_code_stream(
    request: CodeGenerationRequest,
    token: Optional[str] = Depends(verify_token)
):
    """Generate code with streaming response"""
    try:
        async def stream_generator():
            async for chunk in mvp_builder_agent.generate_code_stream(
                prompt=request.prompt,
                model=request.model,
                context=request.context,
                is_edit=request.is_edit
            ):
                yield f"data: {json.dumps(chunk)}\n\n"
        
        return StreamingResponse(
            stream_generator(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            }
        )
    
    except Exception as e:
        logger.error(f"Error in code generation stream: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mvp-builder/scrape-website")
async def scrape_website_endpoint(request: WebsiteScrapingRequest):
    """Scrape website content and optionally take screenshot"""
    try:
        agent = MVPBuilderAgent()
        result = await agent.scrape_website(
            url=request.url,
            include_screenshot=request.include_screenshot
        )
        return result
    except Exception as e:
        logger.error(f"Website scraping error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mvp-builder/search")
async def search_websites(request: dict):
    """Search websites using Firecrawl API (like open-lovable)"""
    try:
        query = request.get('query')
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")

        # Use Firecrawl search to get top 10 results with screenshots
        import httpx
        
        firecrawl_api_key = os.getenv('FIRECRAWL_API_KEY')
        if not firecrawl_api_key:
            raise HTTPException(status_code=500, detail="Firecrawl API key not configured")

        async with httpx.AsyncClient() as client:
            search_response = await client.post(
                'https://api.firecrawl.dev/v1/search',
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {firecrawl_api_key}',
                },
                json={
                    'query': query,
                    'limit': 10,
                    'scrapeOptions': {
                        'formats': ['markdown', 'screenshot'],
                        'onlyMainContent': True,
                    },
                },
                timeout=30.0
            )

            if not search_response.is_success:
                raise HTTPException(status_code=500, detail="Search failed")

            search_data = search_response.json()
            
            # Format results with screenshots and markdown
            results = []
            if search_data.get('data'):
                for result in search_data['data']:
                    results.append({
                        'url': result.get('url', ''),
                        'title': result.get('title', result.get('url', '')),
                        'description': result.get('description', ''),
                        'screenshot': result.get('screenshot'),
                        'markdown': result.get('markdown', ''),
                    })

            return {'results': results}
            
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to perform search: {str(e)}")


@app.post("/api/mvp-builder/create-sandbox")
async def create_sandbox(
    request: SandboxCreateRequest,
    token: Optional[str] = Depends(verify_token)
):
    """Create a new E2B sandbox"""
    try:
        sandbox_info = await mvp_builder_agent.create_sandbox(
            template=request.template,
            files=request.files
        )
        
        return {
            "status": "success",
            "data": {
                "sandbox_id": sandbox_info.id,
                "status": sandbox_info.status.value,
                "url": sandbox_info.url,
                "created_at": sandbox_info.created_at
            }
        }
    
    except Exception as e:
        logger.error(f"Error creating sandbox: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mvp-builder/update-files")
async def update_sandbox_files(
    request: FileUpdateRequest,
    token: Optional[str] = Depends(verify_token)
):
    """Update files in an E2B sandbox"""
    try:
        success = await mvp_builder_agent.update_sandbox_files(
            sandbox_id=request.sandbox_id,
            files=request.files
        )
        
        return {
            "status": "success" if success else "error",
            "message": "Files updated successfully" if success else "Failed to update files"
        }
    
    except Exception as e:
        logger.error(f"Error updating sandbox files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/mvp-builder/sandbox-status/{sandbox_id}")
async def get_sandbox_status(
    sandbox_id: str,
    token: Optional[str] = Depends(verify_token)
):
    """Get sandbox status and information"""
    try:
        sandbox_info = await mvp_builder_agent.get_sandbox_status(sandbox_id)
        
        if not sandbox_info:
            raise HTTPException(status_code=404, detail="Sandbox not found")
        
        return {
            "status": "success",
            "data": {
                "sandbox_id": sandbox_info.id,
                "status": sandbox_info.status.value,
                "url": sandbox_info.url,
                "created_at": sandbox_info.created_at,
                "files": {
                    path: {
                        "size": file_info.size,
                        "last_modified": file_info.last_modified
                    }
                    for path, file_info in sandbox_info.files.items()
                } if sandbox_info.files else {}
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting sandbox status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/mvp-builder/sandbox/{sandbox_id}")
async def cleanup_sandbox(
    sandbox_id: str,
    token: Optional[str] = Depends(verify_token)
):
    """Clean up and delete a sandbox"""
    try:
        success = await mvp_builder_agent.cleanup_sandbox(sandbox_id)
        
        return {
            "status": "success" if success else "error",
            "message": "Sandbox cleaned up successfully" if success else "Failed to cleanup sandbox"
        }
    
    except Exception as e:
        logger.error(f"Error cleaning up sandbox: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mvp-builder/conversation")
async def create_conversation(token: Optional[str] = Depends(verify_token)):
    """Create a new conversation"""
    try:
        conversation_id = mvp_builder_agent.create_conversation()
        
        return {
            "status": "success",
            "conversation_id": conversation_id
        }
    
    except Exception as e:
        logger.error(f"Error creating conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/mvp-builder/style-templates")
async def get_style_templates():
    """Get available style templates"""
    try:
        templates = [
            {
                "id": "glassmorphism",
                "name": "Glassmorphism",
                "description": "Frosted glass effect with transparency",
                "preview_color": "#ffffff40",
                "category": "modern"
            },
            {
                "id": "neumorphism",
                "name": "Neumorphism",
                "description": "Soft 3D shadows and highlights",
                "preview_color": "#e0e5ec",
                "category": "modern"
            },
            {
                "id": "brutalism",
                "name": "Brutalism",
                "description": "Bold, raw, and uncompromising design",
                "preview_color": "#000000",
                "category": "bold"
            },
            {
                "id": "minimalist",
                "name": "Minimalist",
                "description": "Clean, simple, and focused",
                "preview_color": "#ffffff",
                "category": "clean"
            },
            {
                "id": "dark-mode",
                "name": "Dark Mode",
                "description": "Dark theme with high contrast",
                "preview_color": "#1a1a1a",
                "category": "dark"
            },
            {
                "id": "gradient-rich",
                "name": "Gradient Rich",
                "description": "Vibrant gradients and colors",
                "preview_color": "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
                "category": "colorful"
            },
            {
                "id": "3d-depth",
                "name": "3D Depth",
                "description": "Dimensional layers and depth",
                "preview_color": "#2c3e50",
                "category": "dimensional"
            },
            {
                "id": "retro-wave",
                "name": "Retro Wave",
                "description": "80s inspired neon aesthetics",
                "preview_color": "linear-gradient(45deg, #ff0080, #00ffff)",
                "category": "retro"
            }
        ]
        
        return {
            "status": "success",
            "data": templates
        }
    
    except Exception as e:
        logger.error(f"Error fetching style templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/mvp-builder/health")
async def mvp_builder_health():
    """Health check for MVP Builder"""
    try:
        return {
            "status": "ok",
            "agent": "initialized",
            "models": {
                "deepseek": bool(mvp_builder_agent.deepseek_api_key),
                "groq": bool(mvp_builder_agent.groq_api_key),
                "kimi": bool(mvp_builder_agent.kimi_api_key)
            },
            "services": {
                "firecrawl": bool(mvp_builder_agent.firecrawl_api_key),
                "e2b": bool(mvp_builder_agent.e2b_api_key)
            },
            "active_sandboxes": len(mvp_builder_agent.active_sandboxes),
            "active_conversations": len(mvp_builder_agent.conversations),
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error in MVP Builder health check: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/mvp-builder/sandbox-files/{sandbox_id}")
async def get_sandbox_files(
    sandbox_id: str,
    token: Optional[str] = Depends(verify_token)
):
    """Get all files from sandbox with manifest"""
    try:
        result = await mvp_builder_agent.get_sandbox_files(sandbox_id)
        
        return {
            "status": "success",
            "data": result
        }
    
    except Exception as e:
        logger.error(f"Error getting sandbox files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mvp-builder/detect-packages")
async def detect_and_install_packages(
    request: BaseModel,
    token: Optional[str] = Depends(verify_token)
):
    """Detect and install required packages"""
    try:
        data = request.dict()
        sandbox_id = data.get("sandbox_id")
        files = data.get("files", {})
        
        if not sandbox_id:
            raise HTTPException(status_code=400, detail="sandbox_id is required")
        
        result = await mvp_builder_agent.detect_and_install_packages(sandbox_id, files)
        
        return {
            "status": "success" if result.get("success") else "error",
            "data": result
        }
    
    except Exception as e:
        logger.error(f"Error detecting/installing packages: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mvp-builder/apply-code-stream")
async def apply_code_stream(
    request: BaseModel,
    token: Optional[str] = Depends(verify_token)
):
    """Apply generated code to sandbox with streaming progress"""
    try:
        data = request.dict()
        sandbox_id = data.get("sandbox_id")
        generated_code = data.get("code")
        is_edit = data.get("is_edit", False)
        
        if not sandbox_id or not generated_code:
            raise HTTPException(status_code=400, detail="sandbox_id and code are required")
        
        async def stream_generator():
            async for chunk in mvp_builder_agent.apply_code_to_sandbox(
                sandbox_id=sandbox_id,
                generated_code=generated_code,
                is_edit=is_edit
            ):
                yield f"data: {json.dumps(chunk)}\n\n"
        
        return StreamingResponse(
            stream_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            }
        )
    
    except Exception as e:
        logger.error(f"Error applying code stream: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


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
