import { z } from "zod";
import { normalizeIndianMobile } from "@/lib/phone";

export const leadTypes = ["OFFER", "TEST_DRIVE", "LAUNCH_ALERT"] as const;

export const leadRequestSchema = z.object({
  userName: z.string().trim().min(2, "Enter your name.").max(80),
  phone: z
    .string()
    .trim()
    .refine((value) => normalizeIndianMobile(value) !== null, {
      message: "Enter a 10-digit Indian mobile number.",
    }),
  city: z.string().trim().min(2, "Enter a city.").max(80),
  vehicleId: z.string().trim().min(1),
  variantId: z.string().trim().min(1).nullable().optional(),
  leadType: z.enum(leadTypes).default("OFFER"),
});

export type LeadRequest = z.infer<typeof leadRequestSchema>;
