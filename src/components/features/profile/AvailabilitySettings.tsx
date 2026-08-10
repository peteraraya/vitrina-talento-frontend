'use client';

import { UseFormReturn } from 'react-hook-form';
import { UseMutationResult } from '@tanstack/react-query';
import { AvailabilityFormValues } from '@/schemas/profile.schema';
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Select, Input
} from '@/components/ui';
import { toast } from 'sonner';

interface Props {
  form: UseFormReturn<AvailabilityFormValues>;
  mutation: UseMutationResult<any, Error, AvailabilityFormValues, unknown>;
}

export function AvailabilitySettings({ form, mutation }: Props) {
  return (
    <Card className="mb-6 border-0 shadow-xl shadow-gray-200/40 dark:shadow-none bg-white dark:bg-[#161616] overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-800 px-6 py-6 border-b border-gray-200 dark:border-gray-800">
        <CardTitle className="text-xl font-bold text-white">Disponibilidad Laboral</CardTitle>
        <p className="text-emerald-50 mt-1 text-sm">
          Define cuándo y cómo quieres trabajar, y tus expectativas salariales.
        </p>
      </div>
      <CardContent className="p-6">
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit((v) => {
              toast.promise(mutation.mutateAsync(v), {
                loading: 'Actualizando disponibilidad...',
                success: '¡Disponibilidad actualizada con éxito!',
                error: (err) => err instanceof Error ? err.message : 'Error al actualizar disponibilidad'
              });
            })} 
            className="space-y-4"
          >
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
                    <FormLabel>Moneda</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="CLP">CLP - Peso Chileno</option>
                        <option value="USD">USD - Dólar Estadounidense</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="MXN">MXN - Peso Mexicano</option>
                        <option value="COP">COP - Peso Colombiano</option>
                        <option value="PEN">PEN - Sol Peruano</option>
                        <option value="ARS">ARS - Peso Argentino</option>
                      </Select>
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
                    <FormLabel>Salario Max</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salaryPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frecuencia de Pago</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="HOURLY">Por Hora</option>
                        <option value="DAILY">Diario</option>
                        <option value="WEEKLY">Semanal</option>
                        <option value="MONTHLY">Mensual</option>
                        <option value="PROJECT_BASED">Por Proyecto</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
              <details className="group [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 dark:bg-[#111] p-4 font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Ver Opciones Adicionales (Turnos y Viajes)
                  </span>
                  <span className="transition duration-300 group-open:-rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>

                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <FormField
                control={form.control}
                name="willingToTravel"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm dark:border-gray-800">
                    <FormControl>
                      <input 
                        type="checkbox" 
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" 
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Disposición para viajar</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shiftWork"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm dark:border-gray-800">
                    <FormControl>
                      <input 
                        type="checkbox" 
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" 
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Sistema de turnos (Rotativos)</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nightShift"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm dark:border-gray-800">
                    <FormControl>
                      <input 
                        type="checkbox" 
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" 
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Disponibilidad turno noche</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
                </div>
              </details>
            </div>

            <Button type="submit" variant="default" size="lg" className="w-full mt-6" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar Disponibilidad'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
