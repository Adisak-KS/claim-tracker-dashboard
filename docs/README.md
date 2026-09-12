# เอกสารประกอบระบบติดตามการส่งเคลม

รวมเอกสารทั้งหมดของโปรเจกต์ แยกตามหมวด

## สารบัญ

### domain (ความรู้เรื่องงานส่งเคลม)

| ไฟล์ | เนื้อหา |
|---|---|
| [nhso-status-codes.md](domain/nhso-status-codes.md) | สถานะรายการ 66 ตัวจาก สปสช. พร้อมความหมายและขั้นตอนที่อยู่ |
| [nhso-error-codes.md](domain/nhso-error-codes.md) | รหัสข้อผิดพลาด 654 ตัว จัดกลุ่มพร้อมวิธีแก้ |
| [claim-flow.md](domain/claim-flow.md) | ขั้นตอนการส่งเคลมตั้งแต่ต้นจนได้รับเงิน |

### design (การออกแบบระบบ)

| ไฟล์ | เนื้อหา |
|---|---|
| [design-system.md](design/design-system.md) | สี ฟอนต์ ระยะห่าง และกติกาหน้าตาของระบบ |
| [pages.md](design/pages.md) | หน้าจอทั้งหมดและสิ่งที่แต่ละหน้าต้องแสดง |
| [decisions.md](design/decisions.md) | บันทึกการตัดสินใจว่าเลือกอะไรเพราะอะไร |

### api (การเชื่อมต่อ)

| ไฟล์ | เนื้อหา |
|---|---|
| [ingest-contract.md](api/ingest-contract.md) | รูปแบบข้อมูลที่ระบบต้นทางจะยิงเข้ามา |
| [mock-api.md](api/mock-api.md) | API จำลองที่ใช้ระหว่างยังไม่มี backend |

## เอกสารต้นทางที่อ้างอิง

เอกสารพวกนี้ไม่ได้อยู่ใน repo แต่เป็นต้นทางของข้อมูลในโฟลเดอร์นี้

| เอกสาร | ที่อยู่ |
|---|---|
| API Specification 13Plus (NHSO Digital Platform) v1.3.5.1 | `C:/Users/adisa/Downloads/` |
| คู่มือระบบ HOSxP NHSO Eclaim Fee Schedule | `d:/Work/HOSxP/EclaimFeeSchedule/DATA-DICTIONARY.md` |
| โค้ดส่งเคลมฝั่ง HOSxP | `d:/Work/HOSxP/EclaimFeeSchedule/source/` |
| โค้ดส่งเคลมฝั่ง EHP และ NHIP | `d:/Work/New folder/ehppcu/EHPPCU/EclaimFeeSchedule/` |

## กติกาการเขียนเอกสารในโฟลเดอร์นี้

- ตั้งชื่อไฟล์เป็น kebab-case ภาษาอังกฤษ เนื้อหาข้างในเป็นภาษาไทย
- เอกสารที่ลอกตัวเลขหรือรหัสมาจากต้นทาง **ต้องระบุว่าเอามาจากไหนและเวอร์ชันอะไร**
  เพราะ สปสช. แก้เอกสารบ่อย ถ้าไม่ระบุจะไม่รู้ว่าข้อมูลเก่าไปแล้วหรือยัง
- เพิ่มไฟล์ใหม่แล้วต้องมาเติมในสารบัญข้างบนด้วย
