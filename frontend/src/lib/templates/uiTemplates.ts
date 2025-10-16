export interface UITemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  tags: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  features: string[];
  prompt: string;
}

export const uiTemplates: UITemplate[] = [
  {
    id: 'modern-saas',
    name: 'Modern SaaS Dashboard',
    description: 'Clean, professional dashboard with sidebar navigation, data visualization, and modern UI components',
    category: 'Dashboard',
    preview: '/templates/modern-saas.png',
    tags: ['dashboard', 'analytics', 'modern', 'professional'],
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
    },
    features: [
      'Responsive sidebar navigation',
      'Interactive charts and graphs',
      'Data tables with sorting/filtering',
      'User profile management',
      'Settings panel',
      'Notification system',
    ],
    prompt: `Create a modern SaaS dashboard with:
- Clean sidebar navigation with icons
- Top navbar with search and user menu
- Dashboard with cards showing key metrics
- Interactive charts using Recharts
- Data table with pagination
- Modern glassmorphism design
- Smooth animations with Framer Motion
- Dark mode support
- Responsive design for mobile/tablet
Use Tailwind CSS with indigo/purple color scheme`,
  },
  {
    id: 'minimal-portfolio',
    name: 'Minimal Portfolio',
    description: 'Elegant, minimalist portfolio with smooth animations and modern typography',
    category: 'Portfolio',
    preview: '/templates/minimal-portfolio.png',
    tags: ['portfolio', 'minimal', 'elegant', 'creative'],
    colors: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#f97316',
    },
    features: [
      'Hero section with animated text',
      'Project showcase grid',
      'About section',
      'Skills display',
      'Contact form',
      'Smooth scroll animations',
    ],
    prompt: `Create a minimal portfolio website with:
- Full-screen hero with animated typography
- Grid layout for project showcase with hover effects
- About section with image and bio
- Skills section with animated progress bars
- Contact form with validation
- Smooth scroll animations using Framer Motion
- Black and white color scheme with orange accents
- Modern typography (Inter font)
- Responsive design
- Intersection observer for scroll animations`,
  },
  {
    id: 'ecommerce-store',
    name: 'E-Commerce Store',
    description: 'Full-featured online store with product listings, cart, and checkout',
    category: 'E-Commerce',
    preview: '/templates/ecommerce.png',
    tags: ['ecommerce', 'shop', 'store', 'products'],
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#f59e0b',
    },
    features: [
      'Product grid with filters',
      'Product detail pages',
      'Shopping cart',
      'Checkout flow',
      'User authentication',
      'Order history',
    ],
    prompt: `Create an e-commerce store with:
- Header with logo, search, cart icon
- Product grid with category filters
- Product cards with images, price, ratings
- Product detail page with image gallery
- Add to cart functionality with animations
- Shopping cart sidebar
- Checkout page with form validation
- User account pages
- Order confirmation
- Green color scheme
- Responsive design
- Loading skeletons
Use Zustand for state management`,
  },
  {
    id: 'landing-page',
    name: 'Startup Landing Page',
    description: 'High-converting landing page with hero, features, pricing, and testimonials',
    category: 'Marketing',
    preview: '/templates/landing-page.png',
    tags: ['landing', 'marketing', 'conversion', 'startup'],
    colors: {
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      accent: '#f97316',
    },
    features: [
      'Hero with CTA',
      'Features section',
      'Pricing tables',
      'Testimonials',
      'FAQ accordion',
      'Newsletter signup',
    ],
    prompt: `Create a high-converting landing page with:
- Hero section with gradient background, headline, CTA buttons
- Features section with icons and descriptions (3 columns)
- How it works section with step-by-step process
- Pricing section with 3 tiers (cards with hover effects)
- Testimonials carousel
- FAQ accordion
- Newsletter signup form
- Footer with links
- Sticky header that changes on scroll
- Smooth scroll to sections
- Blue gradient color scheme
- Animations on scroll
- Fully responsive`,
  },
  {
    id: 'blog-magazine',
    name: 'Blog & Magazine',
    description: 'Content-focused blog with article listings, categories, and reading experience',
    category: 'Content',
    preview: '/templates/blog.png',
    tags: ['blog', 'content', 'magazine', 'articles'],
    colors: {
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#f59e0b',
    },
    features: [
      'Article grid/list view',
      'Category filtering',
      'Article detail page',
      'Author profiles',
      'Related articles',
      'Search functionality',
    ],
    prompt: `Create a blog/magazine website with:
- Header with logo, navigation, search
- Featured article hero section
- Article grid with images, titles, excerpts
- Category filter buttons
- Article detail page with:
  - Cover image
  - Reading time estimate
  - Author info
  - Table of contents
  - Social share buttons
  - Related articles
- Sidebar with popular posts
- Newsletter subscription
- Footer
- Red color scheme
- Typography optimized for reading
- Responsive design
- Dark mode support`,
  },
  {
    id: 'social-app',
    name: 'Social Media App',
    description: 'Social networking interface with feed, profiles, and interactions',
    category: 'Social',
    preview: '/templates/social-app.png',
    tags: ['social', 'feed', 'community', 'networking'],
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#ec4899',
    },
    features: [
      'News feed',
      'Post creation',
      'User profiles',
      'Follow system',
      'Likes and comments',
      'Notifications',
    ],
    prompt: `Create a social media app interface with:
- Three-column layout (sidebar, feed, widgets)
- Left sidebar with navigation
- Center feed with posts:
  - User avatar and name
  - Post content (text/images)
  - Like, comment, share buttons
  - Comment section
- Post creation modal
- Right sidebar with:
  - Trending topics
  - Suggested users
  - Ads space
- User profile page with:
  - Cover photo
  - Profile info
  - Posts grid
  - Followers/following
- Notification dropdown
- Purple/pink gradient theme
- Smooth animations
- Infinite scroll
- Responsive design`,
  },
  {
    id: 'admin-panel',
    name: 'Admin Control Panel',
    description: 'Comprehensive admin panel with user management, analytics, and settings',
    category: 'Admin',
    preview: '/templates/admin-panel.png',
    tags: ['admin', 'management', 'dashboard', 'control'],
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#f97316',
    },
    features: [
      'User management table',
      'Analytics dashboard',
      'Settings pages',
      'Role permissions',
      'Activity logs',
      'System monitoring',
    ],
    prompt: `Create an admin control panel with:
- Collapsible sidebar with sections:
  - Dashboard
  - Users
  - Content
  - Analytics
  - Settings
- Dashboard page with:
  - KPI cards (users, revenue, growth)
  - Line/bar charts
  - Recent activity table
  - Quick actions
- Users page with:
  - Data table (sortable, filterable)
  - Search bar
  - Add/edit user modal
  - Bulk actions
  - Pagination
- Analytics page with detailed charts
- Settings page with tabs
- Profile dropdown menu
- Breadcrumb navigation
- Cyan color scheme
- Data visualization with Recharts
- Form validation
- Loading states
- Responsive design`,
  },
  {
    id: 'crypto-dashboard',
    name: 'Crypto Trading Dashboard',
    description: 'Real-time crypto dashboard with charts, portfolio, and market data',
    category: 'Finance',
    preview: '/templates/crypto-dashboard.png',
    tags: ['crypto', 'trading', 'finance', 'charts'],
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#ef4444',
    },
    features: [
      'Real-time price charts',
      'Portfolio overview',
      'Market data tables',
      'Trading interface',
      'Watchlist',
      'Transaction history',
    ],
    prompt: `Create a crypto trading dashboard with:
- Top navbar with logo, search, notifications
- Main chart area with:
  - Candlestick/line chart
  - Timeframe selector (1H, 4H, 1D, 1W)
  - Technical indicators
- Left sidebar with:
  - Portfolio value
  - Asset list with prices
  - Watchlist
- Right panel with:
  - Order book
  - Recent trades
  - Buy/sell form
- Market overview cards
- Transaction history table
- Dark theme optimized for trading
- Green/red for gains/losses
- Real-time updates simulation
- Responsive design
- Animated numbers
Use Recharts for charts`,
  },
];

export const getTemplatesByCategory = (category: string) => {
  return uiTemplates.filter((template) => template.category === category);
};

export const getTemplateById = (id: string) => {
  return uiTemplates.find((template) => template.id === id);
};

export const getAllCategories = () => {
  return [...new Set(uiTemplates.map((template) => template.category))];
};
