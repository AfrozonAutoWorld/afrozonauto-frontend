'use client';

import { useState, useMemo } from 'react';
import {
  Car,
  CheckCircle,
  Ship,
  CreditCard,
  Heart,
  User,
} from 'lucide-react';
import { formatCurrency } from '@/lib/pricingCalculator';
import { useOrders } from '@/hooks/useOrderQueries';
import { usePayments } from '@/hooks/usePaymentQuery';
import { useSession } from 'next-auth/react';
import { Payment } from '@/lib/api/payment';
import {
  DashboardHero,
  DashboardRequestsTab,
  DashboardPaymentsTab,
  DashboardSavedTab,
  DashboardProfileTab,
} from '@/components/dashboard';

type DashboardTab = 'requests' | 'saved' | 'payments' | 'profile';

export function Dashboard() {
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const user = session?.user;

  const [activeTab, setActiveTab] = useState<DashboardTab>('requests');

  const { orders } = useOrders();
  const { payments: paymentsData } = usePayments();

  const totalSpent =
    paymentsData
      ?.filter(
        (p: Payment) =>
          p.paymentType === 'FULL_PAYMENT' || p.paymentType === 'DEPOSIT'
      )
      .reduce(
        (sum: number, p: Payment) =>
          sum + (p.metadata?.calculation?.paymentAmount || 0),
        0
      ) || 0;

  const stats = useMemo(() => {
    const orderList = Array.isArray(orders) ? orders : [];
    const status = (o: { status?: string }) => (o.status ?? '').toLowerCase();
    return [
    {
      label: 'Active Orders',
        value: orderList.filter(
          (o) => !['delivered', 'cancelled', 'refunded'].includes(status(o))
        ).length,
      icon: Car,
      color: 'bg-blue-500',
    },
    {
      label: 'In Transit',
        value: orderList.filter((o) =>
          ['shipped', 'in_transit'].includes(status(o))
        ).length,
      icon: Ship,
      color: 'bg-emerald-500',
    },
    {
      label: 'Delivered',
        value: orderList.filter((o) => status(o) === 'delivered').length,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(totalSpent),
      icon: CreditCard,
      color: 'bg-gray-500',
    },
    ];
  }, [orders, totalSpent]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 border-emerald-600 animate-spin border-t-transparent" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  const userName =
    (user as { profile?: { firstName?: string } })?.profile?.firstName ||
    (user?.email ?? '').split('@')[0];

  const tabs: { id: DashboardTab; label: string; icon: typeof Car }[] = [
    { id: 'requests', label: 'My Requests', icon: Car },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'saved', label: 'Saved', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
      <div className="min-h-screen bg-gray-50">
      <DashboardHero userName={userName} />

      <div className="relative z-10 px-4 mx-auto -mt-6 max-w-7xl sm:px-6 lg:px-8 sm:-mt-8">
        <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex gap-3 items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <div className={`${stat.color} p-2 rounded-lg shrink-0`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-gray-900 truncate sm:text-2xl">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex overflow-x-auto gap-4 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
              <button
                key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
              <tab.icon className="w-5 h-5 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>

        {activeTab === 'requests' && <DashboardRequestsTab />}
        {activeTab === 'payments' && <DashboardPaymentsTab />}
        {activeTab === 'saved' && <DashboardSavedTab />}
        {activeTab === 'profile' && <DashboardProfileTab />}
      </div>
    </div>
  );
}
