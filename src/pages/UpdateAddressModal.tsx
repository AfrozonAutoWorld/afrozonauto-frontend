import { X, AlertCircle } from "lucide-react";
import { addressSchema } from "../lib/validation/auth.schema";
import { useAddressMutate } from "../hooks/useAddress";
import { useForm } from "../hooks/useForm";
import { FormInput } from "./FormInput";

interface Props {
  address: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function UpdateAddressModal({ address, onClose, onSuccess }: Props) {
  const { updateAddress } = useAddressMutate();

  const form = useForm({
    schema: addressSchema,
    initialValues: {
      type: address.type || "NORMAL",
      street: address.street || "",
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "",
      isDefault: address.isDefault || false,
      additionalInfo: address.additionalInfo || "",
      phoneNumber: address.phoneNumber || "",
      additionalPhoneNumber: address.additionalPhoneNumber || "",
    },
    onSubmit: async (values) => {
      await updateAddress({ id: address.id, data: values });
      onSuccess();
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Update Address</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Address Type</label>
            <select
              name="type"
              value={form.values.type || ""}
              onChange={form.handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

          <div className="md:col-span-2" />

          <FormInput form={form} label="First Name" name="firstName" />
          <FormInput form={form} label="Last Name" name="lastName" />
          <FormInput form={form} label="Street Address" name="street" />
          <FormInput form={form} label="City" name="city" />
          <FormInput form={form} label="State/Province" name="state" />
          <FormInput form={form} label="Postal Code" name="postalCode" />
          <FormInput form={form} label="Country" name="country" />
          <FormInput form={form} label="Phone Number" name="phoneNumber" type="tel" />
          <FormInput form={form} label="Additional Phone (Optional)" name="additionalPhoneNumber" type="tel" />
          <FormInput form={form} label="Additional Info (Optional)" name="additionalInfo" />

          <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={form.values.isDefault}
              onChange={form.handleChange}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label className="text-sm font-medium cursor-pointer">
              Set as default address
            </label>
          </div>

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
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {form.isSubmitting ? "Saving..." : "Update Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

