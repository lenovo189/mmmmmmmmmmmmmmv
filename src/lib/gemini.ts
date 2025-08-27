export async function getGeminiResponse(prompt: string) {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
  
    const data = await res.json();
    return data.text;
}

// Enhanced function to extract comprehensive Excel data for AI analysis
export function extractExcelDataForAI(rows: any[][], styles: any[][], fileName: string) {
  if (!rows || rows.length === 0) {
    return {
      fileName,
      isEmpty: true,
      structure: 'No data available',
      content: 'Empty file'
    };
  }

  // Basic statistics
  const totalRows = rows.length;
  const totalColumns = rows[0]?.length || 0;
  const nonEmptyRows = rows.filter(row => row.some(cell => cell && cell.toString().trim() !== '')).length;
  
  // Detect headers (first row analysis)
  const possibleHeaders = rows[0] || [];
  const hasHeaders = possibleHeaders.some(cell => 
    cell && typeof cell === 'string' && 
    (cell.includes(' ') || cell.length > 1) &&
    !(/^\d+$/.test(cell.toString()))
  );

  // Sample data for analysis (first 15 rows to give AI good context)
  const sampleData = rows.slice(0, Math.min(15, rows.length));
  
  // Detect data types in columns
  const columnTypes: string[] = [];
  for (let col = 0; col < totalColumns; col++) {
    const columnValues = rows.slice(hasHeaders ? 1 : 0, Math.min(10, rows.length))
      .map(row => row[col])
      .filter(val => val !== null && val !== undefined && val.toString().trim() !== '');
    
    if (columnValues.length === 0) {
      columnTypes.push('empty');
    } else if (columnValues.every(val => !isNaN(Number(val)))) {
      columnTypes.push('numeric');
    } else if (columnValues.every(val => !isNaN(Date.parse(val)))) {
      columnTypes.push('date');
    } else {
      columnTypes.push('text');
    }
  }

  // Check for formatting patterns
  const hasFormatting = styles.some(rowStyles => 
    rowStyles.some(style => style.bold || style.color || style.bgColor)
  );

  return {
    fileName,
    isEmpty: false,
    structure: {
      totalRows,
      totalColumns,
      nonEmptyRows,
      hasHeaders,
      columnTypes,
      hasFormatting,
      dataCompleteness: Math.round((nonEmptyRows / totalRows) * 100)
    },
    headers: hasHeaders ? possibleHeaders : null,
    sampleData,
    content: sampleData.map((row, index) => 
      `Row ${index + 1}: ${row.join(' | ')}`
    ).join('\n')
  };
}

// AI-first comprehensive analysis function
export async function comprehensiveExcelAnalysis(rows: any[][], styles: any[][], fileName: string) {
  const extractedData = extractExcelDataForAI(rows, styles, fileName);
  
  if (extractedData.isEmpty) {
    return {
      understanding: "Empty file - no data to analyze",
      review: "No review possible for empty file",
      recommendations: "Please upload a file with data",
      chartRecommendations: null,
      fileStructure: null,
      sampleSize: 0
    };
  }

  // Type guard to ensure structure is not a string
  if (typeof extractedData.structure === 'string') {
    return {
      understanding: "Error processing file structure",
      review: "Unable to analyze file structure",
      recommendations: "Please try uploading the file again",
      chartRecommendations: null,
      fileStructure: null,
      sampleSize: 0
    };
  }

  const prompt = `
You are a professional data analyst. I'm providing you with an Excel file for comprehensive analysis.

## FILE INFORMATION
- **File Name**: ${extractedData.fileName}
- **Total Rows**: ${extractedData.structure.totalRows}
- **Total Columns**: ${extractedData.structure.totalColumns}
- **Non-empty Rows**: ${extractedData.structure.nonEmptyRows}
- **Data Completeness**: ${extractedData.structure.dataCompleteness}%
- **Has Headers**: ${extractedData.structure.hasHeaders ? 'Yes' : 'No'}
- **Column Types**: ${extractedData.structure.columnTypes.join(', ')}
- **Has Formatting**: ${extractedData.structure.hasFormatting ? 'Yes' : 'No'}

${extractedData.headers ? `**HEADERS**: ${extractedData.headers.join(' | ')}\n\n` : ''}
### SAMPLE DATA (first 15 rows)
\`\`\`
${extractedData.content}
\`\`\`

## ANALYSIS REQUEST

Please provide a comprehensive analysis using **markdown formatting**. Structure your response with the following sections:

### 1. DATA UNDERSTANDING
What type of data is this? What business domain does it represent? What are the key entities and relationships?

### 2. STRUCTURE ANALYSIS
Evaluate the data organization, quality, and completeness. Are there any structural issues?

### 3. KEY INSIGHTS
What are the most important patterns, trends, or findings in this data? Use bullet points for clarity:
- Key finding 1
- Key finding 2
- etc.

### 4. DATA QUALITY REVIEW
Assess data quality including missing values, inconsistencies, outliers, or formatting issues.

### 5. BUSINESS VALUE
What business decisions could be made from this data? What questions does it answer?

### 6. RECOMMENDATIONS
Specific suggestions for data improvement, analysis, or reporting. Use numbered lists where appropriate.

**Important**: Format your response using proper markdown syntax including headers (###), bullet points (-), numbered lists (1.), bold text (**text**), and code blocks (\`\`\`) where appropriate. Be specific and actionable in your analysis.`;

  const aiResponse = await getGeminiResponse(prompt);
  
  // Generate chart recommendations
  const chartAnalysis = await analyzeDataForCharts(extractedData);
  
  return {
    understanding: aiResponse,
    chartRecommendations: chartAnalysis,
    fileStructure: extractedData.structure,
    sampleSize: extractedData.sampleData?.length || 0
  };
}

