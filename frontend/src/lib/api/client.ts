/**
 * ทางเข้าออกเดียวของการยิง API ทั้งระบบ
 * component ห้ามเรียก fetch เอง ให้เรียกผ่าน hook ที่ใช้ไฟล์นี้
 * ของจริงเปลี่ยนแค่ API_BASE ไม่ต้องแก้หน้าจอ
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

/**
 * โหมดไฟล์นิ่งสำหรับ GitHub Pages ซึ่งไม่มีเซิร์ฟเวอร์รัน API
 * เปิดด้วย NEXT_PUBLIC_STATIC_MOCK=1 ตอน build เท่านั้น
 * ตอน dev ยังยิง HTTP จริงเหมือนเดิม เส้นทางโค้ดจึงไม่ต่างจากของจริง
 */
const STATIC_MOCK = process.env.NEXT_PUBLIC_STATIC_MOCK === "1";

export class ApiError extends Error {
  constructor(
    /** ข้อความที่ผู้ใช้ทั่วไปอ่านแล้วรู้ว่าต้องทำอะไรต่อ */
    public readonly userMessage: string,
    public readonly status: number,
  ) {
    super(userMessage);
    this.name = "ApiError";
  }
}

function messageForStatus(status: number): string {
  if (status === 401)
    return "เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้ง";
  if (status === 403)
    return "บัญชีของคุณไม่มีสิทธิ์ดูข้อมูลส่วนนี้ กรุณาติดต่อผู้ดูแลระบบ";
  if (status === 404) return "ไม่พบข้อมูลที่ต้องการ อาจถูกลบไปแล้ว";
  if (status >= 500)
    return "ระบบขัดข้องชั่วคราว กรุณารอสักครู่แล้วกดลองใหม่อีกครั้ง";
  return "เรียกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  let response: Response;
  try {
    if (STATIC_MOCK) {
      const { handleStatic } = await import("./static-router");
      response = await handleStatic(url);
    } else {
      response = await fetch(url.toString(), { credentials: "include" });
    }
  } catch {
    throw new ApiError(
      "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่",
      0,
    );
  }

  if (!response.ok) {
    throw new ApiError(messageForStatus(response.status), response.status);
  }

  return response.json() as Promise<T>;
}
