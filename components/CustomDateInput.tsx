'use client';

import React, { useState, useEffect } from 'react';

interface CustomDateInputProps {
  label?: string;
  name: string;
  value?: string;
  required?: boolean;
  error?: string;
  onChange: (name: string, value: string) => void;
}

export default function CustomDateInput({
  label,
  name,
  value = '',
  required = false,
  error,
  onChange,
}: CustomDateInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '').slice(0, 8); // mantém só números
    if (input.length > 4) input = input.replace(/^(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
    else if (input.length > 2) input = input.replace(/^(\d{2})(\d{0,2})/, '$1/$2');

    setLocalValue(input);
    onChange(name, input);
  };

  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="text"
        name={name}
        value={localValue}
        onChange={handleChange}
        placeholder="DD/MM/AAAA"
        className={`w-full p-2 text-sm border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 
          ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-[#293f58] focus:border-[#293f58]'
          }`}
        style={
          !error
            ? {
                ['--tw-ring-color' as any]: '#293f58',
                borderColor: '#293f58',
              }
            : {}
        }
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
