import { AlertCircle, X } from "lucide-react";
import { addressSchema } from '../lib/validation/auth.schema';
import { useAddressMutate } from "../hooks/useAddress";
import { FormInput } from "./FormInput";
import { useForm } from "../hooks/useForm";
import { useState } from "react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddAddressModal({ onClose, onSuccess }: Props) {
  const { addUserAddress } = useAddressMutate();
  const [loading, setLoading] = useState(false);


  const form = useForm({
    schema: addressSchema,
    initialValues: {
      type: "NORMAL",
      street: "",
      firstName: "",
      lastName: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      isDefault: false,
      additionalInfo: "",
      phoneNumber: "",
      additionalPhoneNumber: "",
    },
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await addUserAddress(values);
        onSuccess();
        onClose();
      } finally {
        setLoading(false);
      }
    },
  });
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Add New Address</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Address Type</label>
            <select
              name="type"
              value={form.values.type}
              onChange={form.handleChange}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${form.errors.type ? "border-red-300" : "border-gray-300"
                }`}
            >
              <option value="NORMAL">Normal</option>
              <option value="BILLING">Billing</option>
              <option value="SHIPPING">Shipping</option>
            </select>
            {form.errors.type && (
              <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                <AlertCircle className="w-4 h-4" />
                {form.errors.type}
              </p>
            )}
          </div>

          <div className="md:col-span-2" /> {/* Spacer */}

          {/* Other Inputs */}
          <FormInput label="First Name" name="firstName" type="text" form={form} />
          <FormInput label="Last Name" name="lastName" type="text" form={form} />
          <FormInput label="Street Address" name="street" type="text" form={form} />
          <FormInput label="City" name="city" type="text" form={form} />
          <FormInput label="State/Province" name="state" type="text" form={form} />
          <FormInput label="Postal Code" name="postalCode" type="text" form={form} />
          <FormInput label="Country" name="country" type="text" form={form} />
          <FormInput label="Phone Number" name="phoneNumber" type="tel" form={form} />
          <FormInput label="Additional Phone (Optional)" name="additionalPhoneNumber" type="tel" form={form} />
          <FormInput label="Additional Info (Optional)" name="additionalInfo" type="text" form={form} />

          {/* Checkbox */}
          <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={form.values.isDefault}
              onChange={form.handleChange}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label className="text-sm font-medium cursor-pointer">Set as default address</label>
          </div>

          {/* Submit / Cancel */}
          <div className="flex justify-end gap-3 pt-4 border-t md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              disabled={form.isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={form.isSubmitting}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Address"}

            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
