"use client";

import React, { useRef, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessedChartData } from '@/lib/chart-utils';

interface ChartRendererProps {
  chartData: ProcessedChartData;
  className?: string;
  onChartRender?: (chartRef: HTMLDivElement | null) => void;
}

export default function ChartRenderer({ chartData, className = '', onChartRender }: ChartRendererProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onChartRender && chartRef.current) {
      // Delay to ensure chart is fully rendered
      setTimeout(() => onChartRender(chartRef.current), 500);
    }
  }, [chartData, onChartRender]);

  const { config, data, colors, metadata } = chartData;

  // Ensure colors are in a safe format for html2canvas
  const safeColors = colors.map(color => {
    // Convert any problematic color formats to hex
    if (color.startsWith('hsl') || color.startsWith('oklch') || color.startsWith('lab')) {
      // Fallback to safe hex colors if problematic format detected
      const fallbackColors = ['#e76f51', '#2a9d8f', '#f4a261', '#e9c46a', '#264653'];
      const index = colors.indexOf(color);
      return fallbackColors[index % fallbackColors.length];
    }
    return color;
  });

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
              {config.type === 'pie' && entry.payload.percentage && 
                ` (${entry.payload.percentage}%)`
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      width: 600,
      height: 400,
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill={safeColors[0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={safeColors[0]} 
                strokeWidth={2}
                dot={{ fill: safeColors[0], strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={safeColors[0]} 
                fill={safeColors[0]}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={safeColors[index % safeColors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'combo':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill={safeColors[0]} name="Primary" />
              <Line 
                type="monotone" 
                dataKey="secondary" 
                stroke={safeColors[1]} 
                strokeWidth={2}
                name="Secondary"
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'histogram':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill={safeColors[0]} name="Frequency" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'waterfall':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill={safeColors[0]} name="Change" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'funnel':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill={safeColors[0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'heatmap':
        // For heatmap, we'll use a simple grid representation
        return (
          <ResponsiveContainer width="100%" height={400}>
            <div className="p-4">
              <div className="text-center text-sm text-gray-600 mb-4">
                Correlation Matrix (Heatmap visualization requires custom implementation)
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                {data.slice(0, 9).map((item, index) => (
                  <div 
                    key={index}
                    className="p-2 text-xs text-center rounded"
                    style={{ 
                      backgroundColor: `rgba(${safeColors[0].replace('#', '')}, ${Math.abs(item.value || 0)})` 
                    }}
                  >
                    {item.name}: {(item.value || 0).toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis dataKey="y" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Scatter
                data={data}
                fill={safeColors[0]}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-center text-gray-500 py-8">Unsupported chart type</div>;
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{config.title}</span>
          <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {config.type.toUpperCase()}
          </span>
        </CardTitle>
        {config.description && (
          <CardDescription>{config.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="w-full">
          {renderChart()}
        </div>
        
        {/* Chart metadata */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>📊 {metadata.totalDataPoints} data points</span>
            {metadata.dataRange && (
              <span>📈 Range: {metadata.dataRange.min.toFixed(1)} - {metadata.dataRange.max.toFixed(1)}</span>
            )}
            {metadata.categories && metadata.categories.length > 0 && (
              <span>🏷️ {metadata.categories.length} categories</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChartsContainerProps {
  chartsData: ProcessedChartData[];
  className?: string;
  onChartsRender?: (chartRefs: (HTMLDivElement | null)[]) => void;
}

export function ChartsContainer({ chartsData, className = '', onChartsRender }: ChartsContainerProps) {
  const chartRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (onChartsRender && chartRefs.current.length === chartsData.length) {
      // Wait for all charts to render
      setTimeout(() => onChartsRender(chartRefs.current), 1000);
    }
  }, [chartsData, onChartsRender]);

  const handleChartRender = (index: number) => (chartRef: HTMLDivElement | null) => {
    chartRefs.current[index] = chartRef;
  };

  if (!chartsData || chartsData.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Data Visualizations</h3>
        <span className="text-sm text-gray-500">
          {chartsData.length} chart{chartsData.length !== 1 ? 's' : ''} generated
        </span>
      </div>
      
      {chartsData.map((chartData, index) => (
        <ChartRenderer
          key={`chart-${index}-${chartData.config.type}`}
          chartData={chartData}
          onChartRender={handleChartRender(index)}
        />
      ))}
    </div>
  );
}

// Export individual chart renderer for external use
export { ChartRenderer };