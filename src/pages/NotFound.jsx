import { useEffect } from "react";
import { fontMono, stamp, PaperclipFonts, PaperclipStyles, PaperclipBackdrop, ToolBackgroundArt, StampWrapper } from "../components/PaperclipChrome";

const MARK_PATH = "M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z";

export default function NotFound() {
  useEffect(function () {
    document.title = "404 — Not on File — Papyri";

    // Search engines shouldn't index this page. Netlify's SPA redirect
    // serves this with a 200 status, so a robots meta tag is the only
    // signal we can send — added on mount, removed on unmount so it
    // never leaks onto a real route if the router re-renders in place.
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return function () { document.head.removeChild(meta); };
  }, []);

  return (
    <PaperclipBackdrop>
      <PaperclipFonts />
      <PaperclipStyles />
      <ToolBackgroundArt glyphs={["?", "!", "\u00D8", "\u2715"]} color="#863bff" />
      <StampWrapper>
        <div style={{ width: 360, ...fontMono }}>
          <div style={{
            position: "relative", overflow: "hidden", background: "#FFFDF6", color: "#1A1A1A",
            padding: "36px 26px 30px", textAlign: "center", borderRadius: 3,
            boxShadow: "0 10px 40px rgba(0,0,0,0.55)",
          }}>
            <svg width="34" height="33" viewBox="0 0 48 46" style={{ margin: "0 auto 14px", display: "block" }}>
              <defs>
                <linearGradient id="notFoundMark" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a566ff" />
                  <stop offset="55%" stopColor="#863bff" />
                  <stop offset="100%" stopColor="#47bfff" />
                </linearGradient>
              </defs>
              <path fill="url(#notFoundMark)" d={MARK_PATH} />
            </svg>

            <p style={{ fontSize: 10, letterSpacing: 1.5, color: "#9A9A9A", margin: "0 0 4px", textTransform: "uppercase" }}>
              Document Reference
            </p>
            <p style={{ fontSize: 34, fontWeight: 700, margin: "0 0 14px", letterSpacing: 1 }}>
              ERR-0404
            </p>

            <div style={{ borderTop: "1px dashed #D8D6CE", borderBottom: "1px dashed #D8D6CE", padding: "14px 0", margin: "0 0 18px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 6px" }}>Nothing filed under this path.</p>
              <p style={{ fontSize: 11.5, color: "#6B6B6B", lineHeight: 1.6, margin: 0 }}>
                The page you're looking for was never issued, or the link has a typo.
              </p>
            </div>

            <a href="/" style={{
              display: "inline-block", padding: "10px 26px", borderRadius: 4, background: "#1A1A1A",
              color: "#FFFDF6", textDecoration: "none", fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
            }}>
              Back to Hub
            </a>

            <div aria-hidden="true" style={{
              position: "absolute", top: 30, right: -6, width: 128, textAlign: "center",
              color: stamp, border: "3.5px solid " + stamp, borderRadius: 6,
              padding: "4px 6px", fontSize: 20, fontWeight: 700, letterSpacing: 2,
              transform: "rotate(14deg)", opacity: 0.85, textTransform: "uppercase",
            }}>
              Void
            </div>
          </div>

          <p style={{ fontSize: 10, color: "#666", textAlign: "center", margin: "16px 0 0" }}>
            getpapyri.com
          </p>
        </div>
      </StampWrapper>
    </PaperclipBackdrop>
  );
}
