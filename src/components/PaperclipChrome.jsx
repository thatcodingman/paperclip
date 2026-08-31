import { useState, useEffect } from "react";

export const ink = "#1A1A1A";
export const sub = "#6B6B6B";
export const bg = "#0A0A0A";
export const stamp = "#C41E3A";
export const fontMono = { fontFamily: "'Courier New', 'Courier', monospace" };

export function PaperclipFonts() {
  return <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap" />;
}

export function PaperclipStyles() {
  return (
    <style>{"\
      @keyframes pcStampIn { 0% { opacity: 0; transform: scale(1.35) rotate(-3deg); } 60% { opacity: 1; transform: scale(0.97) rotate(1deg); } 100% { opacity: 1; transform: scale(1) rotate(0deg); } }\
      .pc-stamp { animation: pcStampIn 0.32s cubic-bezier(0.34, 1.56, 0.64, 1); }\
      @media print {\
        body * { visibility: hidden; }\
        .pc-receipt, .pc-receipt * { visibility: visible; }\
        .pc-receipt { position: absolute; top: 0; left: 0; width: 100% !important; box-shadow: none !important; }\
        .pc-no-print { display: none !important; }\
      }\
      .pc-ui-light { background: #F0EFE9 !important; }\
      .pc-ui-light p { color: #1A1A1A !important; }\
      .pc-ui-light input, .pc-ui-light select, .pc-ui-light textarea {\
        background: #FFFFFF !important; color: #1A1A1A !important; border-color: #D8D6CE !important;\
      }\
      .pc-ui-light > div { background: #FAFAF6 !important; border-color: #E2E0D8 !important; }\
      .pc-ui-light button { color: #1A1A1A !important; border-color: #D8D6CE !important; }\
    "}</style>
  );
}

export function PaperclipBackdrop({ children }) {
  return (
    <div style={{
      display: "flex", justifyContent: "center", background: bg, minHeight: "100vh",
      padding: "30px 16px", flexWrap: "wrap", gap: 24,
    }}>
      {children}
    </div>
  );
}

// Faint, per-tool black-line-art scene sitting behind the card — pass a set
// of small line-icon glyphs unique to each tool, so Receipt vs. Timesheet
// vs. whatever comes next each get their own quiet visual identity while
// staying inside the same black/white paper theme.
export function ToolBackgroundArt({ glyphs, color }) {
  const positions = [
    { top: "8%", left: "6%", size: 46, rotate: -12 },
    { top: "14%", right: "8%", size: 34, rotate: 8 },
    { bottom: "12%", left: "10%", size: 38, rotate: 6 },
    { bottom: "18%", right: "6%", size: 50, rotate: -8 },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {positions.map(function (pos, i) {
        const glyph = glyphs[i % glyphs.length];
        return (
          <span key={i} style={Object.assign({
            position: "absolute", fontSize: pos.size, color: color || "#F0C93A", opacity: 0.08,
            transform: "rotate(" + pos.rotate + "deg)", fontFamily: "'Courier New', monospace",
          }, pos)}>{glyph}</span>
        );
      })}
    </div>
  );
}

// Applies the entrance animation immediately on mount — no delay, no
// remount trick. CSS animations already trigger automatically the moment
// an element with the class appears in the DOM.
export function StampWrapper({ children }) {
  return <div className="pc-stamp" style={{ position: "relative", zIndex: 1 }}>{children}</div>;
}

