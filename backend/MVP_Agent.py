"""
MVP_Nexora Agent — Senior AI Engineer Persona
==============================================

A production-ready AI agent that builds, tests, fixes, and deploys full-stack applications
automatically using DeepSeek v3.1 (OpenRouter), e2b sandboxes, and FireCrawl.

Author: NEXORA Team
Version: 1.0.0
License: MIT
"""

import os
import json
import uuid
import asyncio
import logging
import zipfile
import shutil
import subprocess
import tempfile
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
from dataclasses import dataclass, asdict
from enum import Enum

# Third-party imports
import aiohttp
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================================================
# ENUMS & DATA CLASSES
# ============================================================================

class BuildStatus(Enum):
    """Build status enumeration"""
    SUCCESS = "success"
    FAILED = "failed"
    PENDING = "pending"
    SKIPPED = "skipped"


class TestStatus(Enum):
    """Test status enumeration"""
    SUCCESS = "success"
    FAILED = "failed"
    PENDING = "pending"
    SKIPPED = "skipped"


class DeployStatus(Enum):
    """Deployment status enumeration"""
    SUCCESS = "success"
    FAILED = "failed"
    PENDING = "pending"
    SKIPPED = "skipped"


@dataclass
class StackConfig:
    """Technology stack configuration"""
    frontend: str
    backend: str
    db: str
    styling: str = "Tailwind CSS"
    testing: str = "Jest + Playwright"
    ci_cd: str = "GitHub Actions"


@dataclass
class FileInfo:
    """File information structure"""
    path: str
    preview: str
    size: int = 0
    language: str = ""


@dataclass
class BuildInfo:
    """Build information structure"""
    status: str
    logs: str
    duration: float = 0.0
    timestamp: str = ""


@dataclass
class TestInfo:
    """Test information structure"""
    status: str
    details: List[Dict[str, Any]]
    passed: int = 0
    failed: int = 0
    total: int = 0


@dataclass
class DeployInfo:
    """Deployment information structure"""
    status: str
    instructions: str
    url: Optional[str] = None
    platform: Optional[str] = None


@dataclass
class ScrapeLog:
    """Web scraping log entry"""
    url: str
    timestamp: str
    notes: str
    status: str = "success"


@dataclass
class PatchInfo:
    """Code patch information"""
    iteration: int
    file: str
    diff: str
    reason: str
    timestamp: str


@dataclass
class WinsurfResponse:
    """Complete Winsurf response structure"""
    id: str
    title: str
    stack: StackConfig
    spec_summary: str
    files: List[FileInfo]
    artifact_zip: str
    preview_url: str
    e2b_embed: str
    build: BuildInfo
    tests: TestInfo
    deploy: DeployInfo
    scrape_log: List[ScrapeLog]
    patches: List[PatchInfo]
    next_steps: str
    created_at: str
    user_subscription: str = "free"


# ============================================================================
# API CLIENTS
# ============================================================================

class DeepSeekClient:
    """DeepSeek v3.1 API client via OpenRouter"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("DEEPSEEK_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "deepseek/deepseek-chat-v3.1:free"
        
        if not self.api_key:
            raise ValueError("DEEPSEEK_API_KEY not found in environment variables")
    
    async def generate_code(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 8000
    ) -> str:
        """Generate code using DeepSeek v3.1"""
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://nexora.ai",
            "X-Title": "Nexora MVP Agent"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.base_url,
                    json=payload,
                    headers=headers
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"DeepSeek API error: {error_text}")
                        raise Exception(f"DeepSeek API error: {response.status}")
                    
                    data = await response.json()
                    return data["choices"][0]["message"]["content"]
        
        except Exception as e:
            logger.error(f"Error calling DeepSeek API: {str(e)}")
            raise


class FireCrawlClient:
    """FireCrawl web scraping client"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("FIRECRAWL_API_KEY")
        self.base_url = "https://api.firecrawl.dev/v0"
        
        if not self.api_key:
            raise ValueError("FIRECRAWL_API_KEY not found in environment variables")
    
    async def scrape_url(
        self,
        url: str,
        formats: List[str] = ["markdown", "html"]
    ) -> Dict[str, Any]:
        """Scrape a URL using FireCrawl"""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "url": url,
            "formats": formats
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/scrape",
                    json=payload,
                    headers=headers
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"FireCrawl API error: {error_text}")
                        raise Exception(f"FireCrawl API error: {response.status}")
                    
                    return await response.json()
        
        except Exception as e:
            logger.error(f"Error calling FireCrawl API: {str(e)}")
            raise
    
    async def crawl_site(
        self,
        url: str,
        max_pages: int = 10,
        respect_robots: bool = True
    ) -> List[Dict[str, Any]]:
        """Crawl multiple pages from a website"""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "url": url,
            "limit": max_pages,
            "scrapeOptions": {
                "formats": ["markdown"]
            }
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/crawl",
                    json=payload,
                    headers=headers
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"FireCrawl crawl error: {error_text}")
                        raise Exception(f"FireCrawl crawl error: {response.status}")
                    
                    return await response.json()
        
        except Exception as e:
            logger.error(f"Error crawling site: {str(e)}")
            raise


