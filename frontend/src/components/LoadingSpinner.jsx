export default function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-2 border-border border-t-accent rounded-full animate-spin`} />
    </div>
  );
}