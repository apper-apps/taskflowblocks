import { motion } from 'framer-motion';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'gradient-primary text-white',
    success: 'gradient-success text-white',
    warning: 'bg-warning text-yellow-900',
    danger: 'gradient-accent text-white',
    high: 'gradient-accent text-white animate-pulse-gentle',
    medium: 'bg-warning text-yellow-900',
    low: 'bg-gray-200 text-gray-700'
  };
  
  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };
  
  const badgeClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={badgeClasses}
      {...props}
    >
      {children}
    </motion.span>
  );
};

export default Badge;