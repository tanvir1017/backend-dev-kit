import { ShippingProvider } from "@prisma/client";
import { I_ShippingInput, ShippingCalculator } from "./ShippingProviderCalc";

type T_ProviderConfig = Pick<
  ShippingProvider,
  | "firstWeightG"
  | "firstCharge"
  | "continueG"
  | "renewalCharge"
  | "volumeRatio"
  | "freeShippingAmt"
  | "floatingWeight"
>;
export const computeShippingPrice = (
  providerConfig: T_ProviderConfig,
  pkg: I_ShippingInput,
) => {
  const calc = new ShippingCalculator({
    baseWeight: providerConfig.firstWeightG,
    baseCost: providerConfig.firstCharge,
    continueWeight: providerConfig.continueG,
    continueCost: providerConfig.renewalCharge,
    volumeRatio: providerConfig.volumeRatio,
    freeShippingWeight: providerConfig.freeShippingAmt,
    floatingWeight: providerConfig.floatingWeight,
    renewalCharge: (weightG) =>
      weightG > providerConfig.renewalCharge ? providerConfig.renewalCharge : 0,
  });

  return calc.computePrice({
    lengthCm: pkg.lengthCm,
    widthCm: pkg.widthCm,
    heightCm: pkg.heightCm,
    actualWeightG: pkg.actualWeightG ?? 0,
  });
};
