"use client";

import React, { useEffect, useState, useRef } from "react";
import ExcelJS from "exceljs";
import * as pdfMakeImport from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Button } from "@/components/ui/button";

declare module "pdfmake/build/vfs_fonts" {
  export const pdfMake: { vfs: any };
}

const pdfMake = pdfMakeImport as any;
if (pdfFonts.pdfMake?.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
}

interface ExcelPreviewProps {
  file: File;
}

export default function ExcelPreview({ file }: ExcelPreviewProps) {
  const [rows, setRows] = useState<any[][]>([]);
  const [styles, setStyles] = useState<any[][]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
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
      exitButtonRef.current?.focus(); // Focus exit button for accessibility
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = ""; // Cleanup on unmount
    };
  }, [fullscreen]);

  useEffect(() => {
    if (!file) return;

    const readExcel = async () => {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      const sheetRows: any[][] = [];
      const sheetStyles: any[][] = [];

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
    };

    readExcel();
  }, [file]);

  const exportToPDF = () => {
    if (rows.length === 0) return;

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
        { text: file.name, style: "header" },
        {
          table: {
            headerRows: 1,
            widths: Array(rows[0].length).fill("*"),
            body,
          },
        },
      ],
      styles: {
        header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
      },
      defaultStyle: { fontSize: 10 },
      pageOrientation: "landscape",
    };

    pdfMake.createPdf(docDefinition).download(file.name.replace(".xlsx", ".pdf"));
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex gap-2">
        <Button onClick={exportToPDF} disabled={rows.length === 0}>
          Download as PDF
        </Button>
        <Button
          onClick={() => setFullscreen(!fullscreen)}
          disabled={rows.length === 0}
        >
          {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-gray-500">No data to display</p>
      ) : (
        <div
          ref={containerRef}
          className={`border rounded-lg relative transition-all duration-300 ${
            fullscreen
              ? "fixed top-0 left-0 w-screen h-screen z-50 bg-white p-4 overflow-auto"
              : "max-h-[80vh] overflow-auto"
          }`}
        >
          {fullscreen && (
            <button
              ref={exitButtonRef}
              onClick={() => setFullscreen(false)}
              className="absolute top-2 right-2 z-50 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              title="Exit Fullscreen"
              aria-label="Exit Fullscreen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <table className="min-w-max border-collapse w-full">
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b">
                  {row.map((cell: any, j: number) => {
                    const s = styles[i][j];
                    return (
                      <td
                        key={j}
                        className="px-4 py-2 border"
                        style={{
                          fontWeight: s.bold ? "bold" : undefined,
                          color: s.color,
                          backgroundColor: s.bgColor,
                        }}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}