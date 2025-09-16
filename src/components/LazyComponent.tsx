import { memo, lazy, Suspense } from "react";

// Lazy loading wrapper component for performance optimization
const LazyComponent = memo(({ 
  importFunc, 
  fallback = <div className="animate-pulse bg-muted h-32 rounded-lg" />,
  ...props 
}: {
  importFunc: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  [key: string]: any;
}) => {
  const Component = lazy(importFunc);
  
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
});

LazyComponent.displayName = "LazyComponent";

export default LazyComponent;