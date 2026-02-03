export type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export async function loadRazorpayScript() {
  if (window.Razorpay) return true;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
  return !!window.Razorpay;
}

export async function openRazorpayCheckout(opts: {
  key: string;
  orderId: string;
  amountInPaise: number;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string };
}): Promise<RazorpaySuccess> {
  await loadRazorpayScript();

  return await new Promise((resolve, reject) => {
    if (!window.Razorpay) return reject(new Error('Razorpay unavailable'));

    const rzp = new window.Razorpay({
      key: opts.key,
      amount: opts.amountInPaise,
      currency: 'INR',
      name: opts.name,
      description: opts.description ?? 'Venue booking',
      order_id: opts.orderId,
      prefill: opts.prefill ?? {},
      handler: (response: RazorpaySuccess) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
      theme: { color: '#7c5cff' },
    });

    rzp.open();
  });
}

