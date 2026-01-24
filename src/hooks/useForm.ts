import { useState } from "react";
import { z, ZodObject, ZodRawShape } from "zod";

interface UseFormOptions<TShape extends ZodRawShape> {
  schema: ZodObject<TShape>;
  initialValues: z.infer<ZodObject<TShape>>;
  onSubmit: (values: z.infer<ZodObject<TShape>>) => Promise<void> | void;
}

export function useForm<TShape extends ZodRawShape>({
  schema,
  initialValues,
  onSubmit,
}: UseFormOptions<TShape>) {
  type FormData = z.infer<typeof schema>;
  type FieldName = keyof FormData;

  const [values, setValues] = useState<FormData>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const result = schema.safeParse(values);

    if (!result.success) {
      const fieldErrors: Partial<Record<FieldName, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as FieldName;
        if (field) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const validateField = (name: FieldName): boolean => {
    const fieldSchema = schema.shape[name];
    const result = fieldSchema.safeParse(values[name]);

    if (!result.success) {
      setErrors((prev) => ({
        ...prev,
        [name]: result.error.issues[0]?.message,
      }));
      return false;
    }

    setErrors((prev) => ({ ...prev, [name]: undefined }));
    return true;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, type } = e.target;
    const fieldName = name as FieldName;

    const value =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;

    setValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const setFieldValue = (name: FieldName, value: FormData[FieldName]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const setFieldError = (name: FieldName, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const clearErrors = () => setErrors({});

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
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
