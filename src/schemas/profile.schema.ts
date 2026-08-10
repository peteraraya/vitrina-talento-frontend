import * as z from 'zod';

export const profileSchema = z.object({
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  companyName: z.string().optional(),
  website: z.string().url('Debe ser una URL vรกlida').or(z.literal('')).optional(),
  headline: z.string().min(5, 'El titular es demasiado corto').optional(),
  summary: z.string().optional(),
  location: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0, 'Debe ser un nรบmero positivo').optional(),
  videoPitchUrl: z.string().url('Debe ser una URL vรกlida').or(z.literal('')).optional(),
  phoneNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
  contactEmail: z.string().email('Debe ser un correo vรกlido').or(z.literal('')).optional(),
  githubUrl: z.string().url('Debe ser una URL vรกlida').or(z.literal('')).optional(),
  linkedinUrl: z.string().url('Debe ser una URL vรกlida').or(z.literal('')).optional(),
  portfolioUrl: z.string().url('Debe ser una URL vรกlida').or(z.literal('')).optional(),
  instagramUrl: z.string().url('Debe ser una URL vรกlida').or(z.literal('')).optional(),
  twitterUrl: z.string().url('Debe ser una URL vรกlida').or(z.literal('')).optional(),
  facebookUrl: z.string().url('Debe ser una URL vรกlida').or(z.literal('')).optional(),
  languages: z.array(z.object({
    name: z.string().min(1, 'Obligatorio'),
    level: z.string().min(1, 'Obligatorio'),
  })).optional(),
  educations: z.array(z.object({
    institution: z.string().min(1, 'Obligatorio'),
    degree: z.string().min(1, 'Obligatorio'),
    fieldOfStudy: z.string().optional(),
  })).optional(),
  experiences: z.array(z.object({
    company: z.string().min(1, 'Obligatorio'),
    position: z.string().min(1, 'Obligatorio'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
    description: z.string().optional(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string().min(1, 'Obligatorio'),
    issuer: z.string().min(1, 'Obligatorio'),
    credentialUrl: z.string().optional(),
  })).optional(),
  portfolioItems: z.array(z.object({
    title: z.string().min(1, 'Obligatorio'),
    description: z.string().optional(),
    imageUrl: z.string().url('Debe ser una URL vรกlida').or(z.literal('')).optional(),
    projectUrl: z.string().url('Debe ser una URL vรกlida').or(z.literal('')).optional(),
  })).optional(),
  references: z.array(z.object({
    name: z.string().min(1, 'Obligatorio'),
    company: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email('Debe ser un correo vรกlido').or(z.literal('')).optional(),
    relationship: z.string().optional(),
  })).optional(),
  licenses: z.array(z.object({
    name: z.string().min(1, 'Obligatorio'),
  })).optional(),
  skills: z.array(z.string()).optional(),
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
  salaryPeriod: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'PROJECT_BASED']).optional(),
  willingToTravel: z.boolean().optional(),
  shiftWork: z.boolean().optional(),
  nightShift: z.boolean().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type VisibilityFormValues = z.infer<typeof visibilitySchema>;
export type AvailabilityFormValues = z.infer<typeof availabilitySchema>;
