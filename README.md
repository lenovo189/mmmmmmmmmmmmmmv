# Excel to PDF Report Generator with AI Analysis

A Next.js-based application that transforms Excel files into comprehensive PDF reports powered by AI analysis using Google's Gemini API.

## 🚀 Features

### Core Functionality
- **File Upload**: Drag & drop or click to upload Excel (.xlsx) files
- **Excel Preview**: View Excel data with preserved formatting and styling
- **AI-Powered Analysis**: Comprehensive data analysis using Google Gemini AI
- **PDF Report Generation**: Create professional PDF reports with AI insights

### AI Analysis Capabilities
- **Data Understanding**: AI identifies data types, business domains, and relationships
- **Structure Analysis**: Evaluates data organization, quality, and completeness
- **Key Insights**: Discovers patterns, trends, and important findings
- **Data Quality Review**: Assesses missing values, inconsistencies, and formatting issues
- **Business Value**: Identifies decision-making opportunities and actionable insights
- **Recommendations**: Provides specific suggestions for data improvement and analysis

### Export Options
- **Complete AI Report**: Full PDF with executive summary, analysis, recommendations, and data
- **Data Only PDF**: Simple PDF export of Excel data without AI analysis

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.5.0 with React 19.1.0
- **UI Components**: Radix UI + Tailwind CSS
- **PDF Generation**: pdfMake with custom styling
- **Excel Processing**: ExcelJS for data extraction and formatting
- **AI Integration**: Google Generative AI (Gemini 1.5 Flash)
- **Icons**: Lucide React
- **Type Safety**: TypeScript

## 📋 Prerequisites

- Node.js (compatible with Next.js 15)
- npm, yarn, pnpm, or bun
- Google Gemini API key

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd frontend
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## 📖 How to Use

### 1. Upload Excel File
- Drag and drop an Excel file (.xlsx) onto the upload area
- Or click to browse and select a file

### 2. Preview Data
- View your Excel data with original formatting preserved
- See data structure statistics (rows, columns, completeness)
- Toggle fullscreen mode for better viewing

### 3. Generate AI Review
- Click "AI Review" to start comprehensive analysis
- AI will analyze file structure, data quality, and content
- Review the generated insights in organized sections:
  - **File Structure Analysis**: Data metrics and quality indicators
  - **Executive Summary**: Business-focused overview
  - **Comprehensive Analysis**: Detailed findings and insights
  - **AI Recommendations**: Actionable suggestions

### 4. Export PDF Reports
- **Complete AI Report**: Includes all analysis, insights, and data
- **Data Only**: Simple Excel-to-PDF conversion without AI analysis

## 🔍 AI Analysis Process

The AI follows a structured approach:

1. **Data Extraction**: Processes Excel file structure, formatting, and content
2. **Structure Analysis**: Identifies headers, data types, and quality metrics
3. **Comprehensive Review**: AI analyzes business context and patterns
4. **Executive Summary**: Generates business-focused overview
5. **Recommendations**: Provides actionable insights and suggestions
6. **PDF Generation**: Creates professional report with all findings

## 📁 Project Structure

```
src/
├── app/
│   ├── api/gemini/          # Gemini AI API endpoint
│   ├── layout.tsx           # Root layout
│   └── page.tsx            # Main application page
├── components/
│   ├── ui/                 # Radix UI components
│   ├── file-upload.tsx     # File upload component
│   └── excel-preview-with-review.tsx  # Main Excel preview & AI analysis
├── lib/
│   ├── gemini.ts          # AI analysis functions
│   └── utils.ts           # Utility functions
└── hooks/
    └── use-mobile.ts      # Mobile detection hook
```

## 🎨 Key Components

### ExcelPreviewWithReview
The main component that handles:
- Excel file processing and preview
- AI analysis workflow
- PDF report generation
- Tabbed interface for different views

### AI Analysis Functions
- `comprehensiveExcelAnalysis()`: Main AI analysis function
- `generateExecutiveSummary()`: Creates business summary
- `generateRecommendations()`: Provides actionable insights
- `extractExcelDataForAI()`: Prepares data for AI processing

## 🔧 Configuration

### Gemini AI Settings
- Model: `gemini-1.5-flash`
- API endpoint: `/api/gemini`
- Server-side processing for security

### PDF Export Settings
- Orientation: Landscape for better table display
- Styling: Professional business report format
- Sections: Executive summary, analysis, recommendations, data

## 🚨 Important Notes

- **API Key Security**: Gemini API key is processed server-side only
- **File Size**: Large Excel files may take longer to process
- **AI Analysis**: Requires internet connection for Gemini API calls
- **Browser Support**: Modern browsers with ES2020+ support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

---

**Built with ❤️ using Next.js and Google Gemini AI**
