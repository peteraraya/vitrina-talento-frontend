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

export default function ProfilePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const { 
    profileQuery, 
    availabilityQuery, 
    updateProfileMutation, 
    updateVisibilityMutation, 
    updateAvailabilityMutation 
  } = useProfileQueries();

  const { data: profile, isLoading } = profileQuery;
  const { data: availability, isLoading: isAvailabilityLoading } = availabilityQuery;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const form = useForm<ProfileFormValues>({
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

  const visibilityForm = useForm<VisibilityFormValues>({
    resolver: zodResolver(visibilitySchema),
    defaultValues: {
      visibility: 'ANONYMIZED',
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

  if (!isAuthenticated || isLoading || isAvailabilityLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-300">
      <Navbar />
      <div className="container mx-auto px-4 py-8 lg:py-12 flex-1 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Mi Perfil</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Gestiona tu currículum, expectativas salariales y privacidad.
                </p>
              </div>
              
              <nav className="flex flex-col gap-1 hidden md:flex">
                <a href="#datos" className="px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium rounded-xl transition-colors">
                  Datos Personales
                </a>
                <a href="#disponibilidad" className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200 font-medium rounded-xl transition-colors">
                  Disponibilidad
                </a>
                <a href="#visibilidad" className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200 font-medium rounded-xl transition-colors">
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

          {/* Main Content Area */}
          <div className="flex-1 space-y-10 pb-20">
            <div id="datos" className="scroll-mt-24">
              <ProfileDetailsForm form={form} mutation={updateProfileMutation} />
            </div>
            
            <div id="disponibilidad" className="scroll-mt-24">
              <AvailabilitySettings form={availabilityForm} mutation={updateAvailabilityMutation} />
            </div>
            
            <div id="visibilidad" className="scroll-mt-24">
              <VisibilitySettings form={visibilityForm} mutation={updateVisibilityMutation} />
            </div>
          </div>
          
        </div>
      </div>
      <Footer />
    </div>
  );
}
