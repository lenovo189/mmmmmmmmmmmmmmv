"use client";

import React, { useEffect, useState, useRef } from "react";
import ExcelJS from "exceljs";
import * as pdfMakeImport from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Loader2, Download, BarChart3, Maximize2, Minimize2, TrendingUp } from "lucide-react";
import { 
  analyzeExcelData, 
  generateDataSummary, 
  comprehensiveExcelAnalysis, 
  generateExecutiveSummary, 
  generateRecommendations 
} from "@/lib/gemini";
import MarkdownRenderer from "@/components/markdown-renderer";
import { markdownToPdfMake } from "@/lib/markdown-utils";
import { ChartsContainer } from "@/components/chart-renderer";
import { transformDataForChart, ProcessedChartData, ChartConfig } from "@/lib/chart-utils";
import { captureChartsWithRetry, createChartsPdfSection, getChartPdfStyles } from "@/lib/chart-to-pdf";
import {
  trackAIProcessingStart,
  trackAIProcessingComplete,
  trackChartGenerationStart,
  trackChartGenerationComplete,
  trackPDFCreationStart,
  trackPDFCreationComplete,
  trackPDFDownload,
  trackConversionComplete,
  trackUserEngagement,
  trackDropOff,
  trackFileUploadComplete
} from "@/lib/analytics";

// Configure pdfMake
const pdfMake = pdfMakeImport as any;
if ((pdfFonts as any).pdfMake?.vfs) {
  pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;
}

interface ExcelPreviewWithReviewProps {
  file: File;
}

