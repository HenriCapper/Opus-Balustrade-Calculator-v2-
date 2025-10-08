import { useLayoutStore } from "@/store/useLayoutStore";
import { createShopifyOrder } from "@/services/api";
import { useState } from "react";

function formatQuantity(qty: number): string {
  if (Number.isInteger(qty)) return qty.toLocaleString();
  const rounded = Math.round(qty * 10) / 10;
  return rounded.toFixed(1).replace(/\.0$/, "");
}

export default function OrderList() {
  const orderItems = useLayoutStore((s) => s.result?.orderItems ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    invoiceUrl?: string;
  }>({ type: null, message: '' });

  if (!orderItems.length) return null;

  const handleOrderNow = async () => {
    setIsLoading(true);
    setOrderStatus({ type: null, message: '' });

    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      setOrderStatus({
        type: 'error',
        message: 'Authentication required. Please set up your token first. See browser console for instructions.',
      });
      console.error('❌ No authentication token found!');
      console.log('📋 To fix this, run this script in your backend:');
      console.log('   cd opus-backend && npm run create-test-user');
      console.log('Then copy the token and run in this console:');
      console.log("   localStorage.setItem('token', 'YOUR_TOKEN_HERE')");
      setIsLoading(false);
      return;
    }

    try {
      const items = orderItems.map(item => ({
        code: item.code,
        quantity: item.quantity,
      }));

      console.log('📦 Creating order with items:', items);
      const response = await createShopifyOrder(items);
      console.log('📬 Response received:', response);

      if (response.success && response.data) {
        const invoiceUrl = response.data.invoice_url;
        
        setOrderStatus({
          type: 'success',
          message: `Draft order ${response.data.name} created successfully!`,
          invoiceUrl: invoiceUrl,
        });

        // Automatically open the invoice URL in a new tab
        if (invoiceUrl) {
          console.log('🔗 Opening invoice URL:', invoiceUrl);
          const newWindow = window.open(invoiceUrl, '_blank', 'noopener,noreferrer');
          
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            // Popup blocked - user needs to click the link
            console.warn('⚠️ Popup blocked. Please allow popups for this site.');
          }
        } else {
          console.warn('⚠️ No invoice URL in response');
        }
      } else {
        console.error('❌ Order creation failed:', response);
        setOrderStatus({
          type: 'error',
          message: response.message || 'Failed to create order',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating the order';
      setOrderStatus({
        type: 'error',
        message: errorMessage,
      });
      
      // Log helpful info for auth errors
      if (errorMessage.includes('authorized')) {
        console.error('❌ Authentication error. Your token may be invalid or expired.');
        console.log('📋 Generate a new token by running:');
        console.log('   cd opus-backend && npm run create-test-user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-700">Order List</h3>
        <button
          onClick={handleOrderNow}
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {isLoading ? 'Creating Order...' : 'Order Now'}
        </button>
      </div>

      {orderStatus.type && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            orderStatus.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div>{orderStatus.message}</div>
          {orderStatus.type === 'success' && orderStatus.invoiceUrl && (
            <a
              href={orderStatus.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 font-semibold text-green-700 hover:text-green-900 underline"
            >
              Open Draft Order in Shopify
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Description</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Code</th>
              <th className="px-4 py-2 text-right font-medium text-slate-600">Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orderItems.map((item) => (
              <tr key={`${item.code}-${item.description}`}>
                <td className="px-4 py-2 text-slate-700">{item.description}</td>
                <td className="px-4 py-2 font-mono text-slate-500">{item.code}</td>
                <td className="px-4 py-2 text-right font-semibold text-slate-700">{formatQuantity(item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
