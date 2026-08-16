import { fontMono, PaperclipFonts, PaperclipStyles, PaperclipBackdrop } from "../components/PaperclipChrome";

export default function About() {
  return (
    <PaperclipBackdrop>
      <PaperclipFonts />
      <PaperclipStyles />
      <div className="pc-receipt" style={{
        width: 380, background: "#FFFDF6", color: "#1A1A1A", padding: "28px 24px", ...fontMono,
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
      }}>
        <a href="/" style={{ fontSize: 11, color: "#6B6B6B", textDecoration: "none" }}>&lt; BACK</a>
        <h1 style={{ fontSize: 18, margin: "12px 0 16px" }}>About Papyri</h1>
        <p style={{ fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.7, margin: "0 0 14px" }}>
          Papyri is a set of free, printable business paperwork tools: receipts, invoices, timesheets,
          service agreements, and expense reports. Everything runs in your browser — no signup, no server
          storage of what you type.
        </p>
        <p style={{ fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.7, margin: "0 0 14px" }}>
          Your business profile (name, address, contact, logo) is saved locally in your browser so you only
          fill it in once. You can export it as a file and import it on another device at any time.
        </p>
        <p style={{ fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.7 }}>
          Questions? Visit the <a href="/contact" style={{ color: "#C41E3A" }}>Contact</a> page.
        </p>
      </div>
    </PaperclipBackdrop>
  );
}
