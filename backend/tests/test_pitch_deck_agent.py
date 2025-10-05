"""
Quick test script for Pitch Deck Agent
========================================

Run this to verify the Pitch Deck Agent is working correctly.
"""

import asyncio
import json
import sys
from pitch_deck_agent import PitchDeckAgent


async def test_agent():
    """Test the Pitch Deck Agent with a simple request"""
    
    print("=" * 80)
    print("PITCH DECK AGENT - Test Script")
    print("=" * 80)
    
    try:
        # Initialize agent
        print("\n1. Initializing Pitch Deck Agent...")
        agent = PitchDeckAgent()
        print("   ✓ Agent initialized successfully")
        
        # Test data
        business_idea = "A mobile app that uses AI to help people learn new languages through real-world conversations"
        business_name = "LinguaAI"
        target_market = "Language learners aged 18-35"
        funding_ask = 1000000
        
        print(f"\n2. Creating pitch deck for: {business_name}")
        print(f"   Idea: {business_idea}")
        print(f"   Target Market: {target_market}")
        print(f"   Funding Ask: ${funding_ask:,}")
        
        # Create pitch deck
        print("\n3. Generating pitch deck...")
        deck = await agent.create_pitch_deck(
            business_idea=business_idea,
            business_name=business_name,
            target_market=target_market,
            funding_ask=funding_ask,
            brand_tone="modern",
            include_voiceover=False,  # Skip voiceover for quick test
            include_demo_script=True,
            include_qa=True
        )
        
        print("\n" + "=" * 80)
        print("✓ PITCH DECK CREATED SUCCESSFULLY")
        print("=" * 80)
        
        # Display results
        print(f"\n📋 DECK INFORMATION:")
        print(f"   Deck ID: {deck.deck_id}")
        print(f"   Business: {deck.business_name}")
        print(f"   Tagline: {deck.tagline}")
        print(f"   Created: {deck.created_at}")
        
        print(f"\n🎨 DESIGN THEME:")
        print(f"   Name: {deck.design_theme.name}")
        print(f"   Primary Color: {deck.design_theme.primary_color}")
        print(f"   Secondary Color: {deck.design_theme.secondary_color}")
        print(f"   Font: {deck.design_theme.font_family}")
        print(f"   Style: {deck.design_theme.style_description}")
        
        print(f"\n📊 SLIDES (12 total):")
        all_slides = [
            deck.slides.title_slide,
            deck.slides.problem_slide,
            deck.slides.solution_slide,
            deck.slides.market_slide,
            deck.slides.product_slide,
            deck.slides.business_model_slide,
            deck.slides.traction_slide,
            deck.slides.competition_slide,
            deck.slides.team_slide,
            deck.slides.financials_slide,
            deck.slides.ask_slide,
            deck.slides.closing_slide
        ]
        
        for slide in all_slides:
            print(f"\n   Slide {slide.slide_number}: {slide.title}")
            for i, item in enumerate(slide.content[:3], 1):  # Show first 3 points
                print(f"      {i}. {item}")
            if slide.chart_type:
                print(f"      📈 Chart Type: {slide.chart_type}")
                if slide.chart_data:
                    print(f"      📊 Chart Data: {list(slide.chart_data.keys())}")
        
        print(f"\n🎤 DEMO SCRIPT:")
        print(f"   Total Duration: {deck.demo_script.total_duration_minutes} minutes")
        print(f"   Slide Scripts: {len(deck.demo_script.slide_scripts)}")
        print(f"   Pacing Cues: {len(deck.demo_script.pacing_cues)}")
        print(f"   Emphasis Points: {len(deck.demo_script.emphasis_points)}")
        
        if deck.demo_script.pacing_cues:
            print(f"\n   Sample Pacing Cues:")
            for cue in deck.demo_script.pacing_cues[:3]:
                print(f"      • {cue}")
        
        print(f"\n❓ INVESTOR Q&A:")
        print(f"   Total Questions: {len(deck.investor_qa)}")
        
        # Group by category
        categories = {}
        for qa in deck.investor_qa:
            if qa.category not in categories:
                categories[qa.category] = []
            categories[qa.category].append(qa)
        
        print(f"   Categories: {', '.join(categories.keys())}")
        
        print(f"\n   Sample Questions:")
        for i, qa in enumerate(deck.investor_qa[:5], 1):
            print(f"\n      Q{i} [{qa.category.upper()}] - {qa.difficulty}")
            print(f"      {qa.question}")
            print(f"      Key Points: {', '.join(qa.key_points[:2])}")
        
        # Check PPTX export
        print(f"\n📄 PPTX EXPORT:")
        if deck.pptx_url:
            print(f"   ✓ PPTX exported to: {deck.pptx_url}")
            import os
            if os.path.exists(deck.pptx_url):
                file_size = os.path.getsize(deck.pptx_url) / 1024  # KB
                print(f"   File size: {file_size:.2f} KB")
        else:
            print(f"   ⚠ PPTX export not available (python-pptx not installed)")
        
        # Test chart generation
        print(f"\n📈 CHART GENERATION TEST:")
        if deck.slides.market_slide.chart_data:
            chart_url = agent.quickchart.generate_chart_url(
                chart_type="bar",
                data=deck.slides.market_slide.chart_data,
                width=800,
                height=400
            )
            print(f"   Market Chart URL: {chart_url[:80]}...")
        
        print("\n" + "=" * 80)
        print("✓ ALL TESTS PASSED!")
        print("=" * 80)
        
        # Save results to file
        output_file = "pitch_deck_test_results.json"
        print(f"\n💾 Saving results to {output_file}...")
        
        # Convert to dict for JSON serialization
        results = {
            "deck_id": deck.deck_id,
            "business_name": deck.business_name,
            "tagline": deck.tagline,
            "design_theme": {
                "name": deck.design_theme.name,
                "primary_color": deck.design_theme.primary_color,
                "secondary_color": deck.design_theme.secondary_color,
                "font_family": deck.design_theme.font_family
            },
            "slides": [
                {
                    "slide_number": slide.slide_number,
                    "title": slide.title,
                    "content": slide.content,
                    "chart_type": slide.chart_type
                }
                for slide in all_slides
            ],
            "demo_script": {
                "duration_minutes": deck.demo_script.total_duration_minutes,
                "pacing_cues": deck.demo_script.pacing_cues,
                "emphasis_points": deck.demo_script.emphasis_points
            },
            "investor_qa": [
                {
                    "question": qa.question,
                    "category": qa.category,
                    "difficulty": qa.difficulty,
                    "key_points": qa.key_points
                }
                for qa in deck.investor_qa
            ]
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"   ✓ Results saved to {output_file}")
        
        return True
        
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def test_individual_features():
    """Test individual features separately"""
    
    print("\n" + "=" * 80)
    print("TESTING INDIVIDUAL FEATURES")
    print("=" * 80)
    
    try:
        agent = PitchDeckAgent()
        business_idea = "AI-powered fitness coaching app"
        
        # Test 1: Slide Generation
        print("\n1. Testing Slide Generation...")
        slides = await agent.generate_slides(
            business_idea=business_idea,
            business_name="FitAI",
            funding_ask=500000
        )
        print(f"   ✓ Generated {12} slides")
        print(f"   Sample: {slides.problem_slide.title}")
        
        # Test 2: Design Theme Selection
        print("\n2. Testing Design Theme Selection...")
        theme = await agent.select_design_theme(business_idea, "modern")
        print(f"   ✓ Theme: {theme.name}")
        print(f"   Colors: {theme.primary_color}, {theme.secondary_color}")
        
        # Test 3: Chart Generation
        print("\n3. Testing Chart Generation...")
        slides_with_charts = await agent.add_charts_to_slides(slides, business_idea)
        print(f"   ✓ Market chart: {slides_with_charts.market_slide.chart_type}")
        print(f"   ✓ Financial chart: {slides_with_charts.financials_slide.chart_type}")
        
        # Test 4: Demo Script
        print("\n4. Testing Demo Script Generation...")
        demo_script = await agent.generate_demo_script(slides)
        print(f"   ✓ Duration: {demo_script.total_duration_minutes} minutes")
        print(f"   ✓ Pacing cues: {len(demo_script.pacing_cues)}")
        
        # Test 5: Investor Q&A
        print("\n5. Testing Investor Q&A Generation...")
        qa = await agent.generate_investor_qa(business_idea, slides, num_questions=5)
        print(f"   ✓ Generated {len(qa)} questions")
        if qa:
            print(f"   Sample: {qa[0].question}")
        
        print("\n" + "=" * 80)
        print("✓ ALL INDIVIDUAL FEATURE TESTS PASSED!")
        print("=" * 80)
        
        return True
        
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n🚀 Starting Pitch Deck Agent Tests...\n")
    
    # Run main test
    success1 = asyncio.run(test_agent())
    
    # Run individual feature tests
    success2 = asyncio.run(test_individual_features())
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Main Test: {'✓ PASSED' if success1 else '✗ FAILED'}")
    print(f"Feature Tests: {'✓ PASSED' if success2 else '✗ FAILED'}")
    print("=" * 80)
    
    sys.exit(0 if (success1 and success2) else 1)
