import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AscentLog from "../AscentLog";

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn((url, opts) => {
    if (/\/ascents\/climb(\/|$)/.test(url)) {
      // Always return success for any GET to ascents/climb
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes("/ascents/")) {
      if (opts && opts.method === "POST") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ grade: "V2", notes: "Test note", id: 1, date: new Date().toISOString() }) });
      }
    }
    return Promise.resolve({ ok: false, text: () => Promise.resolve("Error") });
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("AscentLog", () => {
  it("renders form and logs ascent", async () => {
    render(<AscentLog climbId={1} token="demo-token" />);
    expect(await screen.findByText("Log an Ascent")).toBeInTheDocument();
    fireEvent.change(await screen.findByPlaceholderText("e.g. V3, 5.11a"), { target: { value: "V2" } });
    fireEvent.change(await screen.findByPlaceholderText("Optional notes"), { target: { value: "Test note" } });
    fireEvent.click(await screen.findByText("Log Ascent"));
    // Wait for the success message to appear
    expect(await screen.findByText(/ascent logged/i)).toBeInTheDocument();
  });

  it("shows error on failed log", async () => {
    global.fetch.mockImplementationOnce(() => Promise.resolve({ ok: false, text: () => Promise.resolve("Failed") }));
    render(<AscentLog climbId={1} token="demo-token" />);
    fireEvent.change(screen.getByPlaceholderText("e.g. V3, 5.11a"), { target: { value: "V4" } });
    fireEvent.click(screen.getByText("Log Ascent"));
    await waitFor(() => expect(screen.getByText(/Failed/)).toBeInTheDocument());
  });

  it("shows ascent history if present", async () => {
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 2, grade: "V3", notes: "History note", date: new Date().toISOString() }]),
    }));
    render(<AscentLog climbId={2} token="demo-token" />);
    await waitFor(() => expect(screen.getByText(/V3/)).toBeInTheDocument());
    expect(screen.getByText(/History note/)).toBeInTheDocument();
  });
});
