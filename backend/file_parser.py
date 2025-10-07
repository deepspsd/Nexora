"""
File Parser - Extract imports, exports, and component information
================================================================

Analyzes JavaScript/TypeScript files to understand project structure,
dependencies, and component relationships.
"""

import re
import json
from typing import Dict, List, Optional, Set, Tuple
from dataclasses import dataclass, field
from enum import Enum


class FileType(Enum):
    """File type enumeration"""
    COMPONENT = "component"
    PAGE = "page"
    LAYOUT = "layout"
    HOOK = "hook"
    CONTEXT = "context"
    UTILITY = "utility"
    STYLE = "style"
    CONFIG = "config"


@dataclass
class ImportInfo:
    """Import statement information"""
    source: str
    imports: List[str] = field(default_factory=list)
    default_import: Optional[str] = None
    is_local: bool = False


@dataclass
class ComponentInfo:
    """React component information"""
    name: str
    hooks: List[str] = field(default_factory=list)
    has_state: bool = False
    child_components: List[str] = field(default_factory=list)


@dataclass
class FileInfo:
    """Complete file information"""
    content: str
    path: str
    relative_path: str
    file_type: FileType
    imports: List[ImportInfo] = field(default_factory=list)
    exports: List[str] = field(default_factory=list)
    component_info: Optional[ComponentInfo] = None
    last_modified: int = 0


def extract_imports(content: str) -> List[ImportInfo]:
    """Extract import statements from file content"""
    imports = []
    
    # Match ES6 import statements
    import_regex = r'import\s+(?:(.+?)\s+from\s+)?[\'"](.+?)[\'"]'
    matches = re.finditer(import_regex, content)
    
    for match in matches:
        import_clause, source = match.groups()
        import_info = ImportInfo(
            source=source,
            is_local=source.startswith(('./','../', '@/'))
        )
        
        if import_clause:
            # Handle default import
            default_match = re.match(r'^(\w+)(?:,|$)', import_clause)
            if default_match:
                import_info.default_import = default_match.group(1)
            
            # Handle named imports
            named_match = re.search(r'\{([^}]+)\}', import_clause)
            if named_match:
                import_info.imports = [
                    imp.split(' as ')[0].strip()
                    for imp in named_match.group(1).split(',')
                ]
        
        imports.append(import_info)
    
    return imports


def extract_exports(content: str) -> List[str]:
    """Extract export statements from file content"""
    exports = []
    
    # Match default export
    if re.search(r'export\s+default\s+', content, re.MULTILINE):
        default_match = re.search(r'export\s+default\s+(?:function\s+)?(\w+)', content)
        if default_match:
            exports.append(f"default:{default_match.group(1)}")
        else:
            exports.append('default')
    
    # Match named exports
    named_regex = r'export\s+(?:const|let|var|function|class)\s+(\w+)'
    for match in re.finditer(named_regex, content):
        exports.append(match.group(1))
    
    # Match export { ... } statements
    block_regex = r'export\s+\{([^}]+)\}'
    for match in re.finditer(block_regex, content):
        names = [
            exp.split(' as ')[0].strip()
            for exp in match.group(1).split(',')
        ]
        exports.extend(names)
    
    return exports


def extract_component_info(content: str, file_path: str) -> Optional[ComponentInfo]:
    """Extract React component information"""
    # Check if this is likely a React component
    has_jsx = bool(re.search(r'<[A-Z]\w*|<[a-z]+\s+[^>]*\/?>', content))
    if not has_jsx and 'React' not in content:
        return None
    
    # Try to find component name
    component_name = ''
    
    # Check for function component
    func_match = re.search(r'(?:export\s+)?(?:default\s+)?function\s+([A-Z]\w*)\s*\(', content)
    if func_match:
        component_name = func_match.group(1)
    else:
        # Check for arrow function component
        arrow_match = re.search(r'(?:export\s+)?(?:default\s+)?(?:const|let)\s+([A-Z]\w*)\s*=\s*(?:\([^)]*\)|[^=])*=>', content)
        if arrow_match:
            component_name = arrow_match.group(1)
    
    # If no component name found, try to get from filename
    if not component_name:
        file_name = file_path.split('/')[-1].replace('.jsx', '').replace('.tsx', '').replace('.js', '').replace('.ts', '')
        if file_name and file_name[0].isupper():
            component_name = file_name
    
    if not component_name:
        return None
    
    # Extract hooks used
    hooks = list(set(re.findall(r'use[A-Z]\w*', content)))
    
    # Check if component has state
    has_state = 'useState' in hooks or 'useReducer' in hooks
    
    # Extract child components
    child_components = []
    component_regex = r'<([A-Z]\w*)[^>]*(?:\/>|>)'
    for match in re.finditer(component_regex, content):
        comp = match.group(1)
        if comp not in child_components and comp != component_name:
            child_components.append(comp)
    
    return ComponentInfo(
        name=component_name,
        hooks=hooks,
        has_state=has_state,
        child_components=child_components
    )


