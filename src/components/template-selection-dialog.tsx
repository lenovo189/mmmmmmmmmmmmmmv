"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";

// Template type
export interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  styles: {
    title: { fontSize: number; color: string };
    sectionHeader: { fontSize: number; color: string };
    chartTitle: { fontSize: number; color: string };
  };
  chartStyles?: {
    gridColor?: string;
    axisColor?: string;
    tooltipBackgroundColor?: string;
  };
}

// --- 12 Office-Safe Templates ---
export const pdfTemplates: PDFTemplate[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Clean and formal with blue highlights",
    colorScheme: {
      primary: "#2563eb",
      secondary: "#6b7280",
      accent: "#1e40af",
      background: "#ffffff",
      text: "#1f2937",
    },
    styles: {
      title: { fontSize: 22, color: "#1e40af" },
      sectionHeader: { fontSize: 16, color: "#2563eb" },
      chartTitle: { fontSize: 16, color: "#2563eb" },
    },
    chartStyles: {
      gridColor: "#e5e7eb",
      axisColor: "#9ca3af",
      tooltipBackgroundColor: "#ffffff",
    },
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Business-oriented design with conservative colors",
    colorScheme: {
      primary: "#4b5563",
      secondary: "#9ca3af",
      accent: "#1f2937",
      background: "#ffffff",
      text: "#111827",
    },
    styles: {
      title: { fontSize: 22, color: "#1f2937" },
      sectionHeader: { fontSize: 16, color: "#4b5563" },
      chartTitle: { fontSize: 15, color: "#4b5563" },
    },
    chartStyles: {
      gridColor: "#e5e7eb",
      axisColor: "#9ca3af",
      tooltipBackgroundColor: "#f9fafb",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and clean design with grayscale tones",
    colorScheme: {
      primary: "#374151",
      secondary: "#9ca3af",
      accent: "#111827",
      background: "#ffffff",
      text: "#1f2937",
    },
    styles: {
      title: { fontSize: 20, color: "#111827" },
      sectionHeader: { fontSize: 15, color: "#374151" },
      chartTitle: { fontSize: 14, color: "#374151" },
    },
    chartStyles: {
      gridColor: "#f3f4f6",
      axisColor: "#d1d5db",
      tooltipBackgroundColor: "#ffffff",
    },
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary look with vibrant blue tones",
    colorScheme: {
      primary: "#0ea5e9",
      secondary: "#94a3b8",
      accent: "#0284c7",
      background: "#ffffff",
      text: "#0f172a",
    },
    styles: {
      title: { fontSize: 24, color: "#0284c7" },
      sectionHeader: { fontSize: 18, color: "#0ea5e9" },
      chartTitle: { fontSize: 16, color: "#0ea5e9" },
    },
    chartStyles: {
      gridColor: "#e2e8f0",
      axisColor: "#94a3b8",
      tooltipBackgroundColor: "#f8fafc",
    },
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Neutral tones with classy serif feel",
    colorScheme: {
      primary: "#6d28d9",
      secondary: "#a78bfa",
      accent: "#5b21b6",
      background: "#ffffff",
      text: "#1f2937",
    },
    styles: {
      title: { fontSize: 24, color: "#5b21b6" },
      sectionHeader: { fontSize: 17, color: "#6d28d9" },
      chartTitle: { fontSize: 16, color: "#6d28d9" },
    },
    chartStyles: {
      gridColor: "#ede9fe",
      axisColor: "#c4b5fd",
      tooltipBackgroundColor: "#f5f3ff",
    },
  },
  {
    id: "executive",
    name: "Executive",
    description: "Dark gray palette, strong for board reports",
    colorScheme: {
      primary: "#1f2937",
      secondary: "#6b7280",
      accent: "#111827",
      background: "#ffffff",
      text: "#111827",
    },
    styles: {
      title: { fontSize: 22, color: "#111827" },
      sectionHeader: { fontSize: 16, color: "#374151" },
      chartTitle: { fontSize: 15, color: "#374151" },
    },
    chartStyles: {
      gridColor: "#e5e7eb",
      axisColor: "#9ca3af",
      tooltipBackgroundColor: "#f9fafb",
    },
  },
  {
    id: "data",
    name: "Data-Driven",
    description: "Focused on clarity for data-heavy reports",
    colorScheme: {
      primary: "#0284c7",
      secondary: "#64748b",
      accent: "#0369a1",
      background: "#ffffff",
      text: "#0f172a",
    },
    styles: {
      title: { fontSize: 22, color: "#0369a1" },
      sectionHeader: { fontSize: 16, color: "#0284c7" },
      chartTitle: { fontSize: 15, color: "#0284c7" },
    },
    chartStyles: {
      gridColor: "#e2e8f0",
      axisColor: "#94a3b8",
      tooltipBackgroundColor: "#f8fafc",
    },
  },
  {
    id: "lightgray",
    name: "Light Gray",
    description: "Soft gray style for subtle professional reports",
    colorScheme: {
      primary: "#6b7280",
      secondary: "#d1d5db",
      accent: "#4b5563",
      background: "#ffffff",
      text: "#1f2937",
    },
    styles: {
      title: { fontSize: 22, color: "#4b5563" },
      sectionHeader: { fontSize: 16, color: "#6b7280" },
      chartTitle: { fontSize: 15, color: "#6b7280" },
    },
    chartStyles: {
      gridColor: "#f3f4f6",
      axisColor: "#d1d5db",
      tooltipBackgroundColor: "#ffffff",
    },
  },
  {
    id: "subtlepastel",
    name: "Subtle Pastel",
    description: "Gentle pastel colors with a modern touch",
    colorScheme: {
      primary: "#60a5fa",
      secondary: "#fca5a5",
      accent: "#fbbf24",
      background: "#ffffff",
      text: "#1f2937",
    },
    styles: {
      title: { fontSize: 22, color: "#2563eb" },
      sectionHeader: { fontSize: 16, color: "#60a5fa" },
      chartTitle: { fontSize: 15, color: "#fca5a5" },
    },
    chartStyles: {
      gridColor: "#f3f4f6",
      axisColor: "#d1d5db",
      tooltipBackgroundColor: "#ffffff",
    },
  },
  {
    id: "darkmode",
    name: "Dark Mode",
    description: "Dark theme for presentations on screen",
    colorScheme: {
      primary: "#2563eb",
      secondary: "#6b7280",
      accent: "#1e40af",
      background: "#111827",
      text: "#f9fafb",
    },
    styles: {
      title: { fontSize: 22, color: "#60a5fa" },
      sectionHeader: { fontSize: 16, color: "#93c5fd" },
      chartTitle: { fontSize: 15, color: "#93c5fd" },
    },
    chartStyles: {
      gridColor: "#1f2937",
      axisColor: "#6b7280",
      tooltipBackgroundColor: "#374151",
    },
  },
  {
    id: "sleek",
    name: "Sleek Black",
    description: "Premium black-and-white executive style",
    colorScheme: {
      primary: "#000000",
      secondary: "#6b7280",
      accent: "#111827",
      background: "#ffffff",
      text: "#000000",
    },
    styles: {
      title: { fontSize: 22, color: "#000000" },
      sectionHeader: { fontSize: 16, color: "#374151" },
      chartTitle: { fontSize: 15, color: "#111827" },
    },
    chartStyles: {
      gridColor: "#e5e7eb",
      axisColor: "#9ca3af",
      tooltipBackgroundColor: "#f9fafb",
    },
  },
  {
    id: "reportstandard",
    name: "Report Standard",
    description: "Looks like a default MS Office report theme",
    colorScheme: {
      primary: "#1d4ed8",
      secondary: "#6b7280",
      accent: "#1e3a8a",
      background: "#ffffff",
      text: "#111827",
    },
    styles: {
      title: { fontSize: 22, color: "#1e3a8a" },
      sectionHeader: { fontSize: 16, color: "#1d4ed8" },
      chartTitle: { fontSize: 15, color: "#2563eb" },
    },
    chartStyles: {
      gridColor: "#f3f4f6",
      axisColor: "#9ca3af",
      tooltipBackgroundColor: "#ffffff",
    },
  },
];

