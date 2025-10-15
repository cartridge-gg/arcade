import { z } from "zod";

export const formSchema = z.object({
  color: z.string().startsWith("#", { message: "Invalid Color" }),
  preset: z.string().min(2, { message: "Preset is required" }),
  name: z.string().min(2, { message: "Name is required" }),
  description: z.string().min(2, { message: "Description is required" }),
  // Assets
  // Fetch to ensure the image is valid
  image: z
    .string()
    .refine((val) => val.startsWith("http") || !val, {
      message: "Invalid Image URL",
    })
    .refine(
      async (val) => {
        const response = await fetch(val);
        return !!response && response.status !== 404;
      },
      {
        message: "Asset not found",
      },
    ),
  banner: z
    .string()
    .refine((val) => val.startsWith("http") || !val, {
      message: "Invalid Banner URL",
    })
    .refine(
      async (val) => {
        const response = await fetch(val);
        return !!response && response.status !== 404;
      },
      {
        message: "Asset not found",
      },
    ),
  cover: z
    .string()
    .refine((val) => val.startsWith("http") || !val, {
      message: "Invalid Cover URL",
    })
    .refine(
      async (val) => {
        const response = await fetch(val);
        return !!response && response.status !== 404;
      },
      {
        message: "Asset not found",
      },
    ),
  // Socials
  discord: z.string().refine((val) => val.startsWith("http") || !val, {
    message: "Invalid Discord URL",
  }),
  telegram: z.string().refine((val) => val.startsWith("http") || !val, {
    message: "Invalid Telegram URL",
  }),
  twitter: z.string().refine((val) => val.startsWith("http") || !val, {
    message: "Invalid Twitter URL",
  }),
  youtube: z.string().refine((val) => val.startsWith("http") || !val, {
    message: "Invalid Youtube URL",
  }),
  website: z.string().refine((val) => val.startsWith("http") || !val, {
    message: "Invalid Website URL",
  }),
  github: z.string().refine((val) => val.startsWith("http") || !val, {
    message: "Invalid Github URL",
  }),
  videos: z
    .string()
    .refine((val) => val.split("\n").every((v) => v.startsWith("http") || !v), {
      message: "Invalid Video URL",
    }),
  images: z
    .string()
    .refine((val) => val.split("\n").every((v) => v.startsWith("http") || !v), {
      message: "Invalid Image URL",
    }),
});
