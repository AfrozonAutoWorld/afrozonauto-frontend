import { useState } from "react";
import { z, ZodObject, ZodError, ZodTypeAny } from "zod";

interface UseFormOptions<T extends ZodObject<any>> {
  schema: T;
  initialValues: z.infer<T>;
  onSubmit: (values: z.infer<T>) => Promise<void> | void;
}

export function useForm<T extends ZodObject<any>>({
  schema,
  initialValues,
  onSubmit,
}: UseFormOptions<T>) {
  type FormData = z.infer<T>;
  type FieldName = keyof FormData;

  const [values, setValues] = useState<FormData>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    try {
      schema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<Record<FieldName, string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as FieldName] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const validateField = (name: FieldName): boolean => {
    try {
      const fieldSchema = schema.shape[name as string] as ZodTypeAny;
      if (fieldSchema) {
        fieldSchema.parse(values[name]);
        setErrors((prev) => ({ ...prev, [name]: undefined }));
        return true;
      }
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        setErrors((prev) => ({
          ...prev,
          [name]: error.issues[0]?.message,
        }));
      }
      return false;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const fieldName = name as FieldName;

    setValues((prev) => ({
      ...prev,
      [fieldName]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const setFieldValue = (name: FieldName, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const setFieldError = (name: FieldName, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldError,
    validateForm,
    validateField,
    clearErrors,
    reset,
  };
}
