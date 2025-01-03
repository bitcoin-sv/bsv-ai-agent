import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { fetchUser } from '@/lib/prisma';
import ChangeEmailForm from '@/components/settings/change-email-form';
import ChangePasswordForm from '@/components/settings/change-password-form';
import DeleteAccountButton from '@/components/settings/delete-account-button';
import ChangeThemeForm from '@/components/settings/change-theme-form';

const Settings = async () => {
  const user = await fetchUser();
  if (!user) {
    return null;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Modify your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <ChangeEmailForm email={user.email} />
        <ChangePasswordForm />
        <ChangeThemeForm theme={user.theme} />
        <DeleteAccountButton />
      </CardContent>
    </Card>
  );
};

export default Settings;
