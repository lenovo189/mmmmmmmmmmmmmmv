export interface ChartData {
  [key: string]: any;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'combo' | 'histogram' | 'heatmap' | 'waterfall' | 'funnel';
  title: string;
  description: string;
  xAxis: string;
  yAxis: string;
  dataKey: string;
  secondaryDataKey?: string;
  groupBy?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
  chartVariant?: 'stacked' | 'grouped' | 'normalized';
  priority: number;
  analyticalValue?: 'High' | 'Medium' | 'Low';
}

export interface ProcessedChartData {
  config: ChartConfig;
  data: ChartData[];
  colors: string[];
  metadata: {
    totalDataPoints: number;
    dataRange: { min: number; max: number } | null;
    categories: string[] | null;
  };
}

/**
 * Transform Excel rows into chart-ready data based on AI recommendations
 */
export function transformDataForChart(
  rows: any[][],
  chartConfig: ChartConfig,
  hasHeaders: boolean = true
): ProcessedChartData | null {
  if (!rows || rows.length === 0) return null;

  try {
    const headers = hasHeaders ? rows[0] : rows[0].map((_, i) => `Column${i + 1}`);
    const dataRows = hasHeaders ? rows.slice(1) : rows;

    // Validate chart configuration
    if (!chartConfig) {
      console.error('Chart configuration is undefined');
      return null;
    }

    // Ensure chartConfig has all required properties with defaults
    const validatedConfig: ChartConfig = {
      type: chartConfig.type || 'bar',
      title: chartConfig.title || 'Untitled Chart',
      description: chartConfig.description || '',
      xAxis: chartConfig.xAxis || (headers[0] ? headers[0].toString() : '0'),
      yAxis: chartConfig.yAxis || (headers[1] ? headers[1].toString() : '1'),
      dataKey: chartConfig.dataKey || (headers[1] ? headers[1].toString() : '1'),
      secondaryDataKey: chartConfig.secondaryDataKey,
      groupBy: chartConfig.groupBy,
      aggregation: chartConfig.aggregation || 'sum',
      chartVariant: chartConfig.chartVariant,
      priority: chartConfig.priority || 1,
      analyticalValue: chartConfig.analyticalValue || 'Medium'
    };

    // Validate required fields after applying defaults
    if (!validatedConfig.type || !validatedConfig.title || !validatedConfig.xAxis) {
      console.error('Chart configuration missing required fields after validation:', {
        original: chartConfig,
        validated: validatedConfig,
        headers: headers,
        availableColumns: headers.length
      });
      return null;
    }

    // For pie charts, dataKey is required instead of yAxis
    if (validatedConfig.type === 'pie' && !validatedConfig.dataKey) {
      console.error('Pie chart requires dataKey field, applying default');
      validatedConfig.dataKey = validatedConfig.yAxis || (headers[1] ? headers[1].toString() : '1');
    }

    // For non-pie charts, yAxis or dataKey is required
    if (validatedConfig.type !== 'pie' && validatedConfig.type !== 'histogram' && 
        !validatedConfig.yAxis && !validatedConfig.dataKey) {
      console.error('Chart requires yAxis or dataKey field for type:', validatedConfig.type);
      // Apply default value
      validatedConfig.yAxis = headers[1] ? headers[1].toString() : '1';
      validatedConfig.dataKey = validatedConfig.yAxis;
    }

    // Use the validated config for the rest of the function
    chartConfig = validatedConfig;

    console.log('Chart config:', {
      type: chartConfig.type,
      xAxis: chartConfig.xAxis,
      yAxis: chartConfig.yAxis,
      dataKey: chartConfig.dataKey,
      title: chartConfig.title
    });
    console.log('Headers:', headers);

    // Find column indices
    const xAxisIndex = findColumnIndex(headers, chartConfig.xAxis);
    const yAxisIndex = findColumnIndex(headers, chartConfig.yAxis);
    const dataKeyIndex = findColumnIndex(headers, chartConfig.dataKey);

    console.log('Column indices:', {
      xAxisIndex,
      yAxisIndex,
      dataKeyIndex,
      xAxis: chartConfig.xAxis,
      yAxis: chartConfig.yAxis,
      dataKey: chartConfig.dataKey
    });

    // For charts that need xAxis, ensure we have a valid index
    if (xAxisIndex < 0 || xAxisIndex >= headers.length) {
      console.warn('Invalid xAxis index, using column 0 as fallback');
      chartConfig.xAxis = headers[0] ? headers[0].toString() : '0';
    }

    // For charts that need yAxis/dataKey, ensure we have at least one valid column
    const hasValidDataColumn = (
      (yAxisIndex >= 0 && yAxisIndex < headers.length) || 
      (dataKeyIndex >= 0 && dataKeyIndex < headers.length)
    );
    
    if (!hasValidDataColumn && headers.length > 1) {
      console.warn('No valid data column found, using column 1 as fallback');
      if (!chartConfig.yAxis && !chartConfig.dataKey) {
        chartConfig.dataKey = headers[1] ? headers[1].toString() : '1';
      }
    }

    // Final validation - if we still don't have valid columns, skip this chart
    if (headers.length < 2) {
      console.warn('Insufficient columns for chart generation. Need at least 2 columns.');
      return null;
    }

    // Transform data based on chart type
    let transformedData: ChartData[];
    let metadata: ProcessedChartData['metadata'];

    switch (chartConfig.type) {
      case 'pie':
        ({ data: transformedData, metadata } = transformPieData(dataRows, xAxisIndex, dataKeyIndex, headers));
        break;
      case 'bar':
      case 'line':
      case 'area':
        ({ data: transformedData, metadata } = transformXYData(dataRows, xAxisIndex, yAxisIndex, headers, chartConfig));
        break;
      case 'scatter':
        ({ data: transformedData, metadata } = transformScatterData(dataRows, xAxisIndex, yAxisIndex, headers));
        break;
      case 'combo':
        ({ data: transformedData, metadata } = transformComboData(dataRows, xAxisIndex, yAxisIndex, dataKeyIndex, headers, chartConfig));
        break;
      case 'histogram':
        ({ data: transformedData, metadata } = transformHistogramData(dataRows, dataKeyIndex, headers));
        break;
      case 'heatmap':
        ({ data: transformedData, metadata } = transformHeatmapData(dataRows, headers, chartConfig));
        break;
      case 'waterfall':
        ({ data: transformedData, metadata } = transformWaterfallData(dataRows, xAxisIndex, yAxisIndex, headers));
        break;
      case 'funnel':
        ({ data: transformedData, metadata } = transformFunnelData(dataRows, xAxisIndex, yAxisIndex, headers));
        break;
      default:
        return null;
    }

    return {
      config: chartConfig,
      data: transformedData,
      colors: generateColors(transformedData.length),
      metadata
    };
  } catch (error) {
    console.error('Error transforming data for chart:', error);
    return null;
  }
}

