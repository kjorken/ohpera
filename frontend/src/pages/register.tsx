import GuestGuard from "@/components/GuestGuard";
import RegistrationForm from "@/features/auth/components/RegistrationForm";

export default function RegisterPage() {
  return (
    <GuestGuard>
      <RegistrationForm />
    </GuestGuard>
  );
}
