import { useState, useEffect, useMemo, useRef, Component } from "react";
import { Plus, X, Printer, Save, Edit2, Check, Settings, ArrowLeft, Upload, Download, Image, History, RotateCcw } from "lucide-react";
import { ink, sub, bg, fontMono, PaperclipFonts, PaperclipStyles, PaperclipBackdrop, ToolBackgroundArt, StampWrapper, PaperclipStructuredData, exportProfileFile, readProfileFile, readLogoFile, nextDocNumber, DocumentQR, saveToHistory, loadHistory } from "../components/PaperclipChrome";

const PAPER_TONES = {
  cream: { label: "Cream", paper: "#FFFDF6", line: "#D8D4C8" },
  white: { label: "Bright White", paper: "#FFFFFF", line: "#E0E0E0" },
  kraft: { label: "Kraft", paper: "#EFE3C8", line: "#D6C49E" },
};
const SIZES = {
  narrow: { label: "Narrow (58mm)", width: 250 },
  standard: { label: "Standard (80mm)", width: 320 },
  wide: { label: "Full Page", width: 420 },
};

const PROFILE_KEY = "paperclip-profile-v1";
const APPEARANCE_KEY = "paperclip-appearance-v1";

function loadProfile() {
  try { const raw = window.localStorage.getItem(PROFILE_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  return { name: "", address: "", contact: "", logo: "" };
}
function loadAppearance() {
  try { const raw = window.localStorage.getItem(APPEARANCE_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  return { size: "standard", tone: "cream", uiLight: false };
}
function saveAppearance(val) {
  try { window.localStorage.setItem(APPEARANCE_KEY, JSON.stringify(val)); } catch (e) {}
}

function sanitizeNumericInput(value) {
  let v = value.replace(/[^0-9.]/g, "");
  const parts = v.split(".");
  if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
  return v;
}

function makeItem() {
  return { id: Math.random().toString(36).slice(2), desc: "", qty: "1" };
}

function businessNameSize(name) {
  const len = (name || "Your Business Name").length;
  if (len > 28) return 12;
  if (len > 18) return 14;
  return 16;
}
function todayStr() {
  const d = new Date();
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("Packing Slip crashed:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: "flex", justifyContent: "center", background: bg, padding: "40px 16px" }}>
          <div style={{ width: 380, background: "#FFFDF6", color: ink, borderRadius: 4, padding: "30px 24px", ...fontMono, textAlign: "center" }}>
            <p style={{ fontSize: 15, margin: "0 0 8px", fontWeight: 700 }}>Something went wrong</p>
            <p style={{ fontSize: 12, color: sub, margin: "0 0 16px" }}>A refresh usually fixes it.</p>
            <button onClick={function () { window.location.reload(); }} style={{
              background: ink, border: "none", color: "#FFFDF6", padding: "8px 18px", borderRadius: 3,
              fontSize: 12, cursor: "pointer", ...fontMono }}>Refresh</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function TornEdge({ paper }) {
  return (
    <div style={{
      height: 12, background: "repeating-linear-gradient(-45deg, " + paper + " 0, " + paper + " 5px, " + bg + " 5px, " + bg + " 10px)",
      marginTop: -1,
    }} />
  );
}

function PackingSlipInner() {
  const [items, setItems] = useState([makeItem(), makeItem()]);
  const [shipTo, setShipTo] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [notes, setNotes] = useState("");
  const [profile, setProfile] = useState(loadProfile);
  const [editingProfile, setEditingProfile] = useState(!profile.name);
  const [savedFlash, setSavedFlash] = useState(false);
  const [slipNo, setSlipNo] = useState(function () { return nextDocNumber("packing", "SLIP-"); });
  const [date] = useState(todayStr);
  const [appearance, setAppearance] = useState(loadAppearance);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const logoInputRef = useRef(null);
  const importInputRef = useRef(null);

  useEffect(function () { document.title = "Packing Slip — Papyri"; }, []);

  const tone = PAPER_TONES[appearance.tone];
  const size = SIZES[appearance.size];

  function updateItem(id, field, value) {
    setItems(function (prev) { return prev.map(function (it) { return it.id === id ? Object.assign({}, it, { [field]: value }) : it; }); });
  }
  function addItem() { setItems(function (prev) { return prev.concat([makeItem()]); }); }
  function removeItem(id) { setItems(function (prev) { return prev.filter(function (it) { return it.id !== id; }); }); }

  const totalItems = useMemo(function () {
    return items.reduce(function (sum, it) { return sum + (Number(it.qty) || 0); }, 0);
  }, [items]);

  function persistProfile(next) {
    try { window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next)); } catch (e) {}
  }
  function saveProfile() {
    persistProfile(profile);
    setEditingProfile(false);
    setSavedFlash(true);
    setTimeout(function () { setSavedFlash(false); }, 1500);
  }
  function handleLogoChosen(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    readLogoFile(file, function (dataUrl) {
      const next = Object.assign({}, profile, { logo: dataUrl });
      setProfile(next);
      persistProfile(next);
    });
    e.target.value = "";
  }
  function handleImportChosen(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    readProfileFile(file, function (parsed) {
      const next = { name: parsed.name || "", address: parsed.address || "", contact: parsed.contact || "", logo: parsed.logo || "" };
      setProfile(next);
      persistProfile(next);
      setEditingProfile(false);
    });
    e.target.value = "";
  }
  function applyAppearance(next) {
    const merged = Object.assign({}, appearance, next);
    setAppearance(merged);
    saveAppearance(merged);
  }
  function handlePrint() {
    saveToHistory("packing", slipNo, (shipTo ? shipTo.split("\n")[0] : "Untitled") + " — " + totalItems + " items", {
      items: items, shipTo: shipTo, orderRef: orderRef, notes: notes,
    });
    window.print();
  }
  function loadHistoryEntry(entry) {
    const s = entry.state;
    setItems(s.items && s.items.length ? s.items : [makeItem(), makeItem()]);
    setShipTo(s.shipTo || "");
    setOrderRef(s.orderRef || "");
    setNotes(s.notes || "");
    setSlipNo(entry.docNo);
    setShowHistory(false);
  }
  const historyEntries = showHistory ? loadHistory("packing") : [];

  return (
    <PaperclipBackdrop>
      <PaperclipFonts />
      <PaperclipStructuredData
        name="Packing Slip Generator — Papyri"
        description="Free packing slip generator — item and quantity list with ship-to address and order reference, no pricing shown. Printable. No signup."
        path="/packing"
      />
      <PaperclipStyles />
      <ToolBackgroundArt glyphs={["▣", "→", "◫", "✓"]} />
      <StampWrapper>
      <div className={"pc-no-print" + (appearance.uiLight ? " pc-ui-light" : "")} style={{ width: size.width }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#8A8A8A",
          textDecoration: "none", fontSize: 11, marginBottom: 14, ...fontMono }}>
          <ArrowLeft size={13} /> BACK
        </a>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <p style={{ ...fontMono, fontSize: 20, fontWeight: 700, color: "#F5F2E8", letterSpacing: 0.5, margin: 0 }}>
            PAPYRI
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={function () { setShowHistory(!showHistory); setShowAppearance(false); }} aria-label="Recent history" style={{
              background: showHistory ? "#222" : "none", border: "1px solid #333", borderRadius: 4,
              color: "#8A8A8A", padding: "6px 8px", cursor: "pointer" }}>
              <History size={13} />
            </button>
            <button onClick={function () { setShowAppearance(!showAppearance); setShowHistory(false); }} aria-label="Appearance settings" style={{
              background: showAppearance ? "#222" : "none", border: "1px solid #333", borderRadius: 4,
              color: "#8A8A8A", padding: "6px 8px", cursor: "pointer" }}>
              <Settings size={13} />
            </button>
          </div>
        </div>
        <p style={{ ...fontMono, fontSize: 11, color: "#8A8A8A", margin: "0 0 16px" }}>
          what's in the box, no pricing
        </p>

        {showHistory && (
          <div style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 4, padding: 12, marginBottom: 16 }}>
            <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 8px", letterSpacing: 0.5 }}>RECENTLY GENERATED</p>
            {historyEntries.length === 0 ? (
              <p style={{ fontSize: 11, color: "#666", margin: 0, ...fontMono }}>Nothing yet — print a slip to save it here.</p>
            ) : historyEntries.map(function (entry) {
              return (
                <button key={entry.id} onClick={function () { loadHistoryEntry(entry); }} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%",
                  background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 3, padding: "8px 10px",
                  marginBottom: 6, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 11, color: "#F5F2E8", margin: 0, ...fontMono, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.summary}</p>
                    <p style={{ fontSize: 9.5, color: "#666", margin: "2px 0 0", ...fontMono }}>{entry.docNo}</p>
                  </div>
                  <RotateCcw size={12} color="#8A8A8A" style={{ flexShrink: 0, marginLeft: 8 }} />
                </button>
              );
            })}
          </div>
        )}

        {showAppearance && (
          <div style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 4, padding: 12, marginBottom: 16 }}>
            <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 6px", letterSpacing: 0.5 }}>SLIP SIZE</p>
            <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
              {Object.entries(SIZES).map(function (entry) {
                const key = entry[0]; const s = entry[1];
                const active = appearance.size === key;
                return (
                  <button key={key} onClick={function () { applyAppearance({ size: key }); }} style={{
                    flex: 1, padding: "6px 4px", fontSize: 10, borderRadius: 3, cursor: "pointer", ...fontMono,
                    background: active ? "#FFFDF6" : "#0A0A0A", color: active ? ink : "#8A8A8A",
                    border: "1px solid " + (active ? "#FFFDF6" : "#333") }}>{s.label}</button>
                );
              })}
            </div>
            <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 6px", letterSpacing: 0.5 }}>PAPER TONE</p>
            <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
              {Object.entries(PAPER_TONES).map(function (entry) {
                const key = entry[0]; const t = entry[1];
                const active = appearance.tone === key;
                return (
                  <button key={key} onClick={function () { applyAppearance({ tone: key }); }} style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    padding: "6px 4px", fontSize: 10, borderRadius: 3, cursor: "pointer", ...fontMono,
                    background: active ? "#222" : "#0A0A0A", color: active ? "#F5F2E8" : "#8A8A8A",
                    border: "1px solid " + (active ? "#555" : "#333") }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.paper, border: "1px solid #555", flexShrink: 0 }} />
                    {t.label}
                  </button>
                );
              })}
            </div>
            <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 6px", letterSpacing: 0.5 }}>EDITING UI</p>
            <div style={{ display: "flex", gap: 5 }}>
              <button onClick={function () { applyAppearance({ uiLight: false }); }} style={{
                flex: 1, padding: "6px 4px", fontSize: 10, borderRadius: 3, cursor: "pointer", ...fontMono,
                background: !appearance.uiLight ? "#FFFDF6" : "#0A0A0A", color: !appearance.uiLight ? ink : "#8A8A8A",
                border: "1px solid " + (!appearance.uiLight ? "#FFFDF6" : "#333") }}>Dark</button>
              <button onClick={function () { applyAppearance({ uiLight: true }); }} style={{
                flex: 1, padding: "6px 4px", fontSize: 10, borderRadius: 3, cursor: "pointer", ...fontMono,
                background: appearance.uiLight ? "#FFFDF6" : "#0A0A0A", color: appearance.uiLight ? ink : "#8A8A8A",
                border: "1px solid " + (appearance.uiLight ? "#FFFDF6" : "#333") }}>Light</button>
            </div>
          </div>
        )}

        <div style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 4, padding: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: 0, letterSpacing: 0.5 }}>YOUR BUSINESS</p>
            {!editingProfile && (
              <button onClick={function () { setEditingProfile(true); }} style={{ background: "none", border: "none", color: "#8A8A8A", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 10, ...fontMono }}>
                <Edit2 size={11} /> Edit
              </button>
            )}
          </div>
          {editingProfile ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {profile.logo ? (
                  <img src={profile.logo} alt="Logo preview" style={{ width: 32, height: 32, borderRadius: 3, objectFit: "cover", border: "1px solid #333" }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: 3, border: "1px dashed #333", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Image size={14} color="#666" />
                  </div>
                )}
                <button onClick={function () { logoInputRef.current.click(); }} style={{
                  fontSize: 10.5, color: "#8A8A8A", background: "none", border: "1px solid #333", borderRadius: 3,
                  padding: "6px 10px", cursor: "pointer", ...fontMono }}>
                  {profile.logo ? "Change logo" : "Upload logo"}
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChosen} style={{ display: "none" }} />
              </div>
              <input value={profile.name} onChange={function (e) { setProfile(Object.assign({}, profile, { name: e.target.value })); }}
                placeholder="Business name" style={{ width: "100%", background: "#0A0A0A", border: "1px solid #333", borderRadius: 3,
                  color: "#F5F2E8", fontSize: 12, padding: "7px 8px", boxSizing: "border-box", marginBottom: 6, ...fontMono }} />
              <input value={profile.address} onChange={function (e) { setProfile(Object.assign({}, profile, { address: e.target.value })); }}
                placeholder="Address" style={{ width: "100%", background: "#0A0A0A", border: "1px solid #333", borderRadius: 3,
                  color: "#F5F2E8", fontSize: 12, padding: "7px 8px", boxSizing: "border-box", marginBottom: 6, ...fontMono }} />
              <input value={profile.contact} onChange={function (e) { setProfile(Object.assign({}, profile, { contact: e.target.value })); }}
                placeholder="Phone or email" style={{ width: "100%", background: "#0A0A0A", border: "1px solid #333", borderRadius: 3,
                  color: "#F5F2E8", fontSize: 12, padding: "7px 8px", boxSizing: "border-box", marginBottom: 8, ...fontMono }} />
              <button onClick={saveProfile} style={{
                width: "100%", padding: "8px 0", borderRadius: 3, border: "none", background: "#FFFDF6", color: ink,
                fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, ...fontMono, marginBottom: 8 }}>
                {savedFlash ? <Check size={12} /> : <Save size={12} />} {savedFlash ? "Saved" : "Save profile"}
              </button>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={function () { exportProfileFile(profile); }} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: "none",
                  border: "1px solid #333", borderRadius: 3, color: "#8A8A8A", fontSize: 10.5, padding: "6px 0", cursor: "pointer", ...fontMono }}>
                  <Download size={11} /> Export
                </button>
                <button onClick={function () { importInputRef.current.click(); }} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: "none",
                  border: "1px solid #333", borderRadius: 3, color: "#8A8A8A", fontSize: 10.5, padding: "6px 0", cursor: "pointer", ...fontMono }}>
                  <Upload size={11} /> Import
                </button>
                <input ref={importInputRef} type="file" accept="application/json" onChange={handleImportChosen} style={{ display: "none" }} />
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {profile.logo && <img src={profile.logo} alt="Logo" style={{ width: 34, height: 34, borderRadius: 3, objectFit: "cover", flexShrink: 0 }} />}
              <div style={{ ...fontMono, fontSize: 11.5, color: "#F5F2E8", lineHeight: 1.6 }}>
                <p style={{ margin: 0 }}>{profile.name || "—"}</p>
                <p style={{ margin: 0, color: "#AAA" }}>{profile.address}</p>
                <p style={{ margin: 0, color: "#AAA" }}>{profile.contact}</p>
              </div>
            </div>
          )}
        </div>

        <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 6px" }}>SHIP TO</p>
        <textarea value={shipTo} onChange={function (e) { setShipTo(e.target.value); }} rows={2}
          placeholder="Recipient name and address"
          style={{ width: "100%", background: "#141414", border: "1px solid #2A2A2A", borderRadius: 3, color: "#F5F2E8",
            fontSize: 12, padding: "7px 8px", boxSizing: "border-box", marginBottom: 10, resize: "vertical", ...fontMono }} />

        <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 6px" }}>ORDER REFERENCE (optional)</p>
        <input value={orderRef} onChange={function (e) { setOrderRef(e.target.value); }} placeholder="Order # or PO #"
          style={{ width: "100%", background: "#141414", border: "1px solid #2A2A2A", borderRadius: 3, color: "#F5F2E8",
            fontSize: 12, padding: "7px 8px", boxSizing: "border-box", marginBottom: 16, ...fontMono }} />

        <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 6px", letterSpacing: 0.5 }}>ITEMS</p>
        {items.map(function (it) {
          return (
            <div key={it.id} style={{ display: "flex", gap: 5, marginBottom: 6, alignItems: "center" }}>
              <input value={it.desc} onChange={function (e) { updateItem(it.id, "desc", e.target.value); }}
                placeholder="Item description" style={{ flex: 3, minWidth: 0, background: "#141414", border: "1px solid #2A2A2A", borderRadius: 3,
                  color: "#F5F2E8", fontSize: 11.5, padding: "7px 8px", ...fontMono }} />
              <input value={it.qty} onChange={function (e) { updateItem(it.id, "qty", sanitizeNumericInput(e.target.value)); }}
                placeholder="Qty" style={{ flex: 1, minWidth: 0, background: "#141414", border: "1px solid #2A2A2A", borderRadius: 3,
                  color: "#F5F2E8", fontSize: 11.5, padding: "7px 6px", textAlign: "center", ...fontMono }} />
              {items.length > 1 && (
                <button onClick={function () { removeItem(it.id); }} aria-label="Remove item" style={{ background: "none", border: "none", color: "#666", cursor: "pointer", flexShrink: 0 }}>
                  <X size={14} />
                </button>
              )}
            </div>
          );
        })}
        <button onClick={addItem} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, width: "100%",
          background: "none", border: "1px dashed #333", borderRadius: 3, padding: "8px 0", color: "#8A8A8A",
          fontSize: 11, cursor: "pointer", margin: "10px 0 16px", ...fontMono }}>
          <Plus size={12} /> Add item
        </button>

        <p style={{ ...fontMono, fontSize: 10, color: "#8A8A8A", margin: "0 0 6px" }}>NOTES (optional)</p>
        <textarea value={notes} onChange={function (e) { setNotes(e.target.value); }} rows={2}
          placeholder="Handling instructions, etc."
          style={{ width: "100%", background: "#141414", border: "1px solid #2A2A2A", borderRadius: 3, color: "#F5F2E8",
            fontSize: 12, padding: "7px 8px", boxSizing: "border-box", marginBottom: 20, resize: "vertical", ...fontMono }} />

        <button onClick={handlePrint} style={{
          width: "100%", padding: "12px 0", borderRadius: 4, border: "none", background: "#FFFDF6", color: ink,
          fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, ...fontMono }}>
          <Printer size={14} /> Print / Save as PDF
        </button>
      </div>

      <div>
        <div className="pc-receipt" style={{
          width: size.width, background: tone.paper, color: ink, padding: "28px 22px 0", ...fontMono,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)", transition: "width 0.2s ease, background 0.2s ease",
        }}>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            {profile.logo && <img src={profile.logo} alt="Logo" style={{ width: 44, height: 44, borderRadius: 4, objectFit: "cover", margin: "0 auto 8px" }} />}
            <p style={{ fontSize: businessNameSize(profile.name), fontWeight: 700, margin: "0 0 2px", letterSpacing: 0.3, wordBreak: "break-word", lineHeight: 1.3 }}>{profile.name || "Your Business Name"}</p>
            {profile.address && <p style={{ fontSize: 10.5, color: sub, margin: "0 0 2px" }}>{profile.address}</p>}
            {profile.contact && <p style={{ fontSize: 10.5, color: sub, margin: 0 }}>{profile.contact}</p>}
          </div>

          {shipTo && (
            <div style={{ marginBottom: 12, fontSize: 11 }}>
              <p style={{ margin: "0 0 2px", color: sub }}>Ship to:</p>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{shipTo}</p>
            </div>
          )}

          <div style={{ borderTop: "1px dashed " + tone.line, borderBottom: "1px dashed " + tone.line, padding: "8px 0", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5 }}>
              <span>Packing Slip</span>
              <span>{slipNo}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: sub }}>
              <span>{date}</span>
              {orderRef && <span>Ref: {orderRef}</span>}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", fontSize: 10, color: sub, marginBottom: 6, letterSpacing: 0.3 }}>
              <span style={{ flex: 3 }}>ITEM</span>
              <span style={{ flex: 1, textAlign: "right" }}>QTY</span>
            </div>
            {items.filter(function (it) { return it.desc; }).map(function (it) {
              return (
                <div key={it.id} style={{ display: "flex", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ flex: 3, wordBreak: "break-word" }}>{it.desc}</span>
                  <span style={{ flex: 1, textAlign: "right" }}>{it.qty || "0"}</span>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: "1px dashed " + tone.line, paddingTop: 10, marginBottom: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
              <span>TOTAL ITEMS</span><span>{totalItems}</span>
            </div>
          </div>

          {notes && (
            <div style={{ marginTop: 12, fontSize: 11, color: sub }}>
              <p style={{ margin: "0 0 2px", fontWeight: 700, color: ink }}>Notes</p>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{notes}</p>
            </div>
          )}

          <p style={{ textAlign: "center", fontSize: 10, color: sub, margin: "18px 0 6px" }}>
            Please verify contents on arrival.
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <DocumentQR />
          </div>
        </div>
        <TornEdge paper={tone.paper} />
      </div>
      </StampWrapper>
    </PaperclipBackdrop>
  );
}

export default function PackingSlip() {
  return (
    <ErrorBoundary>
      <PackingSlipInner />
    </ErrorBoundary>
  );
}
