export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors ${className}`}
      {...props}
    />
  );
}