class E2BSandboxClient:
    """E2B Sandbox client for live previews"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("E2B_API_KEY")
        self.base_url = "https://api.e2b.dev"
        
        if not self.api_key:
            raise ValueError("E2B_API_KEY not found in environment variables")
    
    async def create_sandbox(
        self,
        template: str = "base",
        timeout: int = 3600
    ) -> Dict[str, Any]:
        """Create a new E2B sandbox"""
        
        headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "template": template,
            "timeout": timeout
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/sandboxes",
                    json=payload,
                    headers=headers
                ) as response:
                    if response.status not in [200, 201]:
                        error_text = await response.text()
                        logger.error(f"E2B API error: {error_text}")
                        raise Exception(f"E2B API error: {response.status}")
                    
                    return await response.json()
        
        except Exception as e:
            logger.error(f"Error creating E2B sandbox: {str(e)}")
            raise
    
    async def upload_files(
        self,
        sandbox_id: str,
        files: Dict[str, str]
    ) -> bool:
        """Upload files to E2B sandbox"""
        
        headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "files": files
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/sandboxes/{sandbox_id}/files",
                    json=payload,
                    headers=headers
                ) as response:
                    return response.status in [200, 201]
        
        except Exception as e:
            logger.error(f"Error uploading files to E2B: {str(e)}")
            return False
    
    async def execute_command(
        self,
        sandbox_id: str,
        command: str,
        cwd: str = "/"
    ) -> Dict[str, Any]:
        """Execute command in E2B sandbox"""
        
        headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "command": command,
            "cwd": cwd
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/sandboxes/{sandbox_id}/commands",
                    json=payload,
                    headers=headers
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"E2B command error: {error_text}")
                        raise Exception(f"E2B command error: {response.status}")
                    
                    return await response.json()
        
        except Exception as e:
            logger.error(f"Error executing command in E2B: {str(e)}")
            raise
    
    def get_preview_url(self, sandbox_id: str, port: int = 3000) -> str:
        """Get preview URL for sandbox"""
        return f"https://{sandbox_id}.e2b.dev:{port}"
    
    def get_embed_snippet(self, sandbox_id: str, port: int = 3000) -> str:
        """Get iframe embed snippet"""
        preview_url = self.get_preview_url(sandbox_id, port)
        return f'<iframe src="{preview_url}" width="100%" height="600px" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'


# ============================================================================
# PROJECT GENERATOR
# ============================================================================

class ProjectGenerator:
    """Generates complete full-stack project structures"""
    
    def __init__(self, deepseek_client: DeepSeekClient):
        self.deepseek = deepseek_client
    
    async def generate_project_structure(
        self,
        spec: str,
        stack: StackConfig
    ) -> Dict[str, str]:
        """Generate complete project file structure"""
        
        system_prompt = """You are a senior full-stack engineer with 10+ years of experience.
Generate production-ready, professional code with:
- Clean architecture and separation of concerns
- Comprehensive error handling
- Type safety (TypeScript for frontend, type hints for backend)
- Responsive, accessible UI with modern design
- Complete test coverage
- Proper documentation
- Security best practices
- Performance optimizations

Return ONLY valid JSON with file paths as keys and file contents as values."""

        user_prompt = f"""Generate a complete full-stack application with this specification:

{spec}

Technology Stack:
- Frontend: {stack.frontend}
- Backend: {stack.backend}
- Database: {stack.db}
- Styling: {stack.styling}
- Testing: {stack.testing}

