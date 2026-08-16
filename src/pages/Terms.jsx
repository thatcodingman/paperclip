import { fontMono, PaperclipFonts, PaperclipStyles, PaperclipBackdrop } from "../components/PaperclipChrome";

export default function Terms() {
  return (
    <PaperclipBackdrop>
      <PaperclipFonts />
      <PaperclipStyles />
      <div className="pc-receipt" style={{
        width: 380, background: "#FFFDF6", color: "#1A1A1A", padding: "28px 24px", ...fontMono,
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
      }}>
        <a href="/" style={{ fontSize: 11, color: "#6B6B6B", textDecoration: "none" }}>&lt; BACK</a>
        <h1 style={{ fontSize: 18, margin: "12px 0 4px" }}>Terms of Use</h1>
        <p style={{ fontSize: 10.5, color: "#999", margin: "0 0 16px" }}>Last updated August 2026</p>

        <h2 style={{ fontSize: 13, margin: "16px 0 6px" }}>Free to use</h2>
        <p style={{ fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.7, margin: "0 0 14px" }}>
          Papyri's tools are free, with no signup or account required.
        </p>

        <h2 style={{ fontSize: 13, margin: "16px 0 6px" }}>Not professional advice</h2>
        <p style={{ fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.7, margin: "0 0 14px" }}>
          The Contract Generator produces plain-language documents for convenience — it is not legal advice,
          and we recommend a lawyer review any agreement used for something important. Receipts, timesheets,
          and expense reports are calculation tools, not accounting or tax advice.
        </p>

        <h2 style={{ fontSize: 13, margin: "16px 0 6px" }}>No warranty</h2>
        <p style={{ fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.7, margin: "0 0 14px" }}>
          Papyri is provided "as is," without warranties of any kind. We're not liable for any loss or
          issue resulting from use of these tools or documents generated with them.
        </p>

        <h2 style={{ fontSize: 13, margin: "16px 0 6px" }}>Advertising</h2>
        <p style={{ fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.7, margin: "0 0 14px" }}>
          Papyri does not currently display advertising. If that changes, this section will be updated to
          accurately disclose it.
        </p>

        <h2 style={{ fontSize: 13, margin: "16px 0 6px" }}>Changes</h2>
        <p style={{ fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.7 }}>
          We may update these terms or the tools themselves at any time. Continued use of the site means you
          accept the current version of these terms.
        </p>
      </div>
    </PaperclipBackdrop>
  );
}
