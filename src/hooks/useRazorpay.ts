import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}
interface RazorpayInstance {
  open(): void;
}
declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type CourseData = {
  id: string;
  title: string;
  price: string;
};

export const useRazorpay = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const existingScript = document.getElementById('razorpay-script');
    if (existingScript) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      toast({
        title: 'Error',
        description: 'Failed to load payment gateway. Please refresh the page.',
        variant: 'destructive',
      });
    };
    document.body.appendChild(script);
  }, []);

  const initiatePayment = useCallback(
    async (
      course: CourseData,
      onSuccess: (courseId: string) => void,
      onCancel?: () => void
    ) => {
      if (!isScriptLoaded) {
        toast({
          title: 'Please Wait',
          description: 'Payment gateway is loading...',
        });
        return;
      }

      setIsLoading(true);

      try {
        // Step 1: Create order on backend
        const orderResponse = await api.post('/payments/create-order', {
          courseId: course.id,
        });

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(errorData.error || 'Failed to create order');
        }

        const orderData = await orderResponse.json();

        // Step 2: Open Razorpay checkout
        const options: RazorpayOptions = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'DataUniverse',
          description: `Purchase: ${course.title}`,
          order_id: orderData.orderId,
          prefill: {
            name: orderData.prefill?.name || '',
            email: orderData.prefill?.email || '',
          },
          theme: {
            color: '#6366f1', // Primary color
          },
          handler: async (response: RazorpayResponse) => {
            try {
              // Step 3: Verify payment on backend
              const verifyResponse = await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                purchaseId: orderData.purchaseId,
              });

              if (!verifyResponse.ok) {
                const errorData = await verifyResponse.json();
                throw new Error(errorData.error || 'Payment verification failed');
              }

              const verifyData = await verifyResponse.json();

              toast({
                title: 'Payment Successful! 🎉',
                description: verifyData.message || `You now have access to "${course.title}"`,
              });

              onSuccess(course.id);
            } catch (error: unknown) {
              console.error('Payment verification error:', error);
              toast({
                title: 'Payment Verification Failed',
                description: error instanceof Error ? error.message : 'Please contact support if amount was deducted.',
                variant: 'destructive',
              });
            } finally {
              setIsLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
              onCancel?.();
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error: unknown) {
        console.error('Payment initiation error:', error);
        toast({
          title: 'Payment Failed',
          description: error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    },
    [isScriptLoaded]
  );

  return {
    initiatePayment,
    isLoading,
    isReady: isScriptLoaded,
  };
};
