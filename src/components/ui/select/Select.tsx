import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from './Select.module.css';

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-gray-100 px-3 py-2 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&>option]:bg-white [&>option]:dark:bg-[#1A1A1A] [&>option]:text-gray-900 [&>option]:dark:text-gray-100",
          styles.selectModule,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export { Select };
