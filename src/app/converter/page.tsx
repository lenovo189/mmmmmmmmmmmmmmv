"use client"

import { useState, useEffect } from "react"
import FileUpload from "@/components/file-upload"
import ExcelPreviewWithReview from "@/components/excel-preview-with-review"
import { FileSpreadsheet } from "lucide-react"
import { trackPageView, trackUserEngagement, setUserProperties } from "@/lib/analytics"
import { Navbar } from "@/components/navbar"

export default function Converter() {
  const [file, setFile] = useState<File | null>(null)

  // Track page view on component mount
  useEffect(() => {
    trackPageView('Excel to PDF Converter Home', {
      conversion_step: 'landing',
      has_file: false
    });
    
    // Set user properties
    setUserProperties({
      user_type: 'excel_converter_user',
      platform: 'web',
      device_type: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop'
    });
  }, []);

  // Track file state changes
  useEffect(() => {
    if (file) {
      trackUserEngagement('file_uploaded_successfully', {
        file_name: file.name,
        file_size_mb: (file.size / 1024 / 1024).toFixed(2)
      });
      
      trackPageView('Excel Preview and Analysis', {
        conversion_step: 'preview',
        has_file: true,
        file_size_category: file.size > 5*1024*1024 ? 'large' : 'small'
      });
    }
  }, [file]);

  const handleFileChange = (newFile: File) => {
    setFile(newFile);
  };

  const handleFileReset = () => {
    setFile(null);
    trackUserEngagement('file_reset', {
      action: 'upload_different_file'
    });
    trackPageView('Excel to PDF Converter Home', {
      conversion_step: 'landing_return',
      has_file: false
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        {!file ? (
          // Simple, centered upload interface
          <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8">
            <div className="text-center space-y-4 max-w-md">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <FileSpreadsheet className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Excel to PDF
              </h1>
              <p className="text-gray-600">
                Drop your Excel file to generate an AI-powered PDF report
                <span className="block text-sm mt-1 text-gray-500">
                  Maximum 100 rows supported
                </span>
              </p>
            </div>
            
            <div className="w-full max-w-lg">
              <FileUpload onFile={handleFileChange} />
            </div>
          </div>
        ) : (
          // File uploaded - show enhanced preview
          <div className="space-y-6">
            {/* Simple file indicator */}
            <div className="flex items-center justify-between py-4 border-b">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                <div>
                  <h2 className="font-medium text-gray-900">{file.name}</h2>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button 
                onClick={handleFileReset}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Upload different file
              </button>
            </div>

            {/* The complex functionality is hidden in this component */}
            <ExcelPreviewWithReview file={file} />
          </div>
        )}
      </div>
    </div>
  )
}