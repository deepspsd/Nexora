"""
Test Suite for Idea Validation Agent
=====================================

Comprehensive tests for all validation modules.

Author: NEXORA Team
Version: 1.0.0
"""

import asyncio
import pytest
from idea_validation_agent import (
    IdeaValidationAgent,
    FeasibilityScore,
    Competitor,
    TargetAudience,
    ProblemSolutionFit,
    Risk
)


# Test ideas
TEST_IDEAS = {
    "food_tech": """
        A B2B SaaS platform that helps restaurants automatically manage food waste 
        using AI-powered sensors and computer vision. The system tracks inventory, 
        predicts demand, and provides actionable insights to reduce waste by up to 40%.
    """,
    
    "fintech": """
        A mobile banking app for Gen Z that gamifies saving money through 
        micro-investments and social challenges with friends.
    """,
    
    "edtech": """
        An AI tutor platform that adapts to each student's learning style 
        and provides personalized study plans for exam preparation.
    """,
    
    "simple": "A todo list app with AI suggestions"
}


class TestIdeaValidationAgent:
    """Test suite for Idea Validation Agent"""
    
    @pytest.fixture
    async def agent(self):
        """Create agent instance"""
        return IdeaValidationAgent()
    
    @pytest.mark.asyncio
    async def test_agent_initialization(self):
        """Test agent initializes correctly"""
        agent = IdeaValidationAgent()
        assert agent is not None
        assert agent.groq is not None
        assert agent.firecrawl is not None
        assert agent.quickchart is not None
    
    @pytest.mark.asyncio
    async def test_feasibility_scoring(self, agent):
        """Test AI feasibility scoring"""
        result = await agent.analyze_feasibility(TEST_IDEAS["food_tech"])
        
        assert isinstance(result, FeasibilityScore)
        assert 0 <= result.feasibility <= 100
        assert 0 <= result.novelty <= 100
        assert 0 <= result.scalability <= 100
        assert 0 <= result.overall <= 100
        assert len(result.reasoning) > 0
        
        print(f"\n✓ Feasibility Score: {result.overall}/100")
        print(f"  - Feasibility: {result.feasibility}/100")
        print(f"  - Novelty: {result.novelty}/100")
        print(f"  - Scalability: {result.scalability}/100")
    
    @pytest.mark.asyncio
    async def test_competitor_search(self, agent):
        """Test competitor finding"""
        result = await agent.find_competitors(
            TEST_IDEAS["food_tech"],
            industry="Food Tech"
        )
        
        assert isinstance(result, list)
        # May find 0 competitors for very novel ideas
        
        if result:
            comp = result[0]
            assert isinstance(comp, Competitor)
            assert len(comp.name) > 0
            assert 0 <= comp.overlap_score <= 100
            
            print(f"\n✓ Found {len(result)} competitors")
            for comp in result[:3]:
                print(f"  - {comp.name}: {comp.overlap_score}% overlap")
        else:
            print("\n✓ No direct competitors found (blue ocean opportunity)")
    
    @pytest.mark.asyncio
    async def test_audience_analysis(self, agent):
        """Test target audience analysis"""
        result = await agent.analyze_target_audience(TEST_IDEAS["fintech"])
        
        assert isinstance(result, TargetAudience)
        assert 0 <= result.fit_score <= 100
        assert len(result.segments) > 0
        
        print(f"\n✓ Audience Fit Score: {result.fit_score}/100")
        print(f"  - Segments: {len(result.segments)}")
        print(f"  - TAM: {result.total_addressable_market}")
        
        for seg in result.segments[:2]:
            print(f"\n  Segment: {seg.name}")
            print(f"    Adoption: {seg.adoption_likelihood}/100")
    
    @pytest.mark.asyncio
    async def test_problem_solution_fit(self, agent):
        """Test problem-solution fit analysis"""
        result = await agent.analyze_problem_solution_fit(TEST_IDEAS["edtech"])
        
        assert isinstance(result, ProblemSolutionFit)
        assert 0 <= result.trend_score <= 100
        assert result.search_volume_trend in ["rising", "stable", "declining"]
        assert result.market_demand in ["high", "moderate", "low"]
        
        print(f"\n✓ Trend Score: {result.trend_score}/100")
        print(f"  - Trend: {result.search_volume_trend}")
        print(f"  - Demand: {result.market_demand}")
        print(f"  - Summary: {result.trend_summary[:100]}...")
    
    @pytest.mark.asyncio
    async def test_risk_detection(self, agent):
        """Test risk detection"""
        result = await agent.detect_risks(
            TEST_IDEAS["food_tech"],
            industry="Food Tech"
        )
        
        assert isinstance(result, list)
        assert len(result) <= 5  # Top 5 risks
        
        if result:
            risk = result[0]
            assert isinstance(risk, Risk)
            assert risk.severity in ["High", "Medium", "Low"]
            assert len(risk.mitigation) > 0
            
            print(f"\n✓ Found {len(result)} risks")
            for risk in result:
                print(f"  - [{risk.severity}] {risk.risk[:60]}...")
    
    @pytest.mark.asyncio
    async def test_full_validation(self, agent):
        """Test complete validation pipeline"""
        result = await agent.validate_idea(
            idea=TEST_IDEAS["food_tech"],
            industry="Food Tech",
            generate_pdf=False  # Skip PDF for faster testing
        )
        
        # Check all components
        assert len(result.idea_title) > 0
        assert len(result.summary) > 0
        assert result.ai_feasibility_score.overall > 0
        assert isinstance(result.competitors, list)
        assert result.target_audience.fit_score > 0
        assert result.problem_solution_fit.trend_score > 0
        assert isinstance(result.risks, list)
        assert len(result.summary_recommendation) > 0
        assert len(result.validation_id) > 0
        
        print(f"\n{'='*60}")
        print(f"FULL VALIDATION RESULTS")
        print(f"{'='*60}")
        print(f"Idea: {result.idea_title}")
        print(f"Overall Score: {result.ai_feasibility_score.overall}/100")
        print(f"Competitors: {len(result.competitors)}")
        print(f"Audience Fit: {result.target_audience.fit_score}/100")
        print(f"Trend Score: {result.problem_solution_fit.trend_score}/100")
        print(f"Risks: {len(result.risks)}")
        print(f"\nRecommendation: {result.summary_recommendation}")
        print(f"{'='*60}")
    
    @pytest.mark.asyncio
    async def test_json_output(self, agent):
        """Test JSON serialization"""
        result = await agent.validate_idea(
            idea=TEST_IDEAS["simple"],
            generate_pdf=False
        )
        
        json_output = agent.to_json(result)
        
        assert isinstance(json_output, str)
        assert len(json_output) > 0
        assert "idea_validation_response" in json_output
        
        print(f"\n✓ JSON output generated ({len(json_output)} chars)")
    
    @pytest.mark.asyncio
    async def test_multiple_ideas(self, agent):
        """Test validation of multiple ideas"""
        results = []
        
        for name, idea in list(TEST_IDEAS.items())[:3]:
            result = await agent.validate_idea(
                idea=idea,
                generate_pdf=False
            )
            results.append((name, result))
        
        print(f"\n{'='*60}")
        print(f"COMPARATIVE ANALYSIS")
        print(f"{'='*60}")
        
        for name, result in results:
            print(f"\n{name.upper()}")
            print(f"  Overall: {result.ai_feasibility_score.overall}/100")
            print(f"  Recommendation: {result.summary_recommendation[:50]}...")
    
    @pytest.mark.asyncio
    async def test_error_handling(self, agent):
        """Test error handling with invalid input"""
        # Very short idea
        result = await agent.analyze_feasibility("App")
        assert isinstance(result, FeasibilityScore)
        
        # Empty competitors search
        competitors = await agent.find_competitors("xyzabc123nonexistent")
        assert isinstance(competitors, list)
        
        print("\n✓ Error handling works correctly")


