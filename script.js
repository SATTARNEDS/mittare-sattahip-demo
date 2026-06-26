const menuButton = document.querySelector(".menu-toggle");
const mainNavigation = document.querySelector(".main-nav");
const quoteForm = document.querySelector("#quote-form");
const successMessage = document.querySelector(".form-success");
const profileDialog = document.querySelector("#profile-dialog");
const productDialog = document.querySelector("#product-dialog");
const pdfDialog = document.querySelector("#pdf-dialog");
const premiumDialog = document.querySelector("#premium-dialog");
const premiumCalculator = document.querySelector("#premium-calculator");

const profileData = {
  thepa: {
    name: "เทพา สารกาล",
    role: "ผู้จัดการฝ่ายขายและขยายงาน",
    image: "assets/thepa.png",
    summary: "เลขที่ใบอนุญาตผู้แนะนำการประกันวินาศภัย 6602003031 ",
    highlights: ["วางแผนความคุ้มครอง", "พัฒนาทีมงาน", "ประสานงานลูกค้า"],
    phone: "0924575836",
    lineUrl: "https://line.me/ti/p/~tepa33",
    facebookUrl: "https://www.facebook.com/thepha.sar.kal.mitrth.prakan.phay"
  },
  phannee: {
    name: "พรรณี สารกาล",
    role: "ผู้จัดการฝ่ายขายและขยายงาน",
    image: "assets/pannee.png",
    summary: "เลขที่ใบอนุญาตผู้แนะนำการประกันวินาศภัย 6602003361 ",
    highlights: ["ดูแลลูกค้า", "ประสานงานบริการ", "ให้คำปรึกษาเบื้องต้น"],
    phone: "0811759296",
    lineUrl: "https://line.me/ti/p/~Pannee556",
    facebookUrl: "https://www.facebook.com/phrrni.sar.kal.mitrth.prakan.phay"
  }
};

const motorExclusions = [
  "การใช้รถนอกประเภทที่แจ้ง หรือผู้ขับขี่ไม่มีใบอนุญาตตามเงื่อนไข",
  "การแข่งรถ เมาสุรา ยาเสพติด หรือการกระทำโดยเจตนา",
  "ความเสียหายส่วนแรกและข้อยกเว้นอื่นตามตารางกรมธรรม์"
];
const propertyExclusions = [
  "การเสื่อมสภาพ การสึกหรอ หรือความบกพร่องเดิมของทรัพย์สิน",
  "ภัยสงคราม การก่อการร้าย และภัยที่ไม่ได้ระบุซื้อความคุ้มครอง",
  "ทรัพย์สินบางชนิดต้องแจ้งรายการหรือกำหนดวงเงินเฉพาะ"
];
const personalExclusions = [
  "การเจ็บป่วยหรือภาวะที่ไม่ใช่อุบัติเหตุ เว้นแต่แผนระบุไว้",
  "การกระทำโดยเจตนา เมาสุรา ยาเสพติด หรือกิจกรรมเสี่ยงที่ยกเว้น",
  "โรคหรือภาวะที่เป็นมาก่อนตามนิยามและเงื่อนไขของกรมธรรม์"
];

