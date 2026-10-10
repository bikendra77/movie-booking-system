const futureProviders = Object.freeze(['esewa', 'khalti']);

export const getPaymentCapabilities = () => ({
  onlinePaymentsEnabled: false,
  currency: 'NPR',
  futureProviders
});

export const createPaymentIntent = async () => {
  throw new Error('Online payment is not configured. Reservations are payable at the cinema counter.');
};