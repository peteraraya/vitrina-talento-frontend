'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { UseMutationResult } from '@tanstack/react-query';
import { ProfileFormValues } from '@/schemas/profile.schema';
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Select, Textarea, MonthPicker
} from '@/components/ui';
import { Camera, Link2, Globe, User, Languages, GraduationCap, Award, FileBadge, Briefcase, Users, Plus, Trash2, Copy, ExternalLink, CheckCircle2, X, Pencil, FileText, Sparkles, DownloadCloud, ArrowUp, ArrowDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import Image from 'next/image';
import { useRef } from 'react';

interface Props {
  form: UseFormReturn<ProfileFormValues>;
  mutation: UseMutationResult<any, Error, ProfileFormValues, unknown>;
  uploadPhotoMutation: UseMutationResult<any, Error, File, unknown>;
  profilePhotoUrl?: string | null;
}

export function ProfileDetailsForm({ form, mutation, uploadPhotoMutation, profilePhotoUrl }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo excede el tamaño máximo de 5MB');
      return;
    }

    toast.promise(uploadPhotoMutation.mutateAsync(file), {
      loading: 'Subiendo foto de perfil...',
      success: '¡Foto actualizada correctamente!',
      error: (err) => err instanceof Error ? err.message : 'Error al subir la foto',
    });
  };
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

  const { fields: eduFields, append: appendEdu, remove: removeEdu, swap: swapEdu } = useFieldArray({ control: form.control, name: "educations" });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: form.control, name: "experiences" });
  const { fields: certFields, append: appendCert, remove: removeCert, swap: swapCert } = useFieldArray({ control: form.control, name: "certifications" });
  const { fields: portfolioFields, append: appendPortfolio, remove: removePortfolio, swap: swapPortfolio } = useFieldArray({ control: form.control, name: "portfolioItems" });
  const { fields: refFields, append: appendRef, remove: removeRef } = useFieldArray({ control: form.control, name: "references" });
  const { fields: licenseFields, append: appendLicense, remove: removeLicense } = useFieldArray({ control: form.control, name: "licenses" });

  const [editingExp, setEditingExp] = useState<Record<string, boolean>>({});
  const [editingEdu, setEditingEdu] = useState<Record<string, boolean>>({});
  const [editingCert, setEditingCert] = useState<Record<string, boolean>>({});
  const [editingPortfolio, setEditingPortfolio] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form.formState.isDirty]);

  return (
    <Card className="border-0 shadow-xl shadow-gray-200/40 dark:shadow-none bg-white dark:bg-[#161616] overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Tu Perfil Profesional</h2>
        <p className="text-blue-100 mt-1 text-sm">Completa cada sección para aumentar tu visibilidad ante las mejores empresas.</p>
      </div>
      <CardContent className="p-6 md:p-8">
        
        {/* Magic Autocomplete Buttons */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <Button type="button" variant="outline" className="flex-1 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-800 rounded-xl" onClick={() => toast.info('Función en desarrollo: Extracción de datos de PDF con IA')}>
             <FileText className="w-4 h-4 mr-2" /> Autocompletar con mi CV (PDF)
          </Button>
          <Button type="button" variant="outline" className="flex-1 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 hover:text-indigo-800 rounded-xl" onClick={() => toast.info('Función en desarrollo: Integración con API de LinkedIn')}>
             <DownloadCloud className="w-4 h-4 mr-2" /> Importar desde LinkedIn
          </Button>
        </div>

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
            
            {/* Avatar Upload UI */}
            <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg, image/webp" 
                onChange={handleFileChange}
              />
              <div 
                className="h-24 w-24 rounded-full bg-white dark:bg-black flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 relative overflow-hidden group cursor-pointer hover:border-blue-500 transition-colors shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                {profilePhotoUrl ? (
                  <Image src={profilePhotoUrl} alt="Avatar" fill className="object-cover" />
                ) : (
                  <User className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Foto de Perfil</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Un retrato claro y amigable aumenta un 40% las vistas a tu perfil.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  type="button" 
                  className="rounded-full font-medium" 
                  disabled={uploadPhotoMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadPhotoMutation.isPending ? 'Subiendo...' : 'Subir nueva foto'}
                </Button>
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
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa (Opcional - Reclutadores)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Tech Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sitio Web de la Empresa (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Profesion o Titular</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Desarrollador / Technical Recruiter en Tech Corp" {...field} />
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Resumen (Bio)</FormLabel>
                      <button type="button" onClick={() => toast.info('Función en desarrollo: Generación de textos con IA')} className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1 hover:underline">
                        <Sparkles className="w-3 h-3" /> Mejorar con IA
                      </button>
                    </div>
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
              <div className="pt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                
                {/* Banner Habilidades Verificadas */}
                <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
                  <div className="flex items-center gap-4 text-white flex-1">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                      <CheckCircle2 className="w-6 h-6 text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Destaca con Habilidades Verificadas</h4>
                      <p className="text-blue-100 text-sm">
                        Los reclutadores confían 3x más en perfiles con insignias oficiales. Realiza nuestros tests técnicos y certifica tus conocimientos.
                      </p>
                    </div>
                  </div>
                  <Button type="button" onClick={() => window.location.href = '/dashboard/assessments'} className="w-full md:w-auto bg-white text-indigo-900 hover:bg-gray-100 font-semibold shrink-0">
                    Ir al Centro de Evaluación
                  </Button>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Ej. React, Liderazgo, Ventas B2B (Presiona Enter)" 
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      className="flex-1"
                      list="popular-skills"
                    />
                    <datalist id="popular-skills">
                      <option value="React" />
                      <option value="Node.js" />
                      <option value="TypeScript" />
                      <option value="JavaScript" />
                      <option value="Python" />
                      <option value="Java" />
                      <option value="C#" />
                      <option value="C++" />
                      <option value="PHP" />
                      <option value="Ruby" />
                      <option value="Go" />
                      <option value="Swift" />
                      <option value="Kotlin" />
                      <option value="Flutter" />
                      <option value="Dart" />
                      <option value="AWS" />
                      <option value="Docker" />
                      <option value="Kubernetes" />
                      <option value="SQL" />
                      <option value="MongoDB" />
                      <option value="PostgreSQL" />
                      <option value="Redis" />
                      <option value="GraphQL" />
                      <option value="Git" />
                      <option value="Figma" />
                      <option value="UI/UX" />
                      <option value="Scrum" />
                      <option value="Agile" />
                      <option value="Liderazgo" />
                      <option value="Ventas B2B" />
                      <option value="Marketing Digital" />
                      <option value="SEO" />
                    </datalist>
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
                  <div className="text-center py-12 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Languages className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">Aún no hay idiomas</p>
                      <p className="text-gray-500 text-sm max-w-[250px] mx-auto mt-1">Saber varios idiomas te abre puertas a mejores ofertas de trabajo.</p>
                    </div>
                  </div>
                )}
                {langFields.map((field, index) => (
                  <div key={field.id} className="p-5 bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl relative group">
                    <button 
                      type="button" 
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500"
                      onClick={() => removeLang(index)}
                      aria-label="Eliminar idioma"
                      title="Eliminar idioma"
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

            {/* Experiencia */}
            <details className="group [&_summary::-webkit-details-marker]:hidden pt-4">
              <summary className="flex cursor-pointer items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg shadow-inner">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">Experiencia Laboral</h3>
                    <p className="text-xs text-gray-500">Tu trayectoria profesional detallada.</p>
                  </div>
                </div>
                <span className="transition duration-300 group-open:-rotate-180 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500">
                  <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="pt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                {expFields.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">Sin experiencia registrada</p>
                      <p className="text-gray-500 text-sm max-w-[250px] mx-auto mt-1">Agrega tu experiencia laboral para destacar frente a los reclutadores.</p>
                    </div>
                  </div>
                )}
                <div className={expFields.length > 0 ? "relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 md:ml-4 space-y-6 pb-4" : ""}>
                {(() => {
                  const watchedExperiences = form.watch('experiences') || [];
                  const sortedIndices = expFields.map((field, index) => {
                    return {
                      index,
                      field,
                      isCurrent: watchedExperiences[index]?.current || false,
                      startDate: watchedExperiences[index]?.startDate || '',
                      endDate: watchedExperiences[index]?.endDate || ''
                    };
                  }).sort((a, b) => {
                    if (a.isCurrent && !b.isCurrent) return -1;
                    if (!a.isCurrent && b.isCurrent) return 1;
                    if (a.endDate && b.endDate && a.endDate !== b.endDate) {
                      return b.endDate.localeCompare(a.endDate);
                    }
                    if (a.startDate && b.startDate) {
                      return b.startDate.localeCompare(a.startDate);
                    }
                    return 0;
                  });

                  return sortedIndices.map((item) => {
                    const index = item.index;
                    const field = item.field;
                    const exp = watchedExperiences[index];
                    const isEditing = editingExp[field.id] || !exp?.company;

                    return (
                      <div key={field.id} className="relative pl-6 md:pl-8 group">
                        <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-800"></div>
                        
                        {!isEditing ? (
                          <div className="p-5 bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl relative hover:border-blue-200 transition-colors">
                            <button 
                              type="button" 
                              className="absolute top-4 right-12 p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              onClick={() => setEditingExp({ ...editingExp, [field.id]: true })}
                              title="Editar experiencia"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              type="button" 
                              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              onClick={() => removeExp(index)}
                              title="Eliminar experiencia"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white pr-16">{exp.position}</h3>
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1 sm:mt-0 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 rounded-full w-fit">
                                {exp.startDate ? new Date(exp.startDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : 'N/A'} - {exp.current ? 'Presente' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : 'N/A')}
                              </span>
                            </div>
                            <h4 className="text-md font-medium text-gray-600 dark:text-gray-400 mb-3">{exp.company}</h4>
                            {exp.description && (
                              <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="p-5 bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 shadow-sm rounded-xl relative group">
                            <button 
                              type="button" 
                              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500"
                              onClick={() => removeExp(index)}
                              aria-label="Eliminar experiencia"
                              title="Eliminar experiencia"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              <FormField
                                control={form.control}
                                name={`experiences.${index}.company`}
                                render={({ field: formField }) => (
                                  <FormItem>
                                    <FormLabel>Empresa</FormLabel>
                                    <FormControl><Input placeholder="Ej. Tech Corp" {...formField} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`experiences.${index}.position`}
                                render={({ field: formField }) => (
                                  <FormItem>
                                    <FormLabel>Cargo</FormLabel>
                                    <FormControl><Input placeholder="Ej. Senior Frontend Developer" {...formField} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`experiences.${index}.startDate`}
                                render={({ field: formField }) => (
                                  <FormItem>
                                    <FormLabel>Fecha de inicio</FormLabel>
                                    <FormControl>
                                      <MonthPicker value={formField.value} onChange={formField.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`experiences.${index}.endDate`}
                                render={({ field: formField }) => (
                                  <FormItem>
                                    <FormLabel>Fecha de término</FormLabel>
                                    <FormControl>
                                      <MonthPicker value={formField.value} onChange={formField.onChange} disabled={form.watch(`experiences.${index}.current`)} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`experiences.${index}.current`}
                                render={({ field: formField }) => (
                                  <FormItem className="md:col-span-2 flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                                    <FormControl>
                                      <input 
                                        type="checkbox" 
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                        checked={formField.value || false}
                                        onChange={formField.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Actualmente trabajo aquí</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`experiences.${index}.description`}
                                render={({ field: formField }) => (
                                  <FormItem className="md:col-span-2">
                                    <div className="flex items-center justify-between">
                                      <FormLabel>Descripción</FormLabel>
                                      <button type="button" onClick={() => toast.info('Función en desarrollo: Generación de textos con IA')} className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1 hover:underline">
                                        <Sparkles className="w-3 h-3" /> Mejorar redacción ✨
                                      </button>
                                    </div>
                                    <FormControl>
                                      <Textarea placeholder="Describe tus responsabilidades y logros..." {...formField} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="md:col-span-2 flex justify-end mt-2">
                                <Button 
                                  type="button" 
                                  variant="secondary" 
                                  onClick={() => {
                                    if (exp.company && exp.position) {
                                      setEditingExp({ ...editingExp, [field.id]: false });
                                    } else {
                                      toast.error("Empresa y Cargo son obligatorios");
                                    }
                                  }}
                                >
                                  Listo
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
                </div>
                
                <button type="button" onClick={() => appendExp({ company: '', position: '', startDate: '', endDate: '', current: false, description: '' })} className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 transition-colors">
                  <Plus className="w-4 h-4" /> Añadir experiencia
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
                  <div className="text-center py-12 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">Sin estudios registrados</p>
                      <p className="text-gray-500 text-sm max-w-[250px] mx-auto mt-1">Comparte tus logros académicos o técnicos para destacar tu perfil.</p>
                    </div>
                  </div>
                )}
                <div className={eduFields.length > 0 ? "relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 md:ml-4 space-y-6 pb-4" : ""}>
                {eduFields.map((field, index) => {
                  const edu = form.watch(`educations.${index}`);
                  const isEditing = editingEdu[field.id] || !edu?.institution;

                  return (
                    <div key={field.id} className="relative pl-6 md:pl-8 group">
                      <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-orange-500 border-4 border-white dark:border-gray-800"></div>
                      
                      {!isEditing ? (
                        <div className="p-5 bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl relative hover:border-orange-200 transition-colors">
                          <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                            {index > 0 && (
                              <button type="button" onClick={() => swapEdu(index, index - 1)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" title="Mover arriba">
                                <ArrowUp className="w-4 h-4" />
                              </button>
                            )}
                            {index < eduFields.length - 1 && (
                              <button type="button" onClick={() => swapEdu(index, index + 1)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" title="Mover abajo">
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              type="button" 
                              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                              onClick={() => setEditingEdu({ ...editingEdu, [field.id]: true })}
                              title="Editar educación"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              type="button" 
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                              onClick={() => removeEdu(index)}
                              title="Eliminar educación"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white pr-24">{edu.degree}</h3>
                          </div>
                          <h4 className="text-md font-medium text-gray-600 dark:text-gray-400 mb-0">{edu.institution}</h4>
                        </div>
                      ) : (
                        <div className="p-5 bg-orange-50/30 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900 shadow-sm rounded-xl relative group">
                          <button 
                            type="button" 
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            onClick={() => removeEdu(index)}
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <FormField
                              control={form.control}
                              name={`educations.${index}.institution`}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormLabel>Institución</FormLabel>
                                  <FormControl><Input placeholder="Ej. Universidad de Chile" {...formField} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`educations.${index}.degree`}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormLabel>Título</FormLabel>
                                  <FormControl><Input placeholder="Ej. Ingeniería en Software" {...formField} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="md:col-span-2 flex justify-end mt-2">
                              <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={() => {
                                  if (edu?.institution && edu?.degree) {
                                    setEditingEdu({ ...editingEdu, [field.id]: false });
                                  } else {
                                    toast.error("Institución y Título son obligatorios");
                                  }
                                }}
                              >
                                Listo
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
                
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
                  <div className="text-center py-12 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">Aún sin certificaciones</p>
                      <p className="text-gray-500 text-sm max-w-[250px] mx-auto mt-1">Los reclutadores valoran mucho el aprendizaje continuo.</p>
                    </div>
                  </div>
                )}
                <div className={certFields.length > 0 ? "relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 md:ml-4 space-y-6 pb-4" : ""}>
                {certFields.map((field, index) => {
                  const cert = form.watch(`certifications.${index}`);
                  const isEditing = editingCert[field.id] || !cert?.name;

                  return (
                    <div key={field.id} className="relative pl-6 md:pl-8 group">
                      <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-purple-500 border-4 border-white dark:border-gray-800"></div>
                      
                      {!isEditing ? (
                        <div className="p-5 bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl relative hover:border-purple-200 transition-colors">
                          <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                            {index > 0 && (
                              <button type="button" onClick={() => swapCert(index, index - 1)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" title="Mover arriba">
                                <ArrowUp className="w-4 h-4" />
                              </button>
                            )}
                            {index < certFields.length - 1 && (
                              <button type="button" onClick={() => swapCert(index, index + 1)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" title="Mover abajo">
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              type="button" 
                              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                              onClick={() => setEditingCert({ ...editingCert, [field.id]: true })}
                              title="Editar certificación"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              type="button" 
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                              onClick={() => removeCert(index)}
                              title="Eliminar certificación"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white pr-24">{cert.name}</h3>
                          </div>
                          <h4 className="text-md font-medium text-gray-600 dark:text-gray-400 mb-0">{cert.issuer}</h4>
                        </div>
                      ) : (
                        <div className="p-5 bg-purple-50/30 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900 shadow-sm rounded-xl relative group">
                          <button 
                            type="button" 
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            onClick={() => removeCert(index)}
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <FormField
                              control={form.control}
                              name={`certifications.${index}.name`}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormLabel>Nombre</FormLabel>
                                  <FormControl><Input placeholder="Ej. AWS Solutions Architect" {...formField} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`certifications.${index}.issuer`}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormLabel>Emisor</FormLabel>
                                  <FormControl><Input placeholder="Ej. Amazon Web Services" {...formField} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="md:col-span-2 flex justify-end mt-2">
                              <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={() => {
                                  if (cert?.name && cert?.issuer) {
                                    setEditingCert({ ...editingCert, [field.id]: false });
                                  } else {
                                    toast.error("Nombre y Emisor son obligatorios");
                                  }
                                }}
                              >
                                Listo
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
                
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
                  <div className="text-center py-12 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">Portafolio vacío</p>
                      <p className="text-gray-500 text-sm max-w-[250px] mx-auto mt-1">Muestra tus mejores trabajos con imágenes o enlaces y aumenta tu contratación.</p>
                    </div>
                  </div>
                )}
                <div className={portfolioFields.length > 0 ? "relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 md:ml-4 space-y-6 pb-4" : ""}>
                {portfolioFields.map((field, index) => {
                  const port = form.watch(`portfolioItems.${index}`);
                  const isEditing = editingPortfolio[field.id] || !port?.title;

                  return (
                    <div key={field.id} className="relative pl-6 md:pl-8 group">
                      <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-800"></div>
                      
                      {!isEditing ? (
                        <div className="p-5 bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl relative hover:border-blue-200 transition-colors">
                          <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                            {index > 0 && (
                              <button type="button" onClick={() => swapPortfolio(index, index - 1)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" title="Mover arriba">
                                <ArrowUp className="w-4 h-4" />
                              </button>
                            )}
                            {index < portfolioFields.length - 1 && (
                              <button type="button" onClick={() => swapPortfolio(index, index + 1)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" title="Mover abajo">
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              type="button" 
                              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                              onClick={() => setEditingPortfolio({ ...editingPortfolio, [field.id]: true })}
                              title="Editar proyecto"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              type="button" 
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                              onClick={() => removePortfolio(index)}
                              title="Eliminar proyecto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white pr-24">{port.title}</h3>
                          </div>
                          {port.description && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed mt-2">
                              {port.description}
                            </p>
                          )}
                          {port.imageUrl && (
                            <div className="mt-4 flex gap-2">
                              <span className="text-xs text-blue-500 flex items-center gap-1"><Link2 className="w-3 h-3" /> Foto adjunta</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-5 bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 shadow-sm rounded-xl relative group">
                          <button 
                            type="button" 
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            onClick={() => removePortfolio(index)}
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <FormField
                              control={form.control}
                              name={`portfolioItems.${index}.title`}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormLabel>Título del Trabajo</FormLabel>
                                  <FormControl><Input placeholder="Ej. Remodelación de Casa" {...formField} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`portfolioItems.${index}.imageUrl`}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormLabel>URL de Fotografía (Opcional)</FormLabel>
                                  <FormControl>
                                    <div className="flex gap-2">
                                      <Input placeholder="https://..." {...formField} />
                                      <Button 
                                        type="button" variant="secondary" size="icon" className="shrink-0"
                                        onClick={() => handleCopy(formField.value || '', `img-${index}`)}
                                      >
                                        {copiedStates[`img-${index}`] ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                                      </Button>
                                      <Button 
                                        type="button" variant="secondary" size="icon" className="shrink-0"
                                        onClick={() => handleOpenLink(formField.value || '')} disabled={!formField.value}
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
                              render={({ field: formField }) => (
                                <FormItem className="md:col-span-2">
                                  <div className="flex items-center justify-between">
                                    <FormLabel>Descripción Breve</FormLabel>
                                    <button type="button" onClick={() => toast.info('Función en desarrollo: Generación de textos con IA')} className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1 hover:underline">
                                      <Sparkles className="w-3 h-3" /> Mejorar con IA
                                    </button>
                                  </div>
                                  <FormControl><Textarea placeholder="Detalles de lo que hiciste..." {...formField} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="md:col-span-2 flex justify-end mt-2">
                              <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={() => {
                                  if (port?.title) {
                                    setEditingPortfolio({ ...editingPortfolio, [field.id]: false });
                                  } else {
                                    toast.error("El Título es obligatorio");
                                  }
                                }}
                              >
                                Listo
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
                
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
              <Button type="submit" variant="default" size="xl" className="w-full shadow-blue-500/20 shadow-xl hidden md:block" disabled={mutation.isPending || !form.formState.isDirty}>
                {mutation.isPending ? 'Guardando...' : 'Guardar Todo el Perfil'}
              </Button>
            </div>
            
            {/* Sticky Save Bar (Modernized UI) */}
            {form.formState.isDirty && (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 animate-in slide-in-from-bottom-10 flex justify-center">
                <div className="container max-w-4xl flex items-center justify-between gap-4">
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Tienes cambios sin guardar</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">No olvides guardar tu progreso antes de salir.</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 sm:flex-none border-gray-300 dark:border-gray-700" 
                      onClick={() => form.reset()}
                      disabled={mutation.isPending}
                    >
                      Descartar
                    </Button>
                    <Button 
                      type="submit" 
                      variant="default" 
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25" 
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