const insurancePlans = [
  createPlan("motor-1", "motor", "รถ", "รถยนต์ประเภท 1", "คุ้มครองกว้างที่สุดสำหรับรถของเราและคู่กรณี", ["รถใหม่หรือรถมูลค่าสูง", "ผู้ใช้รถเป็นประจำ"], ["รถเสียหายจากการชนและอุบัติเหตุตามเงื่อนไข", "รถสูญหาย ไฟไหม้ และน้ำท่วมตามกรมธรรม์", "ความรับผิดต่อชีวิต ร่างกาย และทรัพย์สินคู่กรณี"], ["รุ่นรถ อายุรถ ทุนประกัน", "ประวัติเคลมและลักษณะการใช้", "ซ่อมห้างหรือซ่อมอู่"], motorExclusions, ["สำเนาทะเบียนรถ", "ข้อมูลผู้ขับขี่", "กรมธรรม์เดิมถ้ามี"]),
  createPlan("motor-2", "motor", "รถ", "รถยนต์ประเภท 2", "คุ้มครองคู่กรณี พร้อมรถสูญหายหรือไฟไหม้", ["รถที่ต้องการคุ้มครองสูญหายและไฟไหม้", "ผู้ไม่ต้องการคุ้มครองความเสียหายรถตนจากการชน"], ["ความรับผิดต่อคู่กรณี", "รถประกันสูญหายหรือไฟไหม้", "อุบัติเหตุส่วนบุคคลและค่ารักษาตามตาราง"], ["ชนิดรถ อายุรถ และทุนสูญหาย/ไฟไหม้", "พื้นที่ใช้งานและประวัติเคลม"], motorExclusions, ["ทะเบียนรถ", "ข้อมูลการใช้งาน", "รายละเอียดกรมธรรม์เดิม"]),
  createPlan("motor-3", "motor", "รถ", "รถยนต์ประเภท 3", "เน้นความรับผิดต่อคู่กรณีในงบประหยัด", ["รถอายุหลายปี", "ผู้รับความเสี่ยงค่าซ่อมรถตนเองได้"], ["ชีวิต ร่างกาย และทรัพย์สินคู่กรณี", "อุบัติเหตุส่วนบุคคลและค่ารักษาตามวงเงิน", "ประกันตัวผู้ขับขี่ตามเงื่อนไข"], ["ประเภทรถและการใช้งาน", "วงเงินความรับผิดที่เลือก"], motorExclusions, ["ทะเบียนรถ", "ข้อมูลผู้เอาประกัน"]),
  createPlan("motor-2plus", "motor", "2+", "รถยนต์ประเภท 2+", "คุ้มครองรถเราเมื่อชนกับยานพาหนะที่ระบุคู่กรณีได้ พร้อมสูญหายและไฟไหม้", ["ผู้ต้องการความคุ้มครองใกล้ประเภท 1 ในงบต่ำลง", "รถที่ยังมีมูลค่าแต่ไม่จำเป็นต้องซ่อมทุกกรณี"], ["รถประกันชนยานพาหนะทางบกเมื่อระบุคู่กรณีได้", "สูญหายและไฟไหม้ตามทุน", "ความรับผิดต่อคู่กรณี"], ["รุ่นและอายุรถ", "ทุนประกัน", "ประวัติเคลมและค่าเสียหายส่วนแรก"], motorExclusions, ["ทะเบียนรถ", "ภาพถ่ายรถตามที่ร้องขอ", "กรมธรรม์เดิม"]),
  createPlan("motor-3plus", "motor", "3+", "รถยนต์ประเภท 3+", "คุ้มครองรถเราเมื่อชนกับยานพาหนะที่ระบุคู่กรณีได้ โดยไม่รวมสูญหายและไฟไหม้", ["รถใช้งานทั่วไปที่ต้องการควบคุมงบ", "ผู้ต้องการเพิ่มความคุ้มครองรถตนจากประเภท 3"], ["รถประกันชนยานพาหนะทางบกและระบุคู่กรณีได้", "ความรับผิดต่อคู่กรณี", "ความคุ้มครองผู้ขับขี่และผู้โดยสารตามตาราง"], ["รุ่นรถ อายุรถ และทุนชน", "ค่าเสียหายส่วนแรกและประวัติเคลม"], motorExclusions, ["ทะเบียนรถ", "ภาพถ่ายรถถ้ากำหนด"]),
  createPlan("motor-compulsory", "motor", "พ.ร.บ.", "ประกันภัยรถยนต์ภาคบังคับ", "ความคุ้มครองผู้ประสบภัยจากรถตามกฎหมาย", ["รถทุกคันที่จดทะเบียนและใช้งานบนถนน", "เจ้าของรถที่ต้องต่อภาษีประจำปี"], ["ค่าเสียหายเบื้องต้น", "ค่ารักษาพยาบาลและผลประโยชน์กรณีเสียชีวิต/ทุพพลภาพตามกฎหมาย", "คุ้มครองบุคคล ไม่ใช่ค่าซ่อมรถ"], ["ประเภทรถและขนาดเครื่องยนต์/จำนวนที่นั่ง", "ลักษณะการใช้รถตามทะเบียน"], ["ไม่คุ้มครองความเสียหายต่อตัวรถ", "วงเงินเป็นไปตามกฎหมายและสถานะผู้ขับขี่"], ["สำเนาทะเบียนรถ", "วันเริ่มคุ้มครอง"]),
  createPlan("motor-one", "motor", "ป.1", "มิตรแท้หนึ่งเดียว", "กลุ่มแผนประเภท 1 สำหรับรถเก๋งตามขนาดและเงื่อนไขรับประกัน", ["รถเก๋งกลางและรถเก๋งใหญ่", "ผู้ต้องการแผนสำเร็จรูปประเภท 1"], ["ความคุ้มครองรถประกันและคู่กรณีตามแผน", "สูญหาย ไฟไหม้ และภัยธรรมชาติตามตาราง", "บริการช่วยเหลือและเงื่อนไขซ่อมตามแผน"], ["รุ่นรถ กลุ่มรถ และอายุรถ", "ทุนประกันและประเภทการซ่อม", "ประวัติการเคลม"], motorExclusions, ["ทะเบียนรถ", "ภาพรถ", "ประวัติกรมธรรม์"]),
  createPlan("motor-extra", "motor", "Extra", "ป.1 Extra", "แผนประเภท 1 สำหรับเก๋งเล็ก SUV กระบะบรรทุก และกระบะสี่ประตู", ["เจ้าของรถในกลุ่มรุ่นที่แผนรองรับ", "ผู้ต้องการเลือกแผนตามประเภทรถ"], ["ความเสียหายรถประกันตามเงื่อนไขประเภท 1", "ความรับผิดต่อคู่กรณี", "สูญหาย ไฟไหม้ และความคุ้มครองแนบท้าย"], ["กลุ่มรถและรุ่นที่รับประกัน", "อายุรถ ทุน และประเภทซ่อม"], motorExclusions, ["ทะเบียนรถ", "รูปถ่ายรถ", "ข้อมูลอุปกรณ์ตกแต่ง"]),
  createPlan("motor-eco", "motor", "ECO", "แผนรถเก๋ง Eco Car", "แผนสำหรับรถ Eco Car และรถเก๋งขนาดเล็กที่เข้าเกณฑ์", ["เจ้าของ Eco Car", "ผู้ใช้รถในเมืองและต้องการแผนตามกลุ่มรถ"], ["ความคุ้มครองตามประเภทที่เลือก", "ความรับผิดต่อบุคคลภายนอก", "ความคุ้มครองรถประกันตามทุนและเงื่อนไข"], ["รุ่นรถ ปีรถ และทุนประกัน", "ประเภทความคุ้มครองที่เลือก"], motorExclusions, ["ทะเบียนรถ", "ข้อมูลรุ่นย่อย"]),
  createPlan("motor-permpoon", "motor", "2+", "มิตรแท้เพิ่มพูน 2+", "แผน 2+ ราคาประหยัด เน้นชนกับยานพาหนะ สูญหาย และไฟไหม้", ["รถใช้งานทั่วไป", "ผู้ต้องการบริหารเบี้ยแต่ยังดูแลรถตนเอง"], ["ชนกับยานพาหนะที่ระบุคู่กรณีได้", "สูญหายและไฟไหม้", "ความรับผิดต่อคู่กรณี"], ["กลุ่มรถ อายุรถ ทุนประกัน", "เงื่อนไขค่าเสียหายส่วนแรก"], motorExclusions, ["ทะเบียนรถ", "ภาพรถตามเกณฑ์"]),
  createPlan("motor-taweekoon", "motor", "รถ", "มิตรแท้ทวีคูณ", "ผลิตภัณฑ์รถยนต์สำเร็จรูปตามเงื่อนไขและกลุ่มรถที่บริษัทกำหนด", ["ผู้ต้องการแผนรถยนต์แบบกำหนดชุดความคุ้มครอง", "รถที่อยู่ในเกณฑ์รับประกันของแผน"], ["ความคุ้มครองรถและคู่กรณีตามประเภทของแผน", "วงเงินผู้ขับขี่และผู้โดยสารตามตาราง"], ["รุ่นรถ อายุรถ และแผนย่อย", "ทุนประกันและประวัติเคลม"], motorExclusions, ["ทะเบียนรถ", "รายละเอียดแผนที่ต้องการ"]),
  createPlan("motor-permpoon3", "motor", "3+", "มิตรแท้เพิ่มพูน 3+", "แผน 3+ สำหรับผู้ต้องการคุ้มครองการชนกับยานพาหนะในงบประหยัด", ["รถอายุหลายปี", "ผู้ไม่ต้องการความคุ้มครองสูญหายและไฟไหม้"], ["ชนกับยานพาหนะที่ระบุคู่กรณีได้", "ความรับผิดต่อคู่กรณี", "ผู้ขับขี่และผู้โดยสารตามตาราง"], ["รุ่นรถ อายุรถ และทุนชน", "ค่าเสียหายส่วนแรก"], motorExclusions, ["ทะเบียนรถ", "ภาพรถถ้ากำหนด"]),

  createPlan("residential-fire", "property", "บ้าน", "อัคคีภัยที่อยู่อาศัย", "ดูแลตัวบ้านและทรัพย์สินจากไฟไหม้และภัยที่เลือกเพิ่มเติม", ["เจ้าของบ้าน ทาวน์โฮม และคอนโด", "ผู้กู้ที่ต้องทำประกันอัคคีภัย"], ["ไฟไหม้ ฟ้าผ่า และระเบิดจากแก๊สเพื่ออยู่อาศัย", "ภัยเพิ่มเติม เช่น ลมพายุ น้ำท่วม หรือแผ่นดินไหวเมื่อระบุ", "ตัวอาคารและทรัพย์สินตามทุนประกัน"], ["มูลค่าสิ่งปลูกสร้างไม่รวมที่ดิน", "ประเภทวัสดุและอายุอาคาร", "สถานที่ตั้งและภัยเพิ่มเติม"], propertyExclusions, ["รูปและที่อยู่ทรัพย์สิน", "รายละเอียดอาคาร", "ทุนประกัน"]),
  createPlan("home", "property", "บ้าน", "ประกันภัยบ้านมิตรแท้", "แพ็กเกจบ้านที่รวมภัยต่ออาคารและทรัพย์สินตามแผน", ["เจ้าของและผู้อยู่อาศัย", "ผู้ต้องการแพ็กเกจเข้าใจง่าย"], ["อัคคีภัยและภัยเพิ่มเติมตามแผน", "ทรัพย์สินภายในตามวงเงิน", "ความรับผิดหรือค่าใช้จ่ายเพิ่มเติมเมื่อระบุ"], ["ประเภทบ้าน พื้นที่ใช้สอย และมูลค่า", "วงเงินทรัพย์สินภายใน", "ประวัติความเสียหาย"], propertyExclusions, ["ที่อยู่และภาพบ้าน", "รายการทรัพย์สินสำคัญ"]),
  createPlan("property-risk", "property", "ทรัพย์", "ประกันภัยความเสี่ยงภัยทรัพย์สิน", "ความคุ้มครองทรัพย์สินแบบครอบคลุมความเสี่ยงตามข้อยกเว้น", ["อาคารพาณิชย์ โรงงาน หรือทรัพย์สินมูลค่าสูง", "ผู้ต้องการความคุ้มครองกว้างกว่าอัคคีภัย"], ["ความเสียหายทางกายภาพจากเหตุฉับพลันที่ไม่ถูกยกเว้น", "อาคาร เครื่องจักร สต็อก และทรัพย์สินที่ระบุ", "ภัยธรรมชาติเมื่อกำหนดในกรมธรรม์"], ["ประเภทกิจการและการใช้อาคาร", "มูลค่าทดแทนทรัพย์สิน", "ระบบป้องกันภัยและประวัติความเสียหาย"], propertyExclusions, ["รายการทรัพย์สิน", "แผนผัง/ภาพสถานที่", "มาตรการป้องกันภัย"]),
  createPlan("construction", "property", "CAR", "ประกันภัยงานก่อสร้าง", "ดูแลงานระหว่างก่อสร้าง วัสดุ เครื่องมือ และความรับผิดต่อบุคคลภายนอก", ["ผู้รับเหมา เจ้าของโครงการ และผู้ว่าจ้าง", "งานก่อสร้างหรือติดตั้งที่มีระยะเวลาแน่นอน"], ["ความเสียหายต่องานก่อสร้างจากอุบัติเหตุ", "วัสดุและเครื่องจักรที่ระบุ", "ความรับผิดต่อบุคคลภายนอกเมื่อซื้อความคุ้มครอง"], ["มูลค่าและระยะเวลาโครงการ", "ลักษณะงาน สถานที่ และวิธีการก่อสร้าง", "ประสบการณ์ผู้รับเหมา"], propertyExclusions, ["สัญญาก่อสร้าง", "BOQ และแผนงาน", "แบบโครงการ/รูปสถานที่"]),

  createPlan("pa1", "personal", "อบ.1", "อุบัติเหตุส่วนบุคคล อบ.1", "คุ้มครองการเสียชีวิต สูญเสียอวัยวะ ทุพพลภาพ และค่ารักษาจากอุบัติเหตุ", ["บุคคลทั่วไปและครอบครัว", "ผู้ต้องการเงินสำรองจากอุบัติเหตุ"], ["เสียชีวิต สูญเสียอวัยวะ สายตา หรือทุพพลภาพตามตาราง", "ค่ารักษาพยาบาลจากอุบัติเหตุเมื่อเลือก", "ความคุ้มครองเพิ่มเติมตามแผน"], ["อายุ อาชีพ และชั้นอาชีพ", "วงเงินผลประโยชน์", "กิจกรรมและความเสี่ยง"], personalExclusions, ["บัตรประชาชน", "ข้อมูลอาชีพ", "ผู้รับผลประโยชน์"]),
  createPlan("pa2", "personal", "อบ.2", "อุบัติเหตุส่วนบุคคล อบ.2", "เพิ่มนิยามความสูญเสียหรือทุพพลภาพตามเงื่อนไขแบบ อบ.2", ["ผู้ต้องการขอบเขตผลประโยชน์อุบัติเหตุที่ละเอียดขึ้น", "องค์กรที่จัดสวัสดิการกลุ่ม"], ["ผลประโยชน์อุบัติเหตุตามข้อตกลง อบ.2", "ค่ารักษาพยาบาลและผลประโยชน์เสริมเมื่อเลือก", "คุ้มครองตลอด 24 ชั่วโมงตามอาณาเขต"], ["อายุ อาชีพ จำนวนคน และวงเงิน", "ลักษณะงานและประวัติสินไหม"], personalExclusions, ["ข้อมูลผู้เอาประกัน", "รายชื่อสมาชิกกรณีกลุ่ม"]),
  createPlan("income-hospital", "personal", "รพ.", "ชดเชยรายได้กรณีเข้ารักษาจากอุบัติเหตุ", "รับเงินชดเชยรายวันเมื่อเข้ารักษาในโรงพยาบาลจากอุบัติเหตุ", ["พนักงาน อาชีพอิสระ และเจ้าของกิจการ", "ผู้มีรายได้ที่อาจหยุดชะงักเมื่อพักรักษา"], ["เงินชดเชยรายวันตามจำนวนวันที่เข้าเกณฑ์", "ผลประโยชน์ตามแผนและระยะเวลาสูงสุด", "ความคุ้มครองเฉพาะเหตุจากอุบัติเหตุ"], ["อายุ อาชีพ และจำนวนเงินชดเชยต่อวัน", "ระยะเวลาคุ้มครอง"], personalExclusions, ["บัตรประชาชน", "ข้อมูลอาชีพ", "เอกสารทางการแพทย์เมื่อเคลม"]),
  createPlan("golf", "personal", "Golf", "ประกันภัยสำหรับผู้เล่นกอล์ฟ", "ดูแลอุบัติเหตุ ความรับผิด และอุปกรณ์ระหว่างเล่นกอล์ฟตามแผน", ["นักกอล์ฟสมัครเล่น", "ผู้เล่นในสนามที่กำหนดตามเงื่อนไข"], ["อุบัติเหตุส่วนบุคคลระหว่างเล่น", "ความรับผิดต่อบุคคลภายนอก", "อุปกรณ์กอล์ฟและรางวัล Hole-in-One เมื่อระบุ"], ["อายุผู้เล่นและวงเงิน", "ขอบเขตสนามและจำนวนครั้งเล่น"], personalExclusions, ["ข้อมูลผู้เอาประกัน", "รายละเอียดอุปกรณ์เมื่อกำหนด"]),

  createPlan("sme", "business", "SME", "ร้านค้าและผู้ประกอบการขนาดย่อม", "แพ็กเกจทรัพย์สิน กระจก เงินสด และความรับผิดต่อบุคคลภายนอก", ["ร้านค้า สำนักงาน และกิจการขนาดเล็ก", "ธุรกิจที่มีลูกค้าเข้าพื้นที่"], ["ไฟไหม้และภัยเพิ่มเติมตามแผน", "กระจกติดตั้ง เงินสด และทรัพย์สินตามวงเงิน", "ความรับผิดต่อชีวิต ร่างกาย และทรัพย์สินบุคคลภายนอก"], ["ประเภทธุรกิจ ที่ตั้ง และโครงสร้างอาคาร", "มูลค่าทรัพย์สินและเงินสด", "ระบบดับเพลิงและประวัติความเสียหาย"], propertyExclusions, ["ทะเบียน/ข้อมูลกิจการ", "ภาพสถานที่", "รายการและมูลค่าทรัพย์สิน"]),
  createPlan("public-liability", "business", "PL", "ความรับผิดต่อบุคคลภายนอก", "คุ้มครองความรับผิดตามกฎหมายจากการดำเนินงานหรือสถานที่", ["ธุรกิจที่มีลูกค้า ผู้มาติดต่อ หรือผู้รับเหมา", "เจ้าของสถานที่และผู้จัดกิจกรรม"], ["บาดเจ็บ เจ็บป่วย หรือเสียชีวิตของบุคคลภายนอก", "ความเสียหายต่อทรัพย์สินบุคคลภายนอก", "ค่าใช้จ่ายต่อสู้คดีตามเงื่อนไข"], ["ประเภทธุรกิจ รายได้ และจำนวนผู้ใช้พื้นที่", "วงเงินต่อครั้งและตลอดปี", "ประวัติการเรียกร้อง"], ["ความรับผิดตามสัญญาที่เกินกฎหมาย", "ความเสียหายต่อพนักงานหรือทรัพย์สินในความดูแล", "มลภาวะและความเสี่ยงวิชาชีพ เว้นแต่ระบุ"], ["ข้อมูลกิจการ", "สัญญาที่เกี่ยวข้อง", "มาตรการความปลอดภัย"]),
  createPlan("carrier", "business", "ขนส่ง", "ประกันภัยสำหรับผู้ขนส่ง", "คุ้มครองความรับผิดของผู้ขนส่งต่อสินค้าที่รับขน", ["ผู้ประกอบการรถขนส่งและโลจิสติกส์", "ธุรกิจที่รับผิดชอบสินค้าของลูกค้า"], ["ความสูญเสียหรือเสียหายต่อสินค้าตามความรับผิด", "เหตุจากการขนส่งตามภัยที่ระบุ", "ค่าใช้จ่ายที่เกี่ยวข้องตามเงื่อนไข"], ["ชนิดสินค้า เส้นทาง และมูลค่าต่อเที่ยว", "ชนิดรถและจำนวนเที่ยว", "ประวัติความเสียหาย"], ["การบรรจุหีบห่อไม่เหมาะสม", "การเสื่อมสภาพตามธรรมชาติ", "สินค้าต้องห้ามหรือไม่ได้แจ้ง"], ["ทะเบียนรถขนส่ง", "ชนิดและมูลค่าสินค้า", "เส้นทาง"]),
  createPlan("inland-named", "business", "Cargo", "ขนส่งภายในประเทศแบบระบุภัย", "คุ้มครองสินค้าเฉพาะภัยที่ระบุระหว่างขนส่งภายในประเทศ", ["เจ้าของสินค้าที่ต้องการกำหนดภัยชัดเจน", "การขนส่งเป็นเที่ยวหรือรายปี"], ["ไฟไหม้ ระเบิด รถคว่ำ/ชน หรือภัยที่ระบุ", "สินค้าในระหว่างการขนส่งตามเส้นทาง"], ["ชนิดสินค้า มูลค่า และวิธีบรรจุ", "เส้นทางและยานพาหนะ", "ภัยที่เลือก"], ["ภัยที่ไม่ได้ระบุ", "ความเสียหายจากบรรจุภัณฑ์ไม่เพียงพอ", "การล่าช้าและการเสื่อมสภาพ"], ["ใบกำกับสินค้า", "รายละเอียดเส้นทาง", "วิธีบรรจุ"]),
  createPlan("inland-allrisk", "business", "Cargo", "ขนส่งภายในประเทศแบบความเสี่ยงภัยทุกชนิด", "คุ้มครองความสูญเสียหรือเสียหายจากเหตุภายนอกที่ไม่ถูกยกเว้น", ["สินค้ามูลค่าสูงหรือมีความเสี่ยงหลายรูปแบบ", "ผู้ต้องการขอบเขตกว้างกว่าแบบระบุภัย"], ["ความเสียหายจากเหตุภายนอกระหว่างขนส่ง", "การยกขนและช่วงคุ้มครองตามที่ตกลง", "ภัยธรรมชาติตามข้อกำหนด"], ["ชนิดสินค้า มูลค่า บรรจุภัณฑ์", "เส้นทาง พาหนะ และประวัติเคลม"], ["การเสื่อมสภาพในตัวสินค้า", "การบรรจุไม่เหมาะสม", "การล่าช้าหรือสูญเสียตลาด"], ["Invoice/Packing list", "เส้นทางและพาหนะ", "ภาพบรรจุภัณฑ์"]),
  createPlan("gold-shop", "business", "ทอง", "ประกันภัยร้านทอง", "ความคุ้มครองเฉพาะสำหรับทองคำ เงินสด ทรัพย์สิน และความเสี่ยงของร้าน", ["ร้านทองและผู้ประกอบการค้าทอง", "กิจการที่มีทรัพย์สินมูลค่าสูงและเสี่ยงโจรกรรม"], ["ทรัพย์สินภายในสถานที่ตามภัยที่ตกลง", "การโจรกรรมหรือชิงทรัพย์ตามเงื่อนไข", "เงินสด กระจก และความรับผิดเมื่อระบุ"], ["มูลค่าสต็อกสูงสุด ระบบรักษาความปลอดภัย", "ที่ตั้ง เวลาเปิด และวิธีขนย้าย", "ประวัติความเสียหาย"], ["การทุจริตของพนักงาน เว้นแต่ซื้อเพิ่ม", "การขาดสต็อกที่พิสูจน์เหตุไม่ได้", "การขนส่งนอกเงื่อนไข"], ["ใบอนุญาต/ข้อมูลร้าน", "ระบบ CCTV และตู้นิรภัย", "มูลค่าสต็อก"]),

  createPlan("drone", "specialty", "Drone", "ประกันภัยอากาศยานซึ่งไม่มีนักบิน", "ดูแลความรับผิดต่อบุคคลภายนอกและความเสียหายตามแผนสำหรับโดรน", ["ผู้ใช้โดรนส่วนบุคคลหรือเชิงพาณิชย์", "ช่างภาพ ผู้สำรวจ และธุรกิจบริการโดรน"], ["ความรับผิดต่อชีวิต ร่างกาย และทรัพย์สินบุคคลภายนอก", "ตัวโดรนตามข้อตกลงที่เลือก", "อุบัติเหตุจากการใช้งานที่ถูกต้องตามกฎหมาย"], ["รุ่น น้ำหนัก มูลค่า และวัตถุประสงค์", "พื้นที่บินและประสบการณ์ผู้ควบคุม", "วงเงินความรับผิด"], ["การบินผิดกฎหมายหรือในพื้นที่ห้ามบิน", "การใช้งานสงคราม แข่งขัน หรือเสี่ยงพิเศษ", "การสึกหรอและความขัดข้องเดิม"], ["เลขเครื่อง/รุ่นโดรน", "ใบอนุญาตและการขึ้นทะเบียน", "ข้อมูลผู้ควบคุม"]),
  createPlan("fuel-station", "specialty", "สถานี", "ประกันภัยสถานีบริการเชื้อเพลิง", "วางแผนทรัพย์สิน ความรับผิด และความเสี่ยงเฉพาะของสถานีบริการ", ["สถานีบริการน้ำมัน LPG หรือ NGV", "ผู้ประกอบการที่มีถังและระบบเชื้อเพลิง"], ["อัคคีภัยและทรัพย์สินตามเงื่อนไข", "ความรับผิดต่อบุคคลภายนอก", "ความเสี่ยงเฉพาะระบบเชื้อเพลิงเมื่อระบุ"], ["ชนิดเชื้อเพลิง ความจุถัง และที่ตั้ง", "มาตรฐานระบบและการตรวจสอบ", "มูลค่าทรัพย์สินและรายได้"], ["การฝ่าฝืนมาตรฐานความปลอดภัย", "การรั่วไหลหรือมลภาวะที่ไม่ได้ซื้อเพิ่ม", "การเสื่อมสภาพของอุปกรณ์"], ["ใบอนุญาตสถานี", "แผนผังและระบบดับเพลิง", "รายงานตรวจสอบ"]),
  createPlan("fuel-ctp", "specialty", "พ.ร.บ.", "พ.ร.บ. รถบรรทุก LPG / NGV / น้ำมัน", "ประกันภัยภาคบังคับสำหรับรถตามประเภทเชื้อเพลิงและการจดทะเบียน", ["รถบรรทุกหรือรถที่จดทะเบียนใช้ LPG, NGV หรือน้ำมัน", "ผู้ประกอบการที่ต้องต่อทะเบียนและภาษี"], ["ความคุ้มครองผู้ประสบภัยจากรถตามกฎหมาย", "ค่าเสียหายเบื้องต้นและผลประโยชน์ตามสถานะ"], ["ประเภทรถ น้ำหนัก และลักษณะการใช้", "ประเภทเชื้อเพลิงตามทะเบียน"], ["ไม่คุ้มครองตัวรถหรือสินค้า", "วงเงินเป็นไปตามกฎหมาย"], ["ทะเบียนรถ", "ข้อมูลประเภทเชื้อเพลิง"])
];