# Standalone test functions for manual testing
async def test_quick_validation():
    """Quick validation test"""
    print("\n" + "="*60)
    print("QUICK VALIDATION TEST")
    print("="*60)
    
    agent = IdeaValidationAgent()
    
    idea = input("\nEnter your startup idea: ").strip()
    if not idea:
        idea = TEST_IDEAS["food_tech"]
        print(f"Using default idea: {idea[:100]}...")
    
    print("\n⏳ Analyzing feasibility...")
    result = await agent.analyze_feasibility(idea)
    
    print(f"\n{'='*60}")
    print(f"FEASIBILITY ANALYSIS")
    print(f"{'='*60}")
    print(f"Feasibility:  {result.feasibility}/100")
    print(f"Novelty:      {result.novelty}/100")
    print(f"Scalability:  {result.scalability}/100")
    print(f"{'─'*60}")
    print(f"OVERALL:      {result.overall}/100")
    print(f"{'='*60}")
    print(f"\nReasoning: {result.reasoning}")


async def test_full_validation_interactive():
    """Interactive full validation test"""
    print("\n" + "="*60)
    print("FULL IDEA VALIDATION TEST")
    print("="*60)
    
    agent = IdeaValidationAgent()
    
    idea = input("\nEnter your startup idea: ").strip()
    if not idea:
        idea = TEST_IDEAS["food_tech"]
        print(f"Using default idea: {idea[:100]}...")
    
    industry = input("Enter industry (optional): ").strip()
    
    print("\n⏳ Running full validation (this may take 20-30 seconds)...")
    print("   - Analyzing feasibility...")
    print("   - Searching for competitors...")
    print("   - Analyzing target audience...")
    print("   - Checking market trends...")
    print("   - Detecting risks...")
    
    result = await agent.validate_idea(
        idea=idea,
        industry=industry,
        generate_pdf=True
    )
    
    # Print results
    print(f"\n{'='*60}")
    print(f"VALIDATION RESULTS")
    print(f"{'='*60}")
    print(f"\nIdea: {result.idea_title}")
    print(f"\n{result.summary}")
    
    print(f"\n{'─'*60}")
    print(f"AI FEASIBILITY SCORE")
    print(f"{'─'*60}")
    print(f"Feasibility:  {result.ai_feasibility_score.feasibility}/100")
    print(f"Novelty:      {result.ai_feasibility_score.novelty}/100")
    print(f"Scalability:  {result.ai_feasibility_score.scalability}/100")
    print(f"Overall:      {result.ai_feasibility_score.overall}/100")
    
    print(f"\n{'─'*60}")
    print(f"COMPETITORS ({len(result.competitors)} found)")
    print(f"{'─'*60}")
    for i, comp in enumerate(result.competitors[:3], 1):
        print(f"\n{i}. {comp.name} (Overlap: {comp.overlap_score}%)")
        print(f"   {comp.description[:80]}...")
    
    print(f"\n{'─'*60}")
    print(f"TARGET AUDIENCE (Fit: {result.target_audience.fit_score}/100)")
    print(f"{'─'*60}")
    print(f"TAM: {result.target_audience.total_addressable_market}")
    for seg in result.target_audience.segments[:2]:
        print(f"\n• {seg.name} (Adoption: {seg.adoption_likelihood}/100)")
        print(f"  {seg.demographics}")
    
    print(f"\n{'─'*60}")
    print(f"PROBLEM-SOLUTION FIT (Score: {result.problem_solution_fit.trend_score}/100)")
    print(f"{'─'*60}")
    print(f"Trend: {result.problem_solution_fit.search_volume_trend}")
    print(f"Demand: {result.problem_solution_fit.market_demand}")
    print(f"{result.problem_solution_fit.trend_summary}")
    
    print(f"\n{'─'*60}")
    print(f"RISKS ({len(result.risks)} identified)")
    print(f"{'─'*60}")
    for i, risk in enumerate(result.risks, 1):
        print(f"\n{i}. [{risk.severity}] {risk.risk}")
        print(f"   Mitigation: {risk.mitigation}")
    
    print(f"\n{'='*60}")
    print(f"RECOMMENDATION")
    print(f"{'='*60}")
    print(f"{result.summary_recommendation}")
    print(f"{'='*60}")
    
    if result.pdf_report_url:
        print(f"\n📄 PDF Report: {result.pdf_report_url}")
    
    print(f"\n✓ Validation ID: {result.validation_id}")


# Main execution
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "quick":
        asyncio.run(test_quick_validation())
    elif len(sys.argv) > 1 and sys.argv[1] == "full":
        asyncio.run(test_full_validation_interactive())
    else:
        print("\nUsage:")
        print("  python test_idea_validation.py quick  - Quick feasibility test")
        print("  python test_idea_validation.py full   - Full validation test")
        print("  pytest test_idea_validation.py        - Run all unit tests")
        print("\nRunning quick test by default...\n")
        asyncio.run(test_quick_validation())
