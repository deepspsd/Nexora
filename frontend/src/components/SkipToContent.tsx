import { cn } from '@/lib/utils';

const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "bg-orange-500 text-white px-4 py-2 rounded-lg font-medium",
        "focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"
      )}
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;
