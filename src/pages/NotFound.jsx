import { fontMono, PaperclipFonts, PaperclipStyles, PaperclipBackdrop } from "../components/PaperclipChrome";

export default function NotFound() {
  return (
    <PaperclipBackdrop>
      <PaperclipFonts />
      <PaperclipStyles />
      <div className="pc-receipt" style={{
        width: 340, background: "#FFFDF6", color: "#1A1A1A", padding: "40px 24px", ...fontMono, textAlign: "center",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
      }}>
        <p style={{ fontSize: 40, margin: "0 0 8px" }}>404</p>
        <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>Page not found</p>
        <p style={{ fontSize: 12, color: "#6B6B6B", lineHeight: 1.6, margin: "0 0 20px" }}>
          That page doesn't exist — maybe a typo in the link.
        </p>
        <a href="/" style={{
          display: "inline-block", padding: "10px 24px", borderRadius: 4, background: "#1A1A1A", color: "#FFFDF6",
          textDecoration: "none", fontSize: 12, fontWeight: 700 }}>
          Back to Hub
        </a>
      </div>
    </PaperclipBackdrop>
  );
}
