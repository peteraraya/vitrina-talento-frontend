'use client';

import { UseFormReturn } from 'react-hook-form';
import { UseMutationResult } from '@tanstack/react-query';
import { VisibilityFormValues } from '@/schemas/profile.schema';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Select
} from '@/components/ui';

interface Props {
  form: UseFormReturn<VisibilityFormValues>;
  mutation: UseMutationResult<any, Error, VisibilityFormValues, unknown>;
}

export function VisibilitySettings({ form, mutation }: Props) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Configuración de Visibilidad</CardTitle>
        <CardDescription>
          Controla quién puede ver tu perfil. El estado ANONYMIZED es recomendado en Vitrina Talento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
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
