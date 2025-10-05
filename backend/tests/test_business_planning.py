"""
Test script for Business Planning Agent
========================================

Run this to verify the Business Planning Agent is working correctly.
"""

import asyncio
import json
import sys
from business_planning_agent import BusinessPlanningAgent


async def test_business_planning_agent():
    """Test the Business Planning Agent with a sample business idea"""
    
    print("=" * 80)
    print("Business Planning Agent Test Script")
    print("=" * 80)
    print()
    
    try:
        # Initialize agent
        print("1. Initializing Business Planning Agent...")
        agent = BusinessPlanningAgent()
        print("   ✓ Agent initialized successfully")
        print()
        
        # Test business idea
        test_idea = """
        A mobile app that uses AI to help people learn languages through 
        real-world conversations with native speakers. Users can practice 
        speaking, get instant feedback, and connect with language partners 
        globally. Freemium model with premium features for advanced learners.
        """
        
        print("2. Testing Lean Canvas Generation...")
        lean_canvas = await agent.generate_lean_canvas(
            idea=test_idea,
            target_market="Language learners aged 18-35",
            business_model="Freemium subscription"
        )
        print(f"   ✓ Lean Canvas generated")
        print(f"   - Problem: {', '.join(lean_canvas.problem.content[:2])}")
        print(f"   - Solution: {', '.join(lean_canvas.solution.content[:2])}")
        print(f"   - UVP: {', '.join(lean_canvas.unique_value_proposition.content)}")
        print()
        
        print("3. Testing Financial Estimation...")
        financials = await agent.estimate_financials(
            idea=test_idea,
            business_model="Freemium subscription",
            target_market_size="10M language learners globally"
        )
        print(f"   ✓ Financial estimates generated")
        print(f"   - Year 1 Revenue: ${financials.projections[0].revenue:,.0f}")
        print(f"   - CAC: ${financials.cac}")
        print(f"   - LTV: ${financials.ltv}")
        print(f"   - LTV:CAC Ratio: {financials.ltv_cac_ratio}")
        print(f"   - Break-even Month: {financials.break_even_month}")
        print(f"   - Funding Needed: ${financials.total_funding_needed:,.0f}")
        print()
        
        print("4. Testing Team Role Mapping...")
        team = await agent.map_team_roles(
            idea=test_idea,
            business_model="Freemium subscription",
            stage="pre-seed"
        )
        print(f"   ✓ Team composition mapped")
        print(f"   - Total Team Size: {team.total_team_size}")
        print(f"   - Monthly Payroll: ${team.estimated_payroll_monthly:,.0f}")
        print(f"   - Key Roles: {', '.join([r.role for r in team.roles[:3]])}")
        print()
        
        print("5. Testing Marketing Strategy...")
        marketing = await agent.build_marketing_strategy(
            idea=test_idea,
            target_audience="Language learners aged 18-35",
            budget=15000
        )
        print(f"   ✓ Marketing strategy built")
        print(f"   - Total Budget: ${marketing.total_budget:,.0f}")
        print(f"   - Channels: {', '.join([c.channel for c in marketing.channels[:3]])}")
        print()
        
        print("6. Testing Regulatory Compliance Check...")
        compliance = await agent.check_regulatory_compliance(
            idea=test_idea,
            industry="EdTech",
            region="United States"
        )
        print(f"   ✓ Compliance requirements identified")
        print(f"   - Total Requirements: {len(compliance.requirements)}")
        print(f"   - Total Compliance Cost: ${compliance.total_compliance_cost:,.0f}")
        if compliance.requirements:
            print(f"   - Top Requirement: {compliance.requirements[0].category}")
        print()
        
        print("7. Creating Complete Business Plan...")
        print("   This may take 2-3 minutes...")
        business_plan = await agent.create_business_plan(
            idea=test_idea,
            industry="EdTech",
            target_market="Language learners aged 18-35",
            business_model="Freemium subscription",
            region="United States",
            budget=15000,
            export_formats=["pdf", "docx"]
        )
        
        print(f"   ✓ Business plan created successfully!")
        print(f"   - Plan ID: {business_plan.plan_id}")
        print(f"   - Business Name: {business_plan.business_name}")
        print(f"   - Tagline: {business_plan.tagline}")
        print(f"   - PDF URL: {business_plan.pdf_url or 'Not generated'}")
        print(f"   - DOCX URL: {business_plan.docx_url or 'Not generated'}")
        print(f"   - Co-Founder Feedback: {len(business_plan.co_founder_feedback)} items")
        print()
        
        # Display executive summary
        print("8. Executive Summary:")
        print(f"   {business_plan.executive_summary[:200]}...")
        print()
        
        # Display co-founder feedback
        if business_plan.co_founder_feedback:
            print("9. AI Co-Founder Feedback (first item):")
            feedback = business_plan.co_founder_feedback[0]
            print(f"   Type: {feedback.feedback_type}")
            print(f"   Message: {feedback.message[:150]}...")
            print()
        
        # Save response to file
        formatted = agent.format_response(business_plan)
        with open('test_business_plan.json', 'w', encoding='utf-8') as f:
            json.dump(formatted, f, indent=2)
        print("10. Full business plan saved to: test_business_plan.json")
        print()
        
        print("=" * 80)
        print("✓ All tests passed successfully!")
        print("=" * 80)
        
        return True
        
    except Exception as e:
        print()
        print("=" * 80)
        print("✗ Test failed!")
        print("=" * 80)
        print(f"Error: {str(e)}")
        print()
        print("Troubleshooting:")
        print("1. Check that GROQ_API_KEY is set in .env file")
        print("2. Verify your internet connection")
        print("3. Check the backend logs for more details")
        print()
        import traceback
        traceback.print_exc()
        return False


async def test_api_keys():
    """Test if API keys are configured"""
    
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    print("Checking API keys configuration...")
    print()
    
    keys = {
        "GROQ_API_KEY": os.getenv("GROQ_API_KEY"),
    }
    
    all_set = True
    for key_name, key_value in keys.items():
        if key_value:
            print(f"✓ {key_name}: Set ({key_value[:10]}...)")
        else:
            print(f"✗ {key_name}: Not set")
            all_set = False
    
    print()
    return all_set


if __name__ == "__main__":
    print()
    
    # First check API keys
    if not asyncio.run(test_api_keys()):
        print("⚠️  Warning: GROQ_API_KEY is not configured!")
        print("Please set it in the .env file before running tests.")
        print()
        sys.exit(1)
    
    # Run tests
    success = asyncio.run(test_business_planning_agent())
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)
