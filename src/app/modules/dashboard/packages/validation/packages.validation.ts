import { GoodTypes, PackageStatus } from "@prisma/client";
import { z } from "zod";

const pkgQcDetails = z.object({
  actualCost: z
    .number({
      required_error: "actual cost is required!",
    })
    .nonnegative(),
  actualWeight: z
    .number({
      required_error: "actual weight is required!",
    })
    .nonnegative(),
  length: z
    .number({
      required_error: "Length is required!",
    })
    .nonnegative(),
  width: z
    .number({
      required_error: "width is required!",
    })
    .nonnegative(),
  height: z
    .number({
      required_error: "height is required!",
    })
    .nonnegative(),
  weightGm: z
    .number({
      required_error: "weight is required!",
    })
    .nonnegative(),
});

// Update the package information
const updatePkgQcInfo = z.object({
  body: z
    .object({
      trackingNo: z.string().optional(),
      courierCompany: z.string().optional(),
      packageStatus: z
        .enum([...Object.values(PackageStatus)] as [string, ...string[]])
        .optional(),
      trackingLink: z.string().optional(),
      typeOfGoods: z
        .array(z.enum([...Object.values(GoodTypes)] as [string, ...string[]]))
        .optional(),
    })
    .strict(),
});

const updatePkgQcDetails = z.object({
  body: z.object({
    pkgId: z.string({ required_error: "Package id is required" }),
    pkgQcDetails: pkgQcDetails,
  }),
});

const addWsOrPA = z.object({
  body: z
    .object({
      pkgId: z
        .string({
          required_error: "Package id is required",
        })
        .min(24)
        .max(24),
      paId: z.string().min(24).max(24).optional(),
      wsId: z.string().min(24).max(24).optional(),
    })
    .strict(),
});

export const pkgValidation = {
  updatePkgQcDetails,
  updatePkgQcInfo,
  addWsOrPA,
};
