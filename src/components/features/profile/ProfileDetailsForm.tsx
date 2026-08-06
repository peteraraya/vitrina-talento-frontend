'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { UseMutationResult } from '@tanstack/react-query';
import { ProfileFormValues } from '@/schemas/profile.schema';
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Select, Textarea
} from '@/components/ui';
import { Camera, Link2, Globe } from 'lucide-react';

interface Props {
  form: UseFormReturn<ProfileFormValues>;
  mutation: UseMutationResult<any, Error, ProfileFormValues, unknown>;
}

export function ProfileDetailsForm({ form, mutation }: Props) {
  const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({ control: form.control, name: "languages" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: "educations" });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control: form.control, name: "certifications" });

  return (
    <Card className="border-0 shadow-md bg-white dark:bg-[#161616]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Datos Completos del Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-8">
            
            {/* Avatar Mock UI */}
            <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-2 border-dashed border-blue-300 dark:border-blue-700 relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <span className="text-blue-500 dark:text-blue-400 font-medium text-sm">Foto</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Foto de Perfil</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Sube una foto profesional para destacar (Próximamente).</p>
                <Button variant="outline" size="sm" type="button" disabled>Subir Imagen</Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Básicos</h3>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Redes Sociales */}
            <div className="space-y-4 pt-8 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enlaces Profesionales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Link2 className="h-4 w-4" /> LinkedIn</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/tu-perfil" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="githubUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Link2 className="h-4 w-4" /> GitHub</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/tu-usuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portfolioUrl"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4" /> Portafolio / Web Personal</FormLabel>
                      <FormControl>
                        <Input placeholder="https://tu-sitio.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Idiomas */}
            <div className="space-y-4 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Idiomas</h3>
                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => appendLang({ name: '', level: 'Básico' })}>
                  + Añadir Idioma
                </Button>
              </div>
              <div className="space-y-4">
                {langFields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl relative">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => removeLang(index)}
                    >
                      <span className="text-lg">&times;</span>
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <FormField
                        control={form.control}
                        name={`languages.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Idioma</FormLabel>
                            <FormControl><Input placeholder="Ej. Inglés" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`languages.${index}.level`}
                        render={({ field }) => (
                          <FormItem>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estudios */}
            <div className="space-y-4 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Educación</h3>
                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => appendEdu({ institution: '', degree: '', fieldOfStudy: '' })}>
                  + Añadir Educación
                </Button>
              </div>
              <div className="space-y-4">
                {eduFields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl relative">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => removeEdu(index)}
                    >
                      <span className="text-lg">&times;</span>
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <FormField
                        control={form.control}
                        name={`educations.${index}.institution`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institución</FormLabel>
                            <FormControl><Input placeholder="Ej. Universidad de Chile" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`educations.${index}.degree`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl><Input placeholder="Ej. Ingeniería en Software" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificaciones */}
            <div className="space-y-4 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Certificaciones</h3>
                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => appendCert({ name: '', issuer: '', credentialUrl: '' })}>
                  + Añadir Certificado
                </Button>
              </div>
              <div className="space-y-4">
                {certFields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl relative">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => removeCert(index)}
                    >
                      <span className="text-lg">&times;</span>
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <FormField
                        control={form.control}
                        name={`certifications.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl><Input placeholder="Ej. AWS Solutions Architect" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`certifications.${index}.issuer`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emisor</FormLabel>
                            <FormControl><Input placeholder="Ej. Amazon Web Services" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
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
