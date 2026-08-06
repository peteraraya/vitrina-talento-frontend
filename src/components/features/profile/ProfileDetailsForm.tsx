'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { UseMutationResult } from '@tanstack/react-query';
import { ProfileFormValues } from '@/schemas/profile.schema';
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Select, Textarea
} from '@/components/ui';

interface Props {
  form: UseFormReturn<ProfileFormValues>;
  mutation: UseMutationResult<any, Error, ProfileFormValues, unknown>;
}

export function ProfileDetailsForm({ form, mutation }: Props) {
  const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({ control: form.control, name: "languages" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: "educations" });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control: form.control, name: "certifications" });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos Completos del Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
            
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
                      <Textarea
                        {...field}
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
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
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
                          <Select {...field}>
                            <option value="Básico">Básico</option>
                            <option value="Intermedio">Intermedio</option>
                            <option value="Avanzado">Avanzado</option>
                            <option value="Nativo">Nativo</option>
                          </Select>
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
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
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
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
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

            <Button type="submit" className="w-full mt-4" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar Todo el Perfil'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
