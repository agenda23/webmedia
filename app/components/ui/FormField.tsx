import React from "react";

type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  as?: "input" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  helperText?: string;
  children?: React.ReactNode;
  className?: string;
  rows?: number;
  min?: number;
  max?: number;
};

export function FormField({
  label,
  name,
  type = "text",
  as = "input",
  placeholder,
  required,
  defaultValue,
  error,
  helperText,
  children,
  className = "",
  rows = 3,
  min,
  max,
  ...props
}: FormFieldProps & React.HTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  const id = `field-${name}`;
  
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {as === "textarea" ? (
        <textarea
          id={id}
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          required={required}
          rows={rows}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            error ? "border-red-300" : ""
          }`}
          {...props}
        />
      ) : as === "select" ? (
        <select
          id={id}
          name={name}
          defaultValue={defaultValue}
          required={required}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            error ? "border-red-300" : ""
          }`}
          {...props}
        >
          {children}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          required={required}
          min={min}
          max={max}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            error ? "border-red-300" : ""
          }`}
          {...props}
        />
      )}
      
      {helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
