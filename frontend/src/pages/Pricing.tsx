import React from "react";
import Navbar from "@/components/Navbar";
import PricingSection from "@/components/PricingSection";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-16">
        <PricingSection />
      </main>
    </div>
  );
};

export default Pricing;
