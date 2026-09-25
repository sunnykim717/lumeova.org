"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notAdmin = searchParams.get("error") === "not_admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-2 text-center">
          Admin
        </p>
        <h1 className="font-display text-[22px] text-navy mb-8 text-center">관리자 로그인</h1>

        {notAdmin && (
          <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-sm px-4 py-3 mb-5">
            로그인은 되었지만 관리자 권한이 없는 계정입니다. 관리자에게 문의해 주세요.
          </p>
        )}
        {error && (
          <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-sm px-4 py-3 mb-5">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] text-muted mb-1.5" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-border px-3.5 py-2.5 text-[14px] focus-visible:outline-2 focus-visible:outline-gold-dark"
            />
          </div>
          <div>
            <label className="block text-[13px] text-muted mb-1.5" htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-border px-3.5 py-2.5 text-[14px] focus-visible:outline-2 focus-visible:outline-gold-dark"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <p className="text-[12px] text-muted text-center mt-8">
          관리자 계정은 별도로 발급됩니다. 계정이 없다면 단체 관리자에게 문의해 주세요.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
