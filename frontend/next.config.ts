import type { NextConfig } from "next";

/**
 * build แบบไฟล์นิ่งสำหรับ GitHub Pages เปิดด้วย STATIC_EXPORT=1
 *
 * GitHub Pages ไม่มีเซิร์ฟเวอร์รันโค้ด จึงรัน API route ไม่ได้
 * ตอน build โหมดนี้ apiGet จะเรียก handler เดิมตรง ๆ ในเบราว์เซอร์แทน
 * (ดู lib/api/static-router.ts)
 *
 * 🔴 โหมดนี้ใช้โชว์หน้าตาเท่านั้น ห้ามใช้กับของจริง
 * เพราะข้อมูลทั้งหมดถูกสร้างในเครื่องผู้ใช้ ไม่ได้มาจากฐานข้อมูล
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";

/** ชื่อ repo ใน GitHub เพราะ Pages เสิร์ฟที่ /<repo> ไม่ใช่ราก */
const repoBasePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      basePath: repoBasePath,
      assetPrefix: repoBasePath || undefined,
      /** Pages ไม่มีตัวปรับขนาดรูปฝั่งเซิร์ฟเวอร์ */
      images: { unoptimized: true },
      /** เสิร์ฟเป็นโฟลเดอร์ ทำให้เปิด /providers ตรง ๆ แล้วไม่ 404 */
      trailingSlash: true,
    }
  : {};

export default nextConfig;
