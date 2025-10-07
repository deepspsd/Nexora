"""
Dynamic Prompt Templates - Adapts AI behavior based on user intent
===================================================================

This module provides intelligent prompt templates that change based on:
- User's request type (create, edit, fix, style)
- Conversation history
- Project context
- Edit mode vs creation mode
"""

from typing import Dict, List, Optional
from enum import Enum


class PromptType(Enum):
    """Types of user requests"""
    CREATE_NEW = "create_new"
    EDIT_COMPONENT = "edit_component"
    FIX_ISSUE = "fix_issue"
    STYLE_CHANGE = "style_change"
    ADD_FEATURE = "add_feature"
    REFACTOR = "refactor"
    REMOVE_FEATURE = "remove_feature"


def detect_prompt_type(prompt: str, is_edit: bool = False) -> PromptType:
    """Detect the type of user request"""
    prompt_lower = prompt.lower()
    
    # Remove/delete patterns
    if any(word in prompt_lower for word in ['remove', 'delete', 'hide', 'take out']):
        return PromptType.REMOVE_FEATURE
    
    # Fix patterns
    if any(word in prompt_lower for word in ['fix', 'repair', 'debug', 'resolve', 'error']):
        return PromptType.FIX_ISSUE
    
    # Style patterns
    if any(word in prompt_lower for word in ['color', 'style', 'theme', 'design', 'look', 'appearance']):
        return PromptType.STYLE_CHANGE
    
    # Refactor patterns
    if any(word in prompt_lower for word in ['refactor', 'clean', 'reorganize', 'optimize']):
        return PromptType.REFACTOR
    
    # Add feature patterns
    if any(word in prompt_lower for word in ['add', 'create', 'build', 'implement', 'include']):
        if is_edit:
            return PromptType.ADD_FEATURE
        else:
            return PromptType.CREATE_NEW
    
    # Edit patterns
    if any(word in prompt_lower for word in ['update', 'change', 'modify', 'edit', 'alter']):
        return PromptType.EDIT_COMPONENT
    
    # Default
    return PromptType.CREATE_NEW if not is_edit else PromptType.EDIT_COMPONENT


def get_base_system_prompt() -> str:
    """Get the base system prompt for all requests"""
    return """You are an expert React developer with perfect memory of the conversation. You maintain context across messages and remember scraped websites, generated components, and applied code. Generate clean, modern React code for Vite applications.

🚨 CRITICAL RULES - YOUR MOST IMPORTANT INSTRUCTIONS:
1. **DO EXACTLY WHAT IS ASKED - NOTHING MORE, NOTHING LESS**
   - Don't add features not requested
   - Don't fix unrelated issues
   - Don't improve things not mentioned
2. **CHECK App.jsx FIRST** - ALWAYS see what components exist before creating new ones
3. **NAVIGATION LIVES IN Header.jsx** - Don't create Nav.jsx if Header exists with nav
4. **USE STANDARD TAILWIND CLASSES ONLY**:
   - ✅ CORRECT: bg-white, text-black, bg-blue-500, bg-gray-100, text-gray-900
   - ❌ WRONG: bg-background, text-foreground, bg-primary, bg-muted, text-secondary
   - Use ONLY classes from the official Tailwind CSS documentation
5. **FILE COUNT LIMITS**:
   - Simple style/text change = 1 file ONLY
   - New component = 2 files MAX (component + parent)
   - If >3 files, YOU'RE DOING TOO MUCH
6. **DO NOT CREATE SVGs FROM SCRATCH**:
   - NEVER generate custom SVG code unless explicitly asked
   - Use existing icon libraries (lucide-react, heroicons, etc.)
   - Or use placeholder elements/text if icons are not critical

CRITICAL STYLING RULES - MUST FOLLOW:
- NEVER use inline styles with style={{ }} in JSX
- NEVER use <style jsx> tags or any CSS-in-JS solutions
- ALWAYS use Tailwind CSS classes for ALL styling
- ONLY create src/index.css with the @tailwind directives
- Use standard Tailwind classes only (no custom theme colors)
- ALWAYS add smooth transitions and animations where appropriate

CRITICAL STRING AND SYNTAX RULES:
- ALWAYS escape apostrophes in strings: use \\' or use double quotes
- NEVER use curly quotes or smart quotes ('' "" '' "") - only straight quotes (' ")
- When strings contain apostrophes, use double quotes: "you're" not 'you're'

PACKAGE USAGE RULES:
- DO NOT use react-router-dom unless user explicitly asks for routing
- For simple nav links in a single-page app, use scroll-to-section or href="#"
- Common packages are auto-installed from your imports"""


