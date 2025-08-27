/**
 * Google Analytics 4 (GA4) Integration for Excel-to-PDF Converter
 * 
 * This module provides comprehensive tracking for the conversion funnel:
 * Upload → Process → Generate → Download
 */

// TypeScript declarations for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date | { [key: string]: any },
      config?: { [key: string]: any }
    ) => void;
    dataLayer: any[];
  }
}

// Environment configuration
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Check if GA4 is properly configured
 */
export const isGAConfigured = (): boolean => {
  return !!(GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag);
};

/**
 * Initialize Google Analytics 4
 * Should be called once when the app loads
 */
export const initGA = (): void => {
  if (!GA_MEASUREMENT_ID) {
    if (isDevelopment) {
      console.warn('[GA4] Measurement ID not found. Set NEXT_PUBLIC_GA_MEASUREMENT_ID in your environment variables.');
    }
    return;
  }

  if (typeof window === 'undefined') return;

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: 'Excel to PDF Converter',
    debug_mode: isDevelopment,
    send_page_view: true
  });

  if (isDevelopment) {
    console.log('[GA4] Analytics initialized with ID:', GA_MEASUREMENT_ID);
  }
};

/**
 * Generic event tracking function
 */
const trackEvent = (eventName: string, parameters: Record<string, any> = {}): void => {
  if (!isGAConfigured()) {
    if (isDevelopment) {
      console.log('[GA4] Event (not sent):', eventName, parameters);
    }
    return;
  }

  try {
    window.gtag('event', eventName, {
      ...parameters,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      page_location: window.location.href,
      page_title: document.title
    });

    if (isDevelopment) {
      console.log('[GA4] Event sent:', eventName, parameters);
    }
  } catch (error) {
    console.error('[GA4] Error tracking event:', error);
  }
};

// =============================================
// 1. FILE UPLOAD TRACKING
// =============================================

export interface FileUploadEventData {
  file_name: string;
  file_size_mb: number;
  file_type: string;
  upload_method: 'drag_drop' | 'click_select';
  success: boolean;
  error_message?: string;
}

/**
 * Track file upload start
 */
export const trackFileUploadStart = (data: Omit<FileUploadEventData, 'success'>): void => {
  trackEvent('file_upload_start', {
    event_category: 'conversion_funnel',
    event_label: 'upload_step',
    funnel_step: 1,
    funnel_step_name: 'file_upload',
    file_name: data.file_name,
    file_size_mb: data.file_size_mb,
    file_type: data.file_type,
    upload_method: data.upload_method,
    custom_file_size_category: getFileSizeCategory(data.file_size_mb)
  });
};

/**
 * Track file upload completion (success or failure)
 */
export const trackFileUploadComplete = (data: FileUploadEventData): void => {
  const eventName = data.success ? 'file_upload_success' : 'file_upload_failure';
  
  trackEvent(eventName, {
    event_category: 'conversion_funnel',
    event_label: 'upload_step',
    funnel_step: 1,
    funnel_step_name: 'file_upload',
    file_name: data.file_name,
    file_size_mb: data.file_size_mb,
    file_type: data.file_type,
    upload_method: data.upload_method,
    success: data.success,
    error_message: data.error_message,
    custom_file_size_category: getFileSizeCategory(data.file_size_mb)
  });
};

// =============================================
// 2. AI PROCESSING TRACKING
// =============================================

export interface AIProcessingEventData {
  file_name: string;
  processing_type: 'comprehensive_analysis' | 'executive_summary' | 'recommendations' | 'chart_analysis';
  duration_seconds?: number;
  success: boolean;
  error_message?: string;
  data_rows?: number;
  data_columns?: number;
}

/**
 * Track AI processing start
 */
export const trackAIProcessingStart = (data: Omit<AIProcessingEventData, 'success' | 'duration_seconds'>): void => {
  trackEvent('ai_processing_start', {
    event_category: 'conversion_funnel',
    event_label: 'ai_processing_step',
    funnel_step: 2,
    funnel_step_name: 'ai_processing',
    file_name: data.file_name,
    processing_type: data.processing_type,
    data_rows: data.data_rows,
    data_columns: data.data_columns,
    custom_data_complexity: getDataComplexity(data.data_rows, data.data_columns)
  });
};

/**
 * Track AI processing completion
 */
export const trackAIProcessingComplete = (data: AIProcessingEventData): void => {
  const eventName = data.success ? 'ai_processing_success' : 'ai_processing_failure';
  
  trackEvent(eventName, {
    event_category: 'conversion_funnel',
    event_label: 'ai_processing_step',
    funnel_step: 2,
    funnel_step_name: 'ai_processing',
    file_name: data.file_name,
    processing_type: data.processing_type,
    duration_seconds: data.duration_seconds,
    success: data.success,
    error_message: data.error_message,
    data_rows: data.data_rows,
    data_columns: data.data_columns,
    custom_data_complexity: getDataComplexity(data.data_rows, data.data_columns),
    custom_processing_speed: getProcessingSpeed(data.duration_seconds, data.data_rows)
  });
};

