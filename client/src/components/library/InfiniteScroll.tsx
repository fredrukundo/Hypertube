"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export default function InfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
}: InfiniteScrollProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "200px", // Start loading 200px before reaching the bottom
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, onLoadMore]);

  return (
    <div ref={ref} className="flex justify-center py-8">
      {isLoading && <LoadingSpinner size="md" text="Loading more movies..." />}
      {!hasMore && !isLoading && (
        <p className="text-muted-foreground text-sm font-medium">
          You&apos;ve reached the end 🎬
        </p>
      )}
    </div>
  );
}