// ผูกเอกสารในโฟลเดอร์ document: ใช้ PDF ก่อน หากไม่มีจึงแสดงรูปตามลำดับ
const insuranceMedia = {
  "motor-1": { folder: "รถยนต์ประเภท1", images: 6 },
  "motor-2": null,
  "motor-3": { folder: "รถยนต์ประเภท3", images: 7 },
  "motor-2plus": { folder: "รถยนต์ประเภท2+", imageNames: ["0.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg"] },
  "motor-3plus": { folder: "รถยนต์ประเภท3+", pdf: "ป3+  ใหม่.pdf", images: 5 },
  "motor-compulsory": null,
  "motor-one": { folder: "มิตรแท้หนึ่งเดียว", images: 10 },
  "motor-extra": null,
  "motor-eco": null,
  "motor-permpoon": { folder: "มิตรแท้เพิ่มพูน2+", pdf: "เพิ่มพูน 2+.pdf", images: 6 },
  "motor-taweekoon": { folder: "มิตรแท้ทวีคูณ", images: 5 },
  "motor-permpoon3": { folder: "มิตรแท้เพิ่มพูน3+", images: 5 },
  "residential-fire": { folder: "อัคคีภัย", images: 2 },
  home: null,
  "property-risk": null,
  construction: null,
  pa1: { folder: "อุบัติเหตุส่วนบุคคล อบ.1", images: 2 },
  pa2: null,
  "income-hospital": { folder: "ชดเชยรายได้กรณีเข้ารักษาจากอุบัติเหตุ", images: 4 },
  golf: { folder: "ประกันภัยสำหรับผู้เล่นกอล์ฟ", images: 4 },
  sme: null,
  "public-liability": null,
  carrier: null,
  "inland-named": null,
  "inland-allrisk": null,
  "gold-shop": null,
  drone: { folder: "ประกันภัยอากาศยานซึ่งไม่มีนักบิน", images: 3 },
  "fuel-station": { folder: "ประกันภัยสถานีบริการเชื้อเพลิง", images: 3 },
  "fuel-ctp": null
};

