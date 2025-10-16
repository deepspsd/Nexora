import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  priority?: boolean;
}

const OptimizedImage = ({
  src,
  alt,
  className,
  fallback = '/placeholder.svg',
  priority = false,
  ...props
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>(priority ? src : fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!priority) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
      };
      img.onerror = () => {
        setHasError(true);
        setIsLoading(false);
      };
    } else {
      setIsLoading(false);
    }
  }, [src, priority]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        src={hasError ? fallback : imageSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn(
          'transition-opacity duration-300',
          isLoading && !priority ? 'opacity-0' : 'opacity-100',
          className
        )}
        {...props}
      />
      {isLoading && !priority && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
    </div>
  );
};

export default OptimizedImage;
