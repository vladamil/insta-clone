// Only plain text gets through. Objects like { "$ne": null } become '',
// so they can't be used as MongoDB operators (NoSQL injection).
const cleanString = (value) => (typeof value === 'string' ? value.trim() : '');

export { cleanString };
