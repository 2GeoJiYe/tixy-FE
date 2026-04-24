import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { signup } from "@/features/auth/api/auth";
import { getErrorMessage } from "@/shared/api/error";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useToast } from "@/shared/ui/toast";

export function SignupPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    email: "",
    password: "",
    phone: "",
    name: "",
  });

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      showToast("회원가입이 완료되었습니다. 로그인해 주세요.", "success");
      navigate("/login");
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
            Membership
          </p>
          <h1 className="mt-3 text-3xl font-bold text-foreground">회원가입</h1>
          <p className="mt-2 text-sm text-muted-foreground">예매에 사용할 계정을 만듭니다.</p>
        </div>

        <div className="p-6 md:p-8">
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">이름</span>
              <Input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">이메일</span>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">전화번호</span>
              <Input
                required
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="01012345678"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">비밀번호</span>
              <Input
                type="password"
                required
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="비밀번호 입력"
              />
            </label>

            <Button fullWidth disabled={mutation.isPending} type="submit" className="mt-2">
              {mutation.isPending ? "가입 중..." : "회원가입"}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5 text-sm">
            <span className="text-muted-foreground">이미 계정이 있으신가요?</span>
            <Link className="font-semibold text-primary" to="/login">
              로그인
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
