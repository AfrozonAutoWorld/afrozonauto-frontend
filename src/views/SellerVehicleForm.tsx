'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Send, ArrowLeft, Plus, X, ImageIcon } from 'lucide-react';
import {
  useCreateVehicle,
  useUpdateVehicle,
  useSubmitVehicle,
  useMarketplaceVehicle,
} from '@/hooks/useMarketplace';
import { showToast } from '@/lib/showNotification';
import type { VehicleFormData } from '@/lib/marketplace/types';

interface SellerVehicleFormProps {
  vehicleId?: string;
}

const VEHICLE_TYPES = [
  { value: '', label: 'Select type' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'truck', label: 'Truck' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'van', label: 'Van' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'sports', label: 'Sports Car' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'other', label: 'Other' },
];

const TRANSMISSIONS = [
  { value: '', label: 'Select transmission' },
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'cvt', label: 'CVT' },
  { value: 'dual-clutch', label: 'Dual Clutch' },
];

const FUEL_TYPES = [
  { value: '', label: 'Select fuel type' },
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'plug-in-hybrid', label: 'Plug-in Hybrid' },
  { value: 'flex-fuel', label: 'Flex Fuel' },
  { value: 'hydrogen', label: 'Hydrogen' },
];

const DRIVETRAINS = [
  { value: '', label: 'Select drivetrain' },
  { value: 'fwd', label: 'Front-Wheel Drive (FWD)' },
  { value: 'rwd', label: 'Rear-Wheel Drive (RWD)' },
  { value: 'awd', label: 'All-Wheel Drive (AWD)' },
  { value: '4wd', label: 'Four-Wheel Drive (4WD)' },
];

const INITIAL_FORM: VehicleFormData = {
  title: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  price_usd: 0,
  vehicle_type: '',
  exterior_color: '',
  interior_color: '',
  transmission: '',
  fuel_type: '',
  engine_size: '',
  drivetrain: '',
  mileage: 0,
  vin: '',
  description: '',
  features: [],
  location_city: '',
  location_state: '',
  image_urls: [],
};

