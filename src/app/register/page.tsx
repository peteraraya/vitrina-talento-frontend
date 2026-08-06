'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormValues } from '@/schemas/auth.schema';
import { useAuthQueries } from '@/hooks/queries/useAuthQueries';
import { Navbar, Footer } from '@/components/layout';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Input, Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
  Select
} from '@/components/ui';

export default function RegisterPage() {
  const { registerMutation } = useAuthQueries();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'CANDIDATE',
    },
  });

  function onSubmit(values: RegisterFormValues) {
    registerMutation.mutate(values);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-300">
      <Navbar />
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-[400px]">
          <CardHeader>
            <CardTitle>Registro</CardTitle>
            <CardDescription>Crea una nueva cuenta en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de cuenta</FormLabel>
                      <FormControl>
                        <Select {...field}>
                          <option value="CANDIDATE">Candidato</option>
                          <option value="RECRUITER">Reclutador</option>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {registerMutation.isError && (
                  <p className="text-sm text-red-500 font-medium">
                    {registerMutation.error instanceof Error ? registerMutation.error.message : 'Error desconocido'}
                  </p>
                )}
                <Button 
                  type="submit"
                  variant="default"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? 'Registrando...' : 'Registrarse'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
