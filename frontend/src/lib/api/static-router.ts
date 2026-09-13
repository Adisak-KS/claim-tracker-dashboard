/**
 * เรียก route handler ตัวเดิมตรง ๆ ในเบราว์เซอร์ แทนการยิง HTTP
 *
 * ใช้เฉพาะตอน build แบบไฟล์นิ่ง (GitHub Pages) ซึ่งไม่มีเซิร์ฟเวอร์รัน API
 * 🔴 ห้ามเขียน logic ซ้ำในไฟล์นี้ ต้องเรียก handler เดิมเสมอ
 * ไม่งั้นข้อมูลที่ PM เห็นจะไม่ตรงกับที่รันจริงตอน dev
 *
 * ข้อมูลจำลองเป็น TypeScript ล้วน ไม่ได้พึ่ง Node จึงรันฝั่งเบราว์เซอร์ได้
 */
/**
 * handler แต่ละตัวประกาศ params เป็นชื่อฟิลด์ของตัวเอง (เช่น { code })
 * ตัว router ไม่รู้ชื่อล่วงหน้า จึงรับเป็น unknown แล้วแคสต์ตอนเรียก
 */
type AnyHandler = (
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any,
) => Promise<Response>;

interface Route {
  pattern: RegExp;
  keys: string[];
  load: () => Promise<{ handle: AnyHandler }>;
}

/** เรียงจากเจาะจงไปกว้าง ตัวที่มีพารามิเตอร์ต้องมาก่อนตัวที่ไม่มี */
const ROUTES: Route[] = [
  {
    pattern: /^\/api\/providers\/([^/]+)\/records$/,
    keys: ["code"],
    load: () => import("@/server/api/provider-records"),
  },
  {
    pattern: /^\/api\/providers\/([^/]+)$/,
    keys: ["code"],
    load: () => import("@/server/api/provider-detail"),
  },
  {
    pattern: /^\/api\/submissions\/([^/]+)$/,
    keys: ["batchId"],
    load: () => import("@/server/api/submission-detail"),
  },
  {
    pattern: /^\/api\/providers$/,
    keys: [],
    load: () => import("@/server/api/providers"),
  },
  {
    pattern: /^\/api\/submissions$/,
    keys: [],
    load: () => import("@/server/api/submissions"),
  },
  {
    pattern: /^\/api\/records$/,
    keys: [],
    load: () => import("@/server/api/records"),
  },
  {
    pattern: /^\/api\/dashboard$/,
    keys: [],
    load: () => import("@/server/api/dashboard"),
  },
  {
    pattern: /^\/api\/issues$/,
    keys: [],
    load: () => import("@/server/api/issues"),
  },
  {
    pattern: /^\/api\/reports$/,
    keys: [],
    load: () => import("@/server/api/reports"),
  },
];

export async function handleStatic(url: URL): Promise<Response> {
  for (const route of ROUTES) {
    const match = route.pattern.exec(url.pathname);
    if (!match) continue;

    const params: Record<string, string> = {};
    route.keys.forEach((key, i) => {
      params[key] = decodeURIComponent(match[i + 1]);
    });

    const { handle } = await route.load();
    return handle(new Request(url.toString()), {
      params: Promise.resolve(params),
    });
  }

  return new Response(
    JSON.stringify({ error: "NOT_FOUND", message: "ไม่พบเส้นทางนี้" }),
    { status: 404, headers: { "content-type": "application/json" } },
  );
}
