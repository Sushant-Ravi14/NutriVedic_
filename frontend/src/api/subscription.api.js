import client from './client';

export const createSubscriptionOrderApi = async (planId) => {
  const res = await client.post('/api/subscription/start', { planId });
  return res.data;
};

export const verifySubscriptionApi = async (paymentDetails) => {
  const payload = {
    razorpay_order_id: paymentDetails.orderId || paymentDetails.razorpay_order_id,
    razorpay_payment_id: paymentDetails.paymentId || paymentDetails.razorpay_payment_id,
    razorpay_signature: paymentDetails.signature || paymentDetails.razorpay_signature || 'demo_signature'
  };
  const res = await client.post('/api/subscription/verify', payload);
  return res.data;
};

