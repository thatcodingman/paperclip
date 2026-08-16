import { useState, useEffect } from "react";
import { Receipt, Clock, FileText, PlaneTakeoff, Package, ArrowRight } from "lucide-react";
import { fontMono, PaperclipFonts, PaperclipStyles, PaperclipBackdrop, ToolBackgroundArt, StampWrapper } from "../components/PaperclipChrome";

const ITEMS = [
  { key: "receipt", icon: Receipt, title: "Receipt Generator", tag: "Free tool",
    desc: "Retail, service, rental, or freelance invoice — live calculating, printable, saves your business profile.", href: "/receipt" },
  { key: "timesheet", icon: Clock, title: "Timesheet Generator", tag: "Free tool",
    desc: "Weekly hours by day, auto-totaled, optional hourly pay calculation — printable and profile-aware.", href: "/timesheet" },
  { key: "contract", icon: FileText, title: "Contract Generator", tag: "Free tool",
    desc: "Toggle only the clauses you need — confidentiality, termination, payment terms, and more — and it assembles live.", href: "/contract" },
  { key: "expense", icon: PlaneTakeoff, title: "Expense Report", tag: "Free tool",
    desc: "Itemized expenses auto-grouped by category with running subtotals, plus a grand total.", href: "/expense" },
  { key: "packing", icon: Package, title: "Packing Slip", tag: "Free tool",
    desc: "What's in the box, no pricing — ship-to address, order reference, and item list.", href: "/packing" },
];

export default function Hub() {
  const [hovered, setHovered] = useState(null);
  useEffect(function () { document.title = "Papyri — Receipts & Invoices"; }, []);

  return (
    <PaperclipBackdrop>
      <PaperclipFonts />
      <PaperclipStyles />
      <ToolBackgroundArt glyphs={["$", "#", "%", "="]} />
      <StampWrapper>
        <div style={{ width: 380, ...fontMono }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#F5F2E8", letterSpacing: 0.5, margin: "0 0 4px" }}>
            PAPYRI
          </p>
          <p style={{ fontSize: 12, color: "#8A8A8A", margin: "0 0 24px" }}>
            receipts, invoices, and paperwork — generated instantly
          </p>

          {ITEMS.map(function (item) {
            const Icon = item.icon;
            const isHovered = hovered === item.key;
            return (
              <a key={item.key} href={item.href}
                onMouseEnter={function () { setHovered(item.key); }}
                onMouseLeave={function () { setHovered(null); }}
                style={{
                  display: "block", textDecoration: "none", color: "inherit",
                  background: "#141414", border: "1px solid " + (isHovered ? "#F5F2E8" : "#2A2A2A"),
                  borderRadius: 6, padding: "16px 16px", marginBottom: 12,
                  transition: "border-color 0.2s ease, transform 0.2s ease",
                  transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 4, background: "#1F1F1F",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon size={17} color="#F5F2E8" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{item.title}</span>
                      <span style={{ fontSize: 9, color: "#8A8A8A", textTransform: "uppercase",
                        letterSpacing: 0.5, border: "1px solid #2A2A2A", borderRadius: 4, padding: "1px 5px" }}>
                        {item.tag}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={15} color={isHovered ? "#F5F2E8" : "#8A8A8A"} />
                </div>
                <p style={{ fontSize: 12.5, color: "#8A8A8A", margin: "10px 0 0", lineHeight: 1.5 }}>{item.desc}</p>
              </a>
            );
          })}

          <div style={{ border: "1px dashed #2A2A2A", borderRadius: 6, padding: "12px 14px", textAlign: "center", marginTop: 4, marginBottom: 16 }}>
            <p style={{ fontSize: 10.5, color: "#666", margin: 0 }}>more paperwork tools coming</p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a href="/about" style={{ fontSize: 10, color: "#666", textDecoration: "none" }}>About</a>
            <a href="/contact" style={{ fontSize: 10, color: "#666", textDecoration: "none" }}>Contact</a>
            <a href="/faq" style={{ fontSize: 10, color: "#666", textDecoration: "none" }}>FAQ</a>
            <a href="/privacy" style={{ fontSize: 10, color: "#666", textDecoration: "none" }}>Privacy</a>
            <a href="/terms" style={{ fontSize: 10, color: "#666", textDecoration: "none" }}>Terms</a>
          </div>
        </div>
      </StampWrapper>
    </PaperclipBackdrop>
  );
}
