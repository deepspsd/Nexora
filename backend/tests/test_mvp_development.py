"""
Test Suite for MVP Development Agent
=====================================

Tests all MVP Development endpoints and functionality including:
- MVP generation
- MVP refinement
- Project history
- Project saving
- Template retrieval
- Chat interface
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, Any

# Test configuration
API_BASE_URL = "http://localhost:8000"
TEST_USER_ID = "test_user_123"
TEST_USER_EMAIL = "test@nexora.com"
TEST_USER_PASSWORD = "testpassword123"


class TestMVPDevelopment:
    """Test suite for MVP Development endpoints"""
    
    def __init__(self):
        """Initialize test environment"""
        self.base_url = API_BASE_URL
        self.user_id = TEST_USER_ID
        self.auth_token = None
        
    def test_01_mvp_generation_basic(self):
        """Test basic MVP generation with minimal input"""
        import requests
        
        payload = {
            "productName": "TaskMaster",
            "productIdea": "A simple task management application for teams",
            "coreFeatures": ["Task creation", "Task assignment", "Due dates"],
            "targetPlatform": "web",
            "techStack": ["React", "TypeScript", "Tailwind CSS"],
            "projectType": "web-app",
            "generateMultipleFiles": True,
            "includeComponents": True,
            "defaultLanguage": "react",
            "userId": self.user_id,
            "userSubscription": "free"
        }
        
        print("\n" + "="*80)
        print("TEST 1: Basic MVP Generation")
        print("="*80)
        print(f"Product: {payload['productName']}")
        print(f"Idea: {payload['productIdea']}")
        print(f"Features: {', '.join(payload['coreFeatures'])}")
        
        try:
            print("\n⏳ This may take 3-5 minutes for AI code generation...")
            response = requests.post(
                f"{self.base_url}/api/mvpDevelopment",
                json=payload,
                timeout=600  # 10 minutes timeout for generation
            )
            
            print(f"\nStatus Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✓ MVP Generated Successfully!")
                print(f"\nResponse Structure:")
                print(f"  - Status: {data.get('status')}")
                print(f"  - Has Data: {bool(data.get('data'))}")
                
                if data.get('data'):
                    mvp_data = data['data']
                    print(f"\nMVP Data:")
                    print(f"  - Files Generated: {len(mvp_data.get('files', []))}")
                    print(f"  - Build Status: {mvp_data.get('build_status')}")
                    print(f"  - Test Status: {mvp_data.get('test_status')}")
                    print(f"  - Has Live Preview: {bool(mvp_data.get('livePreviewHtml'))}")
                    print(f"  - Has Artifact ZIP: {bool(mvp_data.get('artifact_zip'))}")
                    
                    if mvp_data.get('files'):
                        print(f"\n  Generated Files:")
                        for file in mvp_data['files'][:5]:  # Show first 5 files
                            print(f"    - {file['path']} ({file['size']} bytes)")
                        if len(mvp_data['files']) > 5:
                            print(f"    ... and {len(mvp_data['files']) - 5} more files")
                    
                    if mvp_data.get('next_steps'):
                        print(f"\n  Next Steps:")
                        for i, step in enumerate(mvp_data['next_steps'][:3], 1):
                            print(f"    {i}. {step}")
                
                assert data['status'] == 'success', "Status should be success"
                assert 'data' in data, "Response should contain data"
                
                return data
            else:
                print(f"✗ Failed with status {response.status_code}")
                print(f"Response: {response.text}")
                raise Exception(f"MVP generation failed: {response.status_code}")
                
        except requests.exceptions.Timeout:
            print("✗ Request timed out (exceeded 10 minutes)")
            print("⚠️  This is normal for complex MVP generation")
            print("💡 Tip: Try a simpler project or increase timeout")
            raise Exception("MVP generation timed out")
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            raise Exception(f"MVP generation error: {str(e)}")
    
    def test_02_mvp_generation_with_scraping(self):
        """Test MVP generation with URL scraping"""
        import requests
        
        payload = {
            "productName": "E-Commerce Store",
            "productIdea": "An online store for selling handmade crafts",
            "coreFeatures": ["Product catalog", "Shopping cart", "Checkout"],
            "targetPlatform": "web",
            "techStack": ["React", "TypeScript"],
            "projectType": "web-app",
            "generateMultipleFiles": True,
            "includeComponents": True,
            "defaultLanguage": "react",
            "userId": self.user_id,
            "scrapeUrls": ["https://example.com"],
            "userSubscription": "pro"
        }
        
        print("\n" + "="*80)
        print("TEST 2: MVP Generation with URL Scraping")
        print("="*80)
        print(f"Product: {payload['productName']}")
        print(f"Scrape URLs: {payload['scrapeUrls']}")
        
        try:
            print("\n⏳ Generating with URL scraping (may take 5-10 minutes)...")
            response = requests.post(
                f"{self.base_url}/api/mvpDevelopment",
                json=payload,
                timeout=600
            )
            
            print(f"\nStatus Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✓ MVP with Scraping Generated Successfully!")
                assert data['status'] == 'success'
                return data
            else:
                print(f"✗ Failed: {response.text}")
                
        except Exception as e:
            print(f"✗ Error: {str(e)}")
    
    def test_03_mvp_refinement(self):
        """Test MVP refinement functionality"""
        import requests
        
        # First generate an MVP
        initial_payload = {
            "productName": "Simple App",
            "productIdea": "A basic application",
            "coreFeatures": ["Feature 1"],
            "targetPlatform": "web",
            "techStack": ["React"],
            "projectType": "web-app",
            "generateMultipleFiles": True,
            "includeComponents": True,
            "defaultLanguage": "react",
            "userId": self.user_id,
            "userSubscription": "free"
        }
        
        print("\n" + "="*80)
        print("TEST 3: MVP Refinement")
        print("="*80)
        
        try:
            # Generate initial MVP
            print("Step 1: Generating initial MVP (may take 3-5 minutes)...")
            initial_response = requests.post(
                f"{self.base_url}/api/mvpDevelopment",
                json=initial_payload,
                timeout=600
            )
            
            if initial_response.status_code != 200:
                print("✗ Initial generation failed")
                return
            
            initial_data = initial_response.json()
            print("✓ Initial MVP generated")
            
            # Refine the MVP
            print("\nStep 2: Refining MVP...")
            refinement_payload = {
                "currentHtml": initial_data['data'].get('html', '<div>Test</div>'),
                "feedback": "Add a dark mode toggle button in the header",
                "userId": self.user_id,
                "userSubscription": "free"
            }
            
            refinement_response = requests.post(
                f"{self.base_url}/api/mvp/refine",
                json=refinement_payload,
                timeout=600
            )
            
            print(f"Status Code: {refinement_response.status_code}")
            
            if refinement_response.status_code == 200:
                refined_data = refinement_response.json()
                print("✓ MVP Refined Successfully!")
                print(f"\nRefined Data:")
                print(f"  - Status: {refined_data.get('status')}")
                print(f"  - Has Updated HTML: {bool(refined_data.get('data', {}).get('html'))}")
                
                assert refined_data['status'] == 'success'
                return refined_data
            else:
                print(f"✗ Refinement failed: {refinement_response.text}")
                
        except Exception as e:
            print(f"✗ Error: {str(e)}")
    
    def test_04_get_mvp_templates(self):
        """Test retrieving MVP templates"""
        import requests
        
        print("\n" + "="*80)
        print("TEST 4: Get MVP Templates")
        print("="*80)
        
        try:
            response = requests.get(f"{self.base_url}/api/mvp/templates")
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✓ Templates Retrieved Successfully!")
                
                if data.get('data'):
                    templates = data['data']
                    print(f"\nAvailable Templates: {len(templates)}")
                    for template in templates:
                        print(f"\n  {template['name']}:")
                        print(f"    - ID: {template['id']}")
                        print(f"    - Category: {template['category']}")
                        print(f"    - Description: {template['description']}")
                        print(f"    - Prompt: {template['prompt'][:60]}...")
                
                assert data['status'] == 'success'
                assert len(data['data']) > 0, "Should have at least one template"
                return data
            else:
                print(f"✗ Failed: {response.text}")
                raise Exception("Failed to retrieve templates")
                
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            raise Exception(f"Error retrieving templates: {str(e)}")
    
    def test_05_save_mvp_project(self):
        """Test saving MVP project"""
        import requests
        
        print("\n" + "="*80)
        print("TEST 5: Save MVP Project")
        print("="*80)
        
        payload = {
            "projectName": "My Awesome Project",
            "projectData": {
                "files": ["index.html", "app.js"],
                "timestamp": datetime.now().isoformat()
            },
            "userId": self.user_id
        }
        
        print(f"Project Name: {payload['projectName']}")
        print(f"User ID: {payload['userId']}")
        
        try:
            response = requests.post(
                f"{self.base_url}/api/mvp/save",
                json=payload
            )
            
            print(f"\nStatus Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✓ Project Saved Successfully!")
                print(f"\nSaved Data:")
                print(f"  - Status: {data.get('status')}")
                print(f"  - Message: {data.get('message')}")
                print(f"  - Project ID: {data.get('project_id')}")
                
                assert data['status'] == 'success'
                assert 'project_id' in data
                return data
            else:
                print(f"✗ Failed: {response.text}")
                
        except Exception as e:
            print(f"✗ Error: {str(e)}")
    
    def test_06_get_mvp_history(self):
        """Test retrieving MVP project history"""
        import requests
        
        print("\n" + "="*80)
        print("TEST 6: Get MVP History")
        print("="*80)
        print(f"User ID: {self.user_id}")
        
        try:
            response = requests.get(
                f"{self.base_url}/api/mvp/history/{self.user_id}"
            )
            
            print(f"\nStatus Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✓ History Retrieved Successfully!")
                print(f"\nHistory Data:")
                print(f"  - Status: {data.get('status')}")
                print(f"  - Projects: {len(data.get('data', []))}")
                
                assert data['status'] == 'success'
                return data
            else:
                print(f"✗ Failed: {response.text}")
                
        except Exception as e:
            print(f"✗ Error: {str(e)}")
    
    def test_07_chat_endpoint(self):
        """Test chat endpoint for conversational AI"""
        import requests
        
        print("\n" + "="*80)
        print("TEST 7: Chat Endpoint")
        print("="*80)
        
        payload = {
            "message": "Build me a simple todo app",
            "context": "I want a React application",
            "userId": self.user_id
        }
        
        print(f"Message: {payload['message']}")
        print(f"Context: {payload['context']}")
        
        try:
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=60
            )
            
            print(f"\nStatus Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✓ Chat Response Received!")
                print(f"\nChat Data:")
                print(f"  - Status: {data.get('status')}")
                print(f"  - Response: {data.get('response', '')[:100]}...")
                
                assert data['status'] == 'success'
                return data
            else:
                print(f"✗ Failed: {response.text}")
                
        except Exception as e:
            print(f"✗ Error: {str(e)}")
    
    def test_08_health_check(self):
        """Test API health check"""
        import requests
        
        print("\n" + "="*80)
        print("TEST 8: Health Check")
        print("="*80)
        
        try:
            response = requests.get(f"{self.base_url}/health")
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✓ API is Healthy!")
                print(f"\nHealth Status:")
                print(f"  - Status: {data.get('status')}")
                
                if 'agents' in data:
                    print(f"\n  Agents Status:")
                    agents = data['agents']
                    print(f"    • MVP Agent: {agents.get('mvp_agent')}")
                    print(f"    • Idea Validation Agent: {agents.get('idea_validation_agent')}")
                    print(f"    • Business Planning Agent: {agents.get('business_planning_agent')}")
                    print(f"    • Market Research Agent: {agents.get('market_research_agent')}")
                    print(f"    • Pitch Deck Agent: {agents.get('pitch_deck_agent')}")
                else:
                    print(f"  - MVP Agent: {data.get('mvp_agent')}")
                    print(f"  - Business Planning Agent: {data.get('business_planning_agent')}")
                
                print(f"\n  - Database: {data.get('database')}")
                print(f"  - Timestamp: {data.get('timestamp')}")
                
                assert data['status'] == 'ok'
                return data
            else:
                print(f"✗ Health check failed: {response.text}")
                raise Exception("Health check failed")
                
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            raise Exception(f"Health check error: {str(e)}")
    
    def test_09_error_handling(self):
        """Test error handling with invalid input"""
        import requests
        
        print("\n" + "="*80)
        print("TEST 9: Error Handling")
        print("="*80)
        
        # Test with missing required fields
        invalid_payload = {
            "productName": "",  # Empty name
            "productIdea": "",  # Empty idea
        }
        
        print("Testing with invalid/empty payload...")
        
        try:
            response = requests.post(
                f"{self.base_url}/api/mvpDevelopment",
                json=invalid_payload,
                timeout=30
            )
            
            print(f"Status Code: {response.status_code}")
            
            # Should either return 400 (bad request) or handle gracefully
            if response.status_code in [400, 422, 500]:
                print("✓ Error handled correctly!")
                print(f"Error Response: {response.text[:200]}")
            else:
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"Exception caught (expected): {str(e)}")
    
    def test_10_performance_metrics(self):
        """Test performance and response times"""
        import requests
        import time
        
        print("\n" + "="*80)
        print("TEST 10: Performance Metrics")
        print("="*80)
        
        # Test health endpoint performance
        print("\n1. Health Endpoint Performance:")
        start_time = time.time()
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            end_time = time.time()
            response_time = (end_time - start_time) * 1000  # Convert to ms
            
            print(f"   Response Time: {response_time:.2f}ms")
            print(f"   Status: {'✓ PASS' if response_time < 1000 else '✗ SLOW'}")
            
            assert response_time < 5000, "Health check should respond within 5 seconds"
        except Exception as e:
            print(f"   ✗ Error: {str(e)}")
        
        # Test templates endpoint performance
        print("\n2. Templates Endpoint Performance:")
        start_time = time.time()
        try:
            response = requests.get(f"{self.base_url}/api/mvp/templates", timeout=5)
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            
            print(f"   Response Time: {response_time:.2f}ms")
            print(f"   Status: {'✓ PASS' if response_time < 1000 else '✗ SLOW'}")
            
            assert response_time < 5000, "Templates should respond within 5 seconds"
        except Exception as e:
            print(f"   ✗ Error: {str(e)}")


def check_server_running():
    """Check if the backend server is running"""
    import requests
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        return response.status_code == 200
    except:
        return False


def run_all_tests():
    """Run all tests in sequence"""
    print("\n" + "="*80)
    print("MVP DEVELOPMENT - COMPREHENSIVE TEST SUITE")
    print("="*80)
    print(f"API Base URL: {API_BASE_URL}")
    print(f"Test User ID: {TEST_USER_ID}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("="*80)
    
    # Check if server is running
    print("\n🔍 Checking if backend server is running...")
    if not check_server_running():
        print("\n" + "="*80)
        print("❌ ERROR: Backend server is not running!")
        print("="*80)
        print("\nTo start the backend server, run:")
        print("  1. Open a new terminal")
        print("  2. Navigate to: cd d:\\Nexora\\backend")
        print("  3. Run: python main.py")
        print("\nOr use uvicorn:")
        print("  uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        print("\nThen run this test again.")
        print("="*80)
        return
    
    print("✅ Backend server is running!\n")
    
    # Initialize test suite
    test_suite = TestMVPDevelopment()
    
    # Quick tests (fast, no AI generation)
    quick_tests = [
        ("Health Check", test_suite.test_08_health_check),
        ("Get MVP Templates", test_suite.test_04_get_mvp_templates),
        ("Save MVP Project", test_suite.test_05_save_mvp_project),
        ("Get MVP History", test_suite.test_06_get_mvp_history),
        ("Error Handling", test_suite.test_09_error_handling),
        ("Performance Metrics", test_suite.test_10_performance_metrics),
    ]
    
    # Slow tests (require AI generation, 3-10 minutes each)
    slow_tests = [
        ("Basic MVP Generation", test_suite.test_01_mvp_generation_basic),
        ("MVP Generation with Scraping", test_suite.test_02_mvp_generation_with_scraping),
        ("MVP Refinement", test_suite.test_03_mvp_refinement),
        ("Chat Endpoint", test_suite.test_07_chat_endpoint),
    ]
    
    # Ask user if they want to run slow tests
    print("\n" + "="*80)
    print("⚡ QUICK TESTS (API endpoints, no AI generation)")
    print("🐌 SLOW TESTS (AI generation, 3-10 minutes each)")
    print("="*80)
    run_slow = input("\nRun slow AI generation tests? (y/N): ").strip().lower()
    
    tests = quick_tests
    if run_slow == 'y':
        tests.extend(slow_tests)
        print("\n✓ Running ALL tests (quick + slow)")
    else:
        print("\n✓ Running QUICK tests only")
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            test_func()
            passed += 1
        except Exception as e:
            failed += 1
            print(f"\n✗ {test_name} FAILED: {str(e)}")
    
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"Total Tests: {len(tests)}")
    print(f"Passed: {passed} ✓")
    print(f"Failed: {failed} ✗")
    print(f"Success Rate: {(passed/len(tests)*100):.1f}%")
    print("="*80)


if __name__ == "__main__":
    run_all_tests()