/**
 * Find column index by name or number with improved error handling
 */
function findColumnIndex(headers: any[], columnRef: string | number | undefined): number {
  // Handle undefined or null columnRef
  if (columnRef === undefined || columnRef === null) {
    console.warn('Column reference is undefined or null');
    return -1;
  }

  // Handle empty headers array
  if (!headers || headers.length === 0) {
    console.warn('Headers array is empty or undefined');
    return -1;
  }

  // Convert to string for consistent handling
  const columnRefStr = columnRef.toString().trim();
  
  // Handle empty string
  if (!columnRefStr) {
    console.warn('Column reference is empty string');
    return -1;
  }

  // If it's a number, use it directly (with bounds checking)
  if (!isNaN(Number(columnRefStr))) {
    const index = Number(columnRefStr);
    if (index >= 0 && index < headers.length) {
      return index;
    } else {
      console.warn(`Column index ${index} is out of bounds. Available columns: 0-${headers.length - 1}`);
      // Return the closest valid index instead of -1
      return Math.max(0, Math.min(index, headers.length - 1));
    }
  }

  // Find by header name (case insensitive)
  let index = headers.findIndex(header => {
    if (!header) return false;
    const headerStr = header.toString().trim();
    return headerStr.toLowerCase() === columnRefStr.toLowerCase();
  });
  
  // If exact match not found, try partial matching
  if (index === -1) {
    index = headers.findIndex(header => {
      if (!header) return false;
      const headerStr = header.toString().trim().toLowerCase();
      const refStr = columnRefStr.toLowerCase();
      return headerStr.includes(refStr) || refStr.includes(headerStr);
    });
    
    if (index !== -1) {
      console.log(`Using partial match for column '${columnRefStr}' -> '${headers[index]}'`);
    }
  }
  
  if (index === -1) {
    console.warn(`Column '${columnRefStr}' not found in headers:`, headers);
    // Return 0 as fallback instead of -1 to prevent chart generation failure
    return 0;
  }
  
  return index;
}

