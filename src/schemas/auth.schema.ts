import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Correo electrónico inválido' }),
  password: z.string().min(1, { message: 'La contraseña es obligatoria' }),
});

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/;

export const registerSchema = z.object({
  email: z.string().email({ message: 'Correo electrónico inválido' }),
  password: z.string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .regex(passwordRegex, { message: 'Debe contener al menos 1 mayúscula, 1 minúscula y 1 número o carácter especial' }),
  passwordConfirm: z.string().min(1, { message: 'Confirma tu contraseña' }),
  role: z.enum(['CANDIDATE', 'RECRUITER']),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Las contraseñas no coinciden",
  path: ["passwordConfirm"],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
