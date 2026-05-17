export default function LoadingSpinner({ size = 'md', light = false }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-10 w-10', lg: 'h-16 w-16' }
  return (
    <div className="flex justify-center items-center py-10">
      <div
        className={`${sizes[size]} border-2 ${light ? 'border-white/30 border-t-white' : 'border-navy/20 border-t-navy'} rounded-full animate-spin`}
      />
    </div>
  )
}
