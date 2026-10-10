export const formatNPR = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-NP', {
  maximumFractionDigits: 0
})}`;
