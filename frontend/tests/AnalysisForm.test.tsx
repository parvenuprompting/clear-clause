// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AnalysisForm } from "@/components/AnalysisForm";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement("span", props),
}));

describe("AnalysisForm", () => {
  it("keeps analysis disabled until text or a file is supplied", () => {
    const onSubmit = vi.fn();
    const { container } = render(<AnalysisForm onSubmit={onSubmit} isLoading={false} />);
    const analyzeButton = screen.getByRole("button", { name: "ANALYSEER" });

    expect(analyzeButton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("Plak hier je juridische tekst..."), {
      target: { value: "Een juridische tekst" },
    });
    expect(analyzeButton).not.toBeDisabled();

    const fileInput = container.querySelector("#file-upload") as HTMLInputElement;
    const file = new File(["pdf-content"], "voorwaarden.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(analyzeButton).not.toBeDisabled();
  });

  it("submits the selected text and mode", () => {
    const onSubmit = vi.fn();
    render(<AnalysisForm onSubmit={onSubmit} isLoading={false} initialMode="privacy_beleid" />);

    fireEvent.change(screen.getByPlaceholderText("Plak hier je juridische tekst..."), {
      target: { value: "Privacytekst" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ANALYSEER" }));

    expect(onSubmit).toHaveBeenCalledWith(
      "Privacytekst",
      "Onbekend Document",
      "privacy_beleid",
      undefined,
      undefined,
    );
  });
});
