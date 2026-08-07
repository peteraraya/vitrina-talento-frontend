'use client';

import { UseFormReturn } from 'react-hook-form';
import { UseMutationResult } from '@tanstack/react-query';
import { VisibilityFormValues } from '@/schemas/profile.schema';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Select
} from '@/components/ui';
import { toast } from 'sonner';

interface Props {
  form: UseFormReturn<VisibilityFormValues>;
  mutation: UseMutationResult<any, Error, VisibilityFormValues, unknown>;
}

export function VisibilitySettings({ form, mutation }: Props) {
  return (
    <Card className="mb-6 border-0 shadow-xl shadow-gray-200/40 dark:shadow-none bg-white dark:bg-[#161616] overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-gray-900 dark:from-slate-900 dark:to-black px-6 py-6 border-b border-gray-200 dark:border-gray-800">
        <CardTitle className="text-xl font-bold text-white">Configuración de Visibilidad</CardTitle>
        <p className="text-slate-300 mt-1 text-sm">
          Controla quién puede ver tu perfil. El estado ANONYMIZED es recomendado en Vitrina tu Empleo.
        </p>
      </div>
      <CardContent className="p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => {
              toast.promise(mutation.mutateAsync(v), {
                loading: 'Actualizando visibilidad...',
                success: '¡Visibilidad actualizada con éxito!',
                error: (err) => err instanceof Error ? err.message : 'Error al guardar la visibilidad'
              });
            })}
            className="flex items-end gap-4"
          >
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Visibilidad</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      <option value="PUBLIC">Público (Indexado en buscadores)</option>
                      <option value="ANONYMIZED">Anonimizado (Recomendado)</option>
                      <option value="PRIVATE">Privado (No visible)</option>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
