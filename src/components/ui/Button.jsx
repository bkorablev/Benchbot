const variants = {
  primary: 'bg-teal-600 hover:bg-teal-700 text-white border-transparent shadow-sm',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 border-transparent',
  danger: 'bg-white hover:bg-red-50 text-red-600 border-red-200',
  outline: 'bg-transparent hover:bg-teal-50 text-teal-700 border-teal-300',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2',
};

export function Button({ children, variant = 'secondary', size = 'md', className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
