'use client';
import { useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

const ChangePasswordForm = () => {
  const clerk = useClerk();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!clerk.user) {
      return;
    }
    setLoading(true);
    try {
      await clerk.user.updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    } catch (error) {
      if (error instanceof Error) {
        form.setError('newPassword', { message: error.message });
      }
      console.error(error);
    }
    setLoading(false);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Change your password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Current password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="grow">
                <FormControl>
                  <Input
                    type="password"
                    placeholder="New password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={loading} type="submit">
            Chang{loading ? 'ing' : 'e'} password{loading ? '…' : ''}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ChangePasswordForm;