// =============================================
// 3. CHART GENERATION TRACKING
// =============================================

export interface ChartGenerationEventData {
  file_name: string;
  chart_types: string[];
  chart_count: number;
  success: boolean;
  failed_charts?: string[];
  error_message?: string;
  generation_time_seconds?: number;
}

/**
 * Track chart generation start
 */
export const trackChartGenerationStart = (data: Omit<ChartGenerationEventData, 'success' | 'generation_time_seconds'>): void => {
  trackEvent('chart_generation_start', {
    event_category: 'conversion_funnel',
    event_label: 'chart_generation_step',
    funnel_step: 3,
    funnel_step_name: 'chart_generation',
    file_name: data.file_name,
    chart_types: data.chart_types.join(','),
    chart_count: data.chart_count,
    failed_charts: data.failed_charts?.join(','),
    custom_chart_complexity: getChartComplexity(data.chart_count, data.chart_types)
  });
};

/**
 * Track chart generation completion
 */
export const trackChartGenerationComplete = (data: ChartGenerationEventData): void => {
  const eventName = data.success ? 'chart_generation_success' : 'chart_generation_failure';
  
  trackEvent(eventName, {
    event_category: 'conversion_funnel',
    event_label: 'chart_generation_step',
    funnel_step: 3,
    funnel_step_name: 'chart_generation',
    file_name: data.file_name,
    chart_types: data.chart_types.join(','),
    chart_count: data.chart_count,
    success: data.success,
    failed_charts: data.failed_charts?.join(','),
    error_message: data.error_message,
    generation_time_seconds: data.generation_time_seconds,
    custom_chart_complexity: getChartComplexity(data.chart_count, data.chart_types)
  });

  // Track individual chart types
  data.chart_types.forEach(chartType => {
    trackEvent('chart_type_generated', {
      event_category: 'chart_analytics',
      chart_type: chartType,
      file_name: data.file_name,
      success: data.success && !data.failed_charts?.includes(chartType)
    });
  });
};

// =============================================
// 4. PDF CREATION AND DOWNLOAD TRACKING
// =============================================

export interface PDFEventData {
  file_name: string;
  pdf_type: 'ai_analysis_report' | 'data_only';
  includes_charts: boolean;
  chart_count?: number;
  pdf_size_mb?: number;
  creation_time_seconds?: number;
  success: boolean;
  error_message?: string;
}

/**
 * Track PDF creation start
 */
export const trackPDFCreationStart = (data: Omit<PDFEventData, 'success' | 'creation_time_seconds' | 'pdf_size_mb'>): void => {
  trackEvent('pdf_creation_start', {
    event_category: 'conversion_funnel',
    event_label: 'pdf_creation_step',
    funnel_step: 4,
    funnel_step_name: 'pdf_creation',
    file_name: data.file_name,
    pdf_type: data.pdf_type,
    includes_charts: data.includes_charts,
    chart_count: data.chart_count || 0
  });
};

/**
 * Track PDF creation completion
 */
export const trackPDFCreationComplete = (data: PDFEventData): void => {
  const eventName = data.success ? 'pdf_creation_success' : 'pdf_creation_failure';
  
  trackEvent(eventName, {
    event_category: 'conversion_funnel',
    event_label: 'pdf_creation_step',
    funnel_step: 4,
    funnel_step_name: 'pdf_creation',
    file_name: data.file_name,
    pdf_type: data.pdf_type,
    includes_charts: data.includes_charts,
    chart_count: data.chart_count || 0,
    pdf_size_mb: data.pdf_size_mb,
    creation_time_seconds: data.creation_time_seconds,
    success: data.success,
    error_message: data.error_message,
    custom_pdf_complexity: getPDFComplexity(data.pdf_type, data.includes_charts, data.chart_count)
  });
};

/**
 * Track PDF download
 */
export const trackPDFDownload = (data: Omit<PDFEventData, 'creation_time_seconds'>): void => {
  trackEvent('pdf_download', {
    event_category: 'conversion_funnel',
    event_label: 'pdf_download_step',
    funnel_step: 5,
    funnel_step_name: 'pdf_download',
    file_name: data.file_name,
    pdf_type: data.pdf_type,
    includes_charts: data.includes_charts,
    chart_count: data.chart_count || 0,
    pdf_size_mb: data.pdf_size_mb,
    success: data.success,
    error_message: data.error_message,
    custom_pdf_complexity: getPDFComplexity(data.pdf_type, data.includes_charts, data.chart_count)
  });
};

