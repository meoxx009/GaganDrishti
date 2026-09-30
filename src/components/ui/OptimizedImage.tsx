"use client";

import React, { useState } from "react";
import { getOptimizedImageUrls } from "@/lib/images/imageOptimizationEngine";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  useResponsive?: boolean;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  aspectRatio = "4/3",
  useResponsive = true,
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const responsive = getOptimizedImageUrls(src);

  if (hasError || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-mono p-4 rounded-xl ${className}`}
        style={{ aspectRatio }}
      >
        <span>📷 Image Unavailable</span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 dark:bg-slate-900 ${className}`}
      style={{ aspectRatio }}
    >
      {/* Skeleton Loading Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-800/80" />
      )}

      {useResponsive ? (
        <picture>
          {/* Mobile screen: max-width 640px -> 400px width image */}
          <source media="(max-width: 640px)" srcSet={responsive.mobile} />
          {/* Tablet screen: max-width 1024px -> 800px width image */}
          <source media="(max-width: 1024px)" srcSet={responsive.tablet} />
          {/* Desktop screen: > 1024px -> 1200px width image */}
          <img
            src={responsive.desktop || responsive.original}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </picture>
      ) : (
        <img
          src={responsive.thumbnail || responsive.original}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
};
