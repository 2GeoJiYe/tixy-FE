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
    <div className="mx-auto max-w-md rounded-card border border-border bg-surface p-6 shadow-panel md:p-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Tixy</p>
        <h1 className="mt-3 text-3xl font-bold text-foreground">로그인</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          현재 백엔드 계약은 access token 중심입니다. 인증이 필요한 조회나 예매 단계에서 다시
          사용할 수 있도록 토큰만 최소 저장합니다.
        </p>
      </div>

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
            placeholder="영문, 숫자, 특수문자 포함"
          />
        </label>

        <Button fullWidth disabled={mutation.isPending} type="submit">
          {mutation.isPending ? "로그인 중..." : "로그인"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        아직 계정이 없나요?{" "}
        <Link className="font-semibold text-primary" to="/signup" state={{ redirectTo }}>
          회원가입
        </Link>
      </p>
    </div>
  );
}
