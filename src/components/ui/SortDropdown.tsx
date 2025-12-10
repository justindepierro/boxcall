import React, { useId, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Icon } from "./Icon";

export type SortOption = {
  id: string;
  label: string;
};

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (optionId: string) => void;
  className?: string;
  label?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  value,
  onChange,
  className = "",
  label = "Sort by",
}) => {
  const selectId = useId();
  const selectedOption = options.find((opt) => opt.id === value);

  return (
    <div className={`relative inline-block ${className}`}>
      <label
        htmlFor={selectId}
        className="mb-2 block text-sm text-secondary sm:mb-0 sm:inline sm:mr-2"
      >
        <span className="sr-only sm:not-sr-only">{label}:</span>
      </label>
      
      <Listbox value={value} onChange={onChange}>
        <div className="relative inline-block">
          <Listbox.Button
            id={selectId}
            className="
              w-full sm:w-auto
              bg-white dark:bg-navy-800
              border border-neutral-200 dark:border-navy-600
              rounded-lg
              px-4 py-2 pr-10
              text-sm text-primary text-left
              cursor-pointer
              hover:border-jade-500
              focus:outline-none focus:ring-2 focus:ring-jade-500/50 focus:border-jade-500
              transition-colors
              min-w-32
            "
          >
            <span className="block truncate">{selectedOption?.label || "Select..."}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Icon name="chevron-down" className="h-4 w-4 text-muted ui-open:rotate-180 transition-transform" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 w-full min-w-32 max-h-60 overflow-auto rounded-lg bg-white dark:bg-navy-800 border border-neutral-200 dark:border-navy-600 shadow-lg focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.id}
                  value={option.id}
                  className={({ active, selected }) =>
                    `relative cursor-pointer select-none py-2 px-3
                    ${active ? "bg-jade-50 dark:bg-jade-900/20" : ""}
                    ${selected ? "bg-jade-100 dark:bg-jade-900/30 text-jade-900 dark:text-jade-100 font-medium" : "text-primary"}
                    `
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between">
                      <span className="block truncate">{option.label}</span>
                      {selected && (
                        <Icon name="check" className="h-4 w-4 text-jade-600 dark:text-jade-400" />
                      )}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
