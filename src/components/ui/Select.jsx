export function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
