import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Logout from "./pages/Logout";

import Login from "./pages/Login";
import Register from "./pages/Register";   // ← keep this

import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import SendMoney from "./pages/SendMoney";
import FundWallet from "./pages/FundWallet";
import Withdraw from "./pages/Withdraw";
import Transactions from "./pages/Transactions";
import CurrencyConverter from "./pages/CurrencyConverter";
import Profile from "./pages/Profile";
import AvatarUpload from "./pages/AvatarUpload";
import BankAccount from "./pages/BankAccount";
import KYC from "./pages/KYC";
import RequestMoney from "./pages/RequestMoney";
import BillPayments from "./pages/BillPayments";
import Savings from "./pages/Savings";
import VirtualCards from "./pages/VirtualCards";
import Referral from "./pages/Referral";
import ScheduledTransfers from "./pages/ScheduledTransfers";
import Support from "./pages/Support";
import Statements from "./pages/Statements";

function App() {
  return (
    <Routes>
      {/* ========== PUBLIC ROUTES ========== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />   {/* ← Moved outside */}

      {/* ========== PROTECTED ROUTES ========== */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="send-money" element={<SendMoney />} />
        <Route path="fund-wallet" element={<FundWallet />} />
        <Route path="withdraw" element={<Withdraw />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="converter" element={<CurrencyConverter />} />
        <Route path="profile" element={<Profile />} />
        <Route path="avatar-upload" element={<AvatarUpload />} />
        <Route path="bank-account" element={<BankAccount />} />
        <Route path="kyc" element={<KYC />} />
        <Route path="logout" element={<Logout />} />
        <Route path="request-money" element={<RequestMoney />} />
        <Route path="bills" element={<BillPayments />} />
        <Route path="savings" element={<Savings />} />
        <Route path="cards" element={<VirtualCards />} />
        <Route path="referral" element={<Referral />} />
        <Route path="scheduled" element={<ScheduledTransfers />} />
        <Route path="support" element={<Support />} />
        <Route path="statements" element={<Statements />} />
      </Route>
    </Routes>
  );
}

export default App;