// Numbered progress rail for the step-by-step generator flow (Business →
// Items → Generate, etc). Shared across all 5 tools so the wizard looks
// and behaves identically everywhere.
// Numbered progress rail for the step-by-step generator flow (Business →
// Items → Generate, etc). Shared across all 5 tools so the wizard looks
// and behaves identically everywhere. Completed steps are clickable —
// this doubles as the "jump back to a section" affordance from any
// later step, including the final review screen, without needing
// separate edit buttons scattered around.
export function WizardProgress({ steps, currentIndex, onStepClick }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 22, ...fontMono }}>
      {steps.map(function (step, i) {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const clickable = done && !!onStepClick;
        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center", flex: i === steps.length - 1 ? "0 0 auto" : 1 }}>
            <div
              onClick={clickable ? function () { onStepClick(i); } : undefined}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, cursor: clickable ? "pointer" : "default" }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700,
                background: active || done ? "#F5F2E8" : "#1A1A1A",
                color: active || done ? "#0A0A0A" : "#666",
                border: "1px solid " + (active || done ? "#F5F2E8" : "#333"),
                transition: "all 0.2s ease",
              }}>
                {done ? "\u2713" : i + 1}
              </div>
              <span style={{ fontSize: 8.5, color: active ? "#F5F2E8" : "#666", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.4, whiteSpace: "nowrap" }}>
                {step.label}
              </span>
            </div>
            {i !== steps.length - 1 && (
              <div style={{ flex: 1, height: 1, background: done ? "#F5F2E8" : "#2A2A2A", margin: "0 6px 14px", transition: "background 0.2s ease" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Back / Continue nav for a wizard step. The last step renders neither —
// its own action button (Print, Generate, etc) is the finishing move.
// Pass `blocked` + `blockedMessage` to gate Continue on required fields —
// the message explains what's missing rather than just disabling silently.
export function WizardNav({ onBack, onNext, isFirst, isLast, nextLabel, blocked, blockedMessage }) {
  if (isFirst && isLast) return null;
  return (
    <div style={{ marginTop: 4, marginBottom: 20 }}>
      {blocked && blockedMessage && (
        <p style={{ ...fontMono, fontSize: 11, color: "#FB923C", margin: "0 0 8px" }}>{blockedMessage}</p>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        {!isFirst && (
          <button onClick={onBack} style={{
            flex: "0 0 auto", padding: "10px 16px", borderRadius: 4, border: "1px solid #333", background: "none",
            color: "#8A8A8A", fontSize: 12, cursor: "pointer", ...fontMono }}>
            &larr; Back
          </button>
        )}
        {!isLast && (
          <button onClick={blocked ? undefined : onNext} disabled={!!blocked} style={{
            flex: 1, padding: "10px 16px", borderRadius: 4, border: "none",
            background: blocked ? "#2A2A2A" : "#F5F2E8",
            color: blocked ? "#666" : "#0A0A0A", fontSize: 12, fontWeight: 700,
            cursor: blocked ? "not-allowed" : "pointer", ...fontMono }}>
            {nextLabel || "Continue \u2192"}
          </button>
        )}
      </div>
    </div>
  );
}

// Generic draft autosave — persists a tool's in-progress form state
// (and which step it was on) to localStorage, so refreshing or coming
// back later doesn't lose everything. Each tool passes its own plain
// object of fields; restored on mount, cleared once a document is
// actually generated (or the user explicitly starts another).
const DRAFT_PREFIX = "papyri-draft-";
export function saveDraft(toolKey, data) {
  try { window.localStorage.setItem(DRAFT_PREFIX + toolKey, JSON.stringify(data)); } catch (e) {}
}
export function loadDraft(toolKey) {
  try {
    const raw = window.localStorage.getItem(DRAFT_PREFIX + toolKey);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}
export function clearDraft(toolKey) {
  try { window.localStorage.removeItem(DRAFT_PREFIX + toolKey); } catch (e) {}
}

// "Start Another" — secondary action on the Generate step, next to
// Print. Resets the tool back to a blank document without leaving
// the page or losing the saved business profile.
export function StartAnotherButton({ onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", marginTop: 8, padding: "10px 0", borderRadius: 4, border: "1px solid #333", background: "none",
      color: "#8A8A8A", fontSize: 12, cursor: "pointer", ...fontMono }}>
      Start another →
    </button>
  );
}

// Downloads the current profile as a JSON file the user can re-import later
// or on another device.
export function exportProfileFile(profile) {
  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "paperclip-profile.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Reads a chosen JSON file back into a profile object via callback.
export function readProfileFile(file, onLoaded) {
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const parsed = JSON.parse(reader.result);
      if (parsed && typeof parsed === "object") onLoaded(parsed);
    } catch (e) {}
  };
  reader.readAsText(file);
}

// Reads an uploaded image file as a base64 data URL for the logo.
export function readLogoFile(file, onLoaded) {
  const reader = new FileReader();
  reader.onload = function () { onLoaded(reader.result); };
  reader.readAsDataURL(file);
}

// Persistent, sequential per-document-type numbering (RCPT-0001, TIME-0001,
// etc.) instead of a random number on every load — saved in localStorage,
// keyed by document kind so each tool has its own counter.
export function nextDocNumber(kind, prefix) {
  const key = "paperclip-docnum-" + kind;
  let n = 1;
  try {
    const raw = window.localStorage.getItem(key);
    n = raw ? parseInt(raw, 10) + 1 : 1;
    window.localStorage.setItem(key, String(n));
  } catch (e) {}
  return (prefix || "#") + String(n).padStart(4, "0");
}

// Structured data so search engines understand this is a free web app —
// can surface richer results ("Free" badge, etc). Renders on the Hub and
// on every tool page, each with its own name/description/URL so search
// engines see distinct structured data per page instead of one blob
// repeated everywhere. Info pages (About/Contact/Privacy/etc.) pass a
// schemaType of their own (AboutPage, ContactPage, WebPage...) since
// "WebApplication" only makes sense for the Hub and the 5 tools.
export function PaperclipStructuredData({ name, description, path, schemaType }) {
  const data = {
    "@context": "https://schema.org",
    "@type": schemaType || "WebApplication",
    "name": name || "Papyri",
    "url": "https://getpapyri.com" + (path || ""),
    "description": description || "Free browser-only paperwork tools: a receipt/invoice generator, timesheet generator, contract generator, expense report, and packing slip generator. No signup, nothing ever leaves your browser.",
    "isPartOf": { "@type": "WebSite", "name": "Papyri", "url": "https://getpapyri.com" },
  };
  if (!schemaType || schemaType === "WebApplication") {
    data.applicationCategory = "BusinessApplication";
    data.operatingSystem = "Any (runs in browser)";
    data.offers = { "@type": "Offer", "price": "0", "priceCurrency": "USD" };
  }
  return <script type="application/ld+json">{JSON.stringify(data)}</script>;
}

// FAQPage structured data — takes the same {q, a} list the FAQ page
// already renders, so search engines can pull real answers into results.
export function PaperclipFAQStructuredData({ faqs }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(function (item) {
      return {
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": { "@type": "Answer", "text": item.a },
      };
    }),
  };
  return <script type="application/ld+json">{JSON.stringify(data)}</script>;
}

// Small QR code printed in the corner of documents, linking back to the
// site. Uses the same 'qrcode' package as CipherForge's TOTP tool.
export function DocumentQR() {
  const [dataUrl, setDataUrl] = useState("");
  useEffect(function () {
    let cancelled = false;
    import("qrcode").then(function (QRCode) {
      QRCode.toDataURL("https://getpapyri.com", { margin: 0, width: 60, color: { dark: "#1A1A1A", light: "#00000000" } })
        .then(function (url) { if (!cancelled) setDataUrl(url); })
        .catch(function () {});
    });
    return function () { cancelled = true; };
  }, []);
  if (!dataUrl) return null;
  return <img src={dataUrl} alt="getpapyri.com" style={{ width: 34, height: 34, opacity: 0.6 }} />;
}

export const CURRENCIES = {
  USD: { symbol: "$", label: "USD" },
  EUR: { symbol: "€", label: "EUR" },
  GBP: { symbol: "£", label: "GBP" },
  CAD: { symbol: "CA$", label: "CAD" },
  AUD: { symbol: "AU$", label: "AUD" },
  JPY: { symbol: "¥", label: "JPY" },
  INR: { symbol: "₹", label: "INR" },
};
export function fmtCurrency(n, currencyCode) {
  const c = CURRENCIES[currencyCode] || CURRENCIES.USD;
  return c.symbol + (Number(n) || 0).toFixed(2);
}

// Recently generated document history — shared across every tool, keyed by
// document type so each tool only sees its own past entries. Stores the
// full form state so "Load" can restore it exactly, not just show a summary.
const HISTORY_KEY = "papyri-history-v1";
const HISTORY_LIMIT_PER_KIND = 8;

export function saveToHistory(kind, docNo, summary, state) {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const entry = { id: Math.random().toString(36).slice(2), kind: kind, docNo: docNo, summary: summary, state: state, savedAt: Date.now() };
    const sameKind = list.filter(function (e) { return e.kind === kind; });
    const otherKinds = list.filter(function (e) { return e.kind !== kind; });
    const nextSameKind = [entry].concat(sameKind).slice(0, HISTORY_LIMIT_PER_KIND);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextSameKind.concat(otherKinds)));
  } catch (e) {}
}

export function loadHistory(kind) {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return list.filter(function (e) { return e.kind === kind; });
  } catch (e) { return []; }
}