interface TemplateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: PDFTemplate) => void;
  selectedTemplateId?: string;
}

export function TemplateSelectionDialog({
  open,
  onOpenChange,
  onSelectTemplate,
  selectedTemplateId,
}: TemplateSelectionDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(
    selectedTemplateId
  );

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleConfirm = () => {
    const template = pdfTemplates.find((t) => t.id === selectedTemplate);
    if (template) {
      onSelectTemplate(template);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[90vw] max-h-[90vh] overflow-y-auto p-8 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Select PDF Template
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose a professional template for your report. Each one is designed
            with office use in mind.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-6 py-6">
          {pdfTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all border rounded-xl hover:shadow-md ${
                selectedTemplate === template.id
                  ? "ring-2 ring-blue-500 ring-offset-2"
                  : ""
              }`}
              onClick={() => handleSelectTemplate(template.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">
                    {template.name}
                  </CardTitle>
                  {selectedTemplate === template.id && (
                    <div className="bg-blue-600 rounded-full p-1">
                      <CheckIcon className="size-4 text-white" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {template.description}
                </p>
                {/* Color preview */}
                <div className="flex gap-1 mb-2">
                  {Object.values(template.colorScheme).map((c, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                {/* Mini text preview */}
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: template.styles.title.color }}
                  >
                    Report Title
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: template.styles.sectionHeader.color }}
                  >
                    Section Header
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedTemplate}>
            Apply Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
