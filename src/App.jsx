import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hub from "./pages/Hub";
import ReceiptGenerator from "./pages/ReceiptGenerator";
import TimesheetGenerator from "./pages/TimesheetGenerator";
import ContractGenerator from "./pages/ContractGenerator";
import ExpenseReport from "./pages/ExpenseReport";
import PackingSlip from "./pages/PackingSlip";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/receipt" element={<ReceiptGenerator />} />
        <Route path="/timesheet" element={<TimesheetGenerator />} />
        <Route path="/contract" element={<ContractGenerator />} />
        <Route path="/expense" element={<ExpenseReport />} />
        <Route path="/packing" element={<PackingSlip />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </BrowserRouter>
  );
}