'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  headline: z.string().min(5, 'Headline is too short').optional(),
  summary: z.string().optional(),
  location: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0, 'Must be a positive number').optional(),
  languages: z.array(z.object({
    name: z.string().min(1),
    level: z.string().min(1),
  })).optional(),
  educations: z.array(z.object({
    institution: z.string().min(1),
    degree: z.string().min(1),
    fieldOfStudy: z.string().optional(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string().min(1),
    issuer: z.string().min(1),
    credentialUrl: z.string().optional(),
  })).optional(),
});

const visibilitySchema = z.object({
  visibility: z.enum(['PUBLIC', 'ANONYMIZED', 'PRIVATE']),
});

const availabilitySchema = z.object({
  status: z.enum(['IMMEDIATE', 'TWO_WEEKS', 'ONE_MONTH', 'NOT_LOOKING']),
  workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']),
  contractType: z.enum(['FULL_TIME', 'PART_TIME', 'FREELANCE', 'CONTRACT']),
  expectedSalaryMin: z.coerce.number().optional(),
  expectedSalaryMax: z.coerce.number().optional(),
  currency: z.string().optional(),
});

export default function ProfilePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch Profile Data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const res = await fetchApi('/profiles/me');
      if (!res.ok) {
        if (res.status === 404) {
          await fetchApi('/profiles', { method: 'POST' });
          const retryRes = await fetchApi('/profiles/me');
          return retryRes.json();
        }
        throw new Error('Failed to fetch profile');
      }
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch Availability Data
  const { data: availability, isLoading: isAvailabilityLoading } = useQuery({
    queryKey: ['availability', 'me'],
    queryFn: async () => {
      const res = await fetchApi('/availability/me');
      if (!res.ok) throw new Error('Failed to fetch availability');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      headline: '',
      summary: '',
      location: '',
      yearsOfExperience: 0,
      languages: [],
      educations: [],
      certifications: [],
    },
  });

  const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({ control: form.control, name: "languages" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: "educations" });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control: form.control, name: "certifications" });

  const visibilityForm = useForm<z.infer<typeof visibilitySchema>>({
    resolver: zodResolver(visibilitySchema),
    defaultValues: {
      visibility: 'ANONYMIZED',
    },
  });

  const availabilityForm = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      status: 'NOT_LOOKING',
      workMode: 'REMOTE',
      contractType: 'FULL_TIME',
      expectedSalaryMin: 0,
      expectedSalaryMax: 0,
      currency: 'USD',
    },
  });

  // Hydrate forms when data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName || '',
        headline: profile.headline || '',
        summary: profile.summary || '',
        location: profile.location || '',
        yearsOfExperience: profile.yearsOfExperience || 0,
        languages: profile.languages || [],
        educations: profile.educations || [],
        certifications: profile.certifications || [],
      });
      visibilityForm.reset({
        visibility: profile.visibility || 'ANONYMIZED',
      });
    }
    if (availability) {
      availabilityForm.reset({
        status: availability.status || 'NOT_LOOKING',
        workMode: availability.workMode || 'REMOTE',
        contractType: availability.contractType || 'FULL_TIME',
        expectedSalaryMin: availability.expectedSalaryMin || 0,
        expectedSalaryMax: availability.expectedSalaryMax || 0,
        currency: availability.currency || 'USD',
      });
    }
  }, [profile, availability, form, visibilityForm, availabilityForm]);

  // Mutation for Profile Update
  const updateProfileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      const res = await fetchApi('/profiles/me', {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      alert('Profile updated successfully!');
    },
    onError: (err) => {
      if (err instanceof Error) alert(err.message);
      else alert('An error occurred');
    },
  });

  // Mutation for Visibility Update
  const updateVisibilityMutation = useMutation({
    mutationFn: async (values: z.infer<typeof visibilitySchema>) => {
      const res = await fetchApi('/profiles/me/visibility', {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to update visibility');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      alert('Visibility updated successfully!');
    },
    onError: (err) => {
      if (err instanceof Error) alert(err.message);
      else alert('An error occurred');
    },
  });

  // Mutation for Availability Update
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (values: z.infer<typeof availabilitySchema>) => {
      const res = await fetchApi('/availability/me', {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to update availability');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', 'me'] });
      alert('Availability updated successfully!');
    },
    onError: (err) => {
      if (err instanceof Error) alert(err.message);
      else alert('An error occurred');
    },
  });

  if (!isAuthenticated || isLoading || isAvailabilityLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>Volver</Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuración de Visibilidad</CardTitle>
          <CardDescription>
            Controla quién puede ver tu perfil. El estado ANONYMIZED es recomendado en Vitrina Talento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...visibilityForm}>
            <form
              onSubmit={visibilityForm.handleSubmit((v) => updateVisibilityMutation.mutate(v))}
              className="flex items-end gap-4"
            >
              <FormField
                control={visibilityForm.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Visibilidad</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="PUBLIC">Público (Indexado en buscadores)</option>
                        <option value="ANONYMIZED">Anonimizado (Recomendado)</option>
                        <option value="PRIVATE">Privado (No visible)</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateVisibilityMutation.isPending}>
                Guardar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Disponibilidad Laboral</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...availabilityForm}>
            <form onSubmit={availabilityForm.handleSubmit((v) => updateAvailabilityMutation.mutate(v))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={availabilityForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="IMMEDIATE">Inmediata</option>
                          <option value="TWO_WEEKS">2 Semanas</option>
                          <option value="ONE_MONTH">1 Mes</option>
                          <option value="NOT_LOOKING">No busco</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={availabilityForm.control}
                  name="workMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidad</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="REMOTE">Remoto</option>
                          <option value="HYBRID">Híbrido</option>
                          <option value="ONSITE">Presencial</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={availabilityForm.control}
                  name="contractType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Contrato</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="FULL_TIME">Full Time</option>
                          <option value="PART_TIME">Part Time</option>
                          <option value="FREELANCE">Freelance</option>
                          <option value="CONTRACT">Contrato Fijo</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={availabilityForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda (Ej: USD)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. USD, CLP, EUR" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={availabilityForm.control}
                  name="expectedSalaryMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salario Min (Mensual)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={availabilityForm.control}
                  name="expectedSalaryMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salario Max (Mensual)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full mt-4" disabled={updateAvailabilityMutation.isPending}>
                {updateAvailabilityMutation.isPending ? 'Guardando...' : 'Guardar Disponibilidad'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos Completos del Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => updateProfileMutation.mutate(v))} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Básicos</h3>
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre para mostrar</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titular profesional</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Desarrollador Frontend React" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resumen (Bio)</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Breve resumen de tu perfil profesional..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Santiago, Chile" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearsOfExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Años de experiencia</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Idiomas */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Idiomas</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendLang({ name: '', level: 'Básico' })}>+ Agregar Idioma</Button>
                </div>
                {langFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end">
                    <FormField
                      control={form.control}
                      name={`languages.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Idioma</FormLabel>
                          <FormControl><Input placeholder="Inglés" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`languages.${index}.level`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Nivel</FormLabel>
                          <FormControl>
                            <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                              <option value="Básico">Básico</option>
                              <option value="Intermedio">Intermedio</option>
                              <option value="Avanzado">Avanzado</option>
                              <option value="Nativo">Nativo</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" onClick={() => removeLang(index)}>X</Button>
                  </div>
                ))}
              </div>

              {/* Estudios */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Educación</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendEdu({ institution: '', degree: '', fieldOfStudy: '' })}>+ Agregar Estudio</Button>
                </div>
                {eduFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end">
                    <FormField
                      control={form.control}
                      name={`educations.${index}.institution`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Institución</FormLabel>
                          <FormControl><Input placeholder="Universidad..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`educations.${index}.degree`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Título</FormLabel>
                          <FormControl><Input placeholder="Ingeniero..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" onClick={() => removeEdu(index)}>X</Button>
                  </div>
                ))}
              </div>

              {/* Certificaciones */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Certificaciones</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendCert({ name: '', issuer: '', credentialUrl: '' })}>+ Agregar Certificado</Button>
                </div>
                {certFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end">
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Nombre</FormLabel>
                          <FormControl><Input placeholder="AWS Certified..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.issuer`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Emisor</FormLabel>
                          <FormControl><Input placeholder="Amazon..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" onClick={() => removeCert(index)}>X</Button>
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full mt-4" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Todo el Perfil'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
