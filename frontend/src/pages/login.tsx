import GuestGuard from "@/components/GuestGuard";
import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginForm />
    </GuestGuard>
  );
}
