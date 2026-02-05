import { AlertCircle } from "lucide-react";
import { AddressInput } from "../lib/validation/auth.schema";

export function FormInput({
  form,
  label,
  name,
  type = "text",
}: {
  form?: any;
  label: string;
  name: keyof AddressInput;
  type?: string;
}) {
  const value = form.values[name];
  const stringValue = value === null || value === undefined ? "" : String(value);

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={stringValue}
        onChange={form.handleChange}
        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${form.errors[name] ? "border-red-300" : "border-gray-300"
          }`}
      />
      {form.errors[name] && (
        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
          <AlertCircle className="w-4 h-4" />
          {form.errors[name]}
        </p>
      )}
    </div>
  );
}