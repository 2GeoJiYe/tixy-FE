import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/app/providers/auth-provider";
import { login } from "@/features/auth/api/auth";
import { getErrorMessage } from "@/shared/api/error";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useToast } from "@/shared/ui/toast";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: storeLogin } = useAuth();
  const { showToast } = useToast();
  const redirectTo = useMemo(() => {
    const state = location.state as { redirectTo?: string } | null;
    return state?.redirectTo ?? "/";
  }, [location.state]);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      storeLogin({
        accessToken: response.tokens.accessToken,
        user: response.user,
      });
      showToast("로그인되었습니다.", "success");
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => showToast(getErrorMessage(error), "danger"),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="mx-auto max-w-md">
      <section className="overflow-hidden rounded-card border border-border bg-surface shadow-panel">
        <div className="border-b border-border bg-panel/80 px-6 py-6 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
            Tixy
          </p>
          <h1 className="mt-3 text-3xl font-bold text-foreground">로그인</h1>
          <p className="mt-2 text-sm text-muted-foreground">이메일 계정으로 로그인</p>
        </div>

        <div className="p-6 md:p-8">
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">이메일</span>
              <Input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="you@example.com"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">비밀번호</span>
              <Input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="비밀번호 입력"
              />
            </label>

            <Button fullWidth disabled={mutation.isPending} type="submit" className="mt-2">
              {mutation.isPending ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5 text-sm">
            <span className="text-muted-foreground">계정이 없으신가요?</span>
            <Link className="font-semibold text-primary" to="/signup" state={{ redirectTo }}>
              회원가입
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
