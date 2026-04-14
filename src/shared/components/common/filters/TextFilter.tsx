/**
 * TextFilter Component
 *
 * Text input filter using shadcn/ui Input
 */

"use client";

import React from "react";
import { Input } from "@/components/ui/input";

interface TextFilterProps {
  field: string;
  label: string;
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const TextFilter = React.forwardRef<HTMLInputElement, TextFilterProps>(
  (
    {
      field,
      label,
      value = "",
      placeholder = `Filter by ${label.toLowerCase()}...`,
      onChange,
      disabled = false,
    },
    ref,
  ) => {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={`filter-${field}`} className="text-sm font-medium">
          {label}
        </label>
        <Input
          ref={ref}
          id={`filter-${field}`}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </div>
    );
  },
);

TextFilter.displayName = "TextFilter";