// Generate executive summary based on AI understanding
export async function generateExecutiveSummary(aiAnalysis: any, fileName: string) {
  const prompt = `
Based on the comprehensive analysis of the Excel file "${fileName}", create a professional executive summary.

## ANALYSIS RESULTS
${aiAnalysis.understanding}

## EXECUTIVE SUMMARY REQUEST

Create a concise executive summary using **markdown formatting** that includes:

### Key Requirements:
1. **Data Overview**: Briefly describe what the data represents
2. **Critical Insights**: Highlight the most important findings
3. **Business Value**: State the potential impact and value
4. **Quality Assessment**: Mention any significant data quality concerns

### Format Guidelines:
- Use 2-3 well-structured paragraphs
- Include bullet points for key insights where appropriate
- Use **bold text** for emphasis on critical points
- Make it professional and actionable for business stakeholders
- Format the response using proper markdown syntax

This summary will be used in a business report, so ensure it's executive-level appropriate.`;

  return await getGeminiResponse(prompt);
}

// Generate specific recommendations based on analysis
export async function generateRecommendations(aiAnalysis: any, fileName: string) {
  const prompt = `
Based on the analysis of "${fileName}", provide specific, actionable recommendations.

## ANALYSIS CONTEXT
${aiAnalysis.understanding}

## RECOMMENDATIONS REQUEST

Provide 5-7 specific recommendations using **markdown formatting** in the following categories:

### 1. Data Quality Improvements
### 2. Analysis Opportunities
### 3. Reporting Enhancements
### 4. Business Actions
### 5. Technical Considerations

### Format Guidelines:
- Use proper markdown headers (###) for each category
- Use numbered lists (1., 2., 3.) or bullet points (-) for recommendations
- Use **bold text** to highlight key action items
- Include specific, actionable steps
- Make each recommendation valuable for business decision-making
- Use \`code formatting\` for technical terms when appropriate

**Example format**:
### 1. Data Quality Improvements
1. **Address missing values** in columns X, Y, Z
2. **Standardize formatting** for date fields
- etc.

Ensure all recommendations are practical and implementable.`;

  return await getGeminiResponse(prompt);
}

// Legacy functions (keeping for backward compatibility)
export async function analyzeExcelData(rows: any[][], fileName: string) {
  if (!rows || rows.length === 0) {
    return "No data available for analysis.";
  }

  const dataPreview = rows.slice(0, 10).map((row, index) => 
    `Row ${index + 1}: ${row.join(', ')}`
  ).join('\n');

  const totalRows = rows.length;
  const totalColumns = rows[0]?.length || 0;

  const prompt = `
Analyze this Excel data from file "${fileName}":

Data Structure:
- Total Rows: ${totalRows}
- Total Columns: ${totalColumns}

Data Preview (first 10 rows):
${dataPreview}

Please provide:
1. A brief summary of what this data appears to represent
2. Key insights or patterns you notice
3. Data quality observations (missing values, inconsistencies, etc.)
4. Recommendations for data presentation or analysis
5. Any potential issues or areas of concern

Keep the analysis concise but comprehensive, suitable for a business report.`;

  return await getGeminiResponse(prompt);
}

