'use client';

import { UseFormReturn } from 'react-hook-form';
import { UseMutationResult } from '@tanstack/react-query';
import { AvailabilityFormValues } from '@/schemas/profile.schema';
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Select, Input
} from '@/components/ui';

interface Props {
  form: UseFormReturn<AvailabilityFormValues>;
  mutation: UseMutationResult<any, Error, AvailabilityFormValues, unknown>;
}

export function AvailabilitySettings({ form, mutation }: Props) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Disponibilidad Laboral</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="IMMEDIATE">Inmediata</option>
                        <option value="TWO_WEEKS">2 Semanas</option>
                        <option value="ONE_MONTH">1 Mes</option>
                        <option value="NOT_LOOKING">No busco</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalidad</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="REMOTE">Remoto</option>
                        <option value="HYBRID">Híbrido</option>
                        <option value="ONSITE">Presencial</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Contrato</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="FREELANCE">Freelance</option>
                        <option value="CONTRACT">Contrato Fijo</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda (Ej: USD)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. USD, CLP, EUR" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedSalaryMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario Min (Mensual)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedSalaryMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario Max (Mensual)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full mt-4" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar Disponibilidad'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
