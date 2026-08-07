'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, CardDescription, Input, Label } from '@/components/ui';
import { Navbar, Footer } from '@/components/layout';
import { Copy, CheckCircle2, ArrowLeft, Download, Share2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function ShareCardPage() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchApi('/profiles/me')
      .then(res => res.json())
      .then(data => setProfileData(data))
      .catch(console.error);
  }, [isAuthenticated, router, _hasHydrated]);

  const userSlug = profileData?.slug || 'mock-slug';
  const domain = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
  const publicUrl = `${domain}/talento/${userSlug}`;
  const ogImageUrl = `/api/og?slug=${userSlug}&t=${Date.now()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!_hasHydrated || !isAuthenticated || !profileData) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-300">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12 max-w-4xl">
        <Button variant="ghost" className="mb-6 gap-2 text-gray-500" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
        </Button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Preview */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Comparte tu Tarjeta</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Esta es la imagen que aparecerá automáticamente cuando envíes tu enlace por LinkedIn, WhatsApp o X.</p>
            
            <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl mb-6">
              <img src={ogImageUrl} alt="Preview Tarjeta" className="w-full h-auto aspect-[1200/630] object-cover" />
            </div>

            <Button variant="outline" className="w-full gap-2 mb-2" onClick={() => window.open(ogImageUrl, '_blank')}>
              <Download className="h-4 w-4" /> Descargar Imagen
            </Button>
          </div>

          {/* Right: Controls */}
          <div className="w-full md:w-80 space-y-6">
            <Card className="border-0 shadow-md bg-white dark:bg-[#161616]">
              <CardHeader>
                <CardTitle className="text-lg">Tu Enlace Público</CardTitle>
                <CardDescription>Copia tu enlace único</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>URL Directa</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={publicUrl} className="bg-gray-50 dark:bg-[#111]" />
                    <Button variant={copied ? "default" : "secondary"} size="icon" onClick={handleCopy} className="shrink-0">
                      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-700" onClick={handleCopy}>
                  <Share2 className="h-4 w-4" /> 
                  {copied ? '¡Copiado!' : 'Copiar enlace'}
                </Button>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-500 mb-3 text-center">O comparte directamente en:</p>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 text-[#0A66C2] border-[#0A66C2]/20 hover:bg-[#0A66C2]/5"
                      onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`, '_blank')}
                    >
                      Compartir en LinkedIn
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 text-[#25D366] border-[#25D366]/20 hover:bg-[#25D366]/5"
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`¡Echa un vistazo a mi perfil profesional en Vitrina tu Empleo! ${publicUrl}`)}`, '_blank')}
                    >
                      Compartir en WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