/**
 * Transform data for pie charts
 */
function transformPieData(
  dataRows: any[][],
  nameIndex: number,
  valueIndex: number,
  headers: any[]
): { data: ChartData[]; metadata: ProcessedChartData['metadata'] } {
  const processedData: ChartData[] = [];
  const categories: string[] = [];
  let totalValue = 0;

  dataRows.forEach((row, index) => {
    const name = row[nameIndex]?.toString().trim();
    const value = parseFloat(row[valueIndex]);

    if (name && !isNaN(value) && value > 0) {
      processedData.push({
        name,
        value,
        id: `pie-${index}`,
      });
      categories.push(name);
      totalValue += value;
    }
  });

  // Calculate percentages
  processedData.forEach(item => {
    item.percentage = ((item.value / totalValue) * 100).toFixed(1);
  });

  return {
    data: processedData,
    metadata: {
      totalDataPoints: processedData.length,
      dataRange: null,
      categories
    }
  };
}

/**
 * Transform data for bar, line, and area charts
 */
function transformXYData(
  dataRows: any[][],
  xIndex: number,
  yIndex: number,
  headers: any[],
  chartConfig?: ChartConfig
): { data: ChartData[]; metadata: ProcessedChartData['metadata'] } {
  const processedData: ChartData[] = [];
  const categories: string[] = [];
  let min = Infinity;
  let max = -Infinity;

  // Handle data aggregation if specified
  let aggregatedData = dataRows;
  if (chartConfig?.aggregation && chartConfig?.groupBy) {
    try {
      aggregatedData = aggregateData(dataRows, xIndex, yIndex, chartConfig.aggregation, headers, chartConfig.groupBy);
      console.log(`Applied ${chartConfig.aggregation} aggregation by ${chartConfig.groupBy}`);
    } catch (error) {
      console.warn('Failed to aggregate data, using original data:', error);
      aggregatedData = dataRows;
    }
  }

  aggregatedData.forEach((row, index) => {
    const xValue = row[xIndex];
    const yValue = parseFloat(row[yIndex]);

    if (xValue !== null && xValue !== undefined && !isNaN(yValue)) {
      const xStr = xValue.toString().trim();
      const dataPoint: ChartData = {
        x: xStr,
        y: yValue,
        name: xStr,
        value: yValue,
        id: `xy-${index}`,
      };

      // Add secondary data if it's a combo chart
      if (chartConfig?.secondaryDataKey && chartConfig?.type === 'combo') {
        const secondaryIndex = findColumnIndex(headers, chartConfig.secondaryDataKey);
        if (secondaryIndex !== -1) {
          const secondaryValue = parseFloat(row[secondaryIndex]);
          if (!isNaN(secondaryValue)) {
            dataPoint.secondary = secondaryValue;
          }
        }
      }

      processedData.push(dataPoint);
      categories.push(xStr);
      min = Math.min(min, yValue);
      max = Math.max(max, yValue);
    }
  });

  return {
    data: processedData,
    metadata: {
      totalDataPoints: processedData.length,
      dataRange: processedData.length > 0 ? { min, max } : null,
      categories
    }
  };
}

/**
 * Transform data for scatter plots
 */
