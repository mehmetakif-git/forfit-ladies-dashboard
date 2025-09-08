import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { motion } from "framer-motion";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  ({
    options,
    value,
    onValueChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyText = "No results found.",
    className,
    disabled,
    ...props
  }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [triggerWidth, setTriggerWidth] = React.useState<number | undefined>();
    const triggerRef = React.useRef<HTMLButtonElement>(null);

    React.useImperativeHandle(ref, () => triggerRef.current!);

    React.useEffect(() => {
      const updateWidth = () => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setTriggerWidth(rect.width);
        }
      };

      if (open) {
        updateWidth();
      }
    }, [open]);

    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find((option) => option.value === value);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            role="combobox"
            aria-expanded={open}
            className={`
              flex h-10 w-full items-center justify-between
              rounded-2xl border border-[color:var(--border)] bg-surface
              px-3 py-2 text-sm text-[color:var(--text-primary)]
              shadow-sm transition-all duration-200
              focus:outline-none focus-visible:brand-ring
              hover:border-[color-mix(in_oklab,var(--brand-1)_20%,transparent)]
              disabled:cursor-not-allowed disabled:opacity-50
              ${className}
            `}
            disabled={disabled}
            {...props}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0"
          style={{
            width: triggerWidth ? `${triggerWidth}px` : undefined,
            minWidth: '12rem'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
          >
            <div className="p-2">
              <input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  flex h-9 w-full rounded-lg border border-[color:var(--border)]
                  bg-surface px-3 py-1 text-sm text-[color:var(--text-primary)]
                  placeholder:text-[color:var(--text-muted)]
                  focus:outline-none focus-visible:brand-ring
                "
              />
            </div>
            <div className="max-h-48 overflow-auto dropdown-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-[color:var(--text-muted)]">
                  {emptyText}
                </div>
              ) : (
                <div className="p-1">
                  {filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onValueChange?.(option.value);
                        setOpen(false);
                        setSearch("");
                      }}
                      disabled={option.disabled}
                      className={`
                        relative flex w-full cursor-default select-none items-center
                        rounded-lg py-2 pl-8 pr-3 text-sm text-[color:var(--text-primary)]
                        outline-none transition-colors duration-150
                        hover:bg-[color-mix(in_oklab,var(--brand-1)_12%,transparent)]
                        disabled:pointer-events-none disabled:opacity-50
                        ${value === option.value ? 'bg-[color-mix(in_oklab,var(--brand-1)_18%,transparent)]' : ''}
                      `}
                    >
                      {value === option.value && (
                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </PopoverContent>
      </Popover>
    );
  }
);

Combobox.displayName = "Combobox";