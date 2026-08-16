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
