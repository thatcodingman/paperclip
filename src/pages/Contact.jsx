import { useEffect } from "react";
import { fontMono, PaperclipFonts, PaperclipStyles, PaperclipBackdrop, PaperclipStructuredData } from "../components/PaperclipChrome";

export default function Contact() {
  useEffect(function () { document.title = "Contact — Papyri"; }, []);

  return (
    <PaperclipBackdrop>
      <PaperclipFonts />
      <PaperclipStructuredData
        schemaType="ContactPage"
        name="Contact Papyri"
        description="Get in touch about Papyri's free receipt, invoice, timesheet, contract, and expense report generators."
        path="/contact"
      />
      <PaperclipStyles />
      <div className="pc-receipt" style={{
        width: 380, background: "#FFFDF6", color: "#1A1A1A", padding: "28px 24px", ...fontMono,
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
      }}>
        <a href="/" style={{ fontSize: 11, color: "#6B6B6B", textDecoration: "none" }}>&lt; BACK</a>
        <h1 style={{ fontSize: 18, margin: "12px 0 16px" }}>Contact</h1>
        <p style={{ fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.7, margin: "0 0 14px" }}>
          Bug report, feature idea, or something looks off? Reach out any time.
        </p>
        <p style={{ fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.7 }}>
          <a href="mailto:pausedawg@gmail.com" style={{ color: "#C41E3A" }}>pausedawg@gmail.com</a>
        </p>
      </div>
    </PaperclipBackdrop>
  );
}
