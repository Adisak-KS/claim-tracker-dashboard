# ระบบติดตามการส่งเคลม

เว็บสำหรับผู้บริหาร ผู้จัดการ PM ทีมฝึกอบรม และผู้ดูแลระบบ
ใช้ติดตามว่าโรงพยาบาลในเครือข่ายส่งเคลมไปแล้วเท่าไร สำเร็จเท่าไร
และที่ส่งไม่สำเร็จติดปัญหาอะไรบ้าง

> **สถานะ: Phase 1 (หน้าจอกับข้อมูลจำลอง)**
> ยังไม่มี backend ยังไม่ต่อฐานข้อมูล ตัวเลขทุกตัวเป็นข้อมูลจำลอง

## เริ่มใช้งาน

```bash
cd frontend
npm install
npm run dev
```

เปิด http://localhost:3000

## โครงสร้าง

```
Dashboard/
├── frontend/     Next.js 16 (App Router)
├── backend/      API server (Phase 2)
├── docker/       Dockerfile และ compose (Phase 2)
├── docs/         เอกสารทั้งหมด แยกตามหมวด
├── CLAUDE.md     กติกาสำหรับคนและ AI ที่มาแก้โค้ด
└── README.md     ไฟล์นี้
```

## เอกสาร

รายละเอียดทั้งหมดอยู่ใน [docs/](docs/README.md)

| อยากรู้เรื่อง | อ่านที่ |
|---|---|
| ระบบส่งเคลมทำงานยังไง (สำหรับคนใหม่) | [claim-flow](docs/domain/claim-flow.md) |
| รหัสสถานะของ สปสช. 66 ตัว | [nhso-status-codes](docs/domain/nhso-status-codes.md) |
| รหัสข้อผิดพลาดของ สปสช. 654 ตัว | [nhso-error-codes](docs/domain/nhso-error-codes.md) |
| สี ฟอนต์ กติกาหน้าตา | [design-system](docs/design/design-system.md) |
| หน้าจอมีอะไรบ้าง | [pages](docs/design/pages.md) |
| ตัดสินใจอะไรไปบ้างเพราะอะไร | [decisions](docs/design/decisions.md) |
| ระบบต้นทางยิงข้อมูลเข้ามายังไง | [ingest-contract](docs/api/ingest-contract.md) |
| API จำลองที่ใช้ตอนนี้ | [mock-api](docs/api/mock-api.md) |

## เทคโนโลยี

ตรวจสอบเวอร์ชันล่าสุดเมื่อ 2026-09-12

| ส่วน | ตัวที่ใช้ | เวอร์ชัน |
|---|---|---|
| Framework | Next.js (App Router) | 16.3.4 |
| UI | React | 19.2.8 |
| CSS | Tailwind CSS | 4.3.3 |
| ดึงข้อมูล | TanStack Query | 5.102.8 |
| ไอคอน | lucide-react | 1.45.0 |
| กราฟ | Recharts | 3.10.1 |
| ฟอนต์ | IBM Plex Sans Thai | Google Fonts |

ที่วางแผนไว้สำหรับ Phase 2: NestJS · PostgreSQL + TimescaleDB · Redis + BullMQ
(เหตุผลอยู่ใน [decisions](docs/design/decisions.md))

## ความคืบหน้า

| ข้อกำหนด | สถานะ |
|---|---|
| เข้าสู่ระบบด้วย BMS Life | ยังไม่ทำ (mock ผู้ใช้ไว้) |
| API รับข้อมูลจากระบบต่าง ๆ | ออกแบบไว้แล้ว ยังไม่ลงมือ |
| รองรับ HOSxP · EHP · NHIP และอื่น ๆ | โครงสร้างรองรับแล้ว |
| แสดงว่า รพ. ไหนสำเร็จ ไม่สำเร็จ ติดปัญหาอะไร | หน้าภาพรวมเสร็จแล้ว |
| รองรับ 5,000+ รพ. ยิงพร้อมกัน | ออกแบบไว้แล้ว ยังไม่ลงมือ |
| ไม่เก็บข้อมูลส่วนตัวผู้ป่วย | บังคับใช้แล้ว (ดู CLAUDE.md) |

## ก่อนส่งงาน

```bash
cd frontend
npx tsc --noEmit    # ต้องไม่มี error
npm run lint        # ต้องไม่มี error
npm run build       # ต้องผ่าน
```

"build ผ่าน" ยังไม่ใช่ "ใช้งานได้" ต้องเปิดดูหน้าจอจริงด้วย
รายละเอียดใน [CLAUDE.md](CLAUDE.md) ข้อ 6