const premiumCheckPlanIds = new Set(["motor-1", "motor-one", "motor-extra"]);

const officialProductUrls = {
  motor: "https://www.mittare.com/motor-insurance/",
  "residential-fire": "https://www.mittare.com/residential-fire-insurance/",
  home: "https://www.mittare.com/home-insurance/",
  "property-risk": "https://www.mittare.com/property-risk-insurance/",
  construction: "https://www.mittare.com/construction-insurance/",
  pa1: "https://www.mittare.com/personal-accident-insurance-1/",
  pa2: "https://www.mittare.com/personal-accident-insurance-2/",
  "income-hospital": "https://www.mittare.com/income-hospitalization-insurance/",
  golf: "https://www.mittare.com/golf-insurance/",
  sme: "https://www.mittare.com/retail-sme-insurance/",
  "public-liability": "https://www.mittare.com/public-liability-insurance/",
  carrier: "https://www.mittare.com/carrier-insurance/",
  "inland-named": "https://www.mittare.com/inland-transit-insurance-named-perils/",
  "inland-allrisk": "https://www.mittare.com/inland-transit-insurance-all-risks/",
  "gold-shop": "https://www.mittare.com/gold-shop-insurance/",
  drone: "https://www.mittare.com/drone-insurance/",
  "fuel-station": "https://www.mittare.com/fuel-station-insurance/",
  "fuel-ctp": "https://www.mittare.com/all-products/"
};

let activeDocumentImages = [];
let activeDocumentImageIndex = 0;
let activeDocumentPdfUrl = "";
let activeDocumentTitle = "";
let dynamicProductMedia = {};

const officialRateSources = {
  compulsory: {
    label: "อัตราเบี้ยประกันภัยรถยนต์ภาคบังคับ (พ.ร.บ.) ที่มิตรแท้เผยแพร่",
    url: "https://www.mittare.com/motor-insurance/",
    effective: "อัตราที่หน้าเว็บไซต์ระบุว่ามีวันเริ่มคุ้มครองตั้งแต่ 1 มีนาคม 2551"
  },
  products: {
    label: "เงื่อนไขผลิตภัณฑ์จากเว็บไซต์มิตรแท้ประกันภัย",
    url: "https://www.mittare.com/all-products/",
    effective: "ตรวจสอบล่าสุด 19 มิถุนายน 2569"
  }
};

const compulsoryVehicleRates = {
  motorcycle75: { label: "รถจักรยานยนต์ส่วนบุคคล ไม่เกิน 75 ซีซี", net: 150 },
  motorcycle125: { label: "รถจักรยานยนต์ส่วนบุคคล เกิน 75–125 ซีซี", net: 300 },
  motorcycle150: { label: "รถจักรยานยนต์ส่วนบุคคล เกิน 125–150 ซีซี", net: 400 },
  motorcycleOver150: { label: "รถจักรยานยนต์ส่วนบุคคล เกิน 150 ซีซี", net: 600 },
  privateCar7: { label: "รถยนต์นั่งส่วนบุคคล ไม่เกิน 7 คน", net: 600 },
  privatePassenger15: { label: "รถยนต์โดยสารส่วนบุคคล ไม่เกิน 15 ที่นั่ง", net: 1100 },
  privatePassenger20: { label: "รถยนต์โดยสารส่วนบุคคล 16–20 ที่นั่ง", net: 2050 },
  privatePassenger40: { label: "รถยนต์โดยสารส่วนบุคคล 21–40 ที่นั่ง", net: 3200 },
  privatePassengerOver40: { label: "รถยนต์โดยสารส่วนบุคคล เกิน 40 ที่นั่ง", net: 3740 },
  privateTruck3: { label: "รถยนต์บรรทุกส่วนบุคคล ไม่เกิน 3 ตัน", net: 900 },
  privateTruck6: { label: "รถยนต์บรรทุกส่วนบุคคล เกิน 3–6 ตัน", net: 1220 },
  privateTruckOver6: { label: "รถยนต์บรรทุกส่วนบุคคล เกิน 6 ตัน", net: 1310 },
  other: { label: "รถประเภทอื่น — ให้ทีมตรวจอัตราตามทะเบียน", net: null }
};

const categoryQuoteFields = {
  motor: [
    ["vehicleMakeModel", "ยี่ห้อ / รุ่นรถ", "text", "เช่น Toyota Yaris Ativ"],
    ["vehicleYear", "ปีจดทะเบียน", "number", "2022"],
    ["vehicleValue", "มูลค่ารถโดยประมาณ (บาท)", "number", "600000"],
    ["vehicleUsage", "การใช้งาน", "select", [["personal", "ส่วนบุคคล"], ["business", "ใช้ในกิจการ"], ["commercial", "รับจ้าง / เชิงพาณิชย์"]]],
    ["repairType", "ประเภทการซ่อม", "select", [["garage", "ซ่อมอู่"], ["dealer", "ซ่อมห้าง / ศูนย์"]]],
    ["claimHistory", "ประวัติเคลมย้อนหลัง", "select", [["0", "ไม่มีเคลม"], ["1", "1 ครั้ง"], ["2plus", "2 ครั้งขึ้นไป"]]]
  ],
  property: [
    ["propertyType", "ประเภททรัพย์สิน", "select", [["house", "บ้านพักอาศัย"], ["condo", "คอนโด"], ["commercial", "อาคารพาณิชย์"], ["construction", "งานก่อสร้าง"]]],
    ["propertyValue", "ทุนประกัน / มูลค่าทดแทน (บาท)", "number", "2000000"],
    ["propertyProvince", "จังหวัดที่ตั้ง", "text", "ชลบุรี"],
    ["constructionType", "โครงสร้างหลัก", "select", [["concrete", "คอนกรีต"], ["mixed", "โครงสร้างผสม"], ["wood", "ไม้"]]],
    ["floodCoverage", "ต้องการภัยน้ำท่วม", "select", [["yes", "ต้องการ"], ["no", "ไม่ต้องการ / ขอประเมินก่อน"]]]
  ],
  personal: [
    ["insuredAge", "อายุผู้เอาประกัน", "number", "35"],
    ["occupation", "อาชีพ", "text", "พนักงานบริษัท"],
    ["occupationRisk", "ระดับความเสี่ยงอาชีพ", "select", [["office", "งานสำนักงาน"], ["field", "งานภาคสนาม"], ["high", "งานเสี่ยง / ใช้เครื่องจักร"]]],
    ["benefitAmount", "วงเงินที่ต้องการ (บาท)", "number", "500000"],
    ["memberCount", "จำนวนผู้เอาประกัน", "number", "1"]
  ],
  business: [
    ["businessType", "ประเภทธุรกิจ / สินค้า", "text", "ร้านค้า / คาเฟ่ / ขนส่ง"],
    ["businessProvince", "จังหวัดที่ตั้ง / เส้นทาง", "text", "ชลบุรี"],
    ["assetValue", "มูลค่าทรัพย์สินหรือสินค้าสูงสุด (บาท)", "number", "1000000"],
    ["annualRevenue", "รายได้ต่อปีโดยประมาณ (บาท)", "number", "3000000"],
    ["employeeCount", "จำนวนพนักงาน", "number", "5"]
  ],
  specialty: [
    ["specialtySubject", "รายละเอียดสิ่งที่เอาประกัน", "text", "รุ่นโดรน / สถานีบริการ / ประเภทรถ"],
    ["specialtyValue", "มูลค่าหรือวงเงินที่ต้องการ (บาท)", "number", "200000"],
    ["specialtyUsage", "วัตถุประสงค์การใช้งาน", "text", "ส่วนบุคคล / เชิงพาณิชย์"],
    ["specialtyProvince", "พื้นที่ใช้งาน", "text", "ชลบุรี"]
  ]
};

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  mainNavigation?.classList.toggle("is-open", !isOpen);
});

mainNavigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    mainNavigation.classList.remove("is-open");
  });
});

function markActiveNavigation() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const currentCategory = new URLSearchParams(window.location.search).get("category");
  mainNavigation?.querySelectorAll("a[href]").forEach((link) => {
    const linkUrl = new URL(link.getAttribute("href"), window.location.href);
    const linkPath = linkUrl.pathname.split("/").pop() || "index.html";
    const linkCategory = linkUrl.searchParams.get("category");
    const isActive = linkUrl.hash
      ? linkPath === currentPath && window.location.hash === linkUrl.hash
      : linkPath === currentPath && (!linkCategory || linkCategory === currentCategory);
    link.classList.toggle("is-current", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
  });
}

