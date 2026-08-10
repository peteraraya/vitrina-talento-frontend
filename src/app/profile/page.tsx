'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProfileQueries } from '@/hooks/queries/useProfileQueries';
import { 
  profileSchema, visibilitySchema, availabilitySchema,
  ProfileFormValues, VisibilityFormValues, AvailabilityFormValues
} from '@/schemas/profile.schema';
import { Navbar, Footer } from '@/components/layout';

import { Button } from '@/components/ui';
import { 
  VisibilitySettings, 
  AvailabilitySettings, 
  ProfileDetailsForm 
} from '@/components/features/profile';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Briefcase, Star, Search, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  
  const { 
    profileQuery, 
    availabilityQuery, 
    updateProfileMutation, 
    updateVisibilityMutation, 
    updateAvailabilityMutation,
    uploadPhotoMutation
  } = useProfileQueries();

  const { data: profile, isLoading } = profileQuery;
  const { data: availability, isLoading: isAvailabilityLoading } = availabilityQuery;

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router, _hasHydrated]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
      defaultValues: {
        displayName: '',
        companyName: '',
        website: '',
        headline: '',
      summary: '',
      location: '',
      yearsOfExperience: 0,
      videoPitchUrl: '',
      phoneNumber: '',
      whatsappNumber: '',
      contactEmail: '',
      githubUrl: '',
      linkedinUrl: '',
      portfolioUrl: '',
      instagramUrl: '',
      twitterUrl: '',
      facebookUrl: '',
      languages: [],
      educations: [],
      experiences: [],
      certifications: [],
      portfolioItems: [],
      references: [],
      licenses: [],
      skills: [],
    },
  });

  const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({ control: form.control, name: "languages" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: "educations" });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control: form.control, name: "certifications" });

  const visibilityForm = useForm<VisibilityFormValues>({
    resolver: zodResolver(visibilitySchema),
    defaultValues: {
      visibility: 'PUBLIC',
    },
  });

  const availabilityForm = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      status: 'NOT_LOOKING',
      workMode: 'REMOTE',
      contractType: 'FULL_TIME',
      expectedSalaryMin: 0,
      expectedSalaryMax: 0,
      currency: 'CLP',
      salaryPeriod: 'MONTHLY',
      willingToTravel: false,
      shiftWork: false,
      nightShift: false,
    },
  });

  const formValues = form.watch();

  const calculateCompleteness = () => {
    let score = 0;
    if (formValues.displayName) score += 15;
    if (formValues.headline) score += 15;
    if (formValues.summary) score += 20;
    if (formValues.skills && formValues.skills.length > 0) score += 15;
    if (formValues.experiences && formValues.experiences.length > 0) score += 15;
    if (formValues.educations && formValues.educations.length > 0) score += 10;
    if (profile?.profilePhotoUrl) score += 10;
    return Math.min(100, score);
  };
  
  const completeness = calculateCompleteness();

  // Hydrate forms when data is loaded
  useEffect(() => {
    if (profile) {
      // Normalizar skills para soportar tanto formato plano (nuevo) como anidado (antiguo/Prisma)
      let parsedSkills: string[] = [];
      if (Array.isArray(profile.skills)) {
        parsedSkills = profile.skills.map((s: any) => typeof s === 'string' ? s : s.skill?.name || s.name || '');
      }

      form.reset({
        displayName: profile.displayName || '',
        companyName: profile.companyName || '',
        website: profile.website || '',
        headline: profile.headline || '',
        summary: profile.summary || '',
        location: profile.location || '',
        yearsOfExperience: profile.yearsOfExperience || 0,
        videoPitchUrl: profile.videoPitchUrl || '',
        phoneNumber: profile.phoneNumber || '',
        whatsappNumber: profile.whatsappNumber || '',
        contactEmail: profile.contactEmail || '',
        githubUrl: profile.githubUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        portfolioUrl: profile.portfolioUrl || '',
        instagramUrl: profile.instagramUrl || '',
        twitterUrl: profile.twitterUrl || '',
        facebookUrl: profile.facebookUrl || '',
        languages: profile.languages || [],
        educations: profile.educations || [],
        experiences: profile.experiences || [],
        certifications: profile.certifications || [],
        portfolioItems: profile.portfolioItems || [],
        references: profile.references || [],
        licenses: profile.licenses || [],
        skills: parsedSkills,
      });
      visibilityForm.reset({
        visibility: profile.visibility || 'PUBLIC',
      });
    }
    if (availability) {
      availabilityForm.reset({
        status: availability.status || 'NOT_LOOKING',
        workMode: availability.workMode || 'REMOTE',
        contractType: availability.contractType || 'FULL_TIME',
        expectedSalaryMin: availability.expectedSalaryMin || 0,
        expectedSalaryMax: availability.expectedSalaryMax || 0,
        currency: availability.currency || 'CLP',
        salaryPeriod: availability.salaryPeriod || 'MONTHLY',
        willingToTravel: availability.willingToTravel || false,
        shiftWork: availability.shiftWork || false,
        nightShift: availability.nightShift || false,
      });
    }
  }, [profile, availability, form, visibilityForm, availabilityForm]);

  if (!_hasHydrated || !isAuthenticated || isLoading || isAvailabilityLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <Navbar />
        <div className="container mx-auto px-4 py-8 lg:py-12 flex-1 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            <div className="w-full md:w-64 shrink-0 space-y-6">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-32 w-full mt-8" />
            </div>
            <div className="flex-1 space-y-10">
              <Skeleton className="h-96 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const visibilityStatus = visibilityForm.watch('visibility');
  const isAnonymized = visibilityStatus === 'ANONYMIZED';
  const isPrivate = visibilityStatus === 'PRIVATE';
  const displayName = isAnonymized ? 'Candidato Anónimo' : (formValues.displayName || 'Tu Nombre');
  const profilePhotoUrl = isAnonymized ? null : profile?.profilePhotoUrl;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-300">
      <Navbar />
      <div className="container mx-auto px-4 py-8 lg:py-12 flex-1 max-w-[1400px] animate-in fade-in duration-500">
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-10">
          
          {/* Left Sidebar Navigation */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Mi Perfil</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Gestiona tu currículum, expectativas salariales y privacidad.
                </p>
              </div>

              {/* Progress Ring */}
              <div className="p-5 bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 flex items-center justify-center rounded-full bg-gray-50 dark:bg-black">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{completeness}%</span>
                  <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-800" />
                    <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={`${completeness * 2.89} 289`} className="text-blue-600 dark:text-blue-500 transition-all duration-700 ease-out" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Fuerza del perfil</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{completeness === 100 ? '¡Listo para brillar!' : 'Aún faltan detalles'}</p>
                </div>
              </div>
              
              <nav className="flex flex-col gap-1 hidden lg:flex">
                <a href="#datos" onClick={(e) => { e.preventDefault(); document.getElementById('datos')?.scrollIntoView({ behavior: 'smooth' }); }} className="px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium rounded-xl transition-colors">
                  Datos Personales
                </a>
                <a href="#disponibilidad" onClick={(e) => { e.preventDefault(); document.getElementById('disponibilidad')?.scrollIntoView({ behavior: 'smooth' }); }} className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200 font-medium rounded-xl transition-colors">
                  Disponibilidad
                </a>
                <a href="#visibilidad" onClick={(e) => { e.preventDefault(); document.getElementById('visibilidad')?.scrollIntoView({ behavior: 'smooth' }); }} className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200 font-medium rounded-xl transition-colors">
                  Privacidad
                </a>
              </nav>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button variant="outline" className="w-full justify-start text-gray-600 dark:text-gray-400" onClick={() => router.push('/dashboard')}>
                  &larr; Volver al Dashboard
                </Button>
              </div>
            </div>
          </div>

          {/* Center Main Content Area */}
          <div className="flex-1 min-w-0 space-y-10 pb-32">
            <div id="datos" className="scroll-mt-24">
              <ProfileDetailsForm 
                form={form} 
                mutation={updateProfileMutation} 
                uploadPhotoMutation={uploadPhotoMutation}
                profilePhotoUrl={profile?.profilePhotoUrl}
              />
            </div>
            
            <div id="disponibilidad" className="scroll-mt-24">
              <AvailabilitySettings form={availabilityForm} mutation={updateAvailabilityMutation} />
            </div>
            
            <div id="visibilidad" className="scroll-mt-24">
              <VisibilitySettings form={visibilityForm} mutation={updateVisibilityMutation} />
            </div>
          </div>

          {/* Right Live Preview Column (Desktop only) */}
          <div className="hidden lg:block w-[320px] xl:w-[380px] shrink-0">
            <div className="sticky top-24 space-y-4">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Vista Previa en Vivo
              </h3>
              
              <div className={`p-4 rounded-xl mb-4 text-sm flex gap-2 ${
                isPrivate ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                isAnonymized ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' :
                'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
              }`}>
                {isPrivate ? <EyeOff className="w-5 h-5 shrink-0" /> : isAnonymized ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <Eye className="w-5 h-5 shrink-0" />}
                <div>
                  <strong className="block">{isPrivate ? 'Perfil Privado' : isAnonymized ? 'Perfil Anonimizado' : 'Perfil Público'}</strong>
                  {isPrivate ? 'Solo tú y quienes tengan el enlace pueden ver esto.' : isAnonymized ? 'Las empresas no pueden ver tu nombre ni foto.' : 'Apareces en el directorio público y Google.'}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="bg-white dark:bg-[#161616] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden pointer-events-none transition-all">
                <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="px-6 pb-6 relative">
                  <div className="absolute -top-10 left-6">
                    {profilePhotoUrl ? (
                      <div className="relative w-20 h-20 rounded-full border-4 border-white dark:border-[#161616] overflow-hidden bg-white">
                        <Image src={profilePhotoUrl} alt="Avatar" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full border-4 border-white dark:border-[#161616] bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 text-2xl font-bold">
                        {isAnonymized ? '?' : displayName.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-12">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{displayName}</h2>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1 line-clamp-2">{formValues.headline || 'Sin titular profesional'}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-3">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{formValues.location || 'Ubicación no especificada'}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Sobre mí</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                      {formValues.summary || 'Aún no has escrito un resumen sobre tu trayectoria o intereses.'}
                    </p>
                  </div>

                  {formValues.skills && formValues.skills.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Habilidades Top</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {formValues.skills.slice(0, 5).map((skill: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md text-[10px] border border-gray-100 dark:border-gray-700">
                            {skill}
                          </span>
                        ))}
                        {formValues.skills.length > 5 && (
                          <span className="px-2 py-0.5 text-gray-400 text-[10px] my-auto">+{formValues.skills.length - 5} más</span>
                        )}
                      </div>
                    </div>
                  )}

                  {formValues.experiences && formValues.experiences.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Experiencia Reciente</h3>
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{formValues.experiences[0].position || 'Cargo'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{formValues.experiences[0].company || 'Empresa'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>
      <Footer />
    </div>
  );
}
