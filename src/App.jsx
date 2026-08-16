import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hub from "./pages/Hub";
import ReceiptGenerator from "./pages/ReceiptGenerator";
import TimesheetGenerator from "./pages/TimesheetGenerator";
import ContractGenerator from "./pages/ContractGenerator";
import ExpenseReport from "./pages/ExpenseReport";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/expense" element={<ExpenseReport />} />
      <Route path="/contract" element={<ContractGenerator />} />
        <Route path="/" element={<Hub />} />
        <Route path="/timesheet" element={<TimesheetGenerator />} />
        <Route path="/receipt" element={<ReceiptGenerator />} />
      </Routes>
    </BrowserRouter>
  );
}
