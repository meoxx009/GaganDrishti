/**
 * Image Optimization & Lazy Loading Types (FINAL_003)
 * Provides typings for responsive images, Cloudinary/CDN transformations,
 * automated compression jobs, gallery pagination, and storage telemetry.
 */

export interface ResponsiveImageUrls {
  original: string;
  thumbnail: string; // w_200,h_200,c_fill (Square thumbnail for lists/tables)
  mobile: string; // w_400,h_300,q_60,f_auto (40 KB)
  tablet: string; // w_800,h_600,q_70,f_auto (80 KB)
  desktop: string; // w_1200,h_900,q_80,f_auto (150 KB)
}

export interface ImageUploadValidationResult {
  is_valid: boolean;
  error_message?: string;
  error_message_hi?: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
}

export interface ImageOptimizationOptions {
  maxWidth?: number; // Default 2048
  maxHeight?: number; // Default 2048
  maxSizeBytes?: number; // Default 1,000,000 (1 MB)
  targetSizeBytes?: number; // Default 500,000 (500 KB)
  quality?: number; // Default 0.80
  format?: "webp" | "jpeg" | "png";
}

export interface GalleryPhotoItem {
  feedback_id: number;
  farmer_name: string;
  village_name: string;
  district: string;
  crop_name: string;
  crop_stage: string;
  timestamp: string;
  photo_url: string;
  thumbnail_url: string;
  file_size_bytes: number;
  file_size_formatted: string;
  image_optimized: boolean;
  aspect_ratio: string;
}

export interface ImagePerformanceMetrics {
  average_file_size_kb: number; // Target < 500 KB
  total_photo_storage_mb: number; // Target < 1,000 MB (1 GB)
  total_photos_count: number;
  optimized_photos_count: number;
  unoptimized_photos_count: number;
  bandwidth_saved_pct: number; // ~70%
  average_load_time_seconds: number; // < 2.0s
  active_alerts: Array<{
    severity: "warning" | "critical" | "info";
    title: string;
    message: string;
    action_required: string;
  }>;
}

export interface ImageOptimizationLog {
  log_id: number;
  timestamp: string;
  job_name: "OPTIMIZE_FARMER_PHOTOS" | "CLEANUP_OLD_PHOTOS" | "CLIENT_COMPRESSION";
  photos_processed: number;
  storage_freed_kb: number;
  status: "SUCCESS" | "FAILED";
  details: string;
}

export interface PaginatedGalleryResponse {
  current_page: number;
  page_size: number;
  total_photos: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  photos: GalleryPhotoItem[];
}
