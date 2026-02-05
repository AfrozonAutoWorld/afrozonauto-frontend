import Link from 'next/link';
import {
  Search,
  FileText,
  CreditCard,
  CheckCircle,
  Ship,
  Truck,
  ArrowRight,
  Shield,
  Clock,
  Headphones,
  Package,
} from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Search & Select',
    description: 'Browse our verified vehicle listings from licensed US sources. Filter by make, model, year, price, and more to find your perfect vehicle.',
    details: [
      'Access thousands of verified US vehicles',
      'Real-time pricing from licensed APIs',
      'Detailed vehicle specifications and photos',
      'VIN-based history information',
    ],
  },
  {
    number: '02',
    icon: FileText,
    title: 'Request & Quote',
    description: 'Submit a request for your chosen vehicle. Our team reviews availability and sends you a detailed quote with all costs broken down.',
    details: [
      'Complete cost breakdown included',
      'All fees transparent upfront',
      'Shipping options explained',
      'Timeline estimates provided',
    ],
  },
  {
    number: '03',
    icon: CreditCard,
    title: 'Pay Deposit',
    description: 'Once you approve the quote, pay a 30% deposit to secure your vehicle. Funds are held securely in escrow.',
    details: [
      'Multiple payment options',
      'Funds protected in escrow',
      'Deposit locks in your vehicle',
      'Balance due before shipping',
    ],
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Inspection & Approval',
    description: 'We conduct a professional inspection and provide a detailed report. You review and approve before we purchase.',
    details: [
      'Professional 150+ point inspection',
      'Full VIN history report',
      'Photo documentation',
      'Your approval required to proceed',
    ],
  },
  {
    number: '05',
    icon: Package,
    title: 'Purchase & Export',
    description: 'After your approval, Afrozon purchases the vehicle on your behalf and handles all export documentation.',
    details: [
      'Afrozon is merchant of record',
      'Complete export documentation',
      'US handling and prep',
      'Insurance coverage',
    ],
  },
  {
    number: '06',
    icon: Ship,
    title: 'Shipping',
    description: 'Your vehicle is shipped via your chosen method (RoRo or Container) with full tracking throughout the journey.',
    details: [
      'RoRo: ~45 days delivery',
      'Container: ~60 days delivery',
      'Real-time tracking updates',
      'Marine insurance included',
    ],
  },
  {
    number: '07',
    icon: Truck,
    title: 'Customs & Delivery',
    description: 'We handle customs clearance at the Nigerian port and deliver your vehicle directly to your doorstep.',
    details: [
      'Complete customs handling',
      'Duty and tax payment assistance',
      'Port-to-door delivery',
      'Final handover and documentation',
    ],
  },
];

const faqs = [
  {
    question: 'How long does the entire process take?',
    answer: 'The complete process typically takes 45-60 days from deposit to delivery, depending on shipping method. RoRo shipping is faster (~45 days) while container shipping takes longer (~60 days).',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept credit/debit cards, bank transfers, and wallet balance. All payments are processed securely and held in escrow until appropriate milestones are reached.',
  },
  {
    question: 'Can I cancel my order?',
    answer: 'You can cancel before Afrozon purchases the vehicle and receive a full deposit refund minus processing fees. Once the vehicle is purchased, cancellations are not possible.',
  },
  {
    question: 'What if the inspection reveals issues?',
    answer: 'If our inspection reveals significant issues, you can decline the vehicle and receive a full deposit refund. Minor issues will be documented and you can make an informed decision.',
  },
  {
    question: 'Is my money safe?',
    answer: 'Yes. All deposits are held in secure escrow accounts. Funds are only released after you approve the inspection report and authorize the purchase.',
  },
  {
    question: 'What documents will I receive?',
    answer: 'You will receive the vehicle title, bill of sale, export documentation, bill of lading, customs clearance papers, and all import documentation required for registration.',
  },
];

export function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How Afrozon Works
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A simple, transparent 7-step process from search to delivery.
            We handle the complexity so you can focus on choosing your dream car.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-24 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 to-emerald-200 hidden md:block" />
                )}

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-bold text-emerald-600">{step.number}</span>
                      <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
                    </div>
                    <p className="text-lg text-gray-600 mb-4">{step.description}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-gray-600">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Why Choose Afrozon?
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            We're not just a car import service. We're your trusted partner in bringing
            quality vehicles to Africa.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure & Transparent',
                description: 'Escrow-protected payments, clear pricing, and no hidden fees. You always know where your money goes.',
              },
              {
                icon: Clock,
                title: 'Efficient Process',
                description: '45-60 day delivery with real-time tracking. We optimize every step to get your car to you faster.',
              },
              {
                icon: Headphones,
                title: 'Expert Support',
                description: 'Dedicated team available to answer questions and guide you through every step of the process.',
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Browse our selection of verified vehicles and start your import journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/vehicles"
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Browse Vehicles
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/calculator"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-400 transition-colors"
            >
              Calculate Costs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