markActiveNavigation();

document.querySelectorAll(".profile-trigger").forEach((button) => {
  button.addEventListener("click", () => {
    const profile = profileData[button.dataset.profile];
    if (!profile || !profileDialog) return;

    document.querySelector("#profile-image").src = profile.image;
    document.querySelector("#profile-image").alt = profile.name;
    document.querySelector("#profile-name").textContent = profile.name;
    document.querySelector("#profile-role").textContent = profile.role;
    document.querySelector("#profile-summary").textContent = profile.summary;
    document.querySelector("#profile-highlights").innerHTML = profile.highlights
      .map((highlight) => `<span>${highlight}</span>`)
      .join("");
    document.querySelector("#profile-phone").href = `tel:${profile.phone}`;
    document.querySelector("#profile-line").href = profile.lineUrl;
    document.querySelector("#profile-line").setAttribute("aria-label", `เพิ่มเพื่อน LINE ${profile.name}`);
    document.querySelector("#profile-facebook").href = profile.facebookUrl;
    document.querySelector("#profile-facebook").setAttribute("aria-label", `เปิด Facebook ${profile.name}`);

    profileDialog.showModal();
  });
});

const categoryMeta = {
  motor: {
    title: "ประกันภัยรถยนต์",
    description: "เลือกดูประเภท 1, 2, 3, 2+, 3+, พ.ร.บ. และแผนรถยนต์สำเร็จรูป พร้อมข้อมูลความคุ้มครองและปัจจัยกำหนดเบี้ย",
    image: "assets/insurance-motor.png",
    alt: "รถยนต์ริมทะเล สื่อถึงประกันภัยรถยนต์"
  },
  property: {
    title: "บ้านและทรัพย์สิน",
    description: "ข้อมูลประกันบ้าน อัคคีภัย ความเสี่ยงภัยทรัพย์สิน และงานก่อสร้าง เพื่อช่วยวางทุนประกันให้เหมาะกับทรัพย์สิน",
    image: "assets/insurance-property.png",
    alt: "บ้านสมัยใหม่ สื่อถึงประกันบ้านและทรัพย์สิน"
  },
  personal: {
    title: "ประกันภัยบุคคล",
    description: "วางแผนความคุ้มครองอุบัติเหตุ ค่ารักษา เงินชดเชยรายได้ และความเสี่ยงจากกิจกรรมส่วนบุคคล",
    image: "assets/insurance-personal.png",
    alt: "อุปกรณ์ความปลอดภัย สื่อถึงประกันภัยบุคคล"
  },
  business: {
    title: "ประกันภัยธุรกิจ",
    description: "ดูแลร้านค้า SME ความรับผิดต่อบุคคลภายนอก ผู้ขนส่ง สินค้าระหว่างขนส่ง และกิจการเฉพาะด้าน",
    image: "assets/insurance-business.png",
    alt: "ร้านค้าสมัยใหม่ สื่อถึงประกันภัยธุรกิจ"
  },
  specialty: {
    title: "ประกันเฉพาะทาง",
    description: "ข้อมูลความคุ้มครองสำหรับโดรน สถานีบริการเชื้อเพลิง และรถตามประเภทเชื้อเพลิงที่มีเงื่อนไขเฉพาะ",
    image: "assets/insurance-specialty.png",
    alt: "โดรนและอุปกรณ์เฉพาะทาง สื่อถึงประกันเฉพาะทาง"
  }
};

const requestedCategory = new URLSearchParams(window.location.search).get("category");
let activeInsuranceCategory = categoryMeta[requestedCategory] ? requestedCategory : "all";
let insuranceSearchTerm = "";

initializeInsurancePage();
renderInsurancePlans();
loadDynamicProductMedia();

document.querySelectorAll(".insurance-tab").forEach((button) => {
  button.addEventListener("click", () => {
    activeInsuranceCategory = button.dataset.category;
    document.querySelectorAll(".insurance-tab").forEach((tab) => {
      const isActive = tab === button;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    renderInsurancePlans();
  });
});

document.querySelector("#insurance-search")?.addEventListener("input", (event) => {
  insuranceSearchTerm = event.target.value.trim().toLocaleLowerCase("th");
  renderInsurancePlans();
});

document.querySelector("#plan-grid")?.addEventListener("click", (event) => {
  const trigger = event.target.closest(".product-detail-trigger");
  if (!trigger) return;

  if (trigger.dataset.planDocument) {
    openPlanDocument(trigger.dataset.planDocument);
    return;
  }

  openProductDetail(trigger.dataset.product);
});

document.querySelector("#product-dialog-primary")?.addEventListener("click", () => {
  const selectedPlanId = document.querySelector("#product-dialog-primary")?.dataset.planId;
  if (selectedPlanId && premiumCalculator) {
    selectCalculatorPlan(selectedPlanId);
  }
  productDialog?.close();
});

document.querySelector("#product-dialog-document")?.addEventListener("click", (event) => {
  const planId = event.currentTarget.dataset.planDocument;
  if (!planId) return;

  productDialog?.close();
  openPlanDocument(planId);
});

document.querySelectorAll(".dialog-close").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog")?.close());
});

[profileDialog, productDialog, pdfDialog, premiumDialog].forEach((dialog) => {
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

pdfDialog?.addEventListener("close", () => {
  const viewer = document.querySelector("#pdf-viewer");
  if (viewer) viewer.removeAttribute("src");
  activeDocumentImages = [];
  activeDocumentImageIndex = 0;
  activeDocumentPdfUrl = "";
  activeDocumentTitle = "";
});

document.querySelector("#document-previous")?.addEventListener("click", () => changeDocumentImage(-1));
document.querySelector("#document-next")?.addEventListener("click", () => changeDocumentImage(1));
document.querySelector("#document-show-images")?.addEventListener("click", showDocumentImages);
document.querySelector("#document-show-pdf")?.addEventListener("click", showDocumentPdf);
pdfDialog?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") changeDocumentImage(-1);
  if (event.key === "ArrowRight") changeDocumentImage(1);
});

initializePremiumCalculator();

document.querySelector("#premium-category")?.addEventListener("change", () => {
  populatePremiumPlans();
  renderPremiumFields();
});

document.querySelector("#premium-plan")?.addEventListener("change", renderPremiumFields);

premiumCalculator?.addEventListener("reset", () => {
  window.setTimeout(() => {
    populatePremiumPlans();
    renderPremiumFields();
  }, 0);
});

premiumCalculator?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(premiumCalculator);
  const plan = insurancePlans.find((item) => item.id === formData.get("premiumPlan"));
  if (!plan) return;

  const result = isOfficialRatePlan(plan.id)
    ? calculateCompulsoryPremium(formData.get("compulsoryVehicleClass"))
    : buildQuoteRequest(plan, formData);

  renderPremiumSummary(plan, result);

  premiumDialog?.showModal();
});

document.querySelector("#export-pdf")?.addEventListener("click", () => {
  // ใช้ Print Dialog ของเบราว์เซอร์เพื่อบันทึกเป็น PDF โดยไม่เพิ่มไลบรารีขนาดใหญ่
  window.print();
});

quoteForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  // เดโมนี้ไม่ส่งข้อมูลออกจากเบราว์เซอร์ ต้องเชื่อม API ก่อนใช้งานจริง
  successMessage.hidden = false;
  quoteForm.reset();
});

function renderPremiumSummary(plan, result) {
  const thaiDate = new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date());
  const documentNumber = `MS-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(Date.now()).slice(-4)}`;

  document.querySelector("#summary-number").textContent = documentNumber;
  document.querySelector("#summary-date").textContent = thaiDate;
  document.querySelector("#summary-details").innerHTML = [
    ["หมวดประกัน", getCategoryLabel(plan.category)],
    ["แผน / ประเภท", plan.title],
    ...result.details,
    ["สถานะเอกสาร", result.status]
  ].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("");

  document.querySelector("#summary-price-label").textContent = result.priceLabel;
  document.querySelector("#summary-price").textContent = result.price;
  document.querySelector("#summary-price-caption").textContent = result.caption;
  document.querySelector("#summary-source").innerHTML = result.source;
}

function formatCurrency(value) {
  return `${new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2
  }).format(value)} บาท`;
}

function initializePremiumCalculator() {
  if (!premiumCalculator) return;
  populatePremiumPlans();
  const requestedPlanId = new URLSearchParams(window.location.search).get("plan");
  if (requestedPlanId) selectCalculatorPlan(requestedPlanId);
  renderPremiumFields();
}

function populatePremiumPlans() {
  const categorySelect = document.querySelector("#premium-category");
  const planSelect = document.querySelector("#premium-plan");
  if (!categorySelect || !planSelect) return;

  const plans = insurancePlans.filter((plan) => {
    if (plan.category !== categorySelect.value) return false;
    return plan.category !== "motor" || premiumCheckPlanIds.has(plan.id);
  });
  planSelect.innerHTML = plans
    .map((plan) => `<option value="${plan.id}">${plan.title}</option>`)
    .join("");
}

function selectCalculatorPlan(planId) {
  const plan = insurancePlans.find((item) => item.id === planId);
  const categorySelect = document.querySelector("#premium-category");
  const planSelect = document.querySelector("#premium-plan");
  const canCheckPremium = plan && (plan.category !== "motor" || premiumCheckPlanIds.has(plan.id));
  if (!canCheckPremium || !categorySelect || !planSelect) return;

  categorySelect.value = plan.category;
  populatePremiumPlans();
  planSelect.value = plan.id;
  renderPremiumFields();
}

