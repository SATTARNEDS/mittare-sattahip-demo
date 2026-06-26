# Mittare Sattahip

เว็บไซต์บริการประกันภัยพร้อมระบบหลังบ้านตัวแทนสำหรับติดตามกรมธรรม์ งานต่ออายุ ไฟล์เอกสาร และหน้าลูกค้าทดลองเช็กสถานะด้วยตนเอง

## โครงระบบ

- `index.html` หน้าเว็บไซต์หลัก
- `insurance.html` ศูนย์ข้อมูลแผนประกัน
- `agent-dashboard.html` หลังบ้านตัวแทน
- `customer-status.html` หน้าลูกค้าตรวจสอบสถานะ
- `line-login.html` หน้าลูกค้า Login ด้วย LINE และดึง profile จาก LINE
- `app.py` Flask backend + SQLite API
- `instance/mittare.sqlite3` ฐานข้อมูลจริง สร้างอัตโนมัติเมื่อรันระบบ
- `instance/uploads/` ที่เก็บไฟล์แนบจริง สร้างอัตโนมัติเมื่ออัปโหลดไฟล์
- `instance/product-media/` ที่เก็บรูปประกอบหน้าเว็บ รูปเอกสาร และ PDF สินค้า
- `render.yaml` ไฟล์ตั้งค่า Deploy บน Render พร้อม persistent disk

## เปิดใช้งานแบบระบบจริง

ติดตั้ง dependency:

```powershell
python -m pip install -r requirements.txt
```

ตั้งค่ารหัสผ่านหลังบ้านก่อนใช้งานจริง:

```powershell
$env:ADMIN_PASSWORD="เปลี่ยนเป็นรหัสผ่านที่ปลอดภัย"
$env:SECRET_KEY="เปลี่ยนเป็นค่าสุ่มยาวสำหรับ session"
$env:LINE_CHANNEL_ACCESS_TOKEN="Channel access token จาก LINE Messaging API ถ้าต้องการใช้ Push"
$env:LINE_CHANNEL_SECRET="Channel secret จาก Basic settings ถ้าต้องการรับ Webhook"
$env:LINE_LOGIN_CHANNEL_ID="Channel ID จาก LINE Login"
$env:LINE_LOGIN_CHANNEL_SECRET="Channel secret จาก LINE Login"
$env:LINE_LOGIN_CALLBACK_URL="http://127.0.0.1:5000/auth/line/callback"
python app.py
```

จากนั้นเปิด:

- เว็บไซต์หลัก: `http://127.0.0.1:5000/`
- หลังบ้านตัวแทน: `http://127.0.0.1:5000/agent-dashboard.html`
- หน้าลูกค้าทดสอบ: `http://127.0.0.1:5000/customer-status.html`
- หน้า Login ด้วย LINE: `http://127.0.0.1:5000/line-login.html`

บน Windows สามารถดับเบิลคลิก `run_server.bat` เพื่อรันและดู URL ที่ต้องเปิดได้ทันที

หาก IDE หรือ Browser Preview ขึ้น `Invalid url.` ให้เปิด URL แบบเต็มที่มี `http://` นำหน้า เช่น `http://127.0.0.1:5000/` ไม่ใช่ `127.0.0.1:5000`

ถ้าไม่ได้ตั้ง `ADMIN_PASSWORD` ระบบจะใช้ค่าเริ่มต้น `admin123` เฉพาะสำหรับทดสอบเท่านั้น

## สิ่งที่หลังบ้านทำได้

- เพิ่ม/แก้ไข/ลบข้อมูลลูกค้าและกรมธรรม์ลง SQLite
- อัปโหลดรูปภาพและไฟล์เอกสารลง `instance/uploads/`
- เพิ่ม/ลบรูปประกอบหน้าเว็บ รูปเอกสาร และ PDF สินค้า โดย metadata บันทึกลง SQLite และไฟล์เก็บใน `instance/product-media/`
- รูปประกอบและเอกสารสินค้าเดิมใน `assets/` / `document/` จะถูก seed เป็น metadata ใน SQLite เพื่อให้เห็นและจัดการจากหลังบ้าน
- เลือกแผน/ผลิตภัณฑ์จาก dropdown ตามประเภทประกัน ลดการพิมพ์ผิดและเพิ่มข้อมูลได้เร็วขึ้น
- แบ่งสถานะงานขาย เช่น ลูกค้าใหม่ ส่งใบเสนอราคา รอเอกสาร นัดชำระ ต่ออายุแล้ว
- ดูแจ้งเตือนภายในสำหรับกรมธรรม์หมดอายุ ครบกำหนดใน 7/30 วัน และนัดติดตาม
- สร้างข้อความติดตามต่ออายุ ขอเอกสาร นัดชำระ หรือติดตามเคลม แล้วคัดลอกหรือเปิด LINE Share เพื่อกดส่งเอง
- ส่ง LINE Push รายคนจากแดชบอร์ดได้เมื่อมี `LINE_CHANNEL_ACCESS_TOKEN` และบันทึก `LINE User ID` ของลูกค้า
- Export JSON จากฐานข้อมูลเพื่อสำรองข้อมูล
- เพิ่มข้อมูลตัวอย่างสำหรับทดสอบหน้าลูกค้า

