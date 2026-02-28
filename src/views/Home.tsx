import { FeaturedVehiclesSection, HeroBreadcrumb, HeroSection, PopularMakesSection, RecommendedForYouSection, FindMyCarBanner } from '@/components/home';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  FileCheck,
  MapPin,
  Search,
  Shield,
  Ship,
  Star,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { useTrendingVehicles, useRecommendedVehicles } from '../hooks/useVehicles';
import { HowItWorks } from '../components/home/HowItWorks';


const features = [
  {
    icon: Shield,
    title: 'Verified Vehicles',
    description: 'Every vehicle undergoes professional inspection with VIN verification before purchase.',
  },
  {
    icon: Truck,
    title: 'Door-to-Door Delivery',
    description: 'From US dealers to your doorstep in Nigeria. We handle everything.',
  },
  {
    icon: Clock,
    title: 'Transparent Timeline',
    description: 'Track your vehicle at every stage with real-time updates and notifications.',
  },
  {
    icon: CreditCard,
    title: 'Secure Escrow',
    description: 'Your funds are protected in escrow until you approve the purchase.',
  },
];

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Search & Request',
    description: 'Browse verified US vehicles and submit a request for your chosen car.',
  },
  {
    icon: FileCheck,
    number: '02',
    title: 'Quote & Deposit',
    description: 'Receive detailed pricing and pay a 30% deposit to secure your vehicle.',
  },
  {
    icon: CheckCircle,
    number: '03',
    title: 'Inspection & Approval',
    description: 'Review professional inspection report and VIN history before we purchase.',
  },
  {
    icon: Ship,
    number: '04',
    title: 'Purchase & Ship',
    description: 'We buy the vehicle and handle export, shipping, and customs clearance.',
  },
  {
    icon: MapPin,
    number: '05',
    title: 'Delivery',
    description: 'Receive your vehicle at your doorstep anywhere in Nigeria.',
  },
];

const testimonials = [
  {
    name: 'Chukwuemeka O.',
    location: 'Lagos',
    text: "Bought a 2021 Toyota Highlander through Afrozon. The process was seamless and the car arrived in perfect condition.",
    rating: 5,
    vehicle: '2021 Toyota Highlander',
  },
  {
    name: 'Amina B.',
    location: 'Abuja',
    text: "Finally, a transparent auto import service! The calculator helped me budget properly and there were no surprise fees.",
    rating: 5,
    vehicle: '2020 Honda CR-V',
  },
  {
    name: 'Oluwaseun A.',
    location: 'Port Harcourt',
    text: "The inspection report saved me from buying a car with hidden damage. Afrozon's team is truly professional.",
    rating: 5,
    vehicle: '2019 Lexus RX 350',
  },
];

export function Home() {
  const { vehicles: trendingVehicles, isLoading, isError, error, refetch } = useTrendingVehicles();
  const { items: recommendedItems, isLoading: recommendedLoading } = useRecommendedVehicles(12);

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="p-8 w-full max-w-md bg-white rounded-xl shadow-lg">
          <div className="flex gap-3 items-center mb-4 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Error Loading Vehicles</h2>
          </div>
          <p className="mb-6 text-gray-600">{error?.message || 'Something went wrong'}</p>
          <button
            onClick={() => refetch()}
            className="py-3 w-full text-white bg-emerald-600 rounded-lg transition-colors hover:bg-emerald-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <div>
      <HeroSection
        breadcrumbs={<HeroBreadcrumb />}
        headerText="Browse from our 2000+ Verified Vehicles"
        descriptionText="Your next ride is one scroll away — vetted US cars, shipped to Nigeria. Discover, compare, and load more as you go."
        shouldShowSearch
        shouldShowFilters
      />

      <RecommendedForYouSection
        vehicles={recommendedItems}
        isLoading={recommendedLoading}
        showLandedPrice
      />

      <PopularMakesSection />

      <FeaturedVehiclesSection
        vehicles={trendingVehicles}
        isLoading={isLoading}
        showLandedPrice
      />
  
      <section className="">
        <HowItWorks />
      </section>

      <FindMyCarBanner />

    </div>
  );
}