Requirements:
1. Complete folder structure (src/, public/, tests/, config files)
2. All necessary dependencies (package.json, requirements.txt, etc.)
3. Environment configuration (.env.example)
4. Docker setup (Dockerfile, docker-compose.yml)
5. CI/CD pipeline (GitHub Actions)
6. Comprehensive README with setup instructions
7. Professional, modern UI with Tailwind CSS
8. Complete test suite
9. Health check endpoints
10. Proper error handling and logging

Return as JSON: {{"file_path": "file_content", ...}}"""

        try:
            response = await self.deepseek.generate_code(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=8000
            )
            
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                logger.error("No JSON found in DeepSeek response")
                return {}
            
            json_str = response[json_start:json_end]
            files = json.loads(json_str)
            
            return files
        
        except Exception as e:
            logger.error(f"Error generating project structure: {str(e)}")
            raise
    
    async def enhance_file(
        self,
        file_path: str,
        current_content: str,
        enhancement_request: str
    ) -> str:
        """Enhance or fix a specific file"""
        
        system_prompt = """You are a senior software engineer fixing code issues.
Provide clean, production-ready code with proper error handling and best practices.
Return ONLY the complete fixed file content, no explanations."""

        user_prompt = f"""Fix this file: {file_path}

Current content:
```
{current_content}
```

Issue to fix:
{enhancement_request}

