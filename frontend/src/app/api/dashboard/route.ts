/**
 * ตัวห่อบาง ๆ ของ dashboard
 *
 * logic อยู่ใน server/api เพราะโหมดไฟล์นิ่ง (GitHub Pages) ต้องเรียกฟังก์ชันเดิม
 * ตรง ๆ จากเบราว์เซอร์ ถ้า logic ติดอยู่ในไฟล์นี้จะเรียกไม่ได้
 */
import { handle } from "@/server/api/dashboard";

export async function GET(request: Request) {
  return handle(request);
}
