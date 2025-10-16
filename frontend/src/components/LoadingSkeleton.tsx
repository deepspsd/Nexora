import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  lines?: number;
  animation?: 'pulse' | 'wave';
}

const LoadingSkeleton = ({
  className,
  variant = 'rectangular',
  lines = 1,
  animation = 'pulse',
}: LoadingSkeletonProps) => {
  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-700',
    animation === 'pulse' && 'animate-pulse',
    animation === 'wave' && 'animate-shimmer'
  );

  if (variant === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              'h-4 rounded',
              i === lines - 1 && lines > 1 && 'w-3/4',
              className
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div
        className={cn(baseClasses, 'rounded-full', className)}
        style={{ aspectRatio: '1' }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('border border-gray-200 dark:border-gray-700 rounded-lg p-4', className)}>
        <div className="flex items-center space-x-4 mb-4">
          <div className={cn(baseClasses, 'w-12 h-12 rounded-full')} />
          <div className="flex-1 space-y-2">
            <div className={cn(baseClasses, 'h-4 rounded w-3/4')} />
            <div className={cn(baseClasses, 'h-3 rounded w-1/2')} />
          </div>
        </div>
        <div className="space-y-2">
          <div className={cn(baseClasses, 'h-3 rounded')} />
          <div className={cn(baseClasses, 'h-3 rounded')} />
          <div className={cn(baseClasses, 'h-3 rounded w-5/6')} />
        </div>
      </div>
    );
  }

  return <div className={cn(baseClasses, 'rounded', className)} />;
};

export default LoadingSkeleton;
