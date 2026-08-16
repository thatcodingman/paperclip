import { fontMono, PaperclipFonts, PaperclipStyles, PaperclipBackdrop } from "../components/PaperclipChrome";

export default function Privacy() {
  return (
    <PaperclipBackdrop>
      <PaperclipFonts />
      <PaperclipStyles />
      <div className="pc-receipt" style={{
        width: 380, background: "#FFFDF6", color: "#1A1A1A", padding: "28px 24px", ...fontMono,
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
      }}>
        <a href="/" style={{ fontSize: 11, color: "#6B6B6B", textDecoration: "none" }}>&lt; BACK</a>
        <h1 style={{ fontSize: 18, margin: "12px 0 4px" }}>Privacy Policy</h1>
        <p style={{ fontSize: 10.5, color: "#999", margin: "0 0 16px" }}>Last updated August 2026</p>

        <h2 style={{ fontSize: 13, margin: "16px 0 6px" }}>Data we collect</h2>
        <p style={{ fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.7, margin: "0 0 14px" }}>
          None of our tools require an account. Receipts, timesheets, contracts, and expense reports you
          create are generated entirely in your browser and are never sent to us or any third party.
        </p>

        <h2 style={{ fontSize: 13, margin: "16px 0 6px" }}>Local storage</h2>
        <p style={{ fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.7, margin: "0 0 14px" }}>
          Your business profile (name, address, contact, logo) and appearance preferences are saved using
          your browser's local storage so they persist between visits. This data stays on your device and
          can be cleared at any time by clearing your browser data. Uploaded logos are stored as image data
          directly in your browser, never uploaded anywhere.
        </p>

        <h2 style={{ fontSize: 13, margin: "16px 0 6px" }}>Analytics and advertising</h2>
        <p style={{ fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.7, margin: "0 0 14px" }}>
          Papyri does not currently use analytics or display advertising. If that changes, this policy
          will be updated first to accurately describe what's added.
        </p>

        <h2 style={{ fontSize: 13, margin: "16px 0 6px" }}>Contact</h2>
        <p style={{ fontSize: 12.5, color: "#6B6B6B", lineHeight: 1.7 }}>
          Questions about this policy: <a href="mailto:pausedawg@gmail.com" style={{ color: "#C41E3A" }}>pausedawg@gmail.com</a>
        </p>
      </div>
    </PaperclipBackdrop>
  );
}