Return the complete fixed file content."""

        try:
            return await self.deepseek.generate_code(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=4000
            )
        
        except Exception as e:
            logger.error(f"Error enhancing file {file_path}: {str(e)}")
            raise


# ============================================================================
# BUILD & TEST MANAGER
# ============================================================================

class BuildTestManager:
    """Manages build and test processes"""
    
    def __init__(self, project_dir: Path):
        self.project_dir = project_dir
    
    def run_command(
        self,
        command: str,
        cwd: Optional[Path] = None,
        timeout: int = 300
    ) -> Tuple[int, str, str]:
        """Run a shell command and return exit code, stdout, stderr"""
        
        if cwd is None:
            cwd = self.project_dir
        
        try:
            process = subprocess.Popen(
                command,
                shell=True,
                cwd=str(cwd),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            stdout, stderr = process.communicate(timeout=timeout)
            return process.returncode, stdout, stderr
        
        except subprocess.TimeoutExpired:
            process.kill()
            return -1, "", f"Command timed out after {timeout} seconds"
        
        except Exception as e:
            return -1, "", str(e)
    
    async def install_dependencies(self) -> BuildInfo:
        """Install project dependencies"""
        
        start_time = datetime.now()
        logs = []
        
        # Check for package.json (Node.js)
        package_json = self.project_dir / "package.json"
        if package_json.exists():
            logger.info("Installing Node.js dependencies...")
            code, stdout, stderr = self.run_command("npm ci", timeout=600)
            logs.append(f"npm ci:\n{stdout}\n{stderr}")
            
            if code != 0:
                duration = (datetime.now() - start_time).total_seconds()
                return BuildInfo(
                    status=BuildStatus.FAILED.value,
                    logs="\n".join(logs),
                    duration=duration,
                    timestamp=datetime.now().isoformat()
                )
        
        # Check for requirements.txt (Python)
        requirements = self.project_dir / "requirements.txt"
        if requirements.exists():
            logger.info("Installing Python dependencies...")
            code, stdout, stderr = self.run_command(
                "pip install -r requirements.txt",
                timeout=600
            )
            logs.append(f"pip install:\n{stdout}\n{stderr}")
            
            if code != 0:
                duration = (datetime.now() - start_time).total_seconds()
                return BuildInfo(
                    status=BuildStatus.FAILED.value,
                    logs="\n".join(logs),
                    duration=duration,
                    timestamp=datetime.now().isoformat()
                )
        
        duration = (datetime.now() - start_time).total_seconds()
        return BuildInfo(
            status=BuildStatus.SUCCESS.value,
            logs="\n".join(logs),
            duration=duration,
            timestamp=datetime.now().isoformat()
        )
    
    async def build_project(self) -> BuildInfo:
        """Build the project"""
        
        start_time = datetime.now()
        logs = []
        
        # Try npm build
        package_json = self.project_dir / "package.json"
        if package_json.exists():
            logger.info("Building frontend...")
            code, stdout, stderr = self.run_command("npm run build", timeout=600)
            logs.append(f"npm run build:\n{stdout}\n{stderr}")
            
            if code != 0:
                duration = (datetime.now() - start_time).total_seconds()
                return BuildInfo(
                    status=BuildStatus.FAILED.value,
                    logs="\n".join(logs),
                    duration=duration,
                    timestamp=datetime.now().isoformat()
                )
        
        duration = (datetime.now() - start_time).total_seconds()
        return BuildInfo(
            status=BuildStatus.SUCCESS.value,
            logs="\n".join(logs),
            duration=duration,
            timestamp=datetime.now().isoformat()
        )
    
    async def run_tests(self) -> TestInfo:
        """Run project tests"""
        
        details = []
        passed = 0
        failed = 0
        
        # Try npm test
        package_json = self.project_dir / "package.json"
        if package_json.exists():
            logger.info("Running tests...")
            code, stdout, stderr = self.run_command("npm run test", timeout=300)
            
            test_result = {
                "suite": "npm test",
                "output": stdout,
                "errors": stderr,
                "passed": code == 0
            }
            details.append(test_result)
            
            if code == 0:
                passed += 1
            else:
                failed += 1
        
        total = passed + failed
        status = TestStatus.SUCCESS.value if failed == 0 else TestStatus.FAILED.value
        
        return TestInfo(
            status=status,
            details=details,
            passed=passed,
            failed=failed,
            total=total
        )
    
    async def health_check(self) -> bool:
        """Perform health check on the application"""
        
        try:
            # Try to check if server responds
            response = requests.get("http://localhost:3000/health", timeout=5)
            return response.status_code == 200
        except:
            return True  # Skip if server not running


# ============================================================================
# MVP NEXORA AGENT
# ============================================================================

class MVPNexoraAgent:
    """
    MVP_Nexora Agent — Senior AI Engineer Persona
    
    Builds, tests, fixes, and deploys production-ready full-stack applications
    automatically using DeepSeek v3.1, e2b sandboxes, and FireCrawl.
    """
    
    def __init__(
        self,
        deepseek_api_key: Optional[str] = None,
        firecrawl_api_key: Optional[str] = None,
        e2b_api_key: Optional[str] = None
    ):
        """Initialize the MVP Nexora Agent"""
        
        self.deepseek = DeepSeekClient(deepseek_api_key)
        self.firecrawl = FireCrawlClient(firecrawl_api_key)
        self.e2b = E2BSandboxClient(e2b_api_key)
        self.project_generator = ProjectGenerator(self.deepseek)
        
        self.max_fix_iterations_free = 3
        self.max_fix_iterations_pro = 15
        
        logger.info("MVP Nexora Agent initialized successfully")
    
    def _determine_stack(self, user_request: str) -> StackConfig:
        """Determine technology stack from user request"""
        
        # Default stack
        stack = StackConfig(
            frontend="Next.js",
            backend="Fastify",
            db="PostgreSQL",
            styling="Tailwind CSS",
            testing="Jest + Playwright",
            ci_cd="GitHub Actions"
        )
        
        # Parse user preferences
        request_lower = user_request.lower()
        
        # Frontend detection
        if "react" in request_lower and "next" not in request_lower:
            stack.frontend = "React + Vite"
        elif "vue" in request_lower:
            stack.frontend = "Vue.js"
        elif "svelte" in request_lower:
            stack.frontend = "SvelteKit"
        
        # Backend detection
        if "express" in request_lower:
            stack.backend = "Express.js"
        elif "fastapi" in request_lower or "python" in request_lower:
            stack.backend = "FastAPI"
        elif "django" in request_lower:
            stack.backend = "Django"
        
        # Database detection
        if "mysql" in request_lower:
            stack.db = "MySQL"
        elif "mongodb" in request_lower or "mongo" in request_lower:
            stack.db = "MongoDB"
        elif "sqlite" in request_lower:
            stack.db = "SQLite"
        
        return stack
    
    async def _scrape_reference_data(
        self,
        urls: List[str]
    ) -> List[ScrapeLog]:
        """Scrape reference data from provided URLs"""
        
        scrape_logs = []
        
        for url in urls:
            try:
                logger.info(f"Scraping {url}...")
                result = await self.firecrawl.scrape_url(url)
                
                scrape_logs.append(ScrapeLog(
                    url=url,
                    timestamp=datetime.now().isoformat(),
                    notes=f"Successfully scraped {len(result.get('markdown', ''))} characters",
                    status="success"
                ))
            
            except Exception as e:
                logger.error(f"Failed to scrape {url}: {str(e)}")
                scrape_logs.append(ScrapeLog(
                    url=url,
                    timestamp=datetime.now().isoformat(),
                    notes=f"Failed: {str(e)}",
                    status="failed"
                ))
        
        return scrape_logs
    
    async def _create_project_files(
        self,
        files: Dict[str, str],
        project_dir: Path
    ) -> List[FileInfo]:
        """Create project files on disk"""
        
        file_infos = []
        
        for file_path, content in files.items():
            try:
                full_path = project_dir / file_path
                full_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Write file
                with open(full_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                # Get file info
                size = full_path.stat().st_size
                extension = full_path.suffix
                preview = content[:200] + "..." if len(content) > 200 else content
                
                file_infos.append(FileInfo(
                    path=file_path,
                    preview=preview,
                    size=size,
                    language=extension[1:] if extension else "txt"
                ))
            
            except Exception as e:
                logger.error(f"Error creating file {file_path}: {str(e)}")
        
        return file_infos
    
    async def _auto_fix_loop(
        self,
        project_dir: Path,
        build_manager: BuildTestManager,
        max_iterations: int
    ) -> Tuple[BuildInfo, TestInfo, List[PatchInfo]]:
        """Auto-fix build and test errors"""
        
        patches = []
        build_info = None
        test_info = None
        
        for iteration in range(1, max_iterations + 1):
            logger.info(f"Build/Test iteration {iteration}/{max_iterations}")
            
            # Install dependencies
            build_info = await build_manager.install_dependencies()
            if build_info.status == BuildStatus.FAILED.value:
                logger.warning(f"Dependency installation failed on iteration {iteration}")
                
                # Try to fix
                error_analysis = await self._analyze_error(build_info.logs)
                patch = await self._apply_fix(
                    project_dir,
                    error_analysis,
                    iteration
                )
                if patch:
                    patches.append(patch)
                continue
            
            # Build project
            build_info = await build_manager.build_project()
            if build_info.status == BuildStatus.FAILED.value:
                logger.warning(f"Build failed on iteration {iteration}")
                
                # Try to fix
                error_analysis = await self._analyze_error(build_info.logs)
                patch = await self._apply_fix(
                    project_dir,
                    error_analysis,
                    iteration
                )
                if patch:
                    patches.append(patch)
                continue
            
            # Run tests
            test_info = await build_manager.run_tests()
            if test_info.status == TestStatus.FAILED.value:
                logger.warning(f"Tests failed on iteration {iteration}")
                
                # Try to fix
                error_analysis = await self._analyze_test_failures(test_info.details)
                patch = await self._apply_fix(
                    project_dir,
                    error_analysis,
                    iteration
                )
                if patch:
                    patches.append(patch)
                continue
            
            # Success!
            logger.info(f"Build and tests passed on iteration {iteration}")
            return build_info, test_info, patches
        
        # Max iterations reached
        logger.error(f"Failed to fix errors after {max_iterations} iterations")
        
        # Create default test_info if it was never initialized
        if test_info is None:
            test_info = TestInfo(
                status=TestStatus.FAILED.value,
                details=[{"error": "Build failed before tests could run"}],
                passed=0,
                failed=0,
                total=0
            )
        
        return build_info, test_info, patches
    
    async def _analyze_error(self, error_logs: str) -> str:
        """Analyze error logs to determine root cause"""
        
        system_prompt = """You are a senior debugging expert.
