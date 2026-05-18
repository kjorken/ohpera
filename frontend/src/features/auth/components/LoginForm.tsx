import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/shared/lib/api";
import { useAuthStore } from "@/shared/store/auth.store";
import { useRouter } from "next/router";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      const res = await api.post<{ token: string }>("/auth/login", data);
      const me = await api.get<{ id: string; email: string }>("/auth/me");
      setAuth(me, res.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm md:max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            OhPera
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track what you owe. Know what you have.
          </p>
        </div>

        <Card className="w-full shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              Sign in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1">
                <Label htmlFor="Email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-danger">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-danger">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded=md bg-danger/10 px-3 py-2">
                  <p className="text-rs text-danger">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{" "}
          <a
            className="font-medium text-foreground underline-offset-4"
            href="/register"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
