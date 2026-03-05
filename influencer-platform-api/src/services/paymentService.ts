import axios from 'axios';

export async function initiatePayment(
  amount: number,
  email: string,
  successRedirectUrl: string,
  failRedirectUrl: string,
  description = '',
  walletId = '681300279f3f9a0d784a27e4'
) {
  const url =
    'https://api.sandbox.konnect.network/api/v2/payments/init-payment';
  const headers = {
    'x-api-key': '681300249f3f9a0d784a27d1:CBJUZ1aTbGCFULeKzh81jNJuLyC7',
  };
  const body = {
    receiverWalletId: walletId,
    token: 'TND',
    amount: amount * 1000, // Convert to millimes
    type: 'immediate',
    description,
    acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
    lifespan: 10,
    checkoutForm: true,
    addPaymentFeesToAmount: false,
    email,
    orderId: Math.floor(Math.random() * 1000000),
    // webhook: 'http://localhost:3000/',
    theme: 'dark',
    successUrl: successRedirectUrl,
    failUrl: failRedirectUrl,
  };

  try {
    const paymentResponse = await axios.post(url, body, { headers });
    const { data } = paymentResponse;
    return data;
  } catch (error) {
    console.error('Error initiating payment:', error);
    throw new Error('Payment initiation failed');
  }
}
export async function getPaymentStatus(paymentRef: string) {
  const url =
    'https://api.sandbox.konnect.network/api/v2/payments/' + paymentRef;

  try {
    const paymentResponse = await axios.get(url);
    const { data } = paymentResponse;
    console.log('Payment status:', data);

    return data;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw new Error('getting payment status failed');
  }
}

// initiatePayment(
//   1000,
//   'example@example.com',
//   'http://localhost:5000/api/test',
//   'http://localhost:3000/',
//   'Payment for services'
// );

// getPaymentStatus('681c24dc83a36f0786e9dd8d');