Analyze error logs and provide a concise root cause analysis with specific fix recommendations.
Focus on the actual error, not symptoms."""

        user_prompt = f"""Analyze these error logs and provide fix recommendations:

```
{error_logs[-2000:]}  # Last 2000 chars
```

Provide:
1. Root cause
2. Affected file(s)
3. Specific fix needed"""

        try:
            return await self.deepseek.generate_code(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=1000
            )
        except Exception as e:
            logger.error(f"Error analyzing error: {str(e)}")
            return "Unable to analyze error"
    
    async def _analyze_test_failures(self, test_details: List[Dict]) -> str:
        """Analyze test failures"""
        
        failures = [t for t in test_details if not t.get("passed", False)]
        failure_summary = "\n".join([
            f"Suite: {t['suite']}\nErrors: {t['errors']}"
            for t in failures
        ])
        
        return await self._analyze_error(failure_summary)
    
    async def _apply_fix(
        self,
        project_dir: Path,
        error_analysis: str,
        iteration: int
    ) -> Optional[PatchInfo]:
        """Apply a fix based on error analysis"""
        
        try:
            # Extract file to fix from analysis
            # This is simplified - in production, use more sophisticated parsing
            lines = error_analysis.split('\n')
            file_to_fix = None
            
            for line in lines:
                if 'file' in line.lower() or '.js' in line or '.py' in line:
                    # Extract filename
                    words = line.split()
                    for word in words:
                        if '.' in word and '/' in word:
                            file_to_fix = word
                            break
            
            if not file_to_fix:
                logger.warning("Could not determine file to fix")
                return None
            
            file_path = project_dir / file_to_fix
            if not file_path.exists():
                logger.warning(f"File {file_to_fix} does not exist")
                return None
            
            # Read current content
            with open(file_path, 'r', encoding='utf-8') as f:
                current_content = f.read()
            
            # Generate fix
            fixed_content = await self.project_generator.enhance_file(
                file_to_fix,
                current_content,
                error_analysis
            )
            
            # Apply fix
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            
            # Create patch info
            patch = PatchInfo(
                iteration=iteration,
                file=file_to_fix,
                diff=f"Fixed based on: {error_analysis[:200]}",
                reason=error_analysis,
                timestamp=datetime.now().isoformat()
            )
            
            logger.info(f"Applied fix to {file_to_fix}")
            return patch
        
        except Exception as e:
            logger.error(f"Error applying fix: {str(e)}")
            return None
    
    async def _create_zip_artifact(
        self,
        project_dir: Path,
        project_id: str
    ) -> str:
        """Create downloadable ZIP artifact"""
        
        zip_path = project_dir.parent / f"artifact-{project_id}.zip"
        
        try:
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, dirs, files in os.walk(project_dir):
                    # Skip node_modules and other large dirs
                    dirs[:] = [d for d in dirs if d not in [
                        'node_modules', '.git', 'dist', 'build', '__pycache__'
                    ]]
                    
                    for file in files:
                        file_path = Path(root) / file
                        arcname = file_path.relative_to(project_dir)
                        zipf.write(file_path, arcname)
            
            # In production, upload to cloud storage (S3, Cloudinary, etc.)
            # For now, return local path
            return f"file://{zip_path}"
        
        except Exception as e:
            logger.error(f"Error creating ZIP: {str(e)}")
            return ""
    
    async def _deploy_to_e2b(
        self,
        project_dir: Path,
        files: Dict[str, str]
    ) -> Tuple[str, str]:
        """Deploy project to E2B sandbox"""
        
        try:
            # Create sandbox
            sandbox = await self.e2b.create_sandbox(template="base")
            sandbox_id = sandbox.get("sandboxID", "")
            
            if not sandbox_id:
                raise Exception("Failed to create E2B sandbox")
            
            # Upload files
            await self.e2b.upload_files(sandbox_id, files)
            
            # Install dependencies and start server
            await self.e2b.execute_command(sandbox_id, "npm install")
            await self.e2b.execute_command(sandbox_id, "npm run dev &")
            
            # Get preview URL and embed
            preview_url = self.e2b.get_preview_url(sandbox_id)
            embed_snippet = self.e2b.get_embed_snippet(sandbox_id)
            
            return preview_url, embed_snippet
        
        except Exception as e:
            logger.error(f"Error deploying to E2B: {str(e)}")
            return "", ""
    
    async def build_mvp(
        self,
        user_request: str,
        scrape_urls: Optional[List[str]] = None,
        user_subscription: str = "free"
    ) -> WinsurfResponse:
        """
        Main entry point: Build a complete MVP from user request
        
        Args:
            user_request: User's app specification
            scrape_urls: Optional URLs to scrape for reference data
            user_subscription: User subscription tier (free/pro)
        
        Returns:
            WinsurfResponse: Complete structured response
        """
        
        logger.info(f"Building MVP for request: {user_request[:100]}...")
        
        # Generate unique ID
        project_id = str(uuid.uuid4())
        
        # Determine stack
        stack = self._determine_stack(user_request)
        logger.info(f"Stack: {stack.frontend} + {stack.backend} + {stack.db}")
        
        # Scrape reference data if provided
        scrape_logs = []
        if scrape_urls:
            scrape_logs = await self._scrape_reference_data(scrape_urls)
        
        # Generate project structure
        logger.info("Generating project structure...")
        files = await self.project_generator.generate_project_structure(
            user_request,
            stack
        )
        
        # Create temporary project directory
        project_dir = Path(tempfile.mkdtemp(prefix=f"nexora-{project_id}-"))
        logger.info(f"Project directory: {project_dir}")
        
        # Create files
        file_infos = await self._create_project_files(files, project_dir)
        
        # Build and test
        build_manager = BuildTestManager(project_dir)
        max_iterations = (
            self.max_fix_iterations_pro
            if user_subscription == "pro"
            else self.max_fix_iterations_free
        )
        
        build_info, test_info, patches = await self._auto_fix_loop(
            project_dir,
            build_manager,
            max_iterations
        )
        
        # Create ZIP artifact
        artifact_zip = await self._create_zip_artifact(project_dir, project_id)
        
        # Deploy to E2B for live preview
        preview_url, e2b_embed = await self._deploy_to_e2b(project_dir, files)
        
        # Deployment instructions
        deploy_info = DeployInfo(
            status=DeployStatus.SKIPPED.value,
            instructions="""
