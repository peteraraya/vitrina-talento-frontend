'use client';

import { UseFormReturn } from 'react-hook-form';
import { UseMutationResult } from '@tanstack/react-query';
import { VisibilityFormValues } from '@/schemas/profile.schema';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Select,
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui';
import { toast } from 'sonner';
import { useState } from 'react';
import { Eye, ShieldAlert, EyeOff, Info } from 'lucide-react';

interface Props {
  form: UseFormReturn<VisibilityFormValues>;
  mutation: UseMutationResult<any, Error, VisibilityFormValues, unknown>;
}

export function VisibilitySettings({ form, mutation }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<VisibilityFormValues | null>(null);

  const onSubmit = (v: VisibilityFormValues) => {
    // Si no ha modificado el valor, guardamos directo
    if (!form.formState.isDirty) {
      executeMutation(v);
      return;
    }
    // Si lo modificó, abrimos el modal informativo
    setPendingValues(v);
    setIsModalOpen(true);
  };

  const executeMutation = (v: VisibilityFormValues) => {
    toast.promise(mutation.mutateAsync(v), {
      loading: 'Actualizando visibilidad...',
      success: '¡Visibilidad actualizada con éxito!',
      error: (err) => err instanceof Error ? err.message : 'Error al guardar la visibilidad'
    });
    setIsModalOpen(false);
    form.reset(v); // Reset form state to new values
  };

  return (
    <Card className="mb-6 border-0 shadow-xl shadow-gray-200/40 dark:shadow-none bg-white dark:bg-[#161616] overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-gray-900 dark:from-slate-900 dark:to-black px-6 py-6 border-b border-gray-200 dark:border-gray-800">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-slate-300" /> Configuración de Visibilidad
        </CardTitle>
        <p className="text-slate-300 mt-1 text-sm">
          Controla quién puede ver tu perfil y cómo apareces en las búsquedas de las empresas.
        </p>
      </div>
      <CardContent className="p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-end gap-4"
          >
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Nivel de Visibilidad</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      <option value="PUBLIC">Público (Máxima exposición)</option>
                      <option value="ANONYMIZED">Anonimizado (Protege tu identidad)</option>
                      <option value="PRIVATE">Privado (Solo enlaces directos)</option>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={mutation.isPending || !form.formState.isDirty}>
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </form>
        </Form>

        {/* Modal Informativo de Visibilidad */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Cambio de Visibilidad</DialogTitle>
              <DialogDescription>
                Estás a punto de cambiar cómo los reclutadores y empresas ven tu perfil. Aquí te explicamos qué significa cada estado:
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-4">
              <div className={`p-4 rounded-xl border flex gap-3 ${pendingValues?.visibility === 'PUBLIC' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-50 border-gray-100 dark:bg-[#111] dark:border-gray-800'}`}>
                <Eye className={`w-5 h-5 shrink-0 mt-0.5 ${pendingValues?.visibility === 'PUBLIC' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                <div>
                  <h4 className={`font-bold text-sm ${pendingValues?.visibility === 'PUBLIC' ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-gray-200'}`}>Público</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tu perfil es completamente visible. Tu nombre, foto y detalles aparecerán en buscadores (Google) y en el directorio de talentos de la plataforma. **Ideal si buscas trabajo activamente.**</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex gap-3 ${pendingValues?.visibility === 'ANONYMIZED' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-gray-50 border-gray-100 dark:bg-[#111] dark:border-gray-800'}`}>
                <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${pendingValues?.visibility === 'ANONYMIZED' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'}`} />
                <div>
                  <h4 className={`font-bold text-sm ${pendingValues?.visibility === 'ANONYMIZED' ? 'text-amber-900 dark:text-amber-300' : 'text-gray-900 dark:text-gray-200'}`}>Anonimizado</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tu perfil aparece en las búsquedas de los reclutadores por tus habilidades, pero **tu foto, nombre y empresa actual se ocultan**. Solo revelas tu identidad si aceptas una solicitud de contacto. **Ideal si tienes trabajo y buscas discretamente.**</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex gap-3 ${pendingValues?.visibility === 'PRIVATE' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-gray-50 border-gray-100 dark:bg-[#111] dark:border-gray-800'}`}>
                <EyeOff className={`w-5 h-5 shrink-0 mt-0.5 ${pendingValues?.visibility === 'PRIVATE' ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`} />
                <div>
                  <h4 className={`font-bold text-sm ${pendingValues?.visibility === 'PRIVATE' ? 'text-red-900 dark:text-red-300' : 'text-gray-900 dark:text-gray-200'}`}>Privado</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tu perfil no aparecerá en ninguna búsqueda. Solo las personas a las que les compartas directamente tu enlace podrán verlo. **Ideal si no estás buscando trabajo.**</p>
                </div>
              </div>
            </div>

            <DialogFooter className="sm:justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={() => pendingValues && executeMutation(pendingValues)}>
                Confirmar Cambio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
}
