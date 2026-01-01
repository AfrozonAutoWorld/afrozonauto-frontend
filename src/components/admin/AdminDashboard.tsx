/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  Clock,
  Ship,
  AlertCircle,
  Search,
} from 'lucide-react';
import { formatCurrency } from '../../lib/pricingCalculator';
import type { VehicleRequest, Vehicle, Profile } from '../../types';

/* ----------------------------------
   STATUS CONSTANTS
----------------------------------- */
const STATUS_OPTIONS = [
  'pending_quote',
  'quote_sent',
  'deposit_pending',
  'deposit_paid',
  'inspection_pending',
  'inspection_complete',
  'awaiting_approval',
  'approved',
  'purchase_in_progress',
  'purchased',
  'export_pending',
  'shipped',
  'in_transit',
  'arrived_port',
  'customs_clearance',
  'cleared',
  'delivery_scheduled',
  'delivered',
  'cancelled',
  'refunded',
];

const STATUS_LABELS: Record<string, string> = {
  pending_quote: 'Pending Quote',
  quote_sent: 'Quote Sent',
  deposit_pending: 'Deposit Pending',
  deposit_paid: 'Deposit Paid',
  inspection_pending: 'Inspection Pending',
  inspection_complete: 'Inspection Complete',
  awaiting_approval: 'Awaiting Approval',
  approved: 'Approved',
  purchase_in_progress: 'Purchasing',
  purchased: 'Purchased',
  export_pending: 'Export Pending',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  arrived_port: 'Arrived at Port',
  customs_clearance: 'Customs Clearance',
  cleared: 'Cleared',
  delivery_scheduled: 'Delivery Scheduled',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

interface RequestWithDetails extends VehicleRequest {
  vehicle: Vehicle;
  profile: Profile;
}

export function AdminDashboard() {
  const navigate = useNavigate();

  // ---------------------------
  // MOCK USER & PROFILE FOR TESTING
  // ---------------------------
  const mockUser = { id: '1', email: 'oluwaizminelinks@gmail.com' };
  const mockProfile: Profile = {
    id: '1',
    full_name: 'Charles Omosegbon',
    email: 'oluwaizminelinks@gmail.com',
    phone: '+234803456789',
    country: 'Nigeria',
    state: 'Lagos',
    city: 'Lagos',
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const [user] = useState(mockUser);
  const [profile] = useState(mockProfile);

  const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests');
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<RequestWithDetails | null>(null);

  // ---------------------------
  // AUTH GUARD
  // ---------------------------
  useEffect(() => {
    if (!user) navigate('/login');
    else if (profile.role !== 'admin') navigate('/dashboard');
  }, [user, profile, navigate]);

  // ---------------------------
  // MOCK DATA FETCH
  // ---------------------------
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // MOCK REQUESTS
      const mockRequests: RequestWithDetails[] = [
        {
          id: 'req1',
          request_number: 'REQ-001',
          status: 'pending_quote',
          total_landed_cost_usd: 12000,
          vehicle: {
            id: 'veh1',
            make: 'Toyota',
            model: 'Corolla',
            year: 2020,
            price_usd: 10000,
            vin: '123456789',
            mileage: 50000,
            vehicle_type: 'Sedan',
            engine_size: '1.8L',
            transmission: 'Automatic',
            fuel_type: 'Petrol',
            exterior_color: 'White',
            interior_color: 'Black',
            dealer_name: 'Dealer A',
            dealer_state: 'Lagos',
            dealer_city: 'Lagos',
            images: [],
            features: [],
            source: 'import',
            api_listing_id: 'api123',
            status: 'AVAILABLE',
            created_at: '',
            updated_at: ''
          },
          profile: mockProfile,
          user_id: '',
          vehicle_id: '',
          quoted_price_usd: null,
          deposit_amount_usd: null,
          total_landed_cost_ngn: null,
          shipping_method: null,
          destination_country: '',
          destination_state: null,
          destination_address: null,
          estimated_delivery_date: null,
          cost_breakdown: null,
          notes: null,
          created_at: '',
          updated_at: ''
        },
      ];

      const mockUsers: Profile[] = [mockProfile];

      setRequests(mockRequests);
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------
  // STATUS UPDATE LOCAL
  // ---------------------------
  function updateRequestStatus(requestId: string, newStatus: string) {
    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: newStatus as any } : r))
    );

    if (selectedRequest?.id === requestId) {
      setSelectedRequest({ ...selectedRequest, status: newStatus as any });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  const filteredRequests = requests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (!searchQuery) return true;

    const q = searchQuery.toLowerCase();
    return (
      r.request_number?.toLowerCase().includes(q) ||
      r.vehicle?.make?.toLowerCase().includes(q) ||
      r.vehicle?.model?.toLowerCase().includes(q) ||
      r.profile?.full_name?.toLowerCase().includes(q) ||
      r.profile?.email?.toLowerCase().includes(q)
    );
  });

  const stats = [
    { label: 'Total Requests', value: requests.length, icon: Package },
    {
      label: 'Pending',
      value: requests.filter(r =>
        ['pending_quote', 'deposit_pending', 'awaiting_approval'].includes(r.status)
      ).length,
      icon: Clock,
    },
    {
      label: 'In Transit',
      value: requests.filter(r => ['shipped', 'in_transit'].includes(r.status)).length,
      icon: Ship,
    },
    { label: 'Total Users', value: users.length, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4">
            <div className="flex items-center gap-3">
              <s.icon className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 mb-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search requests..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded-lg px-4"
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {filteredRequests.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No requests found</p>
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl max-w-xl w-full p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Request {selectedRequest.request_number}
              </h2>
              <button onClick={() => setSelectedRequest(null)}>
                <AlertCircle />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              Customer: {selectedRequest.profile?.full_name}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Total: {formatCurrency(selectedRequest.total_landed_cost_usd || 0)}
            </p>

            <select
              value={selectedRequest.status}
              onChange={e =>
                updateRequestStatus(selectedRequest.id, e.target.value)
              }
              className="w-full border rounded-lg p-2"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>

            <button
              onClick={() => setSelectedRequest(null)}
              className="mt-4 w-full bg-gray-900 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