def determine_file_type(file_path: str, content: str) -> FileType:
    """Determine file type based on path and content"""
    file_name = file_path.split('/')[-1].lower()
    dir_path = file_path.lower()
    
    # Style files
    if file_name.endswith('.css'):
        return FileType.STYLE
    
    # Config files
    if 'config' in file_name or file_name in ['vite.config.js', 'tailwind.config.js', 'postcss.config.js']:
        return FileType.CONFIG
    
    # Hook files
    if '/hooks/' in dir_path or file_name.startswith('use'):
        return FileType.HOOK
    
    # Context files
    if '/context/' in dir_path or 'context' in file_name:
        return FileType.CONTEXT
    
    # Layout components
    if 'layout' in file_name or 'children' in content:
        return FileType.LAYOUT
    
    # Page components
    if '/pages/' in dir_path or 'useRouter' in content or 'useParams' in content:
        return FileType.PAGE
    
    # Utility files
    if '/utils/' in dir_path or '/lib/' in dir_path or 'export default' not in content:
        return FileType.UTILITY
    
    # Default to component
    return FileType.COMPONENT


def parse_javascript_file(content: str, file_path: str) -> Dict:
    """Parse a JavaScript/JSX file to extract imports, exports, and component info"""
    imports = extract_imports(content)
    exports = extract_exports(content)
    component_info = extract_component_info(content, file_path)
    file_type = determine_file_type(file_path, content)
    
    return {
        'imports': [
            {
                'source': imp.source,
                'imports': imp.imports,
                'default_import': imp.default_import,
                'is_local': imp.is_local
            }
            for imp in imports
        ],
        'exports': exports,
        'component_info': {
            'name': component_info.name,
            'hooks': component_info.hooks,
            'has_state': component_info.has_state,
            'child_components': component_info.child_components
        } if component_info else None,
        'type': file_type.value
    }


def extract_packages_from_files(files: Dict[str, str]) -> List[str]:
    """Extract npm packages from import statements in files"""
    packages = set()
    
    # Regex patterns
    import_regex = r'import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s*,?\s*)*(?:from\s+)?[\'"]([^\'"]+)[\'"]'
    require_regex = r'require\s*\([\'"]([^\'"]+)[\'"]\)'
    
    for file_path, content in files.items():
        # Skip non-JS/JSX/TS/TSX files
        if not re.match(r'.*\.(jsx?|tsx?)$', file_path):
            continue
        
        # Find ES6 imports
        for match in re.finditer(import_regex, content):
            packages.add(match.group(1))
        
        # Find CommonJS requires
        for match in re.finditer(require_regex, content):
            packages.add(match.group(1))
    
    # Filter out relative imports and built-in modules
    builtins = {'fs', 'path', 'http', 'https', 'crypto', 'stream', 'util', 'os', 'url', 'querystring', 'child_process', 'react', 'react-dom'}
    
    filtered_packages = []
    for pkg in packages:
        # Skip relative imports
        if pkg.startswith('.') or pkg.startswith('/') or pkg.startswith('@/'):
            continue
        
        # Skip built-ins
        if pkg in builtins:
            continue
        
        # Extract package name (handle scoped packages)
        if pkg.startswith('@'):
            package_name = '/'.join(pkg.split('/')[:2])
        else:
            package_name = pkg.split('/')[0]
        
        if package_name not in filtered_packages:
            filtered_packages.append(package_name)
    
    return filtered_packages


def build_file_manifest(files: Dict[str, str]) -> Dict:
    """Build a comprehensive file manifest with all metadata"""
    manifest = {
        'files': {},
        'routes': [],
        'component_tree': {},
        'entry_point': '',
        'style_files': [],
        'timestamp': 0
    }
    
    # Process each file
    for relative_path, content in files.items():
        full_path = f"/{relative_path}"
        
        # Create base file info
        file_info = {
            'content': content,
            'path': full_path,
            'relative_path': relative_path,
            'type': 'utility'
        }
        
        # Parse JavaScript/JSX files
        if re.match(r'.*\.(jsx?|tsx?)$', relative_path):
            parse_result = parse_javascript_file(content, full_path)
            file_info.update(parse_result)
            
            # Identify entry point
            if relative_path in ['src/main.jsx', 'src/index.jsx', 'src/main.tsx', 'src/index.tsx']:
                manifest['entry_point'] = full_path
            
            # Identify App.jsx
            if relative_path in ['src/App.jsx', 'App.jsx', 'src/App.tsx', 'App.tsx']:
                manifest['entry_point'] = manifest['entry_point'] or full_path
        
        # Track style files
        if relative_path.endswith('.css'):
            manifest['style_files'].append(full_path)
            file_info['type'] = 'style'
        
        manifest['files'][full_path] = file_info
    
    return manifest
