import { Routes, Route, Navigate } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

import Privacy from "./Privacy";
import Terms from "./Terms";

import Logout from "./pages/Logout";
import Business from "./pages/Business";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ForgotPasscode from "./pages/ForgotPasscode";
import Register from "./pages/Register";

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
import Security from "./pages/Security";
import RequestMoney from "./pages/RequestMoney";
import BillPayments from "./pages/BillPayments";
import Savings from "./pages/Savings";
import VirtualCards from "./pages/VirtualCards";
import Referral from "./pages/Referral";
import ScheduledTransfers from "./pages/ScheduledTransfers";
import Support from "./pages/Support";
import Statements from "./pages/Statements";
import PayMerchant from "./pages/PayMerchant";
import ResetPassword from "./pages/ResetPassword";
import HowToUse from "./pages/HowToUse";
import SetPin from "./pages/SetPin";
import ChangePin from "./pages/ChangePin";
import MerchantCallback from "./pages/MerchantCallback";
import FundCallback from "./pages/FundCallback";

function AppShell() {
  return (
    <Route
      element={
        <ErrorBoundary>
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        </ErrorBoundary>
      }
    >
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="wallet" element={<Wallet />} />
      <Route path="send-money" element={<SendMoney />} />
      <Route path="set-pin" element={<SetPin />} />
      <Route path="change-pin" element={<ChangePin />} />
      <Route path="fund-wallet" element={<FundWallet />} />
      <Route path="withdraw" element={<Withdraw />} />
      <Route path="transactions" element={<Transactions />} />
      <Route path="converter" element={<CurrencyConverter />} />
      <Route path="profile" element={<Profile />} />
      <Route path="avatar-upload" element={<AvatarUpload />} />
      <Route path="bank-account" element={<BankAccount />} />
      <Route path="kyc" element={<KYC />} />
      <Route path="security" element={<Security />} />
      <Route path="logout" element={<Logout />} />
      <Route path="request-money" element={<RequestMoney />} />
      <Route path="bills" element={<BillPayments />} />
      <Route path="savings" element={<Savings />} />
      <Route path="cards" element={<VirtualCards />} />
      <Route path="referral" element={<Referral />} />
      <Route path="scheduled" element={<ScheduledTransfers />} />
      <Route path="support" element={<Support />} />
      <Route path="statements" element={<Statements />} />
      <Route path="business" element={<Business />} />
      <Route path="pay" element={<PayMerchant />} />
      <Route path="how-to-use" element={<HowToUse />} />
      <Route path="privacy" element={<Privacy />} />
      <Route path="terms" element={<Terms />} />
    </Route>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-passcode" element={<ForgotPasscode />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />

      {/* Public callback – must be outside ProtectedRoute */}
      <Route path="/merchant/callback" element={<MerchantCallback />} />
      <Route path="/fund/callback" element={<FundCallback />} />

      {AppShell()}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;