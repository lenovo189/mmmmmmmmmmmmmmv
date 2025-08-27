"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileSpreadsheet } from "lucide-react"
import { 
  trackFileUploadStart, 
  trackFileUploadComplete, 
  trackUserEngagement,
  trackDropOff 
} from "@/lib/analytics"

export default function FileUpload({ onFile }: { onFile: (file: File) => void }) {
  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Track upload attempt
    if (acceptedFiles.length > 0 || rejectedFiles.length > 0) {
      trackUserEngagement('file_upload_attempt', {
        accepted_files: acceptedFiles.length,
        rejected_files: rejectedFiles.length
      });
    }

    if (acceptedFiles && acceptedFiles[0]) {
      const file = acceptedFiles[0];
      const fileSizeMB = file.size / 1024 / 1024;
      
      // Track upload start
      trackFileUploadStart({
        file_name: file.name,
        file_size_mb: parseFloat(fileSizeMB.toFixed(2)),
        file_type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upload_method: 'drag_drop', // We'll update this based on actual method
        error_message: undefined
      });

      try {
        // Quick validation for very large files (estimate based on file size)
        // Files larger than 10MB are likely to exceed 100 rows
        if (fileSizeMB > 10) {
          throw new Error('File appears too large. Excel files with more than 100 rows are not supported.');
        }
        
        // Track successful upload (file will be further validated in the preview component)
        trackFileUploadComplete({
          file_name: file.name,
          file_size_mb: parseFloat(fileSizeMB.toFixed(2)),
          file_type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          upload_method: 'drag_drop',
          success: true
        });
        
        onFile(file);
      } catch (error) {
        // Track failed upload
        trackFileUploadComplete({
          file_name: file.name,
          file_size_mb: parseFloat(fileSizeMB.toFixed(2)),
          file_type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          upload_method: 'drag_drop',
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown upload error'
        });
        
        alert(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      }
    } else if (rejectedFiles.length > 0) {
      // Track rejected files
      const rejectedFile = rejectedFiles[0];
      const fileSizeMB = rejectedFile.file.size / 1024 / 1024;
      
      trackFileUploadComplete({
        file_name: rejectedFile.file.name,
        file_size_mb: parseFloat(fileSizeMB.toFixed(2)),
        file_type: rejectedFile.file.type,
        upload_method: 'drag_drop',
        success: false,
        error_message: rejectedFile.errors?.[0]?.message || 'File rejected'
      });

      trackDropOff('upload', 'file_rejected');
    }
  }, [onFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
    multiple: false,
    onDropAccepted: () => {
      trackUserEngagement('file_drop_accepted');
    },
    onDropRejected: () => {
      trackUserEngagement('file_drop_rejected');
    },
    onFileDialogOpen: () => {
      trackUserEngagement('file_dialog_opened');
    },
    onFileDialogCancel: () => {
      trackUserEngagement('file_dialog_cancelled');
      trackDropOff('upload', 'dialog_cancelled');
    }
  })

  return (
    <div
      {...getRootProps()}
      className={`
        group relative
        border-2 border-dashed rounded-xl
        p-8 text-center cursor-pointer
        transition-all duration-300 ease-in-out
        ${
          isDragActive
            ? "border-blue-500 bg-blue-50 scale-[1.02]"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }
      `}
    >
      <input {...getInputProps()} />
      
      <div className="space-y-4">
        <div className={`
          mx-auto w-12 h-12 rounded-full flex items-center justify-center
          transition-colors duration-300
          ${
            isDragActive
              ? "bg-blue-100"
              : "bg-gray-100 group-hover:bg-gray-200"
          }
        `}>
          {isDragActive ? (
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
          ) : (
            <Upload className="h-6 w-6 text-gray-600" />
          )}
        </div>
        
        <div>
          {isDragActive ? (
            <p className="text-blue-700 font-medium">
              Drop your Excel file here
            </p>
          ) : (
            <>
              <p className="text-gray-700 font-medium">
                Drop Excel file or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports .xlsx files • Maximum 100 rows
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