// =============================================
// 5. USER JOURNEY AND DROP-OFF TRACKING
// =============================================

/**
 * Track conversion funnel completion
 */
export const trackConversionComplete = (data: {
  file_name: string;
  total_time_seconds: number;
  pdf_type: string;
  included_charts: boolean;
  chart_count: number;
}): void => {
  trackEvent('conversion_complete', {
    event_category: 'conversion_funnel',
    event_label: 'conversion_complete',
    funnel_step: 5,
    funnel_step_name: 'conversion_complete',
    file_name: data.file_name,
    total_time_seconds: data.total_time_seconds,
    pdf_type: data.pdf_type,
    included_charts: data.included_charts,
    chart_count: data.chart_count,
    custom_conversion_speed: getConversionSpeed(data.total_time_seconds)
  });
};

/**
 * Track user drop-off at specific steps
 */
export const trackDropOff = (step: 'upload' | 'processing' | 'chart_generation' | 'pdf_creation', reason?: string): void => {
  trackEvent('user_drop_off', {
    event_category: 'conversion_funnel',
    event_label: 'drop_off',
    drop_off_step: step,
    drop_off_reason: reason || 'unknown',
    page_location: window.location.href
  });
};

/**
 * Track user engagement events
 */
export const trackUserEngagement = (action: string, details?: Record<string, any>): void => {
  trackEvent('user_engagement', {
    event_category: 'user_interaction',
    engagement_action: action,
    ...details
  });
};

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Categorize file size for analytics
 */
const getFileSizeCategory = (sizeMB: number): string => {
  if (sizeMB < 1) return 'small';
  if (sizeMB < 5) return 'medium';
  if (sizeMB < 20) return 'large';
  return 'very_large';
};

/**
 * Determine data complexity based on rows and columns
 * Note: Row limit is 100, so complexity is relative to this limit
 */
const getDataComplexity = (rows?: number, columns?: number): string => {
  if (!rows || !columns) return 'unknown';
  const cellCount = rows * columns;
  
  // With 100 row limit, complexity is based on total cells
  if (cellCount < 50) return 'simple';     // Very small datasets
  if (cellCount < 200) return 'moderate';  // Small to medium datasets
  if (cellCount < 500) return 'complex';   // Medium to large datasets (within limit)
  return 'very_complex';                   // Large datasets (approaching limit)
};

/**
 * Calculate processing speed category
 * Note: With 100 row limit, processing should be fast
 */
const getProcessingSpeed = (durationSeconds?: number, rows?: number): string => {
  if (!durationSeconds || !rows) return 'unknown';
  const rowsPerSecond = rows / durationSeconds;
  
  // With smaller datasets (max 100 rows), speed thresholds are adjusted
  if (rowsPerSecond > 50) return 'very_fast';  // More than 50 rows/second
  if (rowsPerSecond > 20) return 'fast';       // 20-50 rows/second
  if (rowsPerSecond > 10) return 'moderate';   // 10-20 rows/second
  return 'slow';                               // Less than 10 rows/second
};

/**
 * Determine chart complexity
 */
const getChartComplexity = (chartCount: number, chartTypes: string[]): string => {
  const uniqueTypes = new Set(chartTypes).size;
  if (chartCount <= 2 && uniqueTypes <= 2) return 'simple';
  if (chartCount <= 4 && uniqueTypes <= 3) return 'moderate';
  if (chartCount <= 6 && uniqueTypes <= 4) return 'complex';
  return 'very_complex';
};

/**
 * Determine PDF complexity
 */
const getPDFComplexity = (pdfType: string, includesCharts: boolean, chartCount?: number): string => {
  if (pdfType === 'data_only') return 'simple';
  if (!includesCharts) return 'moderate';
  if ((chartCount || 0) <= 3) return 'complex';
  return 'very_complex';
};

/**
 * Categorize conversion speed
 */
const getConversionSpeed = (totalTimeSeconds: number): string => {
  if (totalTimeSeconds < 30) return 'very_fast';
  if (totalTimeSeconds < 60) return 'fast';
  if (totalTimeSeconds < 120) return 'moderate';
  if (totalTimeSeconds < 300) return 'slow';
  return 'very_slow';
};

// =============================================
// PAGE TRACKING
// =============================================

/**
 * Track page view (for SPA navigation)
 */
export const trackPageView = (pageName: string, additionalData?: Record<string, any>): void => {
  if (!isGAConfigured()) return;

  window.gtag('event', 'page_view', {
    page_title: pageName,
    page_location: window.location.href,
    ...additionalData
  });
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, any>): void => {
  if (!isGAConfigured()) return;

  window.gtag('set', {
    user_properties: properties
  });
};