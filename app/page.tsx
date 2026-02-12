import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import SampleReport from "@/components/SampleReport";
import ReportForm from "@/components/ReportForm";
import WhatYouGet from "@/components/WhatYouGet";
import { faqJsonLd } from "@/lib/landing-content";

export default function Home() {
  return (
    <div className="min-h-screen text-[var(--text-strong)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <SampleReport />
        <ReportForm />
        <WhatYouGet />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
