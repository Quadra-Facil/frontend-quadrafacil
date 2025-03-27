// src/types/jspdf.d.ts
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
      pageNumber?: number;
      cursor?: { x: number; y: number };
    };
    autoTable?: (options: any) => jsPDF;
  }
}