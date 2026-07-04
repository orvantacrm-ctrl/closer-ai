import { z } from "zod";

export const onboardingBusinessSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  industry: z.string().min(1, "Select an industry"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email"),
  timezone: z.string().min(1),
});

export const onboardingAiSchema = z.object({
  aiName: z.string().min(2, "Give your AI receptionist a name"),
  aiTone: z.string().min(1),
  services: z.array(z.string()).min(1, "Add at least one service"),
  hours: z.record(z.string(), z.object({ open: z.string(), close: z.string() })),
});

export type OnboardingBusinessInput = z.infer<typeof onboardingBusinessSchema>;
export type OnboardingAiInput = z.infer<typeof onboardingAiSchema>;