## ตั้งค่า LINE Push

LINE Push ใช้ LINE Messaging API และต้องมี `LINE User ID` ของลูกค้าที่เพิ่มเพื่อนกับ LINE OA แล้ว ไม่สามารถส่งด้วย LINE ID, ชื่อบัญชี หรือ `@` username ได้โดยตรง

1. สร้างหรือเปิด LINE Official Account
2. เปิด Messaging API ใน LINE Developers
3. สร้าง Long-lived Channel access token
4. ตั้งค่า env:

```powershell
$env:LINE_CHANNEL_ACCESS_TOKEN="ใส่ Channel access token"
```

5. ในหลังบ้าน กรอก `LINE User ID สำหรับ Push` ให้กรมธรรม์แต่ละราย
6. เลือกกรมธรรม์ในแดชบอร์ด แล้วกด `ส่ง LINE Push` เพื่อส่งทีละคน

ถ้ายังไม่มี User ID ให้ใช้ปุ่ม `คัดลอกข้อความ` หรือ `เปิด LINE` เพื่อส่งเองก่อนได้

## ตั้งค่า LINE Webhook เพื่อรับ User ID

ระบบมี endpoint รับ Webhook ที่:

```text
https://ชื่อโดเมนของคุณ/api/line/webhook
```

วิธีตั้งค่า:

1. ไปที่ LINE Developers > Messaging API channel
2. คัดลอก `Channel secret` จากแท็บ Basic settings
3. ตั้งค่า env:

```powershell
$env:LINE_CHANNEL_SECRET="ใส่ Channel secret"
```

4. ในแท็บ Messaging API ใส่ Webhook URL เป็น `/api/line/webhook`
5. เปิด Use webhook
6. กด Verify
7. ให้ลูกค้าทัก LINE OA อย่างน้อย 1 ข้อความ
8. กลับมาที่หลังบ้าน รายชื่อ LINE ที่ทักเข้ามาจะขึ้นในกล่อง `LINE ที่ทักเข้ามาล่าสุด`

กด `ใช้กับฟอร์ม` เพื่อใส่ `LINE User ID` ลงฟอร์มกรมธรรม์ แล้วบันทึกก่อนทดสอบ Push

## ตั้งค่า LINE Login เพื่อให้ลูกค้า Login และดึง Profile

LINE Login เป็นคนละ Channel กับ Messaging API ได้ และใช้ค่า env คนละชุดกับ `LINE_CHANNEL_ACCESS_TOKEN`

Callback URL ที่ต้องใส่ใน LINE Developers:

```text
https://ชื่อโดเมนของคุณ/auth/line/callback
```

วิธีตั้งค่า:

1. ไปที่ LINE Developers แล้วสร้างหรือเปิด `LINE Login channel`
2. ตั้ง App type เป็น Web app
3. ในแท็บ LINE Login ใส่ Callback URL เป็น `/auth/line/callback` ของโดเมนจริง
4. คัดลอก Channel ID และ Channel secret มาตั้งค่า env:

```powershell
$env:LINE_LOGIN_CHANNEL_ID="ใส่ Channel ID"
$env:LINE_LOGIN_CHANNEL_SECRET="ใส่ Channel secret"
$env:LINE_LOGIN_CALLBACK_URL="https://ชื่อโดเมนของคุณ/auth/line/callback"
```

5. เปิด `line-login.html`
6. ลูกค้ากด `Login ด้วย LINE`
7. เมื่ออนุญาตแล้ว ระบบจะบันทึก `userId`, `displayName`, `pictureUrl` ลง SQLite และแสดงกรมธรรม์ที่มี `LINE User ID` ตรงกัน

ระบบไม่เก็บ LINE access token ถาวร ใช้เพื่อขอ profile แล้วทิ้งทันที

## วิธีทดสอบหน้าลูกค้า

1. เข้า `agent-dashboard.html`
2. Login ด้วยรหัสผ่านหลังบ้าน
3. กด `เพิ่มข้อมูลตัวอย่าง`
4. เข้า `customer-status.html`
5. กรอก:

```text
เบอร์โทร: 081-111-2222
เลขอ้างอิง: MT4-DEMO-001
```

