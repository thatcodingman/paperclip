import { fontMono, PaperclipFonts, PaperclipStyles, PaperclipBackdrop } from "../components/PaperclipChrome";

const FAQS = [
  { q: "Is anything I type sent to a server?", a: "No. Every document — receipts, timesheets, contracts, expense reports — is generated entirely in your browser. Nothing is transmitted anywhere." },
  { q: "Where is my business profile saved?", a: "In your browser's local storage on this device only. You can export it as a file and import it on another device or browser at any time." },
  { q: "Are the contract clauses legally binding?", a: "The Contract Generator produces a plain-language agreement, not legal advice. For anything high-stakes, have a lawyer review it before using it." },
  { q: "Can I print these, or only save as PDF?", a: "Both — the Print button opens your browser's normal print dialog, where you can choose a physical printer or 'Save as PDF.'" },
  { q: "Do document numbers repeat?", a: "No — each document type (receipt, timesheet, contract, expense report) has its own sequential counter saved in your browser, so numbers increase each time you generate a new one." },
];

export default function FAQ() {
  return (
    <PaperclipBackdrop>
      <PaperclipFonts />
      <PaperclipStyles />
      <div className="pc-receipt" style={{
        width: 380, background: "#FFFDF6", color: "#1A1A1A", padding: "28px 24px", ...fontMono,
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
      }}>
        <a href="/" style={{ fontSize: 11, color: "#6B6B6B", textDecoration: "none" }}>&lt; BACK</a>
        <h1 style={{ fontSize: 18, margin: "12px 0 16px" }}>FAQ</h1>
        {FAQS.map(function (item) {
          return (
            <div key={item.q} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12.5, fontWeight: 700, margin: "0 0 4px" }}>{item.q}</p>
              <p style={{ fontSize: 12, color: "#6B6B6B", lineHeight: 1.7, margin: 0 }}>{item.a}</p>
            </div>
          );
        })}
      </div>
    </PaperclipBackdrop>
  );
}