function renderPremiumFields() {
  const category = document.querySelector("#premium-category")?.value;
  const planId = document.querySelector("#premium-plan")?.value;
  const plan = insurancePlans.find((item) => item.id === planId);
  const container = document.querySelector("#premium-dynamic-fields");
  const mode = document.querySelector("#calculator-mode");
  const submitLabel = document.querySelector("#premium-submit-label");
  if (!plan || !container || !mode) return;

  const officialRate = isOfficialRatePlan(plan.id);
  mode.classList.toggle("is-quote", !officialRate);
  mode.textContent = officialRate
    ? "อัตราสาธารณะ: ระบบคำนวณเบี้ยสุทธิ + อากรแสตมป์ + VAT 7% ให้ทันที"
    : "แผนประมาณการ: ระบบแสดงช่วงราคาโดยประมาณเพื่อวางแผนงบเบื้องต้นทันที";
  if (submitLabel) {
    submitLabel.textContent = officialRate ? "คำนวณเบี้ยจริงและสร้างใบสรุป" : "ประมาณการและสร้างใบสรุป";
  }

  if (officialRate) {
    container.innerHTML = `
      <div class="form-row">
        <label for="compulsory-vehicle-class">ประเภทรถตามทะเบียน</label>
        <select id="compulsory-vehicle-class" name="compulsoryVehicleClass" required>
          ${Object.entries(compulsoryVehicleRates).map(([value, item]) =>
            `<option value="${value}">${item.label}</option>`
          ).join("")}
        </select>
      </div>
      <p class="field-help">หากประเภทรถไม่ตรงกับรายการ ให้เลือก “รถประเภทอื่น” เพื่อจัดทำใบตรวจอัตรากับทีมงาน</p>
    `;
    return;
  }

  const fields = categoryQuoteFields[category] || [];
  container.innerHTML = `
    <div class="form-grid">
      ${fields.map(renderCalculatorField).join("")}
    </div>
    ${renderVerifiedPlanOptions(plan.id)}
    <div class="form-row">
      <label for="contact-channel">ช่องทางให้ทีมตอบกลับ</label>
      <select id="contact-channel" name="contactChannel">
        <option value="LINE @mittaresattahipdemo">LINE @mittaresattahipdemo (Demo)</option>
        <option value="โทรศัพท์ 08x-xxxx-xxxx">โทรศัพท์ 08x-xxxx-xxxx (Demo)</option>
        <option value="Facebook Mittare Sattahip Demo">Facebook Mittare Sattahip Demo</option>
      </select>
    </div>
  `;
}

function renderCalculatorField([name, label, type, config]) {
  if (type === "select") {
    return `
      <div class="form-row">
        <label for="${name}">${label}</label>
        <select id="${name}" name="${name}" required>
          ${config.map(([value, text]) => `<option value="${value}">${text}</option>`).join("")}
        </select>
      </div>
    `;
  }

  const numberAttributes = type === "number" ? 'min="0" step="1" inputmode="numeric"' : "";
  return `
    <div class="form-row">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="${type}" ${numberAttributes} placeholder="${config}" required>
    </div>
  `;
}

function renderVerifiedPlanOptions(planId) {
  if (planId === "motor-permpoon") {
    return `
      <div class="form-row">
        <label for="no-claim-years">ประวัติไม่มีเคลมต่อเนื่อง</label>
        <select id="no-claim-years" name="noClaimYears">
          <option value="0">ไม่มี / ลูกค้าใหม่</option>
          <option value="1">1 ปี — ส่วนลดตามหน้าแผน 500 บาท</option>
          <option value="2">2 ปี — ส่วนลดตามหน้าแผน 900 บาท</option>
          <option value="3">3 ปีขึ้นไป — ส่วนลดตามหน้าแผน 1,200 บาท</option>
        </select>
      </div>
    `;
  }

  if (["motor-extra", "motor-eco"].includes(planId)) {
    return `
      <div class="form-row">
        <label for="has-wrap">รถติด Wrap / Sticker รอบคัน</label>
        <select id="has-wrap" name="hasWrap">
          <option value="no">ไม่มี</option>
          <option value="yes">มี — หน้าแผนระบุเพิ่มเบี้ย 2,000 บาท/คัน</option>
        </select>
      </div>
    `;
  }

  return "";
}

function isOfficialRatePlan(planId) {
  return ["motor-compulsory", "fuel-ctp"].includes(planId);
}

function calculateCompulsoryPremium(vehicleClass) {
  const rate = compulsoryVehicleRates[vehicleClass];
  if (!rate || rate.net === null) {
    return {
      status: "รอตรวจอัตราตามทะเบียน",
      priceLabel: "ผลการตรวจสอบ",
      price: "กรุณาให้ทีมตรวจอัตรา",
      caption: "รถประเภทอื่นอาจมีอัตราแตกต่างตามรหัสและลักษณะการใช้รถ",
      details: [["ประเภทรถ", rate?.label || "ไม่ระบุ"]],
      source: sourceLink(officialRateSources.compulsory)
    };
  }

  // อากรแสตมป์ 0.4% ปัดขึ้นเป็นบาท และ VAT 7% คิดจากเบี้ยสุทธิรวมอากร
  const stampDuty = Math.ceil(rate.net * 0.004);
  const vat = (rate.net + stampDuty) * 0.07;
  const total = rate.net + stampDuty + vat;

  return {
    status: "คำนวณจากอัตราสาธารณะ",
    priceLabel: "เบี้ยรวมอากรและ VAT",
    price: formatCurrency(total),
    caption: `เบี้ยสุทธิ ${formatCurrency(rate.net)} · อากร ${formatCurrency(stampDuty)} · VAT ${formatCurrency(vat)}`,
    details: [
      ["ประเภทรถ", rate.label],
      ["เบี้ยสุทธิ", formatCurrency(rate.net)],
      ["อากรแสตมป์", formatCurrency(stampDuty)],
      ["ภาษีมูลค่าเพิ่ม 7%", formatCurrency(vat)]
    ],
    source: sourceLink(officialRateSources.compulsory)
  };
}

function buildQuoteRequest(plan, formData) {
  const details = [];
  const ignoredFields = new Set(["premiumCategory", "premiumPlan"]);

  for (const [key, value] of formData.entries()) {
    if (ignoredFields.has(key) || !value) continue;
    details.push([getFieldLabel(key), formatFieldValue(key, value)]);
  }

  const verifiedNotes = [];
  let adjustment = 0;
  if (plan.id === "motor-permpoon") {
    const discounts = { "0": 0, "1": 500, "2": 900, "3": 1200 };
    const discount = discounts[formData.get("noClaimYears")] || 0;
    if (discount) {
      adjustment -= discount;
      verifiedNotes.push(`ส่วนลดประวัติไม่มีเคลมที่เผยแพร่: ${formatCurrency(discount)}`);
    }
  }
  if (["motor-extra", "motor-eco"].includes(plan.id) && formData.get("hasWrap") === "yes") {
    adjustment += 2000;
    verifiedNotes.push("ค่าเพิ่มสำหรับ Wrap / Sticker รอบคันที่หน้าแผนระบุ: 2,000 บาท/คัน");
  }

  const estimate = calculateEstimatedPremium(plan, formData);
  const minimum = roundToHundred(Math.max(500, estimate.minimum + adjustment));
  const maximum = roundToHundred(Math.max(minimum + 100, estimate.maximum + adjustment));
  const priceRange = `${formatCurrency(minimum)} – ${formatCurrency(maximum)}`;

  return {
    status: "ประมาณการเบื้องต้น",
    priceLabel: "ช่วงเบี้ยโดยประมาณ",
    price: priceRange,
    caption: verifiedNotes.length
      ? `${verifiedNotes.join(" · ")} · ช่วงราคาเป็นการประเมินเพื่อวางแผนงบเท่านั้น`
      : "ช่วงราคาเป็นการประเมินเพื่อวางแผนงบเท่านั้น ไม่ใช่ใบเสนอราคา",
    details: [...details, ["ช่วงเบี้ยโดยประมาณ", priceRange]],
    source: `${sourceLink(officialRateSources.products)}<br>สูตรประมาณการเป็นแบบจำลองของเว็บไซต์ Demo ไม่ใช่อัตราที่บริษัทประกาศ${verifiedNotes.length ? `<br>${verifiedNotes.join("<br>")}` : ""}`
  };
}

function calculateEstimatedPremium(plan, formData) {
  switch (plan.category) {
    case "motor":
      return calculateMotorEstimate(plan.id, formData);
    case "property":
      return calculatePropertyEstimate(plan.id, formData);
    case "personal":
      return calculatePersonalEstimate(plan.id, formData);
    case "business":
      return calculateBusinessEstimate(plan.id, formData);
    case "specialty":
      return calculateSpecialtyEstimate(plan.id, formData);
    default:
      return createEstimateRange(5000);
  }
}

function calculateMotorEstimate(planId, formData) {
  const rates = {
    "motor-1": { rate: 0.024, minimum: 10500 },
    "motor-one": { rate: 0.022, minimum: 9800 },
    "motor-extra": { rate: 0.023, minimum: 10200 },
    "motor-eco": { rate: 0.018, minimum: 8500 },
    "motor-2": { rate: 0.014, minimum: 7200 },
    "motor-2plus": { rate: 0.011, minimum: 6500 },
    "motor-permpoon": { rate: 0.01, minimum: 5800 },
    "motor-3plus": { rate: 0.007, minimum: 4800 },
    "motor-permpoon3": { rate: 0.0065, minimum: 4500 },
    "motor-3": { rate: 0.004, minimum: 2800 },
    "motor-taweekoon": { rate: 0.016, minimum: 7500 }
  };
  const config = rates[planId] || { rate: 0.012, minimum: 6000 };
  const vehicleYear = Number(formData.get("vehicleYear")) || new Date().getFullYear() - 3;
  const vehicleValue = Number(formData.get("vehicleValue")) || 500000;
  const usageMultipliers = { personal: 1, business: 1.14, commercial: 1.18 };
  const repairMultipliers = { garage: 1, dealer: 1.08 };
  const claimMultipliers = { "0": 1, "1": 1.06, "2plus": 1.12 };
  const vehicleAge = Math.max(0, new Date().getFullYear() - vehicleYear);
  const ageMultiplier = vehicleAge > 10 ? 1.12 : vehicleAge > 6 ? 1.06 : 1;

  const basePremium = Math.max(
    config.minimum,
    vehicleValue * config.rate
      * (usageMultipliers[formData.get("vehicleUsage")] || 1)
      * (repairMultipliers[formData.get("repairType")] || 1)
      * (claimMultipliers[formData.get("claimHistory")] || 1)
      * ageMultiplier
  );

  return createEstimateRange(basePremium);
}

