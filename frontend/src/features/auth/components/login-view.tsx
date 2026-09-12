"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BmsLogo } from "@/components/layout/sidebar";

/**
 * ยังไม่ต่อ BMS Life จริง จึงตรวจแค่ว่ากรอกครบไหม
 * ห้ามใส่รายชื่อผู้ใช้หรือรหัสผ่านตัวอย่างลงในโค้ด
 */
export function LoginView() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบก่อนกดเข้าสู่ระบบ");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 600));
    router.push("/");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="animate-rise w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <BmsLogo className="size-14" />
          <h1 className="mt-3 text-lg font-semibold text-foreground">
            ระบบติดตามการส่งเคลม
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            เข้าสู่ระบบด้วยบัญชี BMS Life ของคุณ
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[var(--radius)] border border-border bg-surface p-5"
          noValidate
        >
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">
                ชื่อผู้ใช้
              </span>
              <input
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={Boolean(error)}
                className="h-10 w-full rounded-[var(--radius)] border border-border-strong bg-surface px-3 text-sm text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">
                รหัสผ่าน
              </span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(error)}
                className="h-10 w-full rounded-[var(--radius)] border border-border-strong bg-surface px-3 text-sm text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              />
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="animate-pop mt-4 flex items-start gap-2 rounded-[var(--radius)] border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          <Button
            type="submit"
            icon={LogIn}
            loadingText="กำลังเข้าสู่ระบบ"
            className="mt-5 w-full"
          >
            เข้าสู่ระบบ
          </Button>

          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            ระบบนี้ดูเฉพาะสถานะการส่งเคลม ไม่มีการเก็บข้อมูลส่วนตัวของผู้ป่วย
          </p>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          เข้าสู่ระบบไม่ได้ กรุณาติดต่อผู้ดูแลระบบของหน่วยงานคุณ
        </p>
      </div>
    </main>
  );
}