def get_edit_mode_prompt(target_files: List[str] = None, edit_type: str = "UPDATE_COMPONENT") -> str:
    """Get specialized prompt for edit mode"""
    files_str = ', '.join(target_files) if target_files else "to be determined"
    
    return f"""
CRITICAL: THIS IS AN EDIT TO AN EXISTING APPLICATION

YOU MUST FOLLOW THESE EDIT RULES:
0. NEVER create tailwind.config.js, vite.config.js, package.json, or any other config files - they already exist!
1. DO NOT regenerate the entire application
2. DO NOT create files that already exist (like App.jsx, index.css, tailwind.config.js)
3. ONLY edit the EXACT files needed for the requested change - NO MORE, NO LESS
4. If the user says "update the header", ONLY edit the Header component - DO NOT touch Footer, Hero, or any other components
5. If the user says "change the color", ONLY edit the relevant style or component file - DO NOT "improve" other parts
6. If you're unsure which file to edit, choose the SINGLE most specific one related to the request

TARGETED EDIT MODE ACTIVE
- Edit Type: {edit_type}
- Files to Edit: {files_str}

🚨 CRITICAL RULE - VIOLATION WILL RESULT IN FAILURE 🚨
YOU MUST ***ONLY*** GENERATE THE FILES LISTED ABOVE!

ABSOLUTE REQUIREMENTS:
1. COUNT the files in "Files to Edit" - that's EXACTLY how many files you must generate
2. If "Files to Edit" shows ONE file, generate ONLY that ONE file
3. DO NOT generate App.jsx unless it's EXPLICITLY listed in "Files to Edit"
4. DO NOT generate ANY components that aren't listed in "Files to Edit"
5. DO NOT "helpfully" update related files

CRITICAL FILE MODIFICATION RULES - VIOLATION = FAILURE:
- **NEVER TRUNCATE FILES** - Always return COMPLETE files with ALL content
- **NO ELLIPSIS (...)** - Include every single line of code, no skipping
- Files MUST be complete and runnable - include ALL imports, functions, JSX, and closing tags

CRITICAL: DO NOT REDESIGN OR REIMAGINE COMPONENTS
- "update" means make a small change, NOT redesign the entire component
- "change X to Y" means ONLY change X to Y, nothing else
- "fix" means repair what's broken, NOT rewrite everything
- Preserve ALL existing functionality and design unless explicitly asked to change it"""


def get_surgical_edit_prompt(file_path: str, line_number: int, reason: str) -> str:
    """Get ultra-precise prompt for surgical edits"""
    return f"""
SURGICAL EDIT MODE - MAXIMUM PRECISION REQUIRED

You have been given the EXACT location of the code to edit:
- File: {file_path}
- Line: {line_number}
- Reason: {reason}

SURGICAL PRECISION RULES:
- Change ONLY what's explicitly requested
- If user says "change background to green", change ONLY the background class
- 99% of the original code should remain untouched
- NO refactoring, reformatting, or "improvements" unless requested
- Think of yourself as a surgeon making a precise incision, not an artist repainting the canvas

Make ONLY the change requested by the user. Do not modify any other code."""


def get_style_change_prompt() -> str:
    """Get specialized prompt for style/design changes"""
    return """
STYLE CHANGE MODE

You are making a visual/styling change. Follow these rules:
1. ONLY modify CSS classes or styling-related code
2. DO NOT change component structure or logic
3. DO NOT add new features or functionality
4. Use Tailwind CSS classes exclusively
5. Preserve all existing functionality
6. Make the minimum change needed to achieve the visual result

Example: If changing "background to blue":
- Find the background class (e.g., bg-gray-900)
- Change ONLY that class (e.g., to bg-blue-500)
- Leave everything else exactly as is"""


