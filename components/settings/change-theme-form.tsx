'use client';
import { useState } from 'react';
import { useTheme } from 'next-themes';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateUser } from '@/lib/actions/user';
import { Theme } from '@/prisma/generated/client';

const formSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
});

const ChangeThemeForm = ({ theme }: { theme: Theme }) => {
  const [loading, setLoading] = useState(false);
  const { setTheme } = useTheme();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { theme },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await updateUser({ theme: values.theme });
    } catch (error) {
      if (error instanceof Error) {
        form.setError('theme', { message: error.message });
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
          name="theme"
          render={({ field }) => (
            <FormItem className="grow">
              <FormLabel>Set your preferred theme</FormLabel>
              <Select
                onValueChange={(value) => {
                  setTheme(value);
                  field.onChange(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a verified email to display" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={loading} type="submit">
          Chang{loading ? 'ing' : 'e'} theme{loading ? '…' : ''}
        </Button>
      </form>
    </Form>
  );
};

export default ChangeThemeForm;
