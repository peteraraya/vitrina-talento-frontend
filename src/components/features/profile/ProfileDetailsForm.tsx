'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { UseMutationResult } from '@tanstack/react-query';
import { ProfileFormValues } from '@/schemas/profile.schema';
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Select, Textarea
} from '@/components/ui';
import { Camera, Link2, Globe, User, Languages, GraduationCap, Award, FileBadge, Briefcase, Users, Plus, Trash2, Copy, ExternalLink, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
  form: UseFormReturn<ProfileFormValues>;
  mutation: UseMutationResult<any, Error, ProfileFormValues, unknown>;
}

export function ProfileDetailsForm({ form, mutation }: Props) {
  const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({ control: form.control, name: "languages" });
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [id]: true });
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
    toast.success('Enlace copiado al portapapeles');
  };

  const handleOpenLink = (url: string) => {
    if (!url) return;
    try {
      const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
      window.open(parsedUrl.toString(), '_blank');
    } catch (e) {
      toast.error('URL inválida');
    }
  };

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: "educations" });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control: form.control, name: "certifications" });
  const { fields: portfolioFields, append: appendPortfolio, remove: removePortfolio } = useFieldArray({ control: form.control, name: "portfolioItems" });
  const { fields: refFields, append: appendRef, remove: removeRef } = useFieldArray({ control: form.control, name: "references" });
  const { fields: licenseFields, append: appendLicense, remove: removeLicense } = useFieldArray({ control: form.control, name: "licenses" });

  // Manejo de Skills como Tags
  const [skillInput, setSkillInput] = useState("");
  const currentSkills = form.watch("skills") || [];

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!skillInput.trim()) return;
    if (currentSkills.includes(skillInput.trim())) {
      toast.warning('Esta habilidad ya ha sido agregada');
      return;
    }
    form.setValue("skills", [...currentSkills, skillInput.trim()], { shouldDirty: true, shouldTouch: true });
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    form.setValue("skills", currentSkills.filter(s => s !== skillToRemove), { shouldDirty: true, shouldTouch: true });
  };

  return (
    <Card className="border-0 shadow-xl shadow-gray-200/40 dark:shadow-none bg-white dark:bg-[#161616] overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Tu Perfil Profesional</h2>
        <p className="text-blue-100 mt-1 text-sm">Completa cada sección para aumentar tu visibilidad ante las mejores empresas.</p>
      </div>
      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(
              (v) => {
                toast.promise(mutation.mutateAsync(v), {
                  loading: 'Guardando perfil...',
                  success: '¡Perfil actualizado con éxito!',
                  error: (err) => err instanceof Error ? err.message : 'Error al guardar el perfil'
                });
              },
              (errors) => {
                toast.error('Revisa los campos obligatorios o con errores');
              }
            )} 
            className="space-y-8"
          >
            
            {/* Avatar Mock UI */}
            <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="h-24 w-24 rounded-full bg-white dark:bg-black flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 relative overflow-hidden group cursor-pointer hover:border-blue-500 transition-colors">
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <User className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Foto de Perfil</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Un retrato claro y amigable aumenta un 40% las vistas a tu perfil.</p>
                <Button variant="outline" size="sm" type="button" className="rounded-full font-medium" disabled>Subir nueva foto (Próximamente)</Button>
              </div>
            </div>

            {/* SECCIÓN BÁSICA */}
            <details className="group [&_summary::-webkit-details-marker]:hidden" open>
              <summary className="flex cursor-pointer items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg shadow-inner">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Información Básica</h3>
                    <p className="text-xs text-gray-500">Tus datos principales y titular profesional.</p>
                  </div>
                </div>
                <span className="transition duration-300 group-open:-rotate-180 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500">
                  <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="pt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <FormLabel>Profesion u Oficio</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Desarrollador Frontend React" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <FormField
                control={form.control}
                name="videoPitchUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video de Presentación (URL opcional)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input placeholder="https://youtube.com/..." {...field} />
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="icon" 
                          className="shrink-0"
                          onClick={() => handleCopy(field.value || '', 'videoPitch')}
                          title="Copiar enlace"
                        >
                          {copiedStates['videoPitch'] ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                        </Button>
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="icon" 
                          className="shrink-0"
                          onClick={() => handleOpenLink(field.value || '')}
                          disabled={!field.value}
                          title="Abrir enlace"
                        >
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
            </details>

            {/* Habilidades (Skills) */}
            <details className="group [&_summary::-webkit-details-marker]:hidden pt-4" open>
              <summary className="flex cursor-pointer items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg shadow-inner">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-red-600 dark:from-rose-400 dark:to-red-500">Habilidades</h3>
                    <p className="text-xs text-gray-500">Agrega palabras clave sobre lo que mejor sabes hacer.</p>
                  </div>
                </div>
                <span className="transition duration-300 group-open:-rotate-180 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500">
                  <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="pt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Ej. React, Liderazgo, Ventas B2B (Presiona Enter)" 
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleAddSkill} variant="secondary" className="shrink-0">
                      Agregar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-gray-50 dark:bg-[#111] rounded-xl border border-gray-100 dark:border-gray-800">
                    {currentSkills.length === 0 ? (
                      <span className="text-sm text-gray-400 my-auto">No has agregado habilidades aún.</span>
                    ) : (
                      currentSkills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm animate-in zoom-in-95 duration-200">
                          {skill}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </details>

            {/* Redes Sociales y Contacto */}
            <details className="group [&_summary::-webkit-details-marker]:hidden pt-4">
              <summary className="flex cursor-pointer items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg shadow-inner">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Contacto y Redes Sociales</h3>
                    <p className="text-xs text-gray-500">Facilita que las empresas te contacten o vean tu trabajo.</p>
                  </div>
                </div>
                <span className="transition duration-300 group-open:-rotate-180 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500">
                  <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="pt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Contacto */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de Contacto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. +56911111111" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp (Recomendado)</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 sm:text-sm">
                            🇨🇱
                          </span>
                          <Input className="rounded-l-none" placeholder="+569..." {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Correo Público de Contacto</FormLabel>
                      <FormControl>
                        <Input placeholder="correo@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Redes */}
                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Link2 className="h-4 w-4" /> LinkedIn</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input placeholder="https://linkedin.com/in/tu-perfil" {...field} />
                          <Button 
                            type="button" variant="secondary" size="icon" className="shrink-0"
                            onClick={() => handleCopy(field.value || '', 'linkedin')}
                          >
                            {copiedStates['linkedin'] ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                          </Button>
                          <Button 
                            type="button" variant="secondary" size="icon" className="shrink-0"
                            onClick={() => handleOpenLink(field.value || '')} disabled={!field.value}
                          >
                            <ExternalLink className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
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
                        <div className="flex gap-2">
                          <Input placeholder="https://github.com/tu-usuario" {...field} />
                          <Button 
                            type="button" variant="secondary" size="icon" className="shrink-0"
                            onClick={() => handleCopy(field.value || '', 'github')}
                          >
                            {copiedStates['github'] ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                          </Button>
                          <Button 
                            type="button" variant="secondary" size="icon" className="shrink-0"
                            onClick={() => handleOpenLink(field.value || '')} disabled={!field.value}
                          >
                            <ExternalLink className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagramUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Link2 className="h-4 w-4" /> Instagram</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input placeholder="https://instagram.com/..." {...field} />
                          <Button 
                            type="button" variant="secondary" size="icon" className="shrink-0"
                            onClick={() => handleCopy(field.value || '', 'instagram')}
                          >
                            {copiedStates['instagram'] ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                          </Button>
                          <Button 
                            type="button" variant="secondary" size="icon" className="shrink-0"
                            onClick={() => handleOpenLink(field.value || '')} disabled={!field.value}
                          >
                            <ExternalLink className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitterUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Link2 className="h-4 w-4" /> X (Twitter)</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input placeholder="https://x.com/..." {...field} />
                          <Button 
                            type="button" variant="secondary" size="icon" className="shrink-0"
                            onClick={() => handleCopy(field.value || '', 'twitter')}
                          >
                            {copiedStates['twitter'] ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                          </Button>
                          <Button 
                            type="button" variant="secondary" size="icon" className="shrink-0"
                            onClick={() => handleOpenLink(field.value || '')} disabled={!field.value}
                          >
                            <ExternalLink className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="facebookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Link2 className="h-4 w-4" /> Facebook</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input placeholder="https://facebook.com/..." {...field} />
                          <Button 
                            type="button" variant="secondary" size="icon" className="shrink-0"
                            onClick={() => handleCopy(field.value || '', 'facebook')}
                          >
                            {copiedStates['facebook'] ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                          </Button>
                          <Button 
                            type="button" variant="secondary" size="icon" className="shrink-0"
                            onClick={() => handleOpenLink(field.value || '')} disabled={!field.value}
                          >
                            <ExternalLink className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
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
                        <div className="flex gap-2">
                          <Input placeholder="https://tu-sitio.com" {...field} />
                          <Button 
                            type="button" variant="secondary" size="icon" className="shrink-0"
                            onClick={() => handleCopy(field.value || '', 'portfolio')}
                          >
                            {copiedStates['portfolio'] ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                          </Button>
                          <Button 
                            type="button" variant="secondary" size="icon" className="shrink-0"
                            onClick={() => handleOpenLink(field.value || '')} disabled={!field.value}
                          >
                            <ExternalLink className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              </div>
            </details>

            {/* Idiomas */}
            <details className="group [&_summary::-webkit-details-marker]:hidden pt-4">
              <summary className="flex cursor-pointer items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg shadow-inner">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">Idiomas</h3>
                    <p className="text-xs text-gray-500">Idiomas y nivel de dominio.</p>
                  </div>
                </div>
                <span className="transition duration-300 group-open:-rotate-180 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500">
                  <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="pt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                {langFields.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 text-sm">
                    No has agregado ningún idioma aún.
                  </div>
                )}
                {langFields.map((field, index) => (
                  <div key={field.id} className="p-5 bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl relative group">
                    <button 
                      type="button" 
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => removeLang(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                
                <button type="button" onClick={() => appendLang({ name: '', level: 'Básico' })} className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600 transition-colors">
                  <Plus className="w-4 h-4" /> Añadir otro idioma
                </button>
              </div>
            </details>

            {/* Estudios */}
            <details className="group [&_summary::-webkit-details-marker]:hidden pt-4">
              <summary className="flex cursor-pointer items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg shadow-inner">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-600 dark:from-orange-400 dark:to-amber-500">Educación</h3>
                    <p className="text-xs text-gray-500">Tus estudios formales o técnicos.</p>
                  </div>
                </div>
                <span className="transition duration-300 group-open:-rotate-180 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500">
                  <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="pt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                {eduFields.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 text-sm">
                    No has agregado ninguna educación.
                  </div>
                )}
                {eduFields.map((field, index) => (
                  <div key={field.id} className="p-5 bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl relative group">
                    <button 
                      type="button" 
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => removeEdu(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                
                <button type="button" onClick={() => appendEdu({ institution: '', degree: '', fieldOfStudy: '' })} className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-orange-600 transition-colors">
                  <Plus className="w-4 h-4" /> Añadir estudio
                </button>
              </div>
            </details>

            {/* Certificaciones */}
            <details className="group [&_summary::-webkit-details-marker]:hidden pt-4">
              <summary className="flex cursor-pointer items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg shadow-inner">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400">Certificaciones</h3>
                    <p className="text-xs text-gray-500">Cursos, talleres o acreditaciones importantes.</p>
                  </div>
                </div>
                <span className="transition duration-300 group-open:-rotate-180 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500">
                  <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="pt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                {certFields.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 text-sm">
                    No has agregado certificaciones.
                  </div>
                )}
                {certFields.map((field, index) => (
                  <div key={field.id} className="p-5 bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl relative group">
                    <button 
                      type="button" 
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => removeCert(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                
                <button type="button" onClick={() => appendCert({ name: '', issuer: '', credentialUrl: '' })} className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-purple-600 transition-colors">
                  <Plus className="w-4 h-4" /> Añadir certificación
                </button>
              </div>
            </details>

            {/* Licencias y Permisos */}
            <details className="group [&_summary::-webkit-details-marker]:hidden pt-4">
              <summary className="flex cursor-pointer items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-lg shadow-inner">
                    <FileBadge className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400">Licencias y Permisos</h3>
                    <p className="text-xs text-gray-500">Conducción, maquinaria o permisos especiales.</p>
                  </div>
                </div>
                <span className="transition duration-300 group-open:-rotate-180 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500">
                  <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="pt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                {licenseFields.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 text-sm">
                    No has agregado licencias.
                  </div>
                )}
                {licenseFields.map((field, index) => (
                  <div key={field.id} className="p-5 bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl relative group">
                    <button 
                      type="button" 
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => removeLicense(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <FormField
                      control={form.control}
                      name={`licenses.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="mr-8">
                          <FormLabel>Nombre de la Licencia</FormLabel>
                          <FormControl><Input placeholder="Ej. Licencia Clase B" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                
                <button type="button" onClick={() => appendLicense({ name: '' })} className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-pink-500 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-pink-600 transition-colors">
                  <Plus className="w-4 h-4" /> Añadir Licencia
                </button>
              </div>
            </details>

            {/* Portafolio y Evidencias */}
            <details className="group [&_summary::-webkit-details-marker]:hidden pt-4">
              <summary className="flex cursor-pointer items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg shadow-inner">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">Portafolio y Evidencias</h3>
                    <p className="text-xs text-gray-500">Muestra proyectos, remodelaciones o trabajos completados.</p>
                  </div>
                </div>
                <span className="transition duration-300 group-open:-rotate-180 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500">
                  <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="pt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                {portfolioFields.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 text-sm">
                    No has agregado proyectos a tu portafolio.
                  </div>
                )}
                {portfolioFields.map((field, index) => (
                  <div key={field.id} className="p-5 bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl relative group">
                    <button 
                      type="button" 
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => removePortfolio(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <FormField
                        control={form.control}
                        name={`portfolioItems.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título del Trabajo</FormLabel>
                            <FormControl><Input placeholder="Ej. Remodelación de Casa" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`portfolioItems.${index}.imageUrl`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL de Fotografía (Opcional)</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input placeholder="https://..." {...field} />
                                <Button 
                                  type="button" variant="secondary" size="icon" className="shrink-0"
                                  onClick={() => handleCopy(field.value || '', `img-${index}`)}
                                >
                                  {copiedStates[`img-${index}`] ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                                </Button>
                                <Button 
                                  type="button" variant="secondary" size="icon" className="shrink-0"
                                  onClick={() => handleOpenLink(field.value || '')} disabled={!field.value}
                                >
                                  <ExternalLink className="h-4 w-4 text-gray-500" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`portfolioItems.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Descripción Breve</FormLabel>
                            <FormControl><Textarea placeholder="Detalles de lo que hiciste..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
                
                <button type="button" onClick={() => appendPortfolio({ title: '', description: '', imageUrl: '', projectUrl: '' })} className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 transition-colors">
                  <Plus className="w-4 h-4" /> Añadir un Proyecto / Trabajo
                </button>
              </div>
            </details>

            {/* Referencias */}
            <details className="group [&_summary::-webkit-details-marker]:hidden pt-4">
              <summary className="flex cursor-pointer items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-lg shadow-inner">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400">Referencias Laborales</h3>
                    <p className="text-xs text-gray-500">Contactos para que verifiquen tu desempeño.</p>
                  </div>
                </div>
                <span className="transition duration-300 group-open:-rotate-180 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500">
                  <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="pt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                {refFields.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 text-sm">
                    No has agregado referencias laborales.
                  </div>
                )}
                {refFields.map((field, index) => (
                  <div key={field.id} className="p-5 bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl relative group">
                    <button 
                      type="button" 
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => removeRef(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <FormField
                        control={form.control}
                        name={`references.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de la Referencia</FormLabel>
                            <FormControl><Input placeholder="Ej. Pedro Gómez" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`references.${index}.company`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Empresa / Lugar</FormLabel>
                            <FormControl><Input placeholder="Ej. Constructora ABC" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`references.${index}.phoneNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl><Input placeholder="Ej. +569..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`references.${index}.relationship`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relación</FormLabel>
                            <FormControl><Input placeholder="Ej. Ex-Jefe, Cliente" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
                
                <button type="button" onClick={() => appendRef({ name: '', company: '', phoneNumber: '', email: '', relationship: '' })} className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-teal-600 transition-colors">
                  <Plus className="w-4 h-4" /> Añadir una Referencia
                </button>
              </div>
            </details>

            <div className="pt-8">
              <Button type="submit" variant="default" size="xl" className="w-full shadow-blue-500/20 shadow-xl" disabled={mutation.isPending}>
                {mutation.isPending ? 'Guardando...' : 'Guardar Todo el Perfil'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
