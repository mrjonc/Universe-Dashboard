const BRAND_ORDER = ["raw", "nxt", "smackdown"];

export function sortBrands(brands = []) {
  return [...brands].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    const indexA = BRAND_ORDER.findIndex((bName) => nameA.includes(bName));
    const indexB = BRAND_ORDER.findIndex((bName) => nameB.includes(bName));

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return nameA.localeCompare(nameB);
  });
}

export function groupItemsByBrand(sortedBrands, items, getBrandIdFn) {
  return sortedBrands.reduce((acc, brand) => {
    acc[brand.id] = {
      brandInfo: brand,
      items: items.filter(
        (item) => String(getBrandIdFn(item)) === String(brand.id),
      ),
    };
    return acc;
  }, {});
}
