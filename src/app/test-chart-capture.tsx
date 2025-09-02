"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { captureChartsWithRetry } from "@/lib/chart-to-pdf";
import { ProcessedChartData } from "@/lib/chart-utils";

export default function ChartCaptureTest() {
  const [captureResult, setCaptureResult] = useState<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const testChartData: ProcessedChartData = {
    config: {
      type: "bar",
      title: "Test Chart",
      description: "A test chart for capture testing",
      xAxis: "0",
      yAxis: "1",
      dataKey: "1",
      priority: 1,
      analyticalValue: "High"
    },
    data: [
      { x: "A", value: 10 },
      { x: "B", value: 20 },
      { x: "C", value: 30 }
    ],
    colors: ["#2563eb", "#6b7280", "#1e40af"],
    metadata: {
      totalDataPoints: 3,
      dataRange: { min: 10, max: 30 },
      categories: ["A", "B", "C"]
    }
  };

  const handleCaptureTest = async () => {
    setIsCapturing(true);
    setCaptureResult(null);

    try {
      // Create a simple chart element for testing
      if (chartRef.current) {
        chartRef.current.innerHTML = `
          <div style="width: 400px; height: 300px; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
            <h2>Test Chart</h2>
          </div>
        `;
      }

      const result = await captureChartsWithRetry(
        [chartRef.current],
        [testChartData],
        3
      );

      setCaptureResult(result);
    } catch (error: unknown) {
      console.error("Capture test failed:", error);
      // Type guard to check if error has a message property
      const errorMessage = error instanceof Error ? error.message : String(error);
      setCaptureResult({ error: errorMessage });
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Chart Capture Test</h1>
      
      <div className="mb-6">
        <Button onClick={handleCaptureTest} disabled={isCapturing}>
          {isCapturing ? "Capturing..." : "Test Chart Capture"}
        </Button>
      </div>

      <div 
        ref={chartRef} 
        className="border rounded-lg p-4 mb-6"
        style={{ width: "400px", height: "300px" }}
      >
        <p>Chart will appear here for testing</p>
      </div>

      {captureResult && (
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Capture Result:</h2>
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(captureResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}