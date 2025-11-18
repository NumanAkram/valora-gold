// Helper function to ensure proper image structure
export const getProductImages = (product) => {
  // Priority: imageUrl (primary) > images[0] (first gallery) > image (fallback) > default
  const primaryImage = product.imageUrl || product.images?.[0] || product.image || '/4.webp';
  
  // Build images array with imageUrl first, then gallery images (excluding imageUrl if it's in gallery)
  let allImages = [];
  if (product.imageUrl) {
    allImages = [product.imageUrl, ...(product.images || []).filter(img => img && img !== product.imageUrl)];
  } else if (product.images && product.images.length > 0) {
    allImages = [...product.images];
  } else if (product.image) {
    allImages = [product.image];
  } else {
    allImages = [primaryImage];
  }
  
  return {
    primaryImage,
    allImages: allImages.length > 0 ? allImages : [primaryImage],
  };
};

