# Excel to PDF Report Generator with AI Analysis

A Next.js-based application that transforms Excel files into comprehensive PDF reports powered by AI analysis using Google's Gemini API.

## 🚀 Features

### Core Functionality
- **File Upload**: Drag & drop or click to upload Excel (.xlsx) files
- **Excel Preview**: View Excel data with preserved formatting and styling
- **AI-Powered Analysis**: Comprehensive data analysis using Google Gemini AI
- **PDF Report Generation**: Create professional PDF reports with AI insights
- **Template Selection**: Choose from multiple PDF templates with different color schemes
- **Chart Styling**: Charts are styled according to the selected template

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
- **Template-Based Styling**: Select from 5 professional templates with unique color schemes
- **Chart Customization**: Charts automatically styled to match selected template

### User Feedback
- **Bug Reporting**: Submit bug reports directly from the application
- **Feature Requests**: Share feedback and suggestions for improvements
- **Feedback Database**: All feedback stored in Supabase for easy access and management

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
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_measurement_id
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
- **Template Selection**: Choose from 5 professional templates with unique color schemes:
  - **Professional**: Clean and professional look with blue accents
  - **Modern**: Contemporary design with vibrant colors
  - **Minimal**: Simple and clean design with grayscale tones
  - **Corporate**: Business-oriented design with conservative colors
  - **Vibrant**: Energetic design with bold, bright colors

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
│   ├── template-selection-dialog.tsx  # PDF template selection dialog
│   └── excel-preview-with-review.tsx  # Main Excel preview & AI analysis
├── lib/
│   ├── gemini.ts          # AI analysis functions
│   ├── chart-to-pdf.ts    # PDF generation with template support
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
- **Templates**: 5 customizable templates with unique color schemes and styling

### Supabase Feedback Database Setup
To enable the bug/feedback reporting feature, you need to set up a Supabase project:

1. **Create a Supabase Project**:
   - Go to [Supabase](https://supabase.com/) and create a new project
   - Note your Project URL and Anonymous Key from the project settings

2. **Create the Feedback Table**:
   Run this SQL in the Supabase SQL editor:
   ```sql
   CREATE TABLE feedback (
     id SERIAL PRIMARY KEY,
     name TEXT,
     email TEXT,
     feedback TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Configure Environment Variables**:
   Add these to your `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Enable Row Level Security** (Optional but recommended):
   ```sql
   ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Feedback are insertable by everyone" ON feedback FOR INSERT WITH CHECK (true);
   ```

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
