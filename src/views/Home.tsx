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
import { useVehicles } from '../hooks/useVehicles';


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

  const { vehicles, isLoading, isError, error, refetch } = useVehicles();

  const featuredVehicles = vehicles.slice(0, 6);


  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Error Loading Vehicles</h2>
          </div>
          <p className="text-gray-600 mb-6">{error?.message || 'Something went wrong'}</p>
          <button
            onClick={() => refetch()}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <div>
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/70" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Car className="w-4 h-4" />
              Trusted by 2,000+ Nigerians
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Import Verified US Vehicles to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Nigeria
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Afrozon handles everything - from sourcing and inspection to shipping and delivery.
              No hidden fees. No surprises. Just your dream car delivered to your door.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/vehicles"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-500 transition-colors"
              >
                Browse Vehicles
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors border border-white/20"
              >
                Calculate Import Cost
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Licensed API Data
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Escrow Protected
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                45-Day Delivery
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 mb-4">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">

            {isLoading ? (
              <p className="text-lg text-gray-300 mb-6">Loading vehicles...</p>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Featured Vehicles
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                  Browse our selection of verified US vehicles ready for import to Nigeria
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
            >
              View All Vehicles
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Afrozon Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A simple 5-step process from search to delivery
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200" />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative text-center">
                  <div className="relative z-10 inline-flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
                      <step.icon className="w-8 h-8" />
                    </div>
                    <div className="text-xs font-bold text-emerald-600 mb-2">{step.number}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/how-it-works"
              className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
            >
              Learn more about our process
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-400">
              Join thousands of satisfied customers across Nigeria
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-800 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6">{testimonial.text}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 text-sm font-medium">{testimonial.vehicle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Import Your Dream Car?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Browse thousands of verified US vehicles and get an instant quote for delivery to Nigeria.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/vehicles"
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Start Browsing
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-400 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 bg-amber-50 border-t border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-amber-800">
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
