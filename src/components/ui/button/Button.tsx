import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'light';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    const sizeClass = 
      size === 'sm' ? styles.sizeSm :
      size === 'lg' ? styles.sizeLg :
      size === 'xl' ? styles.sizeXl :
      size === 'icon' ? styles.sizeIcon :
      styles.sizeDefault;

    const variantClass = 
      variant === 'destructive' ? styles.variantDestructive :
      variant === 'outline' ? styles.variantOutline :
      variant === 'secondary' ? styles.variantSecondary :
      variant === 'ghost' ? styles.variantGhost :
      variant === 'link' ? styles.variantLink :
      variant === 'light' ? styles.variantLight :
      styles.variantDefault;

    return (
      <Comp
        className={cn(
          styles.base,
          variantClass,
          sizeClass,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
