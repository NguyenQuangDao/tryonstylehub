import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  colorScheme?: 'default';
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, colorScheme = 'default', ...props }, ref) => {
    const id = React.useId();
    
    const colorStyles = {
      default: 'border-gray-300 dark:border-gray-600 data-[checked]:bg-blue-600 data-[checked]:border-blue-600 dark:data-[checked]:bg-blue-500 dark:data-[checked]:border-blue-500 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400',
    };

    return (
      <div className="flex items-start gap-2">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id={props.id || id}
            ref={ref}
            className="peer sr-only"
            {...props}
          />
          <motion.div
            className={cn(
              "h-4 w-4 shrink-0 rounded border ring-offset-white dark:ring-offset-gray-950 transition-all peer-disabled:cursor-not-allowed peer-disabled:opacity-50 cursor-pointer",
              colorStyles[colorScheme],
              "peer-checked:data-[checked]:border-transparent peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
              className
            )}
            data-checked={props.checked ? '' : undefined}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 1 }}
            animate={{ scale: 1 }}
            onClick={() => {
              const input = document.getElementById(props.id || id) as HTMLInputElement;
              if (input && !props.disabled) {
                input.click();
              }
            }}
          >
            {props.checked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.1 }}
                className="flex h-full w-full items-center justify-center"
              >
                <Check className="h-3 w-3 text-white" />
              </motion.div>
            )}
          </motion.div>
        </div>
        {(label || description) && (
          <div className="grid gap-0.5 leading-none">
            {label && (
              <label
                htmlFor={props.id || id}
                className="cursor-pointer text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-open-sans text-gray-900 dark:text-gray-100"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-gray-600 dark:text-gray-300 font-open-sans">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;