export default function ExcelPreviewWithReview({ file }: ExcelPreviewWithReviewProps) {
  const [rows, setRows] = useState<any[][]>([]);
  const [styles, setStyles] = useState<any[][]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiRecommendations, setAiRecommendations] = useState<string>("");
  const [chartsData, setChartsData] = useState<ProcessedChartData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [chartRefs, setChartRefs] = useState<(HTMLDivElement | null)[]>([]);
  
  // Analytics timing state
  const [aiProcessingStartTime, setAiProcessingStartTime] = useState<number | null>(null);
  const [chartGenerationStartTime, setChartGenerationStartTime] = useState<number | null>(null);
  const [pdfCreationStartTime, setPdfCreationStartTime] = useState<number | null>(null);
  const [conversionStartTime, setConversionStartTime] = useState<number | null>(null);
  
  const exitButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Esc key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && fullscreen) {
        setFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreen]);

  // Lock body scroll in fullscreen mode
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = "hidden";
      exitButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  useEffect(() => {
    if (!file) return;

    const readExcel = async () => {
      try {
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.worksheets[0];
        const sheetRows: any[][] = [];
        const sheetStyles: any[][] = [];
        
        // Get actual row count first
        let actualRowCount = 0;
        worksheet.eachRow(() => {
          actualRowCount++;
        });
        
        // Check row limit (max 100 rows)
        const MAX_ROWS = 100;
        if (actualRowCount > MAX_ROWS) {
          // Track file rejection due to size limit
          trackFileUploadComplete({
            file_name: file.name,
            file_size_mb: parseFloat((file.size / 1024 / 1024).toFixed(2)),
            file_type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            upload_method: 'drag_drop',
            success: false,
            error_message: `File contains ${actualRowCount} rows. Maximum allowed is ${MAX_ROWS} rows.`
          });
          
          trackDropOff('upload', 'file_too_large_rows');
          
          alert(`This Excel file contains ${actualRowCount} rows, which exceeds the maximum limit of ${MAX_ROWS} rows. Please use a smaller file or reduce the number of rows.`);
          return;
        }

        worksheet.eachRow((row) => {
          const rowData: any[] = [];
          const rowStyle: any[] = [];
          row.eachCell({ includeEmpty: true }, (cell) => {
            const fill = cell.fill as any;
            const cellValue = cell.value;
            let displayValue = "";
            if (cellValue instanceof Date) {
              displayValue = cellValue.toLocaleString();
            } else if (cellValue !== null && cellValue !== undefined) {
              displayValue = String(cellValue);
            }
            rowData.push(displayValue);
            rowStyle.push({
              bold: cell.font?.bold || false,
              color: cell.font?.color?.argb
                ? `#${cell.font.color.argb.slice(2)}`
                : undefined,
              bgColor:
                fill?.fgColor?.argb && fill.type === "pattern"
                  ? `#${fill.fgColor.argb.slice(2)}`
                  : undefined,
            });
          });
          sheetRows.push(rowData);
          sheetStyles.push(rowStyle);
        });

        setRows(sheetRows);
        setStyles(sheetStyles);
        
        // Track successful file processing
        trackUserEngagement('file_processed_successfully', {
          file_name: file.name,
          actual_rows: actualRowCount,
          within_limit: true
        });
        
      } catch (error) {
        console.error('Error reading Excel file:', error);
        
        // Track file processing error
        trackFileUploadComplete({
          file_name: file.name,
          file_size_mb: parseFloat((file.size / 1024 / 1024).toFixed(2)),
          file_type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          upload_method: 'drag_drop',
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown file processing error'
        });
        
        trackDropOff('upload', 'file_processing_error');
        
        alert('Error reading Excel file. Please make sure the file is a valid .xlsx file.');
      }
    };

    readExcel();
  }, [file]);

  const generateAIReview = async () => {
    if (rows.length === 0) return;
    
    // Check row limit before processing
    const MAX_ROWS = 100;
    if (rows.length > MAX_ROWS) {
      alert(`Cannot process files with more than ${MAX_ROWS} rows. Current file has ${rows.length} rows.`);
      trackDropOff('processing', 'exceeds_row_limit');
      return;
    }
    
    setIsAnalyzing(true);
    const startTime = Date.now();
    setAiProcessingStartTime(startTime);
    setConversionStartTime(startTime); // Track overall conversion time
    
    // Track AI processing start
    trackAIProcessingStart({
      file_name: file.name,
      processing_type: 'comprehensive_analysis',
      data_rows: rows.length,
      data_columns: rows[0]?.length || 0,
      error_message: undefined
    });
    
    try {
      // Step 1: Comprehensive AI analysis with chart recommendations
      const comprehensiveAnalysis = await comprehensiveExcelAnalysis(rows, styles, file.name);
      setAiAnalysis(comprehensiveAnalysis);
      
      // Track comprehensive analysis completion
      trackAIProcessingComplete({
        file_name: file.name,
        processing_type: 'comprehensive_analysis',
        duration_seconds: (Date.now() - startTime) / 1000,
        success: true,
        data_rows: rows.length,
        data_columns: rows[0]?.length || 0
      });
      
      // Step 2: Generate executive summary
      const summaryStartTime = Date.now();
      trackAIProcessingStart({
        file_name: file.name,
        processing_type: 'executive_summary',
        data_rows: rows.length,
        data_columns: rows[0]?.length || 0
      });
      
      const executiveSummary = await generateExecutiveSummary(comprehensiveAnalysis, file.name);
      setAiSummary(executiveSummary);
      
      trackAIProcessingComplete({
        file_name: file.name,
        processing_type: 'executive_summary',
        duration_seconds: (Date.now() - summaryStartTime) / 1000,
        success: true,
        data_rows: rows.length,
        data_columns: rows[0]?.length || 0
      });
      
      // Step 3: Generate specific recommendations
      const recommendationsStartTime = Date.now();
      trackAIProcessingStart({
        file_name: file.name,
        processing_type: 'recommendations',
        data_rows: rows.length,
        data_columns: rows[0]?.length || 0
      });
      
      const recommendations = await generateRecommendations(comprehensiveAnalysis, file.name);
      setAiRecommendations(recommendations);
      
      trackAIProcessingComplete({
        file_name: file.name,
        processing_type: 'recommendations',
        duration_seconds: (Date.now() - recommendationsStartTime) / 1000,
        success: true,
        data_rows: rows.length,
        data_columns: rows[0]?.length || 0
      });
      
      // Step 4: Process chart recommendations and generate charts
      const chartRecommendations = comprehensiveAnalysis.chartRecommendations;
      if (chartRecommendations?.shouldCreateCharts && 
          chartRecommendations.recommendedCharts && 
          Array.isArray(chartRecommendations.recommendedCharts) &&
          chartRecommendations.recommendedCharts.length > 0) {
        
        console.log('Chart recommendations received:', {
          shouldCreateCharts: chartRecommendations.shouldCreateCharts,
          chartCount: chartRecommendations.recommendedCharts.length,
          reasoning: chartRecommendations.reasoning
        });
        
        // Validate chart recommendations structure
        const validRecommendations = chartRecommendations.recommendedCharts.filter((chart: any) => {
          if (!chart || typeof chart !== 'object') {
            console.warn('Invalid chart object found in recommendations:', chart);
            return false;
          }
          
          if (!chart.type) {
            console.warn('Chart missing required type field:', chart);
            return false;
          }
          
          return true;
        });
        
        console.log(`Validated ${validRecommendations.length} out of ${chartRecommendations.recommendedCharts.length} chart recommendations`);
        
        if (validRecommendations.length > 0) {
          const chartStartTime = Date.now();
          setChartGenerationStartTime(chartStartTime);
          
          // Track chart generation start
          trackChartGenerationStart({
            file_name: file.name,
            chart_types: validRecommendations.map((c: ChartConfig) => c.type),
            chart_count: validRecommendations.length,
            failed_charts: []
          });
          
          trackAIProcessingStart({
            file_name: file.name,
            processing_type: 'chart_analysis',
            data_rows: rows.length,
            data_columns: rows[0]?.length || 0
          });
          
          const generatedCharts = generateChartsFromRecommendations(
            validRecommendations,
            rows,
            comprehensiveAnalysis.fileStructure?.hasHeaders ?? true
          );
          setChartsData(generatedCharts);
          
          // Track chart generation completion
          const successfulChartTypes = generatedCharts.map((c: ProcessedChartData) => c.config.type);
          const allRequestedTypes = validRecommendations.map((c: ChartConfig) => c.type);
          const failedChartTypes = allRequestedTypes.filter((type: string) => 
            !successfulChartTypes.includes(type as any)
          );
          
          trackChartGenerationComplete({
            file_name: file.name,
            chart_types: successfulChartTypes,
            chart_count: generatedCharts.length,
            success: generatedCharts.length > 0,
            failed_charts: failedChartTypes,
            generation_time_seconds: (Date.now() - chartStartTime) / 1000
          });
          
          trackAIProcessingComplete({
            file_name: file.name,
            processing_type: 'chart_analysis',
            duration_seconds: (Date.now() - chartStartTime) / 1000,
            success: generatedCharts.length > 0,
            data_rows: rows.length,
            data_columns: rows[0]?.length || 0
          });
        } else {
          console.warn('No valid chart recommendations found after validation');
          setChartsData([]);
          
          // Track that no valid charts were found
          trackChartGenerationComplete({
            file_name: file.name,
            chart_types: [],
            chart_count: 0,
            success: true,
            error_message: 'No valid chart recommendations after validation'
          });
        }
      } else {
        setChartsData([]);
        
        // Track that no charts were recommended
        trackChartGenerationComplete({
          file_name: file.name,
          chart_types: [],
          chart_count: 0,
          success: true,
          error_message: 'No charts recommended by AI'
        });
      }
      
      setAnalysisComplete(true);
      
      // Track user engagement
      trackUserEngagement('ai_analysis_completed', {
        total_duration_seconds: (Date.now() - startTime) / 1000,
        charts_generated: chartsData.length
      });
      
    } catch (error) {
      console.error("Error generating AI review:", error);
      
      // Track AI processing failure
      trackAIProcessingComplete({
        file_name: file.name,
        processing_type: 'comprehensive_analysis',
        duration_seconds: (Date.now() - startTime) / 1000,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown AI processing error',
        data_rows: rows.length,
        data_columns: rows[0]?.length || 0
      });
      
      // Track chart generation failure
      trackChartGenerationComplete({
        file_name: file.name,
        chart_types: [],
        chart_count: 0,
        success: false,
        error_message: error instanceof Error ? error.message : 'AI processing failed'
      });
      
      // Track drop off
      trackDropOff('processing', 'ai_analysis_error');
      
      setAiAnalysis({
        understanding: "Error generating analysis. Please try again.",
        chartRecommendations: null,
        fileStructure: null,
        sampleSize: 0
      });
      setAiSummary("Error generating summary. Please try again.");
      setAiRecommendations("Error generating recommendations. Please try again.");
      setChartsData([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to generate charts from AI recommendations
  const generateChartsFromRecommendations = (
    recommendations: ChartConfig[],
    excelRows: any[][],
    hasHeaders: boolean
  ): ProcessedChartData[] => {
    const generatedCharts: ProcessedChartData[] = [];
    
    // Validate input parameters
    if (!recommendations || !Array.isArray(recommendations)) {
      console.warn('No valid chart recommendations provided');
      return generatedCharts;
    }
    
    if (!excelRows || excelRows.length === 0) {
      console.warn('No Excel data available for chart generation');
      return generatedCharts;
    }
    
    // Sort by priority and analytical value, take up to 8 charts for comprehensive analysis
    const sortedRecommendations = recommendations
      .filter(rec => {
        // Basic validation of recommendation structure
        if (!rec || typeof rec !== 'object') {
          console.warn('Invalid recommendation object:', rec);
          return false;
        }
        
        // Check if recommendation has minimum required fields
        if (!rec.type) {
          console.warn('Recommendation missing chart type:', rec);
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // First sort by priority, then by analytical value
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        
        const valueWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const aWeight = valueWeight[a.analyticalValue || 'Medium'];
        const bWeight = valueWeight[b.analyticalValue || 'Medium'];
        return bWeight - aWeight;
      })
      .slice(0, 8); // Allow up to 8 charts for comprehensive analysis
    
    console.log(`Processing ${sortedRecommendations.length} valid chart recommendations`);
    
    for (const recommendation of sortedRecommendations) {
      try {
        // Log the recommendation being processed
        console.log(`Processing chart recommendation:`, {
          type: recommendation.type,
          title: recommendation.title,
          xAxis: recommendation.xAxis,
          yAxis: recommendation.yAxis,
          dataKey: recommendation.dataKey
        });
        
        const chartData = transformDataForChart(excelRows, recommendation, hasHeaders);
        if (chartData && chartData.data.length > 0) {
          generatedCharts.push(chartData);
          console.log(`✓ Generated ${recommendation.type} chart: ${recommendation.title}`);
        } else {
          console.warn(`⚠ Failed to generate data for chart: ${recommendation.title || 'Untitled'}`, {
            recommendation,
            dataRows: excelRows.length,
            hasHeaders
          });
        }
      } catch (error) {
        console.error(`❌ Failed to generate chart: ${recommendation.title || 'Untitled'}`, {
          error: error instanceof Error ? error.message : error,
          recommendation,
          stack: error instanceof Error ? error.stack : undefined
        });
      }
    }
    
    console.log(`Successfully generated ${generatedCharts.length} charts out of ${sortedRecommendations.length} recommendations`);
    return generatedCharts;
  };

  // Handle chart rendering for PDF export
  const handleChartsRender = (refs: (HTMLDivElement | null)[]) => {
    setChartRefs(refs);
  };

  // Test function to demonstrate dynamic chart functionality
  const testChartFunctionality = () => {
    // Create diverse chart configurations to showcase dynamic capabilities
    const dynamicChartConfigs: ChartConfig[] = [
      {
        type: 'bar',
        title: 'Category Comparison Analysis',
        description: 'Comparative analysis across categories',
        xAxis: '0',
        yAxis: '1',
        dataKey: '1',
        priority: 1,
        analyticalValue: 'High'
      },
      {
        type: 'line',
        title: 'Trend Pattern Discovery',
        description: 'Temporal patterns and trends',
        xAxis: '0',
        yAxis: '2',
        dataKey: '2',
        priority: 2,
        analyticalValue: 'High'
      },
      {
        type: 'area',
        title: 'Cumulative Growth Analysis',
        description: 'Cumulative data representation',
        xAxis: '0',
        yAxis: '1',
        dataKey: '1',
        priority: 3,
        analyticalValue: 'Medium'
      },
      {
        type: 'pie',
        title: 'Distribution Breakdown',
        description: 'Proportional data distribution',
        xAxis: '0',
        yAxis: '1',
        dataKey: '1',
        priority: 4,
        analyticalValue: 'Medium'
      },
      {
        type: 'combo',
        title: 'Multi-Metric Dashboard View',
        description: 'Combined metrics analysis',
        xAxis: '0',
        yAxis: '1',
        dataKey: '1',
        secondaryDataKey: '2',
        priority: 5,
        analyticalValue: 'High'
      },
      {
        type: 'histogram',
        title: 'Value Distribution Analysis',
        description: 'Frequency distribution of values',
        xAxis: '1',
        yAxis: '1',
        dataKey: '1',
        priority: 6,
        analyticalValue: 'Medium'
      }
    ];

    const testCharts: ProcessedChartData[] = [];
    
    for (const config of dynamicChartConfigs) {
      try {
        const chartData = transformDataForChart(rows, config, true);
        if (chartData && chartData.data.length > 0) {
          testCharts.push(chartData);
        }
      } catch (error) {
        console.warn(`Failed to generate test chart: ${config.title}`, error);
      }
    }
    
    if (testCharts.length > 0) {
      setChartsData(testCharts);
      setAnalysisComplete(true);
      
      // Set mock AI analysis for demonstration
      setAiAnalysis({
        understanding: "Dynamic chart testing activated",
        chartRecommendations: {
          shouldCreateCharts: true,
          reasoning: "Generated diverse chart types to demonstrate dynamic visualization capabilities including bar charts for comparisons, line charts for trends, area charts for cumulative data, pie charts for distributions, combo charts for multi-metric analysis, and histograms for frequency analysis.",
          dataInsights: "The data shows patterns suitable for multiple visualization approaches, enabling comprehensive analytical perspectives through varied chart types.",
          recommendedCharts: dynamicChartConfigs,
          suggestedCombinations: [
            {
              charts: ["0", "1"],
              reasoning: "Bar and line charts together provide both categorical comparison and trend analysis"
            },
            {
              charts: ["4", "5"],
              reasoning: "Combo chart with histogram offers comprehensive multi-dimensional analysis"
            }
          ]
        },
        fileStructure: null,
        sampleSize: testCharts.length
      });
      
      console.log(`✨ Dynamic chart test: Generated ${testCharts.length} different chart types`);
    } else {
      alert('No suitable data found for dynamic chart generation. Upload an Excel file with varied data types first.');
    }
  };

  const exportToPDFWithReview = async () => {
    if (rows.length === 0) return;

    const pdfStartTime = Date.now();
    setPdfCreationStartTime(pdfStartTime);
    
    // Track PDF creation start
    trackPDFCreationStart({
      file_name: file.name,
      pdf_type: 'ai_analysis_report',
      includes_charts: chartsData.length > 0,
      chart_count: chartsData.length
    });

    // Show loading state
    const originalButtonText = 'Export PDF Report';
    const button = document.querySelector('[data-pdf-export]') as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      button.innerHTML = '<svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating PDF...';
    }

    let pdfSizeMB = 0;
    let pdfCreationSuccess = false;
    let pdfErrorMessage: string | undefined;

    try {
      // Capture charts if they exist
      let chartContent: any[] = [];
      if (chartsData.length > 0 && chartRefs.length > 0) {
        if (button) {
          button.innerHTML = '<svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Capturing charts...';
        }
        
        try {
          // Wait longer for charts to be fully rendered
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const chartImages = await captureChartsWithRetry(chartRefs, chartsData, 5);
          
          if (chartImages.length > 0) {
            chartContent = createChartsPdfSection(chartImages);
            console.log(`Successfully captured ${chartImages.length} charts for PDF`);
          } else {
            console.warn('No charts were captured, PDF will be generated without charts');
            // Add a note about charts in the PDF
            chartContent = [
              { text: 'Data Visualizations', style: 'sectionHeader', pageBreak: 'before' },
              { text: 'Charts were recommended but could not be captured for this PDF. Please view charts in the web interface.', style: 'warningText', margin: [0, 0, 0, 20] }
            ];
          }
        } catch (error) {
          console.error('Failed to capture charts for PDF:', error);
          // Add a note about chart capture failure
          chartContent = [
            { text: 'Data Visualizations', style: 'sectionHeader', pageBreak: 'before' },
            { text: 'Charts were generated but could not be captured for this PDF due to technical limitations. Please view charts in the web interface.', style: 'warningText', margin: [0, 0, 0, 20] }
          ];
        }
      }

      if (button) {
        button.innerHTML = '<svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating PDF...';
      }

      const body = rows.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const cellStyle = styles[rowIndex][colIndex];
          return {
            text: cell?.toString() ?? "",
            bold: cellStyle.bold,
            color: cellStyle.color,
            fillColor: cellStyle.bgColor,
          };
        })
      );

      const docDefinition: any = {
        content: [
          { text: "AI-Powered Data Analysis Report", style: "title" },
          { text: `File: ${file.name}`, style: "subtitle" },
          { text: `Generated on: ${new Date().toLocaleDateString()}`, style: "date" },
          
          // Executive Summary Section
          ...(aiSummary ? [
            { text: "Executive Summary", style: "sectionHeader", pageBreak: "before" },
            ...markdownToPdfMake(aiSummary)
          ] : []),

          // Charts Section (if available)
          ...chartContent,

          // Comprehensive Analysis Section
          ...(aiAnalysis?.understanding ? [
            { text: "Comprehensive Data Analysis", style: "sectionHeader" },
            ...markdownToPdfMake(aiAnalysis.understanding)
          ] : []),

          // Recommendations Section
          ...(aiRecommendations ? [
            { text: "Recommendations & Action Items", style: "sectionHeader" },
            ...markdownToPdfMake(aiRecommendations)
          ] : []),

          // Data Table Section
          { text: "Complete Data Table", style: "sectionHeader" },
          {
            table: {
              headerRows: 1,
              widths: Array(rows[0].length).fill("*"),
              body,
            },
            layout: {
              fillColor: function (rowIndex: number) {
                return rowIndex === 0 ? "#f8f9fa" : null;
              }
            }
          },
        ],
        styles: {
          title: { fontSize: 22, bold: true, margin: [0, 0, 0, 10], alignment: "center", color: "#1e40af" },
          subtitle: { fontSize: 16, bold: true, margin: [0, 0, 0, 5], alignment: "center" },
          date: { fontSize: 12, italics: true, margin: [0, 0, 0, 30], alignment: "center", color: "#6b7280" },
          sectionHeader: { fontSize: 16, bold: true, margin: [0, 25, 0, 10], color: "#2563eb" },
          h1: { fontSize: 18, bold: true, margin: [0, 20, 0, 12], color: "#1f2937" },
          h2: { fontSize: 16, bold: true, margin: [0, 18, 0, 10], color: "#374151" },
          h3: { fontSize: 14, bold: true, margin: [0, 15, 0, 8], color: "#4b5563" },
          code: { font: "Courier", fontSize: 10, background: "#f3f4f6", margin: [0, 8, 0, 8] },
          warningText: { fontSize: 12, italics: true, color: "#f59e0b", margin: [0, 10, 0, 10] },
          ...getChartPdfStyles(), // Add chart-specific styles
        },
        defaultStyle: { fontSize: 10 },
        pageOrientation: "landscape",
      };

      const fileName = file.name.replace(".xlsx", "_ai_analysis_report.pdf");
      
      // Estimate PDF size (rough calculation)
      const estimatedSize = (rows.length * rows[0]?.length * 0.001 + chartsData.length * 0.5);
      pdfSizeMB = Math.max(estimatedSize, 0.1); // Minimum 0.1 MB
      
      pdfMake.createPdf(docDefinition).download(fileName);
      pdfCreationSuccess = true;
      
      // Track PDF creation success
      trackPDFCreationComplete({
        file_name: file.name,
        pdf_type: 'ai_analysis_report',
        includes_charts: chartsData.length > 0,
        chart_count: chartsData.length,
        pdf_size_mb: pdfSizeMB,
        creation_time_seconds: (Date.now() - pdfStartTime) / 1000,
        success: true
      });
      
      // Track PDF download
      trackPDFDownload({
        file_name: file.name,
        pdf_type: 'ai_analysis_report',
        includes_charts: chartsData.length > 0,
        chart_count: chartsData.length,
        pdf_size_mb: pdfSizeMB,
        success: true
      });
      
      // Track complete conversion funnel
      if (conversionStartTime) {
        trackConversionComplete({
          file_name: file.name,
          total_time_seconds: (Date.now() - conversionStartTime) / 1000,
          pdf_type: 'ai_analysis_report',
          included_charts: chartsData.length > 0,
          chart_count: chartsData.length
        });
      }
      
      // Track user engagement
      trackUserEngagement('pdf_export_completed', {
        pdf_type: 'ai_analysis_report',
        file_size_mb: pdfSizeMB,
        included_ai_analysis: !!(aiSummary || aiAnalysis?.understanding || aiRecommendations),
        included_charts: chartsData.length > 0,
        chart_count: chartsData.length
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      pdfCreationSuccess = false;
      pdfErrorMessage = error instanceof Error ? error.message : 'Unknown PDF generation error';
      
      // Track PDF creation failure
      trackPDFCreationComplete({
        file_name: file.name,
        pdf_type: 'ai_analysis_report',
        includes_charts: chartsData.length > 0,
        chart_count: chartsData.length,
        creation_time_seconds: (Date.now() - pdfStartTime) / 1000,
        success: false,
        error_message: pdfErrorMessage
      });
      
      // Track PDF download failure
      trackPDFDownload({
        file_name: file.name,
        pdf_type: 'ai_analysis_report',
        includes_charts: chartsData.length > 0,
        chart_count: chartsData.length,
        success: false,
        error_message: pdfErrorMessage
      });
      
      // Track drop off
      trackDropOff('pdf_creation', 'pdf_generation_error');
      
      alert('Error generating PDF. Please try again.');
    } finally {
      // Reset button state
      if (button) {
        button.disabled = false;
        button.innerHTML = `<svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>${originalButtonText}`;
      }
    }
  };

  const getDataStats = () => {
    if (rows.length === 0) return null;
    
    const totalCells = rows.reduce((sum, row) => sum + row.length, 0);
    const nonEmptyCells = rows.reduce((sum, row) => 
      sum + row.filter(cell => cell && cell.toString().trim() !== "").length, 0
    );
    
    const MAX_ROWS = 100;
    const withinLimit = rows.length <= MAX_ROWS;
    
    return {
      rows: rows.length,
      columns: rows[0]?.length || 0,
      totalCells,
      nonEmptyCells,
      completeness: Math.round((nonEmptyCells / totalCells) * 100),
      withinLimit,
      maxRows: MAX_ROWS
    };
  };

  const stats = getDataStats();

  return (
    <div className="space-y-6">
      {/* Simple data preview - always visible */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Data Preview</h3>
            <div className="flex gap-2 text-sm text-gray-600">
              {stats && (
                <>
                  <span className={stats.withinLimit ? "text-gray-600" : "text-red-600 font-medium"}>
                    {stats.rows} rows {!stats.withinLimit ? `(exceeds ${stats.maxRows} limit)` : ""}
                  </span>
                  <span>•</span>
                  <span>{stats.columns} cols</span>
                  <span>•</span>
                  <span>{stats.completeness}% complete</span>
                  {stats.withinLimit && (
                    <>
                      <span>•</span>
                      <span className="text-green-600">✓ Within limit</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 max-h-80 overflow-auto">
          {rows.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Loading data...</p>
          ) : (
            <table className="min-w-full text-sm">
              <tbody>
                {rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0">
                    {row.map((cell: any, j: number) => {
                      const s = styles[i][j];
                      return (
                        <td
                          key={j}
                          className="px-3 py-2 text-gray-700"
                          style={{
                            fontWeight: s.bold ? "bold" : undefined,
                            color: s.color,
                            backgroundColor: s.bgColor,
                          }}
                        >
                          {cell || '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {rows.length > 10 && (
            <p className="text-center text-gray-500 mt-4 text-sm">
              Showing first 10 rows of {rows.length}
            </p>
          )}
        </div>
      </div>

      {/* Smart action buttons - appear when data is ready */}
      {rows.length > 0 && (
        <div className="space-y-3">
          {/* Warning message for files exceeding row limit */}
          {stats && !stats.withinLimit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    File exceeds row limit
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      This file contains {stats.rows} rows, which exceeds the maximum limit of {stats.maxRows} rows. 
                      AI analysis and PDF export are disabled. Please use a smaller file.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportToPDFWithReview}
              data-pdf-export
              disabled={stats ? !stats.withinLimit : false}
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors font-medium ${
                stats && !stats.withinLimit
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF Report
              {chartsData.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-500 text-xs rounded">
                  +{chartsData.length} chart{chartsData.length !== 1 ? 's' : ''}
                </span>
              )}
            </button>
            
            <button
              onClick={generateAIReview}
              disabled={isAnalyzing || (stats ? !stats.withinLimit : false)}
              className={`inline-flex items-center px-4 py-2 border rounded-lg transition-colors font-medium ${
                isAnalyzing || (stats ? !stats.withinLimit : false)
                  ? 'border-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  AI Analysis & Charts
                </>
              )}
            </button>
            
            {!fullscreen && (
              <button
                onClick={() => setFullscreen(true)}
                className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Maximize2 className="h-4 w-4 mr-1" />
                Full View
              </button>
            )}
            
            {/* Test button for dynamic chart functionality - disabled for oversized files */}
            <button
              onClick={testChartFunctionality}
              disabled={stats ? !stats.withinLimit : false}
              className={`inline-flex items-center px-3 py-2 border border-purple-300 rounded-lg transition-colors ${
                stats ? !stats.withinLimit : false
                  ? 'text-gray-500 cursor-not-allowed opacity-50'
                  : 'text-purple-600 hover:text-purple-800'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Test Dynamic Charts
            </button>
          </div>
        </div>
      )}

      {/* Charts Section - show after analysis if charts are recommended */}
      {analysisComplete && chartsData.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <ChartsContainer 
            chartsData={chartsData} 
            onChartsRender={handleChartsRender}
          />
          
          {/* Debug info for chart capture */}
          <div className="mt-4 p-3 bg-blue-100 rounded border text-sm text-blue-800">
            <strong>Chart Status:</strong> {chartsData.length} chart(s) generated • 
            {chartRefs.length} chart reference(s) ready for PDF export
            {chartRefs.length === chartsData.length && chartsData.length > 0 && (
              <span className="text-green-700 font-medium"> ✓ Ready for PDF export with charts</span>
            )}
          </div>
        </div>
      )}

      {/* AI Analysis Results - only show when analysis is complete */}
      {/* Chart recommendations info */}
      {analysisComplete && aiAnalysis?.chartRecommendations && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dynamic Chart Analysis
          </h4>
          <div className="text-yellow-800 text-sm space-y-2">
            <div>
              <strong>Should create charts:</strong> {aiAnalysis.chartRecommendations.shouldCreateCharts ? 'Yes' : 'No'}
            </div>
            
            {aiAnalysis.chartRecommendations.dataInsights && (
              <div>
                <strong>Data Insights:</strong> {aiAnalysis.chartRecommendations.dataInsights}
              </div>
            )}
            
            <div>
              <strong>AI Reasoning:</strong> {aiAnalysis.chartRecommendations.reasoning}
            </div>
            
            {aiAnalysis.chartRecommendations.recommendedCharts && aiAnalysis.chartRecommendations.recommendedCharts.length > 0 && (
              <div>
                <strong>Recommended Charts ({aiAnalysis.chartRecommendations.recommendedCharts.length}):</strong>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  {aiAnalysis.chartRecommendations.recommendedCharts.slice(0, 6).map((chart: any, index: number) => (
                    <li key={index} className="text-xs">
                      <span className="font-medium">{chart.type.toUpperCase()}</span>: {chart.title}
                      {chart.analyticalValue && (
                        <span className={`ml-2 px-1 rounded text-xs ${
                          chart.analyticalValue === 'High' ? 'bg-green-200 text-green-800' :
                          chart.analyticalValue === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {chart.analyticalValue} Value
                        </span>
                      )}
                    </li>
                  ))}
                  {aiAnalysis.chartRecommendations.recommendedCharts.length > 6 && (
                    <li className="text-xs text-yellow-600 italic">
                      ... and {aiAnalysis.chartRecommendations.recommendedCharts.length - 6} more
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            {aiAnalysis.chartRecommendations.shouldCreateCharts && chartsData.length === 0 && (
              <p className="mt-2 text-yellow-700 italic">Charts were recommended but could not be generated due to data structure.</p>
            )}
            
            {aiAnalysis.chartRecommendations.suggestedCombinations && aiAnalysis.chartRecommendations.suggestedCombinations.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-yellow-700 font-medium">Chart Combinations</summary>
                <div className="mt-1 space-y-1">
                  {aiAnalysis.chartRecommendations.suggestedCombinations.map((combo: any, index: number) => (
                    <div key={index} className="text-xs pl-4">
                      <strong>Combination {index + 1}:</strong> {combo.reasoning}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      )}

      {analysisComplete && aiAnalysis && (
        <div className="space-y-4">
          {/* Executive Summary */}
          {aiSummary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Executive Summary</h4>
              <div className="text-blue-800 text-sm">
                <MarkdownRenderer content={aiSummary} />
              </div>
            </div>
          )}

          {/* Detailed Analysis - collapsible */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="px-4 py-3 font-medium text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors">
              Detailed Analysis
            </summary>
            <div className="px-4 pb-4 pt-2 border-t border-gray-100">
              <div className="text-sm text-gray-700 max-h-60 overflow-y-auto">
                <MarkdownRenderer content={aiAnalysis.understanding} />
              </div>
            </div>
          </details>

          {/* Recommendations - collapsible */}
          {aiRecommendations && (
            <details className="border border-gray-200 rounded-lg">
              <summary className="px-4 py-3 font-medium text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors">
                Recommendations
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                <div className="text-sm text-gray-700 max-h-60 overflow-y-auto">
                  <MarkdownRenderer content={aiRecommendations} />
                </div>
              </div>
            </details>
          )}
        </div>
      )}

      {/* Fullscreen Modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{file.name} - Full View</h2>
              <button
                ref={exitButtonRef}
                onClick={() => setFullscreen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Exit Fullscreen"
              >
                <Minimize2 className="h-5 w-5" />
              </button>
            </div>
            <div className="border rounded-lg overflow-auto">
              <table className="min-w-full text-sm">
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-b-0">
                      {row.map((cell: any, j: number) => {
                        const s = styles[i][j];
                        return (
                          <td
                            key={j}
                            className="px-3 py-2 border-r border-gray-100 last:border-r-0"
                            style={{
                              fontWeight: s.bold ? "bold" : undefined,
                              color: s.color,
                              backgroundColor: s.bgColor,
                            }}
                          >
                            {cell || '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}