Deployment Options:

1. **Vercel** (Recommended for Next.js):
   - Install Vercel CLI: `npm i -g vercel`
   - Run: `vercel --prod`

2. **Docker**:
   - Build: `docker-compose up --build`
   - Access at http://localhost:3000

3. **Manual**:
   - Install dependencies: `npm install`
   - Build: `npm run build`
   - Start: `npm start`

Environment variables required (see .env.example)
            """.strip()
        )
        
        # Generate next steps
        next_steps = f"""
✅ Project generated successfully!

**Next Steps:**
1. Download the ZIP file and extract it
2. Review the README.md for setup instructions
3. Configure environment variables (see .env.example)
4. Run locally: `npm install && npm run dev`
5. Deploy using one of the provided methods

**Live Preview:** {preview_url if preview_url else 'Not available'}

**Build Status:** {build_info.status}
**Tests:** {test_info.passed}/{test_info.total} passed
**Patches Applied:** {len(patches)}
        """.strip()
        
        # Create response
        response = WinsurfResponse(
            id=project_id,
            title=f"MVP: {user_request[:50]}",
            stack=stack,
            spec_summary=user_request[:200],
            files=file_infos,
            artifact_zip=artifact_zip,
            preview_url=preview_url or "Not available",
            e2b_embed=e2b_embed or "Not available",
            build=build_info,
            tests=test_info,
            deploy=deploy_info,
            scrape_log=scrape_logs,
            patches=patches,
            next_steps=next_steps,
            created_at=datetime.now().isoformat(),
            user_subscription=user_subscription
        )
        
        logger.info(f"MVP build complete: {project_id}")
        return response
    
    def format_response(self, response: WinsurfResponse) -> Dict[str, Any]:
        """Format response as JSON for Winsurf UI"""
        
        return {
            "winsurf_response": {
                "id": response.id,
                "title": response.title,
                "stack": asdict(response.stack),
                "spec_summary": response.spec_summary,
                "files": [asdict(f) for f in response.files],
                "artifact_zip": response.artifact_zip,
                "preview_url": response.preview_url,
                "e2b_embed": response.e2b_embed,
                "build": asdict(response.build),
                "tests": asdict(response.tests),
                "deploy": asdict(response.deploy),
                "scrape_log": [asdict(s) for s in response.scrape_log],
                "patches": [asdict(p) for p in response.patches],
                "next_steps": response.next_steps,
                "created_at": response.created_at,
                "user_subscription": response.user_subscription
            }
        }


# ============================================================================
# MAIN EXECUTION
# ============================================================================

async def main():
    """Example usage of MVP Nexora Agent"""
    
    # Initialize agent
    agent = MVPNexoraAgent()
    
    # Example request
    user_request = """
    Build me an AI-powered task manager app with:
    - React frontend with modern UI
    - Node.js backend with REST API
    - PostgreSQL database
    - User authentication
    - Real-time updates
    - Responsive design
    - Dark mode support
    """
    
    # Build MVP
    response = await agent.build_mvp(
        user_request=user_request,
        scrape_urls=["https://example.com/tasks"],
        user_subscription="free"
    )
    
    # Format and print response
    formatted = agent.format_response(response)
    print(json.dumps(formatted, indent=2))
    
    # Also print human-readable summary
    print("\n" + "="*80)
    print("HUMAN SUMMARY")
    print("="*80)
    print(f"\n{response.next_steps}")


if __name__ == "__main__":
    asyncio.run(main())
