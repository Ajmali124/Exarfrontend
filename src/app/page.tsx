import Header from "./(landing)/components/Header";
import HeroSection from "./(landing)/components/HeroSection";



export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
     <HeroSection />
      {/* <InvestmentSection /> */}
      {/* <ExchangesSection />
      <CryptocurrenciesSection />
      <ServicesSection />
      <MobileAppSection />
      <Footer /> */} 
    </main>
  );
}
