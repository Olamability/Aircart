import HomeBanner from "@/components/HomeBanner";
import EcosystemIntro from "@/components/landing/EcosystemIntro";
import HeroSection from "@/components/landing/HeroSection";
import RiderOpportunities from "@/components/landing/Opportunities";
import ServiceShowcase from "@/components/landing/ServiceShowcase";

const Home = () => {
  return (
    <>
      <HomeBanner />


      <ServiceShowcase />
      <RiderOpportunities />

    </>
  );
};

export default Home;