function transformScatterData(
  dataRows: any[][],
  xIndex: number,
  yIndex: number,
  headers: any[]
): { data: ChartData[]; metadata: ProcessedChartData['metadata'] } {
  const processedData: ChartData[] = [];
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  dataRows.forEach((row, index) => {
    const xValue = parseFloat(row[xIndex]);
    const yValue = parseFloat(row[yIndex]);

    if (!isNaN(xValue) && !isNaN(yValue)) {
      processedData.push({
        x: xValue,
        y: yValue,
        id: `scatter-${index}`,
      });
      minX = Math.min(minX, xValue);
      maxX = Math.max(maxX, xValue);
      minY = Math.min(minY, yValue);
      maxY = Math.max(maxY, yValue);
    }
  });

  return {
    data: processedData,
    metadata: {
      totalDataPoints: processedData.length,
      dataRange: processedData.length > 0 ? 
        { min: Math.min(minX, minY), max: Math.max(maxX, maxY) } : null,
      categories: null
    }
  };
}

/**
 * Transform data for combo charts (multiple data series)
 */
function transformComboData(
  dataRows: any[][],
  xIndex: number,
  yIndex: number,
  dataKeyIndex: number,
  headers: any[],
  chartConfig: ChartConfig
): { data: ChartData[]; metadata: ProcessedChartData['metadata'] } {
  const processedData: ChartData[] = [];
  const categories: string[] = [];
  let min = Infinity;
  let max = -Infinity;

  dataRows.forEach((row, index) => {
    const xValue = row[xIndex];
    const primaryValue = parseFloat(row[yIndex]);
    const secondaryValue = chartConfig.secondaryDataKey ? 
      parseFloat(row[findColumnIndex(headers, chartConfig.secondaryDataKey)]) : null;

    if (xValue !== null && xValue !== undefined && !isNaN(primaryValue)) {
      const xStr = xValue.toString().trim();
      const dataPoint: ChartData = {
        x: xStr,
        y: primaryValue,
        name: xStr,
        value: primaryValue,
        id: `combo-${index}`,
      };

      if (secondaryValue !== null && !isNaN(secondaryValue)) {
        dataPoint.secondary = secondaryValue;
        min = Math.min(min, primaryValue, secondaryValue);
        max = Math.max(max, primaryValue, secondaryValue);
      } else {
        min = Math.min(min, primaryValue);
        max = Math.max(max, primaryValue);
      }

      processedData.push(dataPoint);
      categories.push(xStr);
    }
  });

  return {
    data: processedData,
    metadata: {
      totalDataPoints: processedData.length,
      dataRange: processedData.length > 0 ? { min, max } : null,
      categories
    }
  };
}

/**
 * Generate distinct colors for charts
 */
export function generateColors(count: number): string[] {
  const baseColors = [
    '#e76f51', '#2a9d8f', '#f4a261', '#e9c46a', '#264653',
    '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#f97316',
    '#06b6d4', '#8b5a2b', '#84cc16', '#ec4899', '#6366f1'
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // Generate additional colors if needed using a simple algorithm
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.5) % 360; // Golden ratio for color distribution
    const saturation = 60 + (i % 3) * 15; // Vary saturation
    const lightness = 45 + (i % 4) * 10; // Vary lightness
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
}

/**
 * Transform data for histogram charts
 */
function transformHistogramData(
  dataRows: any[][],
  dataIndex: number,
  headers: any[]
): { data: ChartData[]; metadata: ProcessedChartData['metadata'] } {
  const values = dataRows
    .map(row => parseFloat(row[dataIndex]))
    .filter(val => !isNaN(val))
    .sort((a, b) => a - b);

  if (values.length === 0) {
    return {
      data: [],
      metadata: { totalDataPoints: 0, dataRange: null, categories: null }
    };
  }

  // Create bins for histogram
  const binCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
  const min = values[0];
  const max = values[values.length - 1];
  const binWidth = (max - min) / binCount;

  const bins: ChartData[] = [];
  for (let i = 0; i < binCount; i++) {
    const binStart = min + (i * binWidth);
    const binEnd = binStart + binWidth;
    const count = values.filter(val => val >= binStart && (i === binCount - 1 ? val <= binEnd : val < binEnd)).length;
    
    bins.push({
      x: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
      y: count,
      name: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
      value: count,
      id: `hist-${i}`,
    });
  }

  return {
    data: bins,
    metadata: {
      totalDataPoints: bins.length,
      dataRange: { min: 0, max: Math.max(...bins.map(b => b.y)) },
      categories: bins.map(b => b.name)
    }
  };
}

