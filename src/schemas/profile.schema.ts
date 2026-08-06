import * as z from 'zod';

export const profileSchema = z.object({
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  headline: z.string().min(5, 'El titular es demasiado corto').optional(),
  summary: z.string().optional(),
  location: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0, 'Debe ser un número positivo').optional(),
  languages: z.array(z.object({
    name: z.string().min(1, 'Obligatorio'),
    level: z.string().min(1, 'Obligatorio'),
  })).optional(),
  educations: z.array(z.object({
    institution: z.string().min(1, 'Obligatorio'),
    degree: z.string().min(1, 'Obligatorio'),
    fieldOfStudy: z.string().optional(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string().min(1, 'Obligatorio'),
    issuer: z.string().min(1, 'Obligatorio'),
    credentialUrl: z.string().optional(),
  })).optional(),
});

export const visibilitySchema = z.object({
  visibility: z.enum(['PUBLIC', 'ANONYMIZED', 'PRIVATE']),
});

export const availabilitySchema = z.object({
  status: z.enum(['IMMEDIATE', 'TWO_WEEKS', 'ONE_MONTH', 'NOT_LOOKING']),
  workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']),
  contractType: z.enum(['FULL_TIME', 'PART_TIME', 'FREELANCE', 'CONTRACT']),
  expectedSalaryMin: z.coerce.number().optional(),
  expectedSalaryMax: z.coerce.number().optional(),
  currency: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type VisibilityFormValues = z.infer<typeof visibilitySchema>;
export type AvailabilityFormValues = z.infer<typeof availabilitySchema>;
