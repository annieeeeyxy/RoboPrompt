"use client";

import { useState } from "react";
import type { FormField } from "@/types/chat";

function FieldInput({
  field,
  value,
  onChange,
  disabled,
}: {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const baseClass =
    "w-full rounded-xl border border-black/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:opacity-50 dark:border-white/15";

  if (field.type === "select") {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={baseClass}
      >
        <option value="" disabled>
          Select…
        </option>
        {(field.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        rows={3}
        className={`${baseClass} resize-none`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      disabled={disabled}
      className={baseClass}
    />
  );
}

export function FormView({
  prompt,
  fields,
  onSubmit,
  disabled,
}: {
  prompt: string;
  fields: FormField[];
  onSubmit: (values: Record<string, string>) => void;
  disabled?: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.id, ""]))
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="flex flex-col gap-5"
    >
      {prompt && <p className="text-base font-medium">{prompt}</p>}

      <div className="flex flex-col gap-4">
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label className="text-sm text-black/60 dark:text-white/60">{field.label}</label>
            <FieldInput
              field={field}
              value={values[field.id] ?? ""}
              onChange={(value) => setValues((prev) => ({ ...prev, [field.id]: value }))}
              disabled={disabled}
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="self-start rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
      >
        Continue
      </button>
    </form>
  );
}
