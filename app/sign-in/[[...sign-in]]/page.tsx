import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <SignIn />
    </div>
  );
}
