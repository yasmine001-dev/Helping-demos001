import { useLocation, Link } from 'react-router-dom'

export default function OrderConfirmationPage() {
  const { state } = useLocation()
  const order = state?.order

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center animate-slide-up">
        {/* Success icon */}
        <div className="w-24 h-24 bg-navy rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
        <h1 className="font-display text-4xl text-navy mb-3">Order Confirmed!</h1>
        <p className="text-gray-400 font-body text-lg mb-8">
          Thank you for your purchase. We'll process your order shortly.
        </p>

        {order && (
          <div className="bg-gray-50 p-6 text-left space-y-4 mb-8">
            <h2 className="font-display text-xl text-navy">Order Details</h2>
            <div className="space-y-2 font-body text-sm">
              {order._id && (
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-400 uppercase tracking-wider text-xs">Order ID</span>
                  <span className="text-navy font-medium font-mono text-xs">{order._id}</span>
                </div>
              )}
              {order.status && (
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-400 uppercase tracking-wider text-xs">Status</span>
                  <span className="badge bg-gold/20 text-gold-dark text-[10px] capitalize">{order.status}</span>
                </div>
              )}
              {order.totalAmount && (
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-400 uppercase tracking-wider text-xs">Total</span>
                  <span className="text-gold font-semibold">${Number(order.totalAmount).toFixed(2)}</span>
                </div>
              )}
              {order.shippingAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase tracking-wider text-xs">Ship to</span>
                  <span className="text-navy text-right">
                    {order.shippingAddress.street}, {order.shippingAddress.city}
                    <br />{order.shippingAddress.phone}
                  </span>
                </div>
              )}
            </div>

            {/* Order items */}
            {order.items?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-body">Items Ordered</p>
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm font-body py-1">
                    <span className="text-navy">{item.product?.name || item.name} × {item.quantity}</span>
                    <span className="text-gold">${((item.price || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/orders" className="btn-primary uppercase tracking-widest text-sm">View My Orders</Link>
          <Link to="/" className="btn-outline uppercase tracking-widest text-sm">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
