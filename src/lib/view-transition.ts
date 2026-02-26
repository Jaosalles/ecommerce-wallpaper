export function getProductImageTransitionName(slug: string) {
  const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "-");
  return `product-image-${safeSlug}`;
}

export function getProductTitleTransitionName(slug: string) {
  const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "-");
  return `product-title-${safeSlug}`;
}
