import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  Truck,
  Clock,
  CheckCircle,
  Search,
  CreditCard,
  FileCheck,
  Ship,
  MapPin,
  Star,
  Car,
  AlertCircle,
} from 'lucide-react';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { useTrendingVehicles } from '../hooks/useVehicles';


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
  const displayVehicles = trendingVehicles.slice(0, 12);


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
      <section className="overflow-hidden relative bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/70" />

        <div className="relative px-4 py-24 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex gap-2 items-center px-4 py-2 mb-6 text-sm font-medium text-emerald-400 rounded-full bg-emerald-500/20">
              <Car className="w-4 h-4" />
              Trusted by 2,000+ Nigerians
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Import Verified US Vehicles to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Nigeria
              </span>
            </h1>

            <p className="mb-8 text-xl leading-relaxed text-gray-300">
              Afrozon handles everything - from sourcing and inspection to shipping and delivery.
              No hidden fees. No surprises. Just your dream car delivered to your door.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/marketplace"
                className="inline-flex gap-2 justify-center items-center px-8 py-4 text-lg font-semibold text-white bg-emerald-600 rounded-xl transition-colors hover:bg-emerald-500"
              >
                Browse Vehicles
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/marketplace/calculator"
                className="inline-flex gap-2 justify-center items-center px-8 py-4 text-lg font-semibold text-white rounded-xl border transition-colors bg-white/10 hover:bg-white/20 border-white/20"
              >
                Calculate Import Cost
              </Link>
            </div>

            <div className="flex gap-8 items-center mt-12 text-sm text-gray-400">
              <div className="flex gap-2 items-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Licensed API Data
              </div>
              <div className="flex gap-2 items-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Escrow Protected
              </div>
              <div className="flex gap-2 items-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                45-Day Delivery
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-b border-gray-100">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex justify-center items-center mb-4 w-14 h-14 text-emerald-600 bg-emerald-100 rounded-xl">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">

            {isLoading ? (
              <p className="mb-6 text-lg text-gray-300">Loading vehicles...</p>
            ) : (
              <>
                <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                  Trending Vehicles
                </h2>
                <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-600">
                  Popular picks and hot vehicles—ordered by customers and curated for you
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {displayVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/marketplace"
              className="inline-flex gap-2 items-center px-8 py-4 font-semibold text-white bg-gray-900 rounded-xl transition-colors hover:bg-emerald-600"
            >
              View All Vehicles
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              How Afrozon Works
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              A simple 5-step process from search to delivery
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200" />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-5">
              {steps.map((step, index) => (
                <div key={index} className="relative text-center">
                  <div className="inline-flex relative z-10 flex-col items-center">
                    <div className="flex justify-center items-center mb-4 w-16 h-16 text-white bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-200">
                      <step.icon className="w-8 h-8" />
                    </div>
                    <div className="mb-2 text-xs font-bold text-emerald-600">{step.number}</div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex gap-1 items-center font-medium text-emerald-600 hover:text-emerald-700"
            >
              Learn more about our process
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-400">
              Join thousands of satisfied customers across Nigeria
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 bg-gray-800 rounded-2xl">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="mb-6 text-gray-300">{testimonial.text}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-400">{testimonial.vehicle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="px-4 mx-auto max-w-4xl text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
            Ready to Import Your Dream Car?
          </h2>
          <p className="mb-8 text-xl text-emerald-100">
            Browse thousands of verified US vehicles and get an instant quote for delivery to Nigeria.
          </p>
          <div className="flex flex-col gap-4 justify-center sm:flex-row">
            <Link
              href="/marketplace"
              className="inline-flex gap-2 justify-center items-center px-8 py-4 text-lg font-semibold text-emerald-700 bg-white rounded-xl transition-colors hover:bg-gray-100"
            >
              Start Browsing
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/register"
              className="inline-flex gap-2 justify-center items-center px-8 py-4 text-lg font-semibold text-white bg-emerald-500 rounded-xl transition-colors hover:bg-emerald-400"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 bg-amber-50 border-t border-amber-200">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <p className="text-sm text-center text-amber-800">
            <strong>Disclaimer:</strong> Afrozon purchases vehicles on your behalf from verified US sources
            and handles export and delivery. All transactions are subject to our{' '}
            <Link href="/terms" className="underline hover:text-amber-900">terms of service</Link>.
            Prices shown are estimates and may vary.
          </p>
        </div>
      </section>
    </div>
  );
}
