export interface QcDetails {
  id: string;
  length: number;
  width: number;
  height: number;
  volume: number | null;
}

export interface Product {
  qc: QcDetails[];
}
export function calculateTotalQCDimensions(dataArray: Product[]) {
  const total = {
    totalLength: 0,
    totalWidth: 0,
    totalHeight: 0,
    totalVolume: 0,
  };

  if (!dataArray || !Array.isArray(dataArray)) {
    return total;
  }

  // Loop through each product in the data array
  dataArray.forEach((product) => {
    if (product.qc && Array.isArray(product.qc)) {
      // Loop through each QC entry in the product
      product.qc.forEach((qc: QcDetails) => {
        total.totalLength += qc.length || 0;
        total.totalWidth += qc.width || 0;
        total.totalHeight += qc.height || 0;
        total.totalVolume += qc.volume || 0;
      });
    }
  });

  return total;
}