/**
 * Transform data for heatmap charts
 */
function transformHeatmapData(
  dataRows: any[][],
  headers: any[],
  chartConfig: ChartConfig
): { data: ChartData[]; metadata: ProcessedChartData['metadata'] } {
  // For heatmap, we'll create a correlation matrix if we have numeric columns
  const numericColumns = headers.map((_, index) => {
    const values = dataRows.slice(0, 10).map(row => parseFloat(row[index]));
    return values.every(val => !isNaN(val)) ? index : -1;
  }).filter(index => index !== -1);

  if (numericColumns.length < 2) {
    return {
      data: [],
      metadata: { totalDataPoints: 0, dataRange: null, categories: null }
    };
  }

  const heatmapData: ChartData[] = [];
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = 0; j < numericColumns.length; j++) {
      const correlation = calculateCorrelation(dataRows, numericColumns[i], numericColumns[j]);
      heatmapData.push({
        x: headers[numericColumns[i]]?.toString() || `Col${numericColumns[i]}`,
        y: headers[numericColumns[j]]?.toString() || `Col${numericColumns[j]}`,
        value: correlation,
        name: `${headers[numericColumns[i]]} vs ${headers[numericColumns[j]]}`,
        id: `heat-${i}-${j}`,
      });
      min = Math.min(min, correlation);
      max = Math.max(max, correlation);
    }
  }

  return {
    data: heatmapData,
    metadata: {
      totalDataPoints: heatmapData.length,
      dataRange: { min, max },
      categories: numericColumns.map(i => headers[i]?.toString() || `Col${i}`)
    }
  };
}

/**
 * Transform data for waterfall charts
 */
function transformWaterfallData(
  dataRows: any[][],
  xIndex: number,
  yIndex: number,
  headers: any[]
): { data: ChartData[]; metadata: ProcessedChartData['metadata'] } {
  const processedData: ChartData[] = [];
  const categories: string[] = [];
  let runningTotal = 0;
  let min = Infinity;
  let max = -Infinity;

  dataRows.forEach((row, index) => {
    const xValue = row[xIndex];
    const yValue = parseFloat(row[yIndex]);

    if (xValue !== null && xValue !== undefined && !isNaN(yValue)) {
      const xStr = xValue.toString().trim();
      const previousTotal = runningTotal;
      runningTotal += yValue;

      processedData.push({
        x: xStr,
        y: yValue,
        value: yValue,
        cumulative: runningTotal,
        start: previousTotal,
        name: xStr,
        id: `waterfall-${index}`,
      });
      
      categories.push(xStr);
      min = Math.min(min, yValue, runningTotal);
      max = Math.max(max, yValue, runningTotal);
    }
  });

  return {
    data: processedData,
    metadata: {
      totalDataPoints: processedData.length,
      dataRange: processedData.length > 0 ? { min, max } : null,
      categories
    }
  };
}

/**
 * Transform data for funnel charts
 */
function transformFunnelData(
  dataRows: any[][],
  xIndex: number,
  yIndex: number,
  headers: any[]
): { data: ChartData[]; metadata: ProcessedChartData['metadata'] } {
  const processedData: ChartData[] = [];
  const categories: string[] = [];
  let min = Infinity;
  let max = -Infinity;

  dataRows.forEach((row, index) => {
    const xValue = row[xIndex];
    const yValue = parseFloat(row[yIndex]);

    if (xValue !== null && xValue !== undefined && !isNaN(yValue) && yValue > 0) {
      const xStr = xValue.toString().trim();
      processedData.push({
        x: xStr,
        y: yValue,
        name: xStr,
        value: yValue,
        id: `funnel-${index}`,
      });
      categories.push(xStr);
      min = Math.min(min, yValue);
      max = Math.max(max, yValue);
    }
  });

  // Sort by value descending for funnel effect
  processedData.sort((a, b) => b.value - a.value);

  return {
    data: processedData,
    metadata: {
      totalDataPoints: processedData.length,
      dataRange: processedData.length > 0 ? { min, max } : null,
      categories
    }
  };
}

/**
 * Helper function to aggregate data
 */
