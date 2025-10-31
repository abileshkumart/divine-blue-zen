import { useState, useRef, useEffect, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
}

const PullToRefresh = ({ onRefresh, children, disabled = false }: PullToRefreshProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 80; // Distance needed to trigger refresh
  const MAX_PULL = 120; // Maximum pull distance

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    let isScrolledToTop = true;

    const handleScroll = () => {
      isScrolledToTop = container.scrollTop === 0;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!isScrolledToTop || isRefreshing) return;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isScrolledToTop || isRefreshing || touchStartY.current === 0) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY.current;

      if (distance > 0) {
        e.preventDefault();
        setIsPulling(true);
        setPullDistance(Math.min(distance, MAX_PULL));
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            setIsPulling(false);
            setPullDistance(0);
          }, 500);
        }
      } else {
        setIsPulling(false);
        setPullDistance(0);
      }
      touchStartY.current = 0;
    };

    container.addEventListener('scroll', handleScroll);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, isRefreshing, onRefresh, disabled]);

  const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldTrigger = pullDistance >= PULL_THRESHOLD;

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto">
      {/* Pull to Refresh Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-50"
        style={{
          height: `${pullDistance}px`,
          opacity: isPulling ? 1 : 0,
          pointerEvents: 'none'
        }}
      >
        <div
          className={`flex flex-col items-center justify-center transition-all duration-200 ${
            shouldTrigger ? 'scale-110' : 'scale-100'
          }`}
        >
          <div className="relative w-12 h-12">
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-r from-accent to-indigo transition-all duration-200 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              style={{
                opacity: pullProgress * 0.3,
                transform: `rotate(${pullProgress * 360}deg)`
              }}
            ></div>
            <div className="absolute inset-1 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <RefreshCw
                className={`w-6 h-6 transition-all duration-200 ${
                  shouldTrigger ? 'text-accent' : 'text-muted-foreground'
                } ${isRefreshing ? 'animate-spin' : ''}`}
                style={{
                  transform: `rotate(${isRefreshing ? 0 : pullProgress * 180}deg)`
                }}
              />
            </div>
          </div>
          <p
            className="text-xs mt-2 font-medium transition-all duration-200"
            style={{ opacity: pullProgress }}
          >
            {isRefreshing
              ? 'Refreshing...'
              : shouldTrigger
              ? 'Release to refresh'
              : 'Pull to refresh'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: isPulling ? `translateY(${pullDistance * 0.5}px)` : 'translateY(0)',
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
