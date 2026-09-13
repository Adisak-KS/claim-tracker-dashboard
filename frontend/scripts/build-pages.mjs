import { execFileSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

/**
 * build ไฟล์นิ่งสำหรับ GitHub Pages
 *
 * 🔴 ต้องเอา src/app/api ออกจากโครงระหว่าง build
 *
 * Next บังคับ prerender ทุก route.ts และเขียนผลเป็นไฟล์ชื่อเดียวกับโฟลเดอร์
 * (api/providers ชนกับ api/providers/) ทำให้ copy ไม่ผ่านบน Windows
 * และ handler ก็อ่าน query string ซึ่งตอน prerender ยังไม่มี
 *
 * ตัดออกได้เพราะ logic จริงอยู่ใน src/server/api ซึ่ง static-router
 * เรียกตรงจากเบราว์เซอร์อยู่แล้ว ไม่ได้พึ่ง route.ts เลย
 *
 * ย้ายกลับใน finally เสมอ ต่อให้ build ล้ม โครงโปรเจกต์จึงไม่เสียหาย
 */
const root = process.cwd();
const apiDir = join(root, "src", "app", "api");
const parked = join(root, ".api-parked");

function move(from, to) {
  cpSync(from, to, { recursive: true });
  rmSync(from, { recursive: true, force: true });
}

if (!existsSync(apiDir)) {
  console.error("ไม่พบ src/app/api ยกเลิก");
  process.exit(1);
}
rmSync(parked, { recursive: true, force: true });
rmSync(join(root, "out"), { recursive: true, force: true });

move(apiDir, parked);

let failed = false;
try {
  execFileSync("npx", ["next", "build"], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      STATIC_EXPORT: "1",
      NEXT_PUBLIC_STATIC_MOCK: "1",
    },
  });
} catch {
  failed = true;
} finally {
  move(parked, apiDir);
}

process.exit(failed ? 1 : 0);