function aggregateData(
  dataRows: any[][],
  xIndex: number,
  yIndex: number,
  aggregation: string,
  headers: any[],
  groupBy: string | undefined
): any[][] {
  // Validate groupBy parameter
  if (!groupBy) {
    console.warn('groupBy parameter is undefined, returning original data');
    return dataRows;
  }

  const groupIndex = findColumnIndex(headers, groupBy);
  if (groupIndex === -1) {
    console.warn(`Could not find column for groupBy: ${groupBy}`);
    return dataRows;
  }

  const groups: { [key: string]: number[] } = {};
  const groupKeys: { [key: string]: string } = {};

  dataRows.forEach(row => {
    const groupKey = row[groupIndex]?.toString() || 'Unknown';
    const xValue = row[xIndex];
    const yValue = parseFloat(row[yIndex]);

    if (!isNaN(yValue)) {
      if (!groups[groupKey]) {
        groups[groupKey] = [];
        groupKeys[groupKey] = xValue;
      }
      groups[groupKey].push(yValue);
    }
  });

  return Object.entries(groups).map(([groupKey, values]) => {
    let aggregatedValue: number;
    switch (aggregation) {
      case 'sum':
        aggregatedValue = values.reduce((sum, val) => sum + val, 0);
        break;
      case 'avg':
        aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
        break;
      case 'count':
        aggregatedValue = values.length;
        break;
      case 'max':
        aggregatedValue = Math.max(...values);
        break;
      case 'min':
        aggregatedValue = Math.min(...values);
        break;
      default:
        aggregatedValue = values.reduce((sum, val) => sum + val, 0);
    }

    const result: any[] = new Array(Math.max(xIndex, yIndex, groupIndex) + 1);
    result[xIndex] = groupKeys[groupKey];
    result[yIndex] = aggregatedValue;
    result[groupIndex] = groupKey;
    return result;
  });
}

/**
 * Helper function to calculate correlation between two columns
 */
function calculateCorrelation(dataRows: any[][], col1Index: number, col2Index: number): number {
  const values1 = dataRows.map(row => parseFloat(row[col1Index])).filter(val => !isNaN(val));
  const values2 = dataRows.map(row => parseFloat(row[col2Index])).filter(val => !isNaN(val));
  
  if (values1.length !== values2.length || values1.length === 0) return 0;

  const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
  const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;

  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;

  for (let i = 0; i < values1.length; i++) {
    const diff1 = values1[i] - mean1;
    const diff2 = values2[i] - mean2;
    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(denominator1 * denominator2);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Validate chart data quality
 */
export function validateChartData(data: ChartData[]): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!data || data.length === 0) {
    issues.push('No data available for chart');
    return { isValid: false, issues, suggestions };
  }

  if (data.length < 2) {
    issues.push('Insufficient data points for meaningful visualization');
    suggestions.push('Consider collecting more data or combining with other datasets');
  }

  if (data.length > 50) {
    suggestions.push('Consider grouping or filtering data for better readability');
  }

  // Check for missing values
  const missingValues = data.some(item => 
    Object.values(item).some(value => value === null || value === undefined)
  );
  
  if (missingValues) {
    issues.push('Dataset contains missing values');
    suggestions.push('Clean data by removing or interpolating missing values');
  }

  return {
    isValid: issues.length === 0 || issues.every(issue => !issue.includes('No data')),
    issues,
    suggestions
  };
}

/**
 * Get recommended chart dimensions based on data and chart type
 */
export function getChartDimensions(
  chartType: ChartConfig['type'],
  dataLength: number
): { width: number; height: number } {
  const baseWidth = 600;
  const baseHeight = 400;

  switch (chartType) {
    case 'pie':
      return { width: 500, height: 500 }; // Square for pie charts
    case 'bar':
      // Adjust width based on number of bars
      const barWidth = Math.max(baseWidth, dataLength * 30);
      return { width: Math.min(barWidth, 1000), height: baseHeight };
    case 'line':
    case 'area':
      return { width: baseWidth, height: baseHeight };
    case 'scatter':
      return { width: baseWidth, height: baseHeight };
    default:
      return { width: baseWidth, height: baseHeight };
  }
}