// New function to analyze data for chart recommendations
export async function analyzeDataForCharts(extractedData: any) {
  if (extractedData.isEmpty || typeof extractedData.structure === 'string') {
    return null;
  }

  const { structure, headers, sampleData } = extractedData;
  
  const prompt = `
You are a data visualization expert. Analyze this Excel data and create comprehensive chart recommendations for maximum analytical insight.

## DATA CONTEXT
- **Total Rows**: ${structure.totalRows}
- **Total Columns**: ${structure.totalColumns}
- **Column Types**: ${structure.columnTypes.join(', ')}
- **Has Headers**: ${structure.hasHeaders ? 'Yes' : 'No'}
- **Data Completeness**: ${structure.dataCompleteness}%

${headers ? `**HEADERS**: ${headers.join(' | ')}\n\n` : ''}
### SAMPLE DATA
\`\`\`
${extractedData.content}
\`\`\`

## COMPREHENSIVE CHART ANALYSIS

Analyze this data and provide dynamic chart recommendations. Consider:
- **Data patterns**: trends, distributions, correlations, comparisons
- **Business insights**: what story does the data tell?
- **Multiple perspectives**: different ways to view the same data
- **Analytical depth**: charts that reveal hidden insights

Provide your analysis in this JSON format:

\`\`\`json
{
  "shouldCreateCharts": true/false,
  "reasoning": "Detailed explanation of why charts are beneficial and what insights they'll reveal",
  "dataInsights": "Key patterns and relationships you identified in the data",
  "recommendedCharts": [
    {
      "type": "bar|line|pie|area|scatter|combo|histogram|heatmap|waterfall|funnel",
      "title": "REQUIRED: Descriptive chart title",
      "description": "REQUIRED: What insights this chart reveals",
      "xAxis": "REQUIRED: exact column name or 0-based index for x-axis",
      "yAxis": "REQUIRED for most charts: exact column name or 0-based index for y-axis",
      "dataKey": "REQUIRED for pie/histogram: exact column name or 0-based index for the main data",
      "secondaryDataKey": "optional: second data series for combo charts",
      "groupBy": "optional: column for grouping/categorization",
      "aggregation": "sum|avg|count|max|min (default: sum if data needs aggregation)",
      "chartVariant": "stacked|grouped|normalized (for applicable chart types)",
      "priority": "REQUIRED: 1-10 (1 being highest priority)",
      "analyticalValue": "REQUIRED: High|Medium|Low - how much insight this chart provides"
    }
  ],
  "suggestedCombinations": [
    {
      "charts": ["chart indices that work well together"],
      "reasoning": "why these charts complement each other"
    }
  ]
}
\`\`\`

## CRITICAL REQUIREMENTS FOR CHART CONFIGURATIONS

**MANDATORY FIELDS** - Every chart MUST have:
- type: Valid chart type from the list
- title: Clear, descriptive title  
- xAxis: Column reference (name or 0-based index)
- priority: Number 1-10
- analyticalValue: High/Medium/Low

**CONDITIONAL FIELDS**:
- For pie charts: Must have dataKey (not yAxis)
- For histogram charts: Must have dataKey
- For all other charts: Must have yAxis OR dataKey

**COLUMN REFERENCES**: Use either:
- Exact header names (case-sensitive)
- 0-based column indices: "0", "1", "2" (first column is "0")

**EXAMPLE VALID CONFIGURATIONS**:
Bar chart: type=bar, title="Sales by Category", xAxis="Category", yAxis="Sales Amount", priority=1, analyticalValue="High"
Pie chart: type=pie, title="Market Share Distribution", xAxis="Region", dataKey="Market Share", priority=2, analyticalValue="Medium"

## CHART TYPE GUIDELINES

**Choose chart types based on data characteristics:**

- **Bar/Column**: Categorical comparisons, rankings
- **Line**: Time series, trends, continuous data
- **Pie/Donut**: Proportions, parts of a whole (max 6-8 categories)
- **Area**: Cumulative data, stacked proportions over time
- **Scatter**: Correlations between two continuous variables
- **Combo**: Multiple data series with different scales
- **Histogram**: Distribution of continuous data
- **Heatmap**: Correlation matrix, intensity data
- **Waterfall**: Sequential positive/negative changes
- **Funnel**: Process stages, conversion rates

## REQUIREMENTS

1. **Be Comprehensive**: Recommend 4-8 charts for rich analysis (not limited to 3)
2. **Prioritize Insight**: Focus on charts that reveal meaningful patterns
3. **Ensure Variety**: Use different chart types for different perspectives
4. **Consider Business Value**: Think about what decision-makers need to see
5. **Data-Driven**: Only recommend charts if data supports visualization
6. **Column Mapping**: Ensure all column references are accurate

**Return only the JSON object, no additional text.**`;

  try {
    const response = await getGeminiResponse(prompt);
    // Extract JSON from the response (in case AI includes additional text)
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : response;
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error('Error parsing chart recommendations:', error);
    return {
      shouldCreateCharts: false,
      reasoning: "Error analyzing data for charts",
      dataInsights: "Unable to analyze data patterns",
      recommendedCharts: [],
      suggestedCombinations: []
    };
  }
}

export async function generateDataSummary(rows: any[][], fileName: string) {
  if (!rows || rows.length === 0) {
    return "No data available for summary.";
  }

  const totalRows = rows.length;
  const totalColumns = rows[0]?.length || 0;
  const nonEmptyRows = rows.filter(row => row.some(cell => cell && cell.toString().trim() !== '')).length;
  
  const headerRow = rows[0]?.join(', ') || 'No headers detected';

  const prompt = `
Generate a professional executive summary for this Excel data:

File: ${fileName}
Total Records: ${totalRows}
Columns: ${totalColumns}
Non-empty Records: ${nonEmptyRows}
Headers: ${headerRow}

Create a brief, professional summary (2-3 paragraphs) that would be suitable for:
- Executive overview in a business report
- Data quality assessment
- Key metrics and findings

Focus on business value and actionable insights.`;

  return await getGeminiResponse(prompt);
}