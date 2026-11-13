import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import AwarenessSection from "./components/AwarenessSection";
import DonorRegistration from "./components/DonorRegistration";
import PatientSupport from "./components/PatientSupport";
import FinancialSupport from "./components/FinancialSupport";
import CostEstimation from "./components/CostEstimation";
import Admin from "./components/Admin";
import Chatbot from "./components/chatbot";
import "./App.css";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Chatbot/>
      <Routes>

        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* How It Works Page */}
        <Route
          path="/how-it-works"
          element={
            <>
              <Navbar />
              <HowItWorks />
              <Footer />
            </>
          }
        />

        {/* Awareness Page */}
        <Route
          path="/awareness"
          element={
            <>
              <Navbar />
              <AwarenessSection />
              <Footer />
            </>
          }
        />

        {/* Donor Management */}
        <Route
          path="/donors"
          element={
            <>
              <Navbar />
              <DonorRegistration />
              <Footer />
            </>
          }
        />

        {/* Patient Management */}
        <Route
          path="/patients"
          element={
            <>
              <Navbar />
              <PatientSupport />
              <Footer />
            </>
          }
        />

        {/* Financial Support */}
        <Route
          path="/financial"
          element={
            <>
              <Navbar />
              <FinancialSupport />
              <Footer />
            </>
          }
        />

        {/* Cost Estimation */}
        <Route
          path="/cost-estimation"
          element={
            <>
              <Navbar />
              <CostEstimation />
              <Footer />
            </>
          }
        />
        {/* .Admin panel */}
        <Route
           path="/admin"
           element={
            <Admin/>
           }

        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;