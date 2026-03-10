import { GotQuestionsSection } from "@/components/seller/GotQuestionsSection";
import { SellerHeroSection } from "@/components/seller/SellerHeroSection";
import { SellStepsSection } from "@/components/seller/SellStepsSection";
import { TestimonialSection } from "@/components/seller/TestimonialSection";
import { WhyChooseUsSection } from "@/components/seller/WhyChooseUsSection";
import { SellYourCar } from "@/components/seller/SellYourCar";

export function SellerLanding() {
  return (
    <div>
      <SellerHeroSection />
      <SellStepsSection />
      <WhyChooseUsSection />
      <TestimonialSection />
      <GotQuestionsSection />
      <SellYourCar />
    </div>
  );
}
