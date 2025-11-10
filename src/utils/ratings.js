export const getDisplayRating = (product) => {
  const ratingValue = Number(product?.rating);
  if (!Number.isNaN(ratingValue) && ratingValue > 0) {
    return Math.min(Math.max(ratingValue, 0), 5);
  }

  const source = String(
    product?._id ||
      product?.id ||
      product?.slug ||
      product?.name ||
      product?.title ||
      Math.random()
  );

  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(i);
    hash |= 0;
  }

  const fallback = hash % 2 === 0 ? 5 : 4;
  return fallback;
};
