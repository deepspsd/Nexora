import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.warn('Stripe publishable key not found');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  priceId: string; // Stripe Price ID
  popular?: boolean;
  bonus?: number;
}

export const creditPackages: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 9.99,
    priceId: 'price_starter',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 500,
    price: 39.99,
    priceId: 'price_pro',
    popular: true,
    bonus: 50,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 2000,
    price: 129.99,
    priceId: 'price_enterprise',
    bonus: 300,
  },
];

export const createCheckoutSession = async (priceId: string): Promise<{ sessionId: string }> => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  
  const response = await fetch(`${backendUrl}/api/payments/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ priceId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return await response.json();
};

export const redirectToCheckout = async (priceId: string) => {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const { sessionId } = await createCheckoutSession(priceId);
    
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};
