"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";

import type { AnalysisResponse } from "@/lib/api";
import { AnalysisPDF } from "./AnalysisPDF";
import { Button } from "@/components/ui/button";

export function ExportResultaten({ data, documentName = "Document", reviewStatuses = {} }: { data: AnalysisResponse; documentName?: string; reviewStatuses?: Record<string, string> }) {
  const filename = `clearclause-analyse-${data.mode}.pdf`;

  return (
    <PDFDownloadLink
      document={<AnalysisPDF data={data} documentName={documentName} reviewStatuses={reviewStatuses} />}
      fileName={filename}
    >
      {({ loading }) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={loading}
          className="gap-2 border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 hover:text-white"
        >
          <Download className="h-4 w-4" />
          {loading ? "PDF voorbereiden..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
