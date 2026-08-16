export const ink = "#1A1A1A";
export const sub = "#6B6B6B";
export const paperDefault = "#FFFDF6";
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
