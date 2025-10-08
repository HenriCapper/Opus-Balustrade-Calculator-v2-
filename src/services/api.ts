const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface OrderItem {
  code: string;
  quantity: number;
}

interface CreateOrderResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    name: string;
    invoice_url: string;
    order_id: number | null;
    total_price: string;
  };
  error?: string;
}

export const createShopifyOrder = async (items: OrderItem[]): Promise<CreateOrderResponse> => {
  const token = localStorage.getItem('token'); // Adjust based on your auth implementation

  const response = await fetch(`${API_BASE_URL}/shopify/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create order' }));
    throw new Error(errorData.message || 'Failed to create order');
  }

  return response.json();
};
