interface I_ShippingConfig {
  baseWeight: number; // Base weight in grams
  baseCost: number; // Base cost for baseWeight (in your currency)
  continueWeight: number; // Step weight (g) for each extra cost increment
  continueCost: number; // Cost for each continueWeight (in your currency)
  volumeRatio: number; // Used to calculate volumetric weight (e.g. 5000 or 6000)
  freeShippingWeight?: number; // (optional) Weight (g) eligible for free shipping
  floatingWeight?: number; // (optional) Tolerance before rounding up (g)
  renewalCharge?: number | ((weightG: number) => number); // flat or dynamic
}

export interface I_ShippingInput {
  lengthCm: number; // Length in cm
  widthCm: number; // Width in cm
  heightCm: number; // Height in cm
  actualWeightG: number; // Actual weight in grams
}

export class ShippingCalculator {
  private baseWeight: number;
  private baseCost: number;
  private continueWeight: number;
  private continueCost: number;
  private volumeRatio: number;
  private freeShippingWeight: number;
  private floatingWeight: number;
  private renewalCharge: number | ((weightG: number) => number);
  constructor(config: I_ShippingConfig) {
    this.baseWeight = config.baseWeight;
    this.baseCost = config.baseCost;
    this.continueWeight = config.continueWeight;
    this.continueCost = config.continueCost;
    this.volumeRatio = config.volumeRatio;
    this.freeShippingWeight = config.freeShippingWeight ?? 0;
    this.floatingWeight = config.floatingWeight ?? 0;
    this.renewalCharge = config.renewalCharge ?? 0;
  }

  /**
   * Calculate volumetric weight (kg)
   * Formula: (L × W × H) / VolumeRatio
   */
  private calcVolumetricWeight(
    lengthCm: number,
    widthCm: number,
    heightCm: number,
  ): number {
    const volume = lengthCm * widthCm * heightCm; // in cubic cm
    return volume / this.volumeRatio; // result in kg
  }

  /**
   * Returns the heavier weight (in grams)
   * between actual and volumetric
   */
  private getChargeableWeight(input: I_ShippingInput): number {
    const volumetricKg = this.calcVolumetricWeight(
      input.lengthCm,
      input.widthCm,
      input.heightCm,
    );
    const volumetricG = volumetricKg * 1000;
    return Math.max(volumetricG, input.actualWeightG);
  }

  /**
   * Applies floating weight tolerance and free shipping adjustment
   */
  private adjustWeight(weightG: number): number {
    // Apply free shipping allowance
    let chargeable = Math.max(0, weightG - this.freeShippingWeight);

    // Apply floating tolerance
    const remainder = chargeable % this.continueWeight;
    if (remainder <= this.floatingWeight) {
      chargeable -= remainder; // Round down small remainder
    }

    return chargeable;
  }

  /**
   * Compute final shipping cost
   */
  public computePrice(input: I_ShippingInput): number {
    // Determine which weight to charge
    let weight = this.getChargeableWeight(input);
    weight = this.adjustWeight(weight);

    if (weight <= 0) return 0; // free shipping

    // Start with base cost
    let total = this.baseCost;

    // Add extra charge for exceeding base weight
    if (weight > this.baseWeight) {
      const extraWeight = weight - this.baseWeight;
      const continues = Math.ceil(extraWeight / this.continueWeight);
      total += continues * this.continueCost;
    }

    // Apply renewal charge if applicable
    if (typeof this.renewalCharge === "function") {
      total += this.renewalCharge(weight);
    } else {
      total += this.renewalCharge;
    }

    return parseFloat(total.toFixed(2)); // rounded for currency precision
  }
}
