'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, Bookmark, BookmarkCheck, Link2, FileText, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

type ProfileActionsProps = {
  slug: string;
  isAnonymized: boolean;
  contactEmail?: string;
  linkedinUrl?: string;
  whatsappNumber?: string;
};

export function ProfileActions({ slug, isAnonymized, contactEmail, linkedinUrl, whatsappNumber }: ProfileActionsProps) {
  const { role, isAuthenticated, accessToken, _hasHydrated } = useAuthStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [notes, setNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  
  // Ref para evitar que se ejecute dos veces en el ciclo de vida o por hydration
  const hasTrackedView = useRef(false);

  // Efecto para registrar la vista (silencioso)
  useEffect(() => {
    // Esperar a que zustand lea el localStorage para saber el rol real
    if (!_hasHydrated) return;
    
    // Evitar contar vistas si es un candidato
    if (role === 'CANDIDATE') return; 
    
    // Si ya lo registramos, no lo volvemos a enviar
    if (hasTrackedView.current) return;
    
    hasTrackedView.current = true;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    
    fetch(`${baseUrl}/profiles/${slug}/view`, { method: 'POST' }).catch(() => {
      // Fallo silencioso, no importa si falla el tracking
    });
  }, [slug, role, _hasHydrated]);

  // Efecto para comprobar si el candidato ya está guardado (solo para reclutadores)
  useEffect(() => {
    if (role !== 'RECRUITER' || !accessToken) return;

    const checkSavedStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
        const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        
        const response = await fetch(`${baseUrl}/profiles/me/saved-candidates`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          // Soporte por si viene envuelto en { data: [...] } o es el array directo
          const savedList = Array.isArray(data) ? data : (data.data || []);
          const alreadySaved = savedList.some((c: any) => c.slug === slug || c.profile?.slug === slug);
          setIsSaved(alreadySaved);
        }
      } catch (err) {
        // Ignorar
      }
    };

    checkSavedStatus();

    // Fetch jobs para asignar
    const fetchJobs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
        const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        
        const response = await fetch(`${baseUrl}/jobs`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          setJobs(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (err) {
        // Ignorar
      }
    };
    fetchJobs();
  }, [slug, role, accessToken]);

  const toggleSaveCandidate = async () => {
    if (!accessToken) {
      toast.error('Debes iniciar sesión como reclutador para guardar candidatos.');
      return;
    }

    try {
      setIsSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      const method = isSaved ? 'DELETE' : 'POST';
      
      const response = await fetch(`${baseUrl}/profiles/saved-candidates/${slug}`, {
        method,
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Error al guardar el candidato');
      
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Candidato eliminado de guardados' : 'Candidato guardado con éxito');
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un problema al modificar los candidatos guardados');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadCV = async () => {
    if (!accessToken) {
      toast.error('Debes iniciar sesión como reclutador para descargar CVs.');
      return;
    }
    
    try {
      setIsDownloading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
      const response = await fetch(`${baseUrl}/profiles/${slug}/export-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Error al generar el PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cv-${slug}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un problema al descargar el CV del candidato');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!_hasHydrated) {
    return <div className="flex items-center gap-3 w-full sm:w-auto opacity-0" />;
  }

  // Si el usuario es un candidato viendo la vista pública, no mostramos estos botones de acciones
  if (isAuthenticated && role === 'CANDIDATE') {
    return null;
  }

  const handleSendProposal = async () => {
    if (!message.trim()) {
      toast.error('Por favor ingresa un mensaje para la propuesta.');
      return;
    }
    
    try {
      setIsSending(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
      const response = await fetch(`${baseUrl}/contacts/${slug}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) throw new Error('Error al enviar la propuesta');
      
      toast.success('¡Propuesta enviada con éxito! El candidato ha sido notificado.');
      setShowContactForm(false);
      setMessage('');
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un problema al enviar la propuesta.');
    } finally {
      setIsSending(false);
    }
  };

  const handleAssignToJob = async () => {
    if (!selectedJob) {
      toast.error('Debes seleccionar una vacante.');
      return;
    }
    
    try {
      setIsAssigning(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
      const response = await fetch(`${baseUrl}/jobs/${selectedJob}/candidates/${slug}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });

      if (!response.ok) throw new Error('Error al asignar a vacante');
      
      toast.success('¡Candidato asignado a la vacante con éxito!');
      setShowJobForm(false);
      setNotes('');
      setSelectedJob('');
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un problema al asignar el candidato.');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
      <div className="flex flex-wrap justify-end items-center gap-3 w-full sm:w-auto">
      {role === 'RECRUITER' && (
        <>
          <Button 
            variant="outline" 
            className="gap-2 flex-1 sm:flex-none"
            onClick={downloadCV}
            disabled={isDownloading}
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} 
            Descargar CV
          </Button>

          <Button 
            variant={isSaved ? "default" : "outline"} 
            className={`gap-2 flex-1 sm:flex-none ${isSaved ? 'bg-amber-500 hover:bg-amber-600 text-white border-0' : ''}`}
            onClick={toggleSaveCandidate}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            {isSaved ? 'Guardado' : 'Guardar'}
          </Button>
        </>
      )}
      
      {role === 'RECRUITER' ? (
        <>
          {!isAnonymized && whatsappNumber && (
            <Button asChild className="gap-2 flex-1 sm:flex-none bg-[#25D366] hover:bg-[#25D366]/90 text-white shadow-md border-0">
              <a href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('¡Hola! Vi tu perfil en Vitrina tu Empleo y me interesaría conversar contigo sobre una oportunidad laboral.')}`} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="w-4 h-4" /> WhatsApp
              </a>
            </Button>
          )}

          <Button 
            className="gap-2 flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-md border-0"
            onClick={() => { setShowJobForm(!showJobForm); setShowContactForm(false); }}
          >
            <BookmarkCheck className="w-4 h-4" /> Añadir a Vacante
          </Button>

          <Button 
            className="gap-2 flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            onClick={() => { setShowContactForm(!showContactForm); setShowJobForm(false); }}
          >
            <Mail className="w-4 h-4" /> 
            {isAnonymized ? 'Contacto Ciego' : 'Enviar Propuesta'}
          </Button>
        </>
      ) : (
        <>
          {!isAnonymized && whatsappNumber && (
            <Button asChild className="gap-2 flex-1 sm:flex-none bg-[#25D366] hover:bg-[#25D366]/90 text-white shadow-md">
              <a href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('¡Hola! Vi tu perfil profesional y me gustaría contactarte.')}`} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="w-4 h-4" /> WhatsApp
              </a>
            </Button>
          )}

          {!isAnonymized && contactEmail && (
            <Button asChild className="gap-2 flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-md">
              <a href={`mailto:${contactEmail}`}>
                <Mail className="w-4 h-4" /> Contactar
              </a>
            </Button>
          )}
          
          {!isAnonymized && linkedinUrl && (
            <Button asChild className="gap-2 flex-1 sm:flex-none bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white shadow-md">
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                <Link2 className="w-4 h-4" /> LinkedIn
              </a>
            </Button>
          )}
          
          {(isAnonymized || (!contactEmail && !linkedinUrl && !whatsappNumber)) && (
            <Button className="gap-2 flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-md" disabled>
              <Mail className="w-4 h-4" /> Perfil Privado
            </Button>
          )}
        </>
      )}
      </div>

      {showJobForm && (
        <div className="w-full sm:w-96 bg-white dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl mt-2 animate-in fade-in slide-in-from-top-4">
          <h4 className="font-bold text-sm mb-2 text-gray-900 dark:text-white">Añadir a Vacante (ATS)</h4>
          <p className="text-xs text-gray-500 mb-3">
            Selecciona la vacante a la que deseas asignar este candidato para agregarlo a tu Pipeline (Kanban).
          </p>
          
          <select 
            className="w-full p-2 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            disabled={isAssigning || jobs.length === 0}
          >
            <option value="" disabled>Selecciona una vacante...</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>

          {jobs.length === 0 && (
            <p className="text-xs text-red-500 mb-3">No tienes vacantes creadas. Ve al Dashboard para crear una.</p>
          )}

          <textarea 
            className="w-full h-20 p-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
            placeholder="Observaciones o notas privadas (Opcional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isAssigning}
          ></textarea>
          
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowJobForm(false)} disabled={isAssigning}>Cancelar</Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAssignToJob} disabled={isAssigning || !selectedJob}>
              {isAssigning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Asignar
            </Button>
          </div>
        </div>
      )}

      {showContactForm && (
        <div className="w-full sm:w-96 bg-white dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl mt-2 animate-in fade-in slide-in-from-top-4">
          <h4 className="font-bold text-sm mb-2 text-gray-900 dark:text-white">Enviar Propuesta Laboral</h4>
          <p className="text-xs text-gray-500 mb-3">
            {isAnonymized 
              ? 'Este candidato es anónimo. Le enviaremos tu mensaje y, si acepta, se revelarán sus datos de contacto reales.'
              : 'Escribe un mensaje presentándole tu oferta laboral al candidato.'}
          </p>
          <textarea 
            className="w-full h-24 p-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            placeholder="Hola, nos encanta tu perfil para un puesto de Senior..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
          ></textarea>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowContactForm(false)} disabled={isSending}>Cancelar</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSendProposal} disabled={isSending || !message.trim()}>
              {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Enviar
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
