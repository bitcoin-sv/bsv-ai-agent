'use client';
import { useState } from 'react';
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
import { changeUserEmail } from '@/lib/actions/user';

const formSchema = z.object({
  email: z.string().email({ message: 'Email is required' }),
});

const ChangeEmailForm = ({ email }: { email: string }) => {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await changeUserEmail(values.email);
    } catch (error) {
      if (error instanceof Error) {
        form.setError('email', { message: error.message });
      }
      console.error(error);
    }
    setLoading(false);
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-2 items-end"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="grow">
              <FormLabel>Change your email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={loading} type="submit">
          Chang{loading ? 'ing' : 'e'} email{loading ? '…' : ''}
        </Button>
      </form>
    </Form>
  );
};

export default ChangeEmailForm;