export function SellerVehicleForm({ vehicleId }: SellerVehicleFormProps) {
  const router = useRouter();
  const isEditMode = !!vehicleId;

  const { data: existingVehicle, isLoading: isLoadingVehicle } = useMarketplaceVehicle(
    vehicleId || ''
  );

  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const submitVehicle = useSubmitVehicle();

  const [form, setForm] = useState<VehicleFormData>(INITIAL_FORM);
  const [featuresInput, setFeaturesInput] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof VehicleFormData, string>>>({});
  const [hasPreFilled, setHasPreFilled] = useState(false);

  // Pre-fill form when editing an existing vehicle
  useEffect(() => {
    if (isEditMode && existingVehicle && !hasPreFilled) {
      setForm({
        title: existingVehicle.title || '',
        make: existingVehicle.make || '',
        model: existingVehicle.model || '',
        year: existingVehicle.year || new Date().getFullYear(),
        price_usd: existingVehicle.price_usd || 0,
        vehicle_type: existingVehicle.vehicle_type || '',
        exterior_color: existingVehicle.exterior_color || '',
        interior_color: existingVehicle.interior_color || '',
        transmission: existingVehicle.transmission || '',
        fuel_type: existingVehicle.fuel_type || '',
        engine_size: existingVehicle.engine_size || '',
        drivetrain: existingVehicle.drivetrain || '',
        mileage: existingVehicle.mileage || 0,
        vin: existingVehicle.vin || '',
        description: existingVehicle.description || '',
        features: existingVehicle.features || [],
        location_city: existingVehicle.location_city || '',
        location_state: existingVehicle.location_state || '',
        image_urls: existingVehicle.images
          ? existingVehicle.images.map((img) => img.url)
          : [],
      });
      setFeaturesInput((existingVehicle.features || []).join(', '));
      setHasPreFilled(true);
    }
  }, [isEditMode, existingVehicle, hasPreFilled]);

  const updateField = useCallback(
    <K extends keyof VehicleFormData>(key: K, value: VehicleFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      if (errors[key]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    },
    [errors]
  );

  function handleFeaturesChange(value: string) {
    setFeaturesInput(value);
    const features = value
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    updateField('features', features);
  }

  function addImageUrl() {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      showToast({ type: 'error', message: 'Please enter a valid URL.' });
      return;
    }
    if (form.image_urls.includes(trimmed)) {
      showToast({ type: 'warning', message: 'This image URL has already been added.' });
      return;
    }
    updateField('image_urls', [...form.image_urls, trimmed]);
    setNewImageUrl('');
  }

  function removeImageUrl(index: number) {
    updateField(
      'image_urls',
      form.image_urls.filter((_, i) => i !== index)
    );
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof VehicleFormData, string>> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required.';
    if (!form.make.trim()) newErrors.make = 'Make is required.';
    if (!form.model.trim()) newErrors.model = 'Model is required.';
    if (!form.year || form.year < 1900 || form.year > new Date().getFullYear() + 2) {
      newErrors.year = 'Please enter a valid year.';
    }
    if (!form.price_usd || form.price_usd <= 0) newErrors.price_usd = 'Price must be greater than 0.';
    if (!form.vehicle_type) newErrors.vehicle_type = 'Vehicle type is required.';
    if (!form.description.trim()) newErrors.description = 'Description is required.';
    if (!form.location_city.trim()) newErrors.location_city = 'City is required.';
    if (!form.location_state.trim()) newErrors.location_state = 'State is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSaveDraft() {
    if (!validate()) {
      showToast({ type: 'error', message: 'Please fix the errors before saving.' });
      return;
    }
    setIsSaving(true);
    try {
      if (isEditMode && vehicleId) {
        await updateVehicle.mutateAsync({ id: vehicleId, data: form });
        showToast({ type: 'success', message: 'Listing updated successfully.' });
      } else {
        await createVehicle.mutateAsync(form);
        showToast({ type: 'success', message: 'Draft saved successfully.' });
      }
      router.push('/seller');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save listing.';
      showToast({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveAndSubmit() {
    if (!validate()) {
      showToast({ type: 'error', message: 'Please fix the errors before submitting.' });
      return;
    }
    setIsSubmitting(true);
    try {
      let id = vehicleId;
      if (isEditMode && vehicleId) {
        await updateVehicle.mutateAsync({ id: vehicleId, data: form });
      } else {
        const created = await createVehicle.mutateAsync(form);
        id = created.id;
      }
      if (id) {
        await submitVehicle.mutateAsync(id);
      }
      showToast({ type: 'success', message: 'Listing submitted for review.' });
      router.push('/seller');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save and submit listing.';
      showToast({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- Loading State (edit mode) ---
  if (isEditMode && isLoadingVehicle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded" />
              <div className="h-8 w-64 bg-gray-200 rounded" />
            </div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isProcessing = isSaving || isSubmitting;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/seller')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Listing' : 'Create New Listing'}
            </h1>
            <p className="mt-1 text-gray-500">
              {isEditMode ? 'Update your vehicle listing details.' : 'Fill in the details for your new vehicle listing.'}
            </p>
          </div>
        </div>

        {/* Rejection Notice (edit mode) */}
        {isEditMode && existingVehicle?.status === 'REJECTED' && existingVehicle.rejection_reason && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-semibold text-red-800">This listing was rejected:</p>
            <p className="text-sm text-red-700 mt-1">{existingVehicle.rejection_reason}</p>
            <p className="text-sm text-red-600 mt-2">
              Please address the issues above and resubmit for review.
            </p>
          </div>
        )}

        <div className="space-y-8">
          {/* Basic Information */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Basic Information</h2>
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. 2023 Toyota Camry XSE - Low Miles"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={isProcessing}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Make, Model, Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                    Make <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="make"
                    type="text"
                    value={form.make}
                    onChange={(e) => updateField('make', e.target.value)}
                    placeholder="e.g. Toyota"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.make ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isProcessing}
                  />
                  {errors.make && <p className="mt-1 text-sm text-red-600">{errors.make}</p>}
                </div>
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="model"
                    type="text"
                    value={form.model}
                    onChange={(e) => updateField('model', e.target.value)}
                    placeholder="e.g. Camry"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.model ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isProcessing}
                  />
                  {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
                </div>
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="year"
                    type="number"
                    value={form.year}
                    onChange={(e) => updateField('year', parseInt(e.target.value, 10) || 0)}
                    placeholder="e.g. 2023"
                    min={1900}
                    max={new Date().getFullYear() + 2}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.year ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isProcessing}
                  />
                  {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
                </div>
              </div>

              {/* Price and VIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price_usd" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      id="price_usd"
                      type="number"
                      value={form.price_usd || ''}
                      onChange={(e) => updateField('price_usd', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min={0}
                      className={`w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.price_usd ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={isProcessing}
                    />
                  </div>
                  {errors.price_usd && <p className="mt-1 text-sm text-red-600">{errors.price_usd}</p>}
                </div>
                <div>
                  <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
                    VIN
                  </label>
                  <input
                    id="vin"
                    type="text"
                    value={form.vin}
                    onChange={(e) => updateField('vin', e.target.value.toUpperCase())}
                    placeholder="e.g. 1HGCG5655WA041649"
                    maxLength={17}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Vehicle Details */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Vehicle Details</h2>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vehicle Type */}
                <div>
                  <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="vehicle_type"
                    value={form.vehicle_type}
                    onChange={(e) => updateField('vehicle_type', e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white ${
                      errors.vehicle_type ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isProcessing}
                  >
                    {VEHICLE_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.vehicle_type && <p className="mt-1 text-sm text-red-600">{errors.vehicle_type}</p>}
                </div>

                {/* Transmission */}
                <div>
                  <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">
                    Transmission
                  </label>
                  <select
                    id="transmission"
                    value={form.transmission}
                    onChange={(e) => updateField('transmission', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    disabled={isProcessing}
                  >
                    {TRANSMISSIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Type
                  </label>
                  <select
                    id="fuel_type"
                    value={form.fuel_type}
                    onChange={(e) => updateField('fuel_type', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    disabled={isProcessing}
                  >
                    {FUEL_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Drivetrain */}
                <div>
                  <label htmlFor="drivetrain" className="block text-sm font-medium text-gray-700 mb-1">
                    Drivetrain
                  </label>
                  <select
                    id="drivetrain"
                    value={form.drivetrain}
                    onChange={(e) => updateField('drivetrain', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    disabled={isProcessing}
                  >
                    {DRIVETRAINS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Engine Size */}
                <div>
                  <label htmlFor="engine_size" className="block text-sm font-medium text-gray-700 mb-1">
                    Engine Size
                  </label>
                  <input
                    id="engine_size"
                    type="text"
                    value={form.engine_size}
                    onChange={(e) => updateField('engine_size', e.target.value)}
                    placeholder="e.g. 2.5L"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    disabled={isProcessing}
                  />
                </div>

                {/* Mileage */}
                <div>
                  <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
                    Mileage
                  </label>
                  <input
                    id="mileage"
                    type="number"
                    value={form.mileage || ''}
                    onChange={(e) => updateField('mileage', parseInt(e.target.value, 10) || 0)}
                    placeholder="e.g. 25000"
                    min={0}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="exterior_color" className="block text-sm font-medium text-gray-700 mb-1">
                    Exterior Color
                  </label>
                  <input
                    id="exterior_color"
                    type="text"
                    value={form.exterior_color}
                    onChange={(e) => updateField('exterior_color', e.target.value)}
                    placeholder="e.g. Pearl White"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label htmlFor="interior_color" className="block text-sm font-medium text-gray-700 mb-1">
                    Interior Color
                  </label>
                  <input
                    id="interior_color"
                    type="text"
                    value={form.interior_color}
                    onChange={(e) => updateField('interior_color', e.target.value)}
                    placeholder="e.g. Black Leather"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Description & Features */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Description & Features</h2>
            <div className="space-y-5">
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={5}
                  placeholder="Describe your vehicle in detail. Include condition, history, notable features, etc."
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-y ${
                    errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={isProcessing}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Features */}
              <div>
                <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-1">
                  Features (comma-separated)
                </label>
                <input
                  id="features"
                  type="text"
                  value={featuresInput}
                  onChange={(e) => handleFeaturesChange(e.target.value)}
                  placeholder="e.g. Leather seats, Sunroof, Backup camera, Apple CarPlay"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  disabled={isProcessing}
                />
                {form.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location_city" className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  id="location_city"
                  type="text"
                  value={form.location_city}
                  onChange={(e) => updateField('location_city', e.target.value)}
                  placeholder="e.g. Los Angeles"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.location_city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={isProcessing}
                />
                {errors.location_city && (
                  <p className="mt-1 text-sm text-red-600">{errors.location_city}</p>
                )}
              </div>
              <div>
                <label htmlFor="location_state" className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  id="location_state"
                  type="text"
                  value={form.location_state}
                  onChange={(e) => updateField('location_state', e.target.value)}
                  placeholder="e.g. California"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.location_state ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={isProcessing}
                />
                {errors.location_state && (
                  <p className="mt-1 text-sm text-red-600">{errors.location_state}</p>
                )}
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Images</h2>
            <div className="space-y-4">
              {/* Add image URL */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addImageUrl();
                    }
                  }}
                  placeholder="Paste image URL here..."
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  disabled={isProcessing}
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  disabled={isProcessing || !newImageUrl.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              {/* Image list */}
              {form.image_urls.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center">
                  <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No images added yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Add image URLs to showcase your vehicle.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {form.image_urls.map((url, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={url}
                        alt={`Vehicle image ${index + 1}`}
                        className="w-full h-28 object-cover bg-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '';
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.classList.add('bg-gray-100');
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        disabled={isProcessing}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        aria-label="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={() => router.push('/seller')}
              disabled={isProcessing}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={handleSaveAndSubmit}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Save & Submit for Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
