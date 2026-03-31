import { ReadyToExperience } from "@/components/service/ReadyToExperience";
import { ServiceHero } from "@/components/service/ServiceHero";
import { ServiceOfferings } from "@/components/service/ServiceOfferings";

export function ServiceRepair() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <ServiceHero />
      <ServiceOfferings />
      <ReadyToExperience />
    </div>
  );
}
