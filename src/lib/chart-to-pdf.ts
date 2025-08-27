import html2canvas from 'html2canvas';
import { ProcessedChartData } from './chart-utils';

export interface ChartImageData {
  dataURL: string;
  width: number;
  height: number;
  title: string;
  description: string;
  chartType: string;
}

/**
 * Convert chart DOM elements to images for PDF inclusion
 */
export async function chartsToImages(
  chartRefs: (HTMLDivElement | null)[],
  chartsData: ProcessedChartData[]
): Promise<ChartImageData[]> {
  const chartImages: ChartImageData[] = [];

  for (let i = 0; i < chartRefs.length; i++) {
    const chartRef = chartRefs[i];
    const chartData = chartsData[i];

    if (!chartRef || !chartData) {
      console.warn(`Chart ${i}: Missing chart reference or data`);
      continue;
    }

    try {
      // Find the chart container (the recharts wrapper)
      const chartContainer = chartRef.querySelector('.recharts-wrapper') || 
                            chartRef.querySelector('svg') || 
                            chartRef;
      
      if (!chartContainer) {
        console.warn(`Chart ${i}: Chart container not found`);
        continue;
      }

      console.log(`Chart ${i}: Attempting to capture chart '${chartData.config.title}'`);

      // Generate canvas from the chart element
      const canvas = await html2canvas(chartContainer as HTMLElement, {
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      // Validate that we actually captured something
      if (canvas.width === 0 || canvas.height === 0) {
        console.warn(`Chart ${i}: Captured canvas has zero dimensions`);
        continue;
      }
      
      chartImages.push({
        dataURL,
        width: canvas.width,
        height: canvas.height,
        title: chartData.config.title,
        description: chartData.config.description,
        chartType: chartData.config.type,
      });

      console.log(`Chart ${i}: Successfully captured (${canvas.width}x${canvas.height})`);

      // Small delay between captures to avoid issues
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Chart ${i}: Error capturing chart:`, error);
      // Continue with other charts even if one fails
    }
  }

  console.log(`Total charts captured: ${chartImages.length} out of ${chartRefs.length}`);
  return chartImages;
}

/**
 * Convert chart images to pdfMake format
 */
export function chartImagesToPdfMake(chartImages: ChartImageData[]) {
  const pdfContent: any[] = [];

  chartImages.forEach((chart, index) => {
    // Add page break before each chart except the first
    if (index > 0) {
      pdfContent.push({ text: '', pageBreak: 'before' });
    }

    // Chart title
    pdfContent.push({
      text: chart.title,
      style: 'chartTitle',
      margin: [0, 20, 0, 10],
    });

    // Chart description
    if (chart.description) {
      pdfContent.push({
        text: chart.description,
        style: 'chartDescription',
        margin: [0, 0, 0, 15],
      });
    }

    // Chart image
    pdfContent.push({
      image: chart.dataURL,
      width: 500, // Fixed width for PDF
      alignment: 'center',
      margin: [0, 0, 0, 20],
    });

    // Chart metadata
    pdfContent.push({
      text: `Chart Type: ${chart.chartType.toUpperCase()}`,
      style: 'chartMeta',
      alignment: 'center',
      margin: [0, 0, 0, 10],
    });
  });

  return pdfContent;
}

/**
 * Enhanced function to capture charts with retry mechanism
 */
export async function captureChartsWithRetry(
  chartRefs: (HTMLDivElement | null)[],
  chartsData: ProcessedChartData[],
  maxRetries: number = 5
): Promise<ChartImageData[]> {
  let attempt = 0;
  let lastError: Error | null = null;

  console.log(`Starting chart capture: ${chartsData.length} charts to capture`);

  while (attempt < maxRetries) {
    try {
      // Wait for charts to be fully rendered
      const waitTime = 1500 + (attempt * 500);
      console.log(`Attempt ${attempt + 1}: Waiting ${waitTime}ms for charts to render`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      const images = await chartsToImages(chartRefs, chartsData);
      
      // Validate that we captured some charts (allow partial success)
      if (images.length > 0) {
        console.log(`Chart capture successful: ${images.length} charts captured`);
        return images;
      }
      
      throw new Error(`No charts captured on attempt ${attempt + 1}`);
    } catch (error) {
      lastError = error as Error;
      attempt++;
      console.warn(`Chart capture attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        console.log(`Retrying chart capture...`);
      }
    }
  }

  console.error('Failed to capture charts after all retries:', lastError);
  return [];
}

/**
 * Prepare chart section for PDF with proper formatting
 */
export function createChartsPdfSection(chartImages: ChartImageData[]) {
  if (chartImages.length === 0) {
    return [];
  }

  const content = [
    { text: 'Data Visualizations', style: 'sectionHeader', pageBreak: 'before' },
    { 
      text: `The following charts were automatically generated based on AI analysis of your data. These visualizations highlight key patterns, trends, and insights found in the dataset.`,
      style: 'sectionIntro',
      margin: [0, 0, 0, 20]
    },
    ...chartImagesToPdfMake(chartImages)
  ];

  return content;
}

/**
 * Add chart-specific styles to PDF document definition
 */
export function getChartPdfStyles() {
  return {
    chartTitle: {
      fontSize: 16,
      bold: true,
      color: '#2563eb',
      alignment: 'center' as const,
    },
    chartDescription: {
      fontSize: 12,
      italics: true,
      color: '#6b7280',
      alignment: 'center' as const,
    },
    chartMeta: {
      fontSize: 10,
      color: '#9ca3af',
    },
    sectionIntro: {
      fontSize: 11,
      color: '#4b5563',
      lineHeight: 1.4,
    },
  };
}