function calculatePropertyEstimate(planId, formData) {
  const value = Number(formData.get("propertyValue")) || 2000000;
  const rates = {
    "residential-fire": { rate: 0.0012, minimum: 3500 },
    home: { rate: 0.0014, minimum: 4200 },
    "property-risk": { rate: 0.002, minimum: 8000 },
    construction: { rate: 0.0035, minimum: 15000 }
  };
  const config = rates[planId] || { rate: 0.0015, minimum: 4000 };
  const structureMultipliers = { concrete: 1, mixed: 1.06, wood: 1.14 };
  const floodMultiplier = formData.get("floodCoverage") === "yes" ? 1.1 : 1;

  const basePremium = Math.max(
    config.minimum,
    value * config.rate
      * (structureMultipliers[formData.get("constructionType")] || 1)
      * floodMultiplier
  );

  return createEstimateRange(basePremium);
}

function calculatePersonalEstimate(planId, formData) {
  const benefit = Number(formData.get("benefitAmount")) || 500000;
  const members = Math.max(1, Number(formData.get("memberCount")) || 1);
  const age = Number(formData.get("insuredAge")) || 35;
  const rates = {
    pa1: { rate: 0.003, minimum: 1200 },
    pa2: { rate: 0.0035, minimum: 1400 },
    "income-hospital": { rate: 0.018, minimum: 900 },
    golf: { rate: 0.012, minimum: 2500 }
  };
  const config = rates[planId] || { rate: 0.003, minimum: 1200 };
  const riskMultipliers = { office: 1, field: 1.12, high: 1.28 };
  const ageMultiplier = age > 55 ? 1.15 : age > 45 ? 1.08 : 1;
  const memberMultiplier = planId === "pa2" ? members * 0.85 + 0.15 : 1;

  const basePremium = Math.max(
    config.minimum,
    benefit * config.rate
      * (riskMultipliers[formData.get("occupationRisk")] || 1)
      * ageMultiplier
      * memberMultiplier
  );

  return createEstimateRange(basePremium);
}

function calculateBusinessEstimate(planId, formData) {
  const assetValue = Number(formData.get("assetValue")) || 1000000;
  const revenue = Number(formData.get("annualRevenue")) || 3000000;
  const employees = Math.max(1, Number(formData.get("employeeCount")) || 5);
  const rates = {
    sme: { assetRate: 0.004, revenueRate: 0.0008, minimum: 5000 },
    "public-liability": { assetRate: 0.0015, revenueRate: 0.0012, minimum: 3500 },
    carrier: { assetRate: 0.003, revenueRate: 0.0005, minimum: 6000 },
    "inland-named": { assetRate: 0.0025, revenueRate: 0.0004, minimum: 4500 },
    "inland-allrisk": { assetRate: 0.0035, revenueRate: 0.0006, minimum: 7000 },
    "gold-shop": { assetRate: 0.006, revenueRate: 0.0015, minimum: 12000 }
  };
  const config = rates[planId] || { assetRate: 0.003, revenueRate: 0.001, minimum: 4000 };
  const employeeFactor = 1 + Math.min(employees - 1, 20) * 0.015;

  const basePremium = Math.max(
    config.minimum,
    assetValue * config.assetRate + revenue * config.revenueRate * employeeFactor
  );

  return createEstimateRange(basePremium);
}

function calculateSpecialtyEstimate(planId, formData) {
  const value = Number(formData.get("specialtyValue")) || 200000;
  const rates = {
    drone: { rate: 0.025, minimum: 3000 },
    "fuel-station": { rate: 0.0045, minimum: 25000 }
  };
  const config = rates[planId] || { rate: 0.015, minimum: 5000 };
  const usageMultiplier = /เชิงพาณิชย์|commercial/i.test(formData.get("specialtyUsage") || "") ? 1.18 : 1;

  const basePremium = Math.max(config.minimum, value * config.rate * usageMultiplier);
  return createEstimateRange(basePremium);
}

function createEstimateRange(basePremium) {
  return {
    minimum: roundToHundred(basePremium * 0.9),
    maximum: roundToHundred(basePremium * 1.12)
  };
}

function roundToHundred(value) {
  return Math.round(value / 100) * 100;
}

function sourceLink(source) {
  return `แหล่งข้อมูล: <a href="${source.url}" target="_blank" rel="noopener">${source.label}</a><br>${source.effective}`;
}

function getFieldLabel(fieldName) {
  const label = premiumCalculator?.querySelector(`[name="${fieldName}"]`)?.closest(".form-row")?.querySelector("label");
  return label?.textContent.trim() || fieldName;
}

function formatFieldValue(fieldName, value) {
  const field = premiumCalculator?.querySelector(`[name="${fieldName}"]`);
  if (field?.tagName === "SELECT") {
    return field.selectedOptions[0]?.textContent.trim() || value;
  }
  if (/Value|Amount|Revenue/i.test(fieldName)) {
    return formatCurrency(Number(value));
  }
  return value;
}

function createPlan(id, category, icon, title, lead, audience, coverage, premium, exclusions, preparation) {
  const isTypeOneMotorPlan = ["motor-1", "motor-one", "motor-extra"].includes(id);
  return {
    id,
    category,
    icon,
    title,
    lead,
    audience,
    coverage,
    premium,
    exclusions,
    preparation,
    premiumLabel: ["motor-compulsory", "fuel-ctp"].includes(id)
      ? "อัตราตามประเภทรถ"
      : isTypeOneMotorPlan
        ? "เช็กเบี้ยตามข้อมูลรถ"
        : category === "motor"
          ? "ราคาตามเอกสารแผน"
          : "คำนวณตามข้อมูลจริง"
  };
}

function encodeDocumentPath(...segments) {
  return ["document", ...segments].map((segment) => encodeURIComponent(segment)).join("/");
}

function getInsuranceMedia(planId) {
  const config = insuranceMedia[planId];
  const dynamicMedia = dynamicProductMedia[planId] || {};
  if (!config && !dynamicMedia.imageUrls?.length && !dynamicMedia.pdfUrl) return null;

  const imageNames = config?.imageNames
    || Array.from({ length: config?.images || 0 }, (_, index) => `${index + 1}.jpg`);
  const fallbackImageUrls = config
    ? imageNames.map((fileName) => encodeDocumentPath(config.folder, fileName))
    : [];

  return {
    pdfUrl: dynamicMedia.pdfUrl || (config?.pdf ? encodeDocumentPath(config.folder, config.pdf) : ""),
    imageUrls: dynamicMedia.imageUrls?.length ? dynamicMedia.imageUrls : fallbackImageUrls,
    coverImageUrl: dynamicMedia.coverImageUrl || ""
  };
}

function getPlanCoverImage(plan) {
  return dynamicProductMedia[plan.id]?.coverImageUrl || categoryMeta[plan.category].image;
}

async function loadDynamicProductMedia() {
  try {
    const response = await fetch("/api/public/product-media", { credentials: "same-origin" });
    if (!response.ok) return;
    dynamicProductMedia = await response.json();
    renderInsurancePlans();
  } catch (error) {
    dynamicProductMedia = {};
  }
}