หน้าลูกค้าจะแสดงเฉพาะข้อมูลจำกัด เช่น สถานะ วันหมดอายุ เบี้ย และผู้ดูแล โดยไม่เปิดไฟล์แนบหรือบันทึกภายในทั้งหมด

## เปิดเว็บให้ลูกค้าทดสอบผ่าน Render

GitHub Pages ใช้ได้เฉพาะเว็บ static จึงไม่เหมาะกับระบบนี้เพราะหลังบ้านต้องเขียน SQLite และรับอัปโหลดไฟล์ ให้ใช้ Render/Railway/Fly.io หรือ VPS ที่รัน Flask ได้ ตัวเลือกที่เตรียมไว้ใน repo นี้คือ Render

1. Push repo นี้ขึ้น GitHub
2. เข้า Render Dashboard แล้วเลือก New > Blueprint หรือ New > Web Service
3. เลือก repo `SATTARNEDS/mittare-sattahip-demo`
4. ใช้ค่าจาก `render.yaml` หรือกรอกเอง:

```text
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
APP_INSTANCE_DIR: /var/data
LINE_CHANNEL_ACCESS_TOKEN: ใส่เมื่อพร้อมใช้ LINE Push จริง
LINE_CHANNEL_SECRET: ใส่เมื่อพร้อมรับ LINE Webhook จริง
LINE_LOGIN_CHANNEL_ID: ใส่ Channel ID จาก LINE Login
LINE_LOGIN_CHANNEL_SECRET: ใส่ Channel secret จาก LINE Login
LINE_LOGIN_CALLBACK_URL: https://ชื่อเว็บ.onrender.com/auth/line/callback
```

5. ตั้ง `ADMIN_PASSWORD` เป็นรหัสผ่านหลังบ้าน และให้ Render สร้าง `SECRET_KEY`
6. เปิด persistent disk ที่ mount path `/var/data` ขนาดเริ่มต้น 1 GB
7. หลัง deploy เสร็จ Render จะให้ URL รูปแบบ `https://ชื่อเว็บ.onrender.com`
8. ถ้าต้องการโดเมน `.org` ให้ซื้อโดเมนจากผู้ให้บริการโดเมน แล้วเพิ่ม Custom Domain ใน Render และตั้งค่า DNS ตามที่ Render แจ้ง

สำหรับทดสอบลูกค้าทันที ส่งลิงก์หน้าเว็บหลักหรือ `customer-status.html` จาก URL ของ Render ได้เลย ส่วนหลังบ้านคือ `https://ชื่อเว็บ.onrender.com/agent-dashboard.html`

## หมายเหตุสำหรับ Production

- เปลี่ยน `ADMIN_PASSWORD` และ `SECRET_KEY` ทุกครั้งก่อนเผยแพร่จริง
- รันผ่าน HTTPS เพื่อปกป้อง session และข้อมูลลูกค้า
- สำรองทั้ง `instance/mittare.sqlite3`, `instance/uploads/` และ `instance/product-media/`
- ตั้งสิทธิ์โฟลเดอร์ `instance/` ไม่ให้เปิดดาวน์โหลดตรงจากเว็บเซิร์ฟเวอร์
- SQLite เหมาะกับทีมเล็กหรือใช้งานเครื่องเดียว/เซิร์ฟเวอร์เดียว หากมีหลายสาขาหรือผู้ใช้พร้อมกันจำนวนมากควรย้ายไป PostgreSQL
- ไฟล์แนบจำกัดที่ 8 MB ต่อ request และรองรับ `jpg`, `jpeg`, `png`, `webp`, `pdf`, `doc`, `docx`, `xls`, `xlsx`

## หมายเหตุข้อมูลประกัน

- เมนูเช็กเบี้ย DIY เป็นสูตรประมาณการสำหรับสาธิต UX ไม่ใช่อัตราเบี้ยหรือใบเสนอราคาของบริษัท
- ข้อมูลผลิตภัณฑ์และช่องทางบริการอ้างอิงเว็บไซต์ `mittare.com` ณ วันที่ 19 มิถุนายน 2569
- ก่อนเผยแพร่จริงควรตรวจสอบสิทธิ์การใช้ตราสัญลักษณ์ ชื่อทางการ ที่อยู่สำนักงานตัวแทน และข้อมูลติดต่อเฉพาะทีม

## Performance

ภาพบุคคลและภาพประกอบประกันมีขนาดค่อนข้างใหญ่เพื่อคงรายละเอียดบนจอใหญ่ หากนำขึ้น Production ควรแปลงเป็น AVIF/WebP หลายขนาดและใช้ `<picture>` เพื่อลดเวลาโหลดบนมือถือ
