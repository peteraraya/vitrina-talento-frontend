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
      <div className="container mx-auto p-8 max-w-3xl flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>Volver</Button>
        </div>

        <VisibilitySettings form={visibilityForm} mutation={updateVisibilityMutation} />
        <AvailabilitySettings form={availabilityForm} mutation={updateAvailabilityMutation} />
        <ProfileDetailsForm form={form} mutation={updateProfileMutation} />
      </div>
      <Footer />
    </div>
  );
}