function escapeAttribute(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getOfficialProductUrl(product) {
  return officialProductUrls[product.id]
    || officialProductUrls[product.category]
    || "https://www.mittare.com/all-products/";
}

function renderInsurancePlans() {
  const planGrid = document.querySelector("#plan-grid");
  const planEmpty = document.querySelector("#plan-empty");
  if (!planGrid) return;

  const visiblePlans = insurancePlans.filter((plan) => {
    const matchesCategory = activeInsuranceCategory === "all" || plan.category === activeInsuranceCategory;
    const searchableText = `${plan.title} ${plan.lead} ${plan.icon}`.toLocaleLowerCase("th");
    return matchesCategory && searchableText.includes(insuranceSearchTerm);
  });

  document.querySelector("#plan-count").textContent = visiblePlans.length;
  planEmpty.hidden = visiblePlans.length > 0;
  planGrid.innerHTML = visiblePlans.map((plan) => `
    <article class="plan-card">
      <img class="plan-card__image" src="${escapeAttribute(getPlanCoverImage(plan))}" alt="" loading="lazy">
      <div class="plan-card__header">
        <span class="plan-card__icon">${plan.icon}</span>
        <span class="plan-card__category">${getCategoryLabel(plan.category)}</span>
      </div>
      <h3>${plan.title}</h3>
      <p>${plan.lead}</p>
      <div class="plan-card__premium">
        <span>แนวทางเบี้ยประกัน</span>
        <strong>${plan.premiumLabel}</strong>
      </div>
      ${getInsuranceMedia(plan.id)
        ? `<button class="product-detail-trigger" type="button" data-plan-document="${plan.id}">
            เปิดเอกสารผลิตภัณฑ์ <span aria-hidden="true">→</span>
          </button>`
        : `<button class="product-detail-trigger" type="button" data-product="${plan.id}">
            ดูข้อมูลฉบับละเอียด <span aria-hidden="true">→</span>
          </button>`}
    </article>
  `).join("");
}

function initializeInsurancePage() {
  if (!document.body.classList.contains("insurance-page")) return;

  const category = categoryMeta[activeInsuranceCategory] ? activeInsuranceCategory : "motor";
  activeInsuranceCategory = category;
  const meta = categoryMeta[category];
  document.title = `${meta.title} | Mittare Sattahip`;
  document.querySelector("#category-page-title").textContent = meta.title;
  document.querySelector("#category-page-description").textContent = meta.description;
  const heroImage = document.querySelector("#category-hero-image");
  heroImage.src = meta.image;
  heroImage.alt = meta.alt;

  document.querySelectorAll("[data-page-category], [data-nav-category]").forEach((link) => {
    const isActive = link.dataset.pageCategory === category || link.dataset.navCategory === category;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
  });
}

function openProductDetail(productId) {
  const product = insurancePlans.find((plan) => plan.id === productId);
  if (!product || !productDialog) return;

  document.querySelector("#product-dialog-icon").textContent = product.icon;
  document.querySelector("#product-dialog-title").textContent = product.title;
  document.querySelector("#product-dialog-lead").textContent = product.lead;
  const coverImage = document.querySelector("#product-dialog-image");
  const coverImageUrl = dynamicProductMedia[product.id]?.coverImageUrl || "";
  if (coverImage) {
    coverImage.hidden = !coverImageUrl;
    coverImage.src = coverImageUrl;
    coverImage.alt = coverImageUrl ? product.title : "";
  }
  renderList("#product-dialog-audience", product.audience);
  renderList("#product-dialog-coverage", product.coverage);
  renderList("#product-dialog-premium", product.premium);
  renderList("#product-dialog-exclusions", product.exclusions);
  renderList("#product-dialog-preparation", product.preparation);

  const notice = document.querySelector(".product-dialog__notice");
  if (notice) {
    notice.innerHTML = `
      <strong>ข้อมูลสำคัญก่อนตัดสินใจ</strong><br>
      ข้อมูลนี้เรียบเรียงตามประเภทผลิตภัณฑ์เพื่อช่วยทำความเข้าใจความคุ้มครอง ปัจจัยรับประกัน
      ข้อยกเว้น และเอกสารที่ควรเตรียม เงื่อนไขที่มีผลบังคับจริงให้ยึดกรมธรรม์ ตารางกรมธรรม์
      เอกสารแนบท้าย และการพิจารณารับประกันภัยของบริษัท
      <br><a href="${getOfficialProductUrl(product)}" target="_blank" rel="noopener">ตรวจสอบข้อมูลผลิตภัณฑ์ต้นฉบับจากมิตรแท้ประกันภัย ↗</a>
    `;
  }

  const primaryButton = document.querySelector("#product-dialog-primary");
  const canCheckPremium = product.category !== "motor" || premiumCheckPlanIds.has(product.id);
  primaryButton.hidden = !canCheckPremium;
  primaryButton.textContent = product.category === "motor"
    ? "เช็กเบี้ยแผนประเภท 1 นี้"
    : "ประมาณการแผนนี้";
  primaryButton.dataset.planId = product.id;
  primaryButton.href = premiumCalculator
    ? "#premium-check"
    : `index.html?plan=${encodeURIComponent(product.id)}#premium-check`;

  const documentButton = document.querySelector("#product-dialog-document");
  const media = getInsuranceMedia(product.id);
  if (documentButton) {
    documentButton.hidden = !media;
    documentButton.dataset.planDocument = media ? product.id : "";
  }
  productDialog.showModal();
}

function openPlanDocument(planId) {
  const product = insurancePlans.find((plan) => plan.id === planId);
  const media = getInsuranceMedia(planId);
  if (!product || !media) {
    openProductDetail(planId);
    return;
  }

  activeDocumentImages = media.imageUrls;
  activeDocumentImageIndex = 0;
  activeDocumentPdfUrl = media.pdfUrl;
  activeDocumentTitle = product.title;

  if (media.imageUrls.length) {
    openImageDocument(media.imageUrls, product.title, media.pdfUrl);
    return;
  }

  openPdfDocument(media.pdfUrl, product.title);
}

function openPdfDocument(documentUrl, documentTitle) {
  const viewer = document.querySelector("#pdf-viewer");
  const gallery = document.querySelector("#document-gallery");
  const title = document.querySelector("#pdf-dialog-title");
  const status = document.querySelector("#document-page-status");
  const modeSwitch = document.querySelector("#document-mode-switch");
  if (!documentUrl || !viewer || !pdfDialog) return;

  activeDocumentPdfUrl = documentUrl;
  activeDocumentTitle = documentTitle;
  title.textContent = documentTitle;
  status.textContent = "เอกสาร PDF";
  modeSwitch.hidden = !activeDocumentImages.length;
  gallery.hidden = true;
  viewer.hidden = false;
  viewer.src = documentUrl;
  updateDocumentModeButtons("pdf");
  pdfDialog.showModal();
}

function openImageDocument(imageUrls, documentTitle, pdfUrl = "") {
  const viewer = document.querySelector("#pdf-viewer");
  const gallery = document.querySelector("#document-gallery");
  const title = document.querySelector("#pdf-dialog-title");
  const modeSwitch = document.querySelector("#document-mode-switch");
  if (!imageUrls.length || !gallery || !pdfDialog) return;

  activeDocumentImages = imageUrls;
  activeDocumentImageIndex = 0;
  activeDocumentPdfUrl = pdfUrl;
  activeDocumentTitle = documentTitle;
  title.textContent = documentTitle;
  modeSwitch.hidden = !pdfUrl;
  viewer.hidden = true;
  viewer.removeAttribute("src");
  gallery.hidden = false;
  renderDocumentImage();
  updateDocumentModeButtons("images");
  pdfDialog.showModal();
}

function showDocumentImages() {
  if (!activeDocumentImages.length) return;

  const viewer = document.querySelector("#pdf-viewer");
  const gallery = document.querySelector("#document-gallery");
  viewer.hidden = true;
  viewer.removeAttribute("src");
  gallery.hidden = false;
  renderDocumentImage();
  updateDocumentModeButtons("images");
}

function showDocumentPdf() {
  if (!activeDocumentPdfUrl) return;

  const viewer = document.querySelector("#pdf-viewer");
  const gallery = document.querySelector("#document-gallery");
  const status = document.querySelector("#document-page-status");
  gallery.hidden = true;
  viewer.hidden = false;
  viewer.src = activeDocumentPdfUrl;
  status.textContent = "เอกสาร PDF";
  updateDocumentModeButtons("pdf");
}

function updateDocumentModeButtons(activeMode) {
  document.querySelector("#document-show-images")?.classList.toggle("is-active", activeMode === "images");
  document.querySelector("#document-show-pdf")?.classList.toggle("is-active", activeMode === "pdf");
}

function changeDocumentImage(direction) {
  if (activeDocumentImages.length < 2) return;
  activeDocumentImageIndex = (
    activeDocumentImageIndex + direction + activeDocumentImages.length
  ) % activeDocumentImages.length;
  renderDocumentImage();
}

function renderDocumentImage() {
  const image = document.querySelector("#document-image");
  const status = document.querySelector("#document-page-status");
  const previous = document.querySelector("#document-previous");
  const next = document.querySelector("#document-next");
  if (!image || !activeDocumentImages.length) return;

  image.src = activeDocumentImages[activeDocumentImageIndex];
  image.alt = `หน้าเอกสาร ${activeDocumentImageIndex + 1} จาก ${activeDocumentImages.length}`;
  status.textContent = `หน้า ${activeDocumentImageIndex + 1} / ${activeDocumentImages.length}`;
  previous.hidden = activeDocumentImages.length < 2;
  next.hidden = activeDocumentImages.length < 2;
}

function getCategoryLabel(category) {
  return {
    motor: "รถยนต์",
    property: "บ้านและทรัพย์สิน",
    personal: "บุคคล",
    business: "ธุรกิจ",
    specialty: "เฉพาะทาง"
  }[category];
}

function renderList(selector, items) {
  document.querySelector(selector).innerHTML = items
    .map((item) => `<li>${item}</li>`)
    .join("");
}

function initializeMotionEffects() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const progressBar = document.querySelector(".scroll-progress span");
  const siteHeader = document.querySelector(".site-header");
  const hero = document.querySelector(".hero");
  const heroImage = document.querySelector(".hero__image");
  const cursorGlow = document.querySelector(".cursor-glow");

  document.body.classList.add("motion-ready");

  const revealGroups = [
    [".premium-check__intro", "left"],
    [".premium-calculator", "right"],
    [".section-heading > *", "up"],
    [".category-card", "up"],
    [".why-us__visual", "left"],
    [".why-us__content", "right"],
    [".benefit-list li", "up"],
    [".leader-card", "up"],
    [".emergency__inner > *", "up"],
    [".quote__content", "left"],
    [".quote-form", "right"]
  ];

  revealGroups.forEach(([selector, direction]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.dataset.reveal = direction;
      element.style.setProperty("--reveal-delay", `${Math.min(index * 90, 360)}ms`);
    });
  });

  if (reduceMotion) {
    document.querySelectorAll("[data-reveal]").forEach((element) => {
      element.classList.add("is-visible");
      element.removeAttribute("data-reveal");
    });
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);

      // คืน transform ให้เอฟเฟกต์ tilt หลัง reveal จบ
      const revealDelay = Number.parseInt(entry.target.style.getPropertyValue("--reveal-delay"), 10) || 0;
      window.setTimeout(() => {
        entry.target.removeAttribute("data-reveal");
        entry.target.classList.remove("is-visible");
      }, revealDelay + 850);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));

  let scrollFrame;
  const updateScrollEffects = () => {
    scrollFrame = null;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = documentHeight > 0 ? window.scrollY / documentHeight : 0;
    progressBar?.style.setProperty("transform", `scaleX(${Math.min(Math.max(progress, 0), 1)})`);
    siteHeader?.classList.toggle("is-scrolled", window.scrollY > 24);

    if (hero && heroImage) {
      const heroProgress = Math.min(window.scrollY / Math.max(hero.offsetHeight, 1), 1);
      heroImage.style.setProperty("--hero-y", `${heroProgress * 42}px`);
    }
  };

  window.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollEffects);
  }, { passive: true });
  updateScrollEffects();

  if (!supportsHover) return;

  let pointerFrame;
  window.addEventListener("pointermove", (event) => {
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      cursorGlow?.classList.add("is-visible");
      cursorGlow?.style.setProperty("transform", `translate3d(${event.clientX - 130}px, ${event.clientY - 130}px, 0)`);

      if (hero?.contains(event.target) && heroImage) {
        const x = (event.clientX / window.innerWidth - .5) * -18;
        const y = (event.clientY / window.innerHeight - .5) * -12;
        heroImage.style.setProperty("--hero-x", `${x}px`);
        heroImage.style.setProperty("--hero-y", `${y + Math.min(window.scrollY * .05, 42)}px`);
      }
    });
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () => cursorGlow?.classList.remove("is-visible"));

  document.querySelectorAll(".category-card, .leader-card__photo").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const relativeX = (event.clientX - bounds.left) / bounds.width;
      const relativeY = (event.clientY - bounds.top) / bounds.height;
      card.style.setProperty("--tilt-x", `${(relativeY - .5) * -7}deg`);
      card.style.setProperty("--tilt-y", `${(relativeX - .5) * 7}deg`);
      card.style.setProperty("--glow-x", `${relativeX * 100}%`);
      card.style.setProperty("--glow-y", `${relativeY * 100}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
      card.style.removeProperty("--glow-x");
      card.style.removeProperty("--glow-y");
    });
  });
}

initializeMotionEffects();

document.querySelector("#current-year").textContent = new Date().getFullYear();
