// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ResultatenDashboard } from "@/components/ResultatenDashboard";
import type { AnalysisResponse } from "@/lib/api";

vi.mock("@/components/export/ExportResultaten", () => ({
  ExportResultaten: () => React.createElement("button", { type: "button" }, "Download PDF"),
}));

const baseResult = {
  summary: ["Een heldere samenvatting"],
  red_flags: [],
  suggestions: ["Controleer de bewaartermijn"],
  privacy_score: 7,
  privacy_motivatie: "Goede basis",
  analyzedText: "Een document",
};

describe("ResultatenDashboard", () => {
  it("renders privacy-specific details", () => {
    const data: AnalysisResponse = {
      ...baseResult,
      mode: "privacy_beleid",
      data_categories: ["Naam", "E-mailadres"],
      third_parties: ["Hostingprovider"],
      retention_policies: "Twee jaar",
    };

    render(<ResultatenDashboard data={data} analyzedText={baseResult.analyzedText} />);

    expect(screen.getByText("Privacy-inzichten")).toBeInTheDocument();
    expect(screen.getByText("E-mailadres")).toBeInTheDocument();
    expect(screen.getByText("Hostingprovider")).toBeInTheDocument();
    expect(screen.getByText("Twee jaar")).toBeInTheDocument();
    expect(screen.getByText("GDPR Score")).toBeInTheDocument();
  });

  it("renders a response letter and its review status", () => {
    const data: AnalysisResponse = {
      ...baseResult,
      mode: "reactie_brief",
      draft_letter: "Geachte heer/mevrouw,\n\nHierbij reageer ik op uw brief.",
      tone: "Diplomatiek",
      key_points: ["Vraag om toelichting"],
      legal_review_needed: true,
    };

    render(<ResultatenDashboard data={data} analyzedText={baseResult.analyzedText} />);

    expect(screen.getByText("Conceptbrief")).toBeInTheDocument();
    expect(screen.getByText("Diplomatiek", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Juridische review aanbevolen")).toBeInTheDocument();
    expect(screen.getByText(/Hierbij reageer ik/)).toBeInTheDocument();
  });
});