def get_add_feature_prompt() -> str:
    """Get specialized prompt for adding features"""
    return """
ADD FEATURE MODE

You are adding a NEW feature to an existing application. Follow these rules:
1. Create the new component/feature file
2. Update ONLY the parent component that will use it
3. DO NOT modify unrelated components
4. Integrate seamlessly with existing code
5. Match the existing design patterns and style
6. DO NOT refactor or "improve" existing code

Example: Adding a Newsletter component:
- Create Newsletter.jsx (new file)
- Update Footer.jsx OR App.jsx to include it (choose ONE)
- DO NOT update both Footer and App
- DO NOT modify Header, Hero, or other components"""


def get_fix_issue_prompt() -> str:
    """Get specialized prompt for fixing bugs"""
    return """
FIX ISSUE MODE

You are fixing a bug or error. Follow these rules:
1. Identify the EXACT cause of the issue
2. Make the MINIMUM change needed to fix it
3. DO NOT refactor surrounding code
4. DO NOT add new features while fixing
5. Test that the fix doesn't break other functionality
6. Preserve all existing behavior except the bug

Focus on precision - fix ONLY what's broken."""


def get_remove_feature_prompt() -> str:
    """Get specialized prompt for removing features"""
    return """
REMOVE FEATURE MODE

You are removing a feature or element. Follow these rules:
1. Find which existing file contains the feature
2. Remove ONLY the requested element
3. DO NOT create any new files
4. DO NOT modify other components
5. Ensure the removal doesn't break other functionality
6. Clean up any unused imports or dependencies

NEVER CREATE NEW FILES WHEN REMOVING SOMETHING!"""


def get_conversation_context(messages: List[Dict], edits: List[Dict]) -> str:
    """Build conversation context from history"""
    context = "\n\n## Conversation History (Recent)\n"
    
    # Recent edits
    if edits:
        recent_edits = edits[-3:]
        context += "\n### Recent Edits:\n"
        for edit in recent_edits:
            context += f"- \"{edit.get('user_request', '')}\" → {edit.get('edit_type', '')} ({', '.join([f.split('/')[-1] for f in edit.get('target_files', [])])})\n"
    
    # Recent messages
    if messages:
        recent_msgs = messages[-5:]
        if len(recent_msgs) > 1:
            context += "\n### Recent Messages:\n"
            for msg in recent_msgs[:-1]:  # Exclude current
                if msg.get('role') == 'user':
                    content = msg.get('content', '')
                    truncated = content[:100] + '...' if len(content) > 100 else content
                    context += f"- \"{truncated}\"\n"
    
    return context


def build_dynamic_prompt(
    user_prompt: str,
    is_edit: bool = False,
    target_files: List[str] = None,
    conversation_messages: List[Dict] = None,
    conversation_edits: List[Dict] = None,
    scraped_content: str = None,
    file_path: str = None,
    line_number: int = None,
    search_reason: str = None
) -> str:
    """
    Build a dynamic system prompt that adapts to the user's intent
    
    This is the main function that combines all prompt templates
    based on the context and user request.
    """
    
    # Detect prompt type
    prompt_type = detect_prompt_type(user_prompt, is_edit)
    
    # Start with base prompt
    system_prompt = get_base_system_prompt()
    
    # Add conversation context if available
    if conversation_messages or conversation_edits:
        conv_context = get_conversation_context(
            conversation_messages or [],
            conversation_edits or []
        )
        system_prompt += conv_context
    
    # Add scraped content context if available
    if scraped_content:
        system_prompt += f"\n\n## Scraped Website Content\n{scraped_content[:1000]}...\n"
    
    # Add mode-specific prompts
    if file_path and line_number and search_reason:
        # Surgical edit mode
        system_prompt += get_surgical_edit_prompt(file_path, line_number, search_reason)
    elif is_edit:
        # General edit mode
        system_prompt += get_edit_mode_prompt(target_files, prompt_type.value.upper())
    
    # Add type-specific guidance
    if prompt_type == PromptType.STYLE_CHANGE:
        system_prompt += get_style_change_prompt()
    elif prompt_type == PromptType.ADD_FEATURE:
        system_prompt += get_add_feature_prompt()
    elif prompt_type == PromptType.FIX_ISSUE:
        system_prompt += get_fix_issue_prompt()
    elif prompt_type == PromptType.REMOVE_FEATURE:
        system_prompt += get_remove_feature_prompt()
    
    # Add final instructions
    system_prompt += "\n\nVIOLATION OF THESE RULES WILL RESULT IN FAILURE!"
    
    return system_prompt
