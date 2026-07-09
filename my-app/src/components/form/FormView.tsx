"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/hooks/useTranslation";
import type { FormField } from "@/types/chat";

const OTHER_SENTINEL = "__other__";

const baseInputClass =
  "w-full rounded-xl border border-black/15 bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-pink-500 disabled:opacity-50 dark:border-white/15";

function SelectField({
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
  const options = field.options ?? [];
  const [customMode, setCustomMode] = useState(() => value !== "" && !options.includes(value));

  if (customMode) {
    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "Type your own answer"}
          disabled={disabled}
          autoFocus
          className={baseInputClass}
        />
        <button
          type="button"
          onClick={() => {
            setCustomMode(false);
            onChange("");
          }}
          disabled={disabled}
          className="shrink-0 rounded-xl border border-black/15 px-3 text-xs text-black/60 hover:border-black/30 disabled:opacity-50 dark:border-white/15 dark:text-white/60 dark:hover:border-white/30"
        >
          Choose from list
        </button>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === OTHER_SENTINEL) {
          setCustomMode(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      }}
      disabled={disabled}
      className={baseInputClass}
    >
      <option value="" disabled className="bg-background text-foreground">
        Select…
      </option>
      {options.map((option) => (
        <option key={option} value={option} className="bg-background text-foreground">
          {option}
        </option>
      ))}
      <option value={OTHER_SENTINEL} className="bg-background text-foreground">
        Other (type my own)
      </option>
    </select>
  );
}

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
  if (field.type === "select") {
    return <SelectField field={field} value={value} onChange={onChange} disabled={disabled} />;
  }

  if (field.type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        rows={3}
        className={cn(baseInputClass, "resize-none")}
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
      className={baseInputClass}
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
  const { t } = useTranslation();
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
        className="self-start rounded-full bg-pink-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-pink-500 disabled:opacity-40"
      >
        {t("continue")}
      </button>
    </form>
  );
}
