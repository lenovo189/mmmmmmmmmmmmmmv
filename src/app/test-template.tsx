"use client";

import { TemplateSelectionDialog, pdfTemplates } from "@/components/template-selection-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TemplateTestPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    console.log("Selected template:", template);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Template Selection Test</h1>
      <p className="mb-4">Click the button below to test the template selection dialog:</p>
      
      <Button onClick={() => setIsDialogOpen(true)}>
        Open Template Selection
      </Button>
      
      {selectedTemplate && (
        <div className="mt-6 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Selected Template</h2>
          <p><strong>Name:</strong> {selectedTemplate.name}</p>
          <p><strong>Description:</strong> {selectedTemplate.description}</p>
          <div className="mt-2">
            <p><strong>Color Scheme:</strong></p>
            <div className="flex gap-2 mt-1">
              <div className="flex items-center">
                <div 
                  className="w-6 h-6 rounded border mr-2" 
                  style={{ backgroundColor: selectedTemplate.colorScheme.primary }}
                />
                <span>Primary</span>
              </div>
              <div className="flex items-center">
                <div 
                  className="w-6 h-6 rounded border mr-2" 
                  style={{ backgroundColor: selectedTemplate.colorScheme.secondary }}
                />
                <span>Secondary</span>
              </div>
              <div className="flex items-center">
                <div 
                  className="w-6 h-6 rounded border mr-2" 
                  style={{ backgroundColor: selectedTemplate.colorScheme.accent }}
                />
                <span>Accent</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <TemplateSelectionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
}