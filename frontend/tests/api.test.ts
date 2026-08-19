import { afterEach, describe, expect, it, vi } from "vitest";

import { analyzeDocument, analyzeFile, askFollowUp, checkHealth } from "@/lib/api";

const analysisResponse = {
  mode: "privacy_beleid",
  summary: ["Een punt"],
  red_flags: [],
  suggestions: [],
  privacy_score: 7,
  privacy_motivatie: "Goede basis",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("API client", () => {
  it("sends a JSON analysis request", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(analysisResponse), { status: 200 }),
    );

    const result = await analyzeDocument({ text: "Een privacybeleid", mode: "privacy_beleid" });

    expect(result).toEqual(analysisResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/analyze",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Een privacybeleid", mode: "privacy_beleid" }),
      }),
    );
  });

  it("translates API errors into an Error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ detail: "Dagelijkse limiet bereikt" }), { status: 429 }),
    );

    await expect(analyzeDocument({ text: "tekst" })).rejects.toThrow("Dagelijkse limiet bereikt");
  });

  it("sends follow-up chat history", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ answer: "Antwoord" }), { status: 200 }),
    );
    const request = {
      question: "Wat betekent dit?",
      context_text: "Een document",
      history: [{ role: "user" as const, content: "Eerdere vraag" }],
    };

    await askFollowUp(request);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/chat",
      expect.objectContaining({ body: JSON.stringify(request) }),
    );
  });

  it("uploads a file as multipart form data", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(analysisResponse), { status: 200 }),
    );
    const file = new File(["document"], "document.pdf", { type: "application/pdf" });

    await analyzeFile(file, "algemene_voorwaarden", "Voorwaarden");

    const options = fetchMock.mock.calls[0][1];
    expect(fetchMock.mock.calls[0][0]).toBe("http://127.0.0.1:8000/analyze-file");
    expect(options?.method).toBe("POST");
    expect(options?.body).toBeInstanceOf(FormData);
    expect((options?.body as FormData).get("mode")).toBe("algemene_voorwaarden");
    expect((options?.body as FormData).get("document_name")).toBe("Voorwaarden");
  });

  it("checks backend health", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "healthy", service: "ClearClause Suite" }), { status: 200 }),
    );

    await expect(checkHealth()).resolves.toEqual({ status: "healthy", service: "ClearClause Suite" });
  });
});
