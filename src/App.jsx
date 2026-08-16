import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hub from "./pages/Hub";
import ReceiptGenerator from "./pages/ReceiptGenerator";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/receipt" element={<ReceiptGenerator />} />
      </Routes>
    </BrowserRouter>
  );
}
