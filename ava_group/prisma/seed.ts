// prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Yeni ProjectDetailData interface'i, detay başlıkları için dil bazlı alanları içerir
interface ProjectDetailDataForDb {
  type: "image" | "text" | "video";
  content: string;
  title_en?: string;
  title_tr?: string;
  title_ar?: string;
  content_en?: string;
  content_tr?: string;
  content_ar?: string;
  order?: number;
}

// Yeni ProjectData interface'i, proje için dil bazlı metin alanlarını içerir
interface ProjectDataForDb {
  src: string;
  alt: string;
  status: "COMPLETED" | "UNDER_CONSTRUCTION" | "IN_DESIGN"; // Prisma enum ile uyumlu
  icon: string;
  year: number;
  details: ProjectDetailDataForDb[]; // Güncellenmiş detay tipi

  // *** Doğrudan çevrilmiş metinler için yeni alanlar ***
  leftTitle_en: string;
  leftTitle_tr: string;
  leftTitle_ar?: string; // Prisma'da String? ise burası da String?

  description_en: string;
  description_tr: string;
  description_ar?: string;

  location_en: string;
  location_tr: string;
  location_ar?: string;

  client_en: string;
  client_tr: string;
  client_ar?: string;

  typology_en: string;
  typology_tr: string;
  typology_ar?: string;
}

// Mevcut verilerinizi yeni Prisma formatına dönüştürüyoruz
const projectsData: ProjectDataForDb[] = [
  {
    src: "/images/heathrow-airport.jpg",
    alt: "Heathrow Airport Terminal",
    status: "COMPLETED",
    icon: "/icons/icon-build.svg",
    year: 2008,
    // JSON dosyalarınızdaki metinleri buraya kopyalayın
    leftTitle_en: "Heathrow Airport Expansion",
    leftTitle_tr: "Heathrow Havalimanı Genişletme",
    leftTitle_ar: "توسعة مطار هيثرو", // Arapça çeviriyi ekleyin

    description_en:
      "A major expansion of Heathrow Airport to increase capacity and passenger experience. The project involved new terminals, runways, and extensive infrastructure upgrades.",
    description_tr:
      "Heathrow Havalimanı'nın kapasitesini ve yolcu deneyimini artırmaya yönelik büyük bir genişletme projesi. Proje, yeni terminaller, pistler ve kapsamlı altyapı iyileştirmelerini içeriyordu.",
    description_ar:
      "توسعة كبيرة لمطار هيثرو لزيادة السعة وتحسين تجربة الركاب. شمل المشروع محطات جديدة ومدارج وتحديثات واسعة للبنية التحتية.",

    location_en: "London, United Kingdom",
    location_tr: "Londra, Birleşik Krallık",
    location_ar: "لندن، المملكة المتحدة",

    client_en: "Heathrow Airport Holdings Ltd.",
    client_tr: "Heathrow Airport Holdings Ltd.",
    client_ar: "شركة مطار هيثرو القابضة المحدودة",

    typology_en: "Airport Infrastructure",
    typology_tr: "Havalimanı Altyapısı",
    typology_ar: "بنية تحتية للمطارات",
    details: [
      {
        type: "image",
        content: "/images/heathrow-1.jpg",
        title_en: "Terminal 5 Extension", // Örnek detay başlıkları
        title_tr: "Terminal 5 Genişletmesi",
        title_ar: "توسعة المحطة 5",
      },
      {
        type: "text",
        content: "This text content will not be translated by i18n keys.", // Bu metin i18n key ile çevrilmeyecekse
        title_en: "Cargo Terminal Design",
        title_tr: "Kargo Terminali Tasarımı",
        title_ar: "تصميم محطة الشحن",
      },
      {
        type: "image",
        content: "/images/heathrow-2.jpg",
        title_en: "Airfield Upgrades",
        title_tr: "Havaalanı İyileştirmeleri",
        title_ar: "ترقيات مهبط الطائرات",
      },
    ],
  },
  {
    src: "/images/changi-airport.jpg",
    alt: "Changi Airport Terminal",
    status: "COMPLETED",
    icon: "/icons/icon-build.svg",
    year: 2019,
    leftTitle_en: "Changi Airport Jewel Complex",
    leftTitle_tr: "Changi Havalimanı Jewel Kompleksi",
    leftTitle_ar: "مجمع جوهرة مطار شانغي",

    description_en:
      "Development of the iconic Jewel Changi Airport, a multi-dimensional lifestyle destination featuring a waterfall, gardens, retail, and dining.",
    description_tr:
      "Şelale, bahçeler, perakende ve yeme-içme alanları içeren çok boyutlu bir yaşam merkezi olan ikonik Jewel Changi Havalimanı'nın geliştirilmesi.",
    description_ar:
      "تطوير مجمع جوهرة مطار شانغي الشهير، وهو وجهة حياة متعددة الأبعاد تضم شلالاً وحدائق ومتاجر تجزئة ومطاعم.",

    location_en: "Singapore",
    location_tr: "Singapur",
    location_ar: "سنغافورة",

    client_en: "Changi Airport Group",
    client_tr: "Changi Airport Group",
    client_ar: "مجموعة مطار شانغي",

    typology_en: "Mixed-Use Retail & Airport",
    typology_tr: "Karma Kullanımlı Perakende & Havalimanı",
    typology_ar: "تجارة تجزئة متعددة الاستخدامات ومطار",
    details: [],
  },
  {
    src: "/images/incheon-airport.jpg",
    alt: "Incheon Airport Terminal",
    status: "COMPLETED",
    icon: "/icons/icon-build.svg",
    location_en: "Incheon, South Korea",
    location_tr: "İnçon, Güney Kore",
    location_ar: "إنشيون، كوريا الجنوبية",
    year: 2018,
    client_en: "Incheon International Airport Corporation",
    client_tr: "İnçon Uluslararası Havalimanı İşletmesi",
    client_ar: "شركة مطار إنشيون الدولي",
    typology_en: "Airport Terminal",
    typology_tr: "Havalimanı Terminali",
    typology_ar: "مبنى ركاب المطار",
    leftTitle_en: "Incheon Airport Terminal 2",
    leftTitle_tr: "İnçon Havalimanı Terminal 2",
    leftTitle_ar: "مبنى الركاب 2 في مطار إنشيون",
    description_en:
      "Construction of a new, state-of-the-art Terminal 2 at Incheon International Airport, aiming for increased efficiency and passenger comfort.",
    description_tr:
      "İnçon Uluslararası Havalimanı'nda artan verimlilik ve yolcu konforunu hedefleyen yeni, son teknoloji Terminal 2'nin inşası.",
    description_ar:
      "بناء مبنى ركاب جديد ومتطور (رقم 2) في مطار إنشيون الدولي، بهدف زيادة الكفاءة وراحة الركاب.",
    details: [],
  },
  {
    src: "/images/lagos-airport.jpg",
    alt: "Lagos International Airport",
    status: "UNDER_CONSTRUCTION",
    icon: "/icons/icon-build.svg",
    location_en: "Lagos, Nigeria",
    location_tr: "Lagos, Nijerya",
    location_ar: "لاغوس، نيجيريا",
    year: 2024,
    client_en: "Federal Airports Authority of Nigeria (FAAN)",
    client_tr: "Nijerya Federal Havalimanları Otoritesi (FAAN)",
    client_ar: "الهيئة الفيدرالية للمطارات في نيجيريا (FAAN)",
    typology_en: "Airport Modernization",
    typology_tr: "Havalimanı Modernizasyonu",
    typology_ar: "تحديث المطار",
    leftTitle_en: "Lagos Airport Modernization",
    leftTitle_tr: "Lagos Havalimanı Modernizasyonu",
    leftTitle_ar: "تحديث مطار لاغوس",
    description_en:
      "Ongoing modernization and expansion of Murtala Muhammed International Airport in Lagos, including new passenger facilities and cargo handling areas.",
    description_tr:
      "Lagos'taki Murtala Muhammed Uluslararası Havalimanı'nın yeni yolcu tesisleri ve kargo elleçleme alanlarını içeren devam eden modernizasyon ve genişletme çalışmaları.",
    description_ar:
      "أعمال التحديث والتوسعة الجارية في مطار مورتالا محمد الدولي في لاغوس، بما في ذلك مرافق ركاب جديدة ومناطق لمناولة البضائع.",
    details: [],
  },
  {
    src: "/images/sydney-airport.jpg",
    alt: "Sydney Airport Terminal",
    status: "UNDER_CONSTRUCTION",
    icon: "/icons/icon-build.svg",
    location_en: "Sydney, Australia",
    location_tr: "Sidney, Avustralya",
    location_ar: "سيدني، أستراليا",
    year: 2025,
    client_en: "Sydney Airport Corporation Limited",
    client_tr: "Sidney Havalimanı Şirketi Limited",
    client_ar: "شركة مطار سيدني المحدودة",
    typology_en: "Urbanism & Infrastructure",
    typology_tr: "Şehircilik ve Altyapı",
    typology_ar: "التخطيط الحضري والبنية التحتية",
    leftTitle_en: "Sydney Airport Redevelopment",
    leftTitle_tr: "Sidney Havalimanı Yeniden Geliştirme",
    leftTitle_ar: "إعادة تطوير مطار سيدني",
    description_en:
      "Redevelopment of the landside precinct and improvements to terminal access at Sydney Airport to enhance traffic flow and passenger convenience.",
    description_tr:
      "Trafik akışını ve yolcu kolaylığını artırmak amacıyla Sidney Havalimanı'ndaki kara tarafı bölgesinin yeniden geliştirilmesi ve terminal erişiminde iyileştirmeler.",
    description_ar:
      "إعادة تطوير المنطقة البرية وتحسينات على الوصول إلى مباني المطار في مطار سيدني لتعزيز تدفق حركة المرور وراحة الركاب.",
    details: [],
  },
  {
    src: "/images/cape-town-airport.jpg",
    alt: "Cape Town Airport Terminal",
    status: "UNDER_CONSTRUCTION",
    icon: "/icons/icon-build.svg",
    location_en: "Cape Town, South Africa",
    location_tr: "Cape Town, Güney Afrika",
    location_ar: "كيب تاون، جنوب أفريقيا",
    year: 2026,
    client_en: "Airports Company South Africa (ACSA)",
    client_tr: "Güney Afrika Havalimanları Şirketi (ACSA)",
    client_ar: "شركة مطارات جنوب أفريقيا (ACSA)",
    typology_en: "Infrastructure",
    typology_tr: "Altyapı",
    typology_ar: "بنية تحتية",
    leftTitle_en: "Cape Town Airport Runway Extension",
    leftTitle_tr: "Cape Town Havalimanı Pist Uzatma",
    leftTitle_ar: "تمديد مدرج مطار كيب تاون",
    description_en:
      "Extension of the main runway at Cape Town International Airport to accommodate larger aircraft and increase operational flexibility.",
    description_tr:
      "Cape Town Uluslararası Havalimanı ana pistinin daha büyük uçakları ağırlamak ve operasyonel esnekliği artırmak için uzatılması.",
    description_ar:
      "تمديد المدرج الرئيسي في مطار كيب تاون الدولي لاستيعاب الطائرات الأكبر وزيادة المرونة التشغيلية.",
    details: [],
  },
  {
    src: "/images/gelephu-airport.jpg",
    alt: "Gelephu Airport",
    status: "IN_DESIGN",
    icon: "/icons/icon-build.svg",
    location_en: "Gelephu, Bhutan",
    location_tr: "Gelephu, Butan",
    location_ar: "غيليفو، بوتان",
    year: 2030,
    client_en: "Royal Government of Bhutan",
    client_tr: "Butan Kraliyet Hükümeti",
    client_ar: "حكومة بوتان الملكية",
    typology_en: "Masterplan & Airport",
    typology_tr: "Masterplan ve Havalimanı",
    typology_ar: "مخطط رئيسي ومطار",
    leftTitle_en: "Gelephu Mindfulness City Airport",
    leftTitle_tr: "Gelephu Farkındalık Şehri Havalimanı",
    leftTitle_ar: "مطار مدينة غيليفو للسلام الداخلي",
    description_en:
      "Proposed international airport as part of the Gelephu Mindfulness City project, aiming for sustainable and innovative design in Bhutan.",
    description_tr:
      "Butan'da sürdürülebilir ve yenilikçi tasarıma odaklanan Gelephu Farkındalık Şehri projesinin bir parçası olarak önerilen uluslararası havalimanı.",
    description_ar:
      "مطار دولي مقترح كجزء من مشروع مدينة غيليفو للسلام الداخلي، يهدف إلى تحقيق تصميم مستدام ومبتكر في بوتان.",
    details: [],
  },
  {
    src: "/images/zayed-airport.jpg",
    alt: "Zayed International Airport",
    status: "IN_DESIGN",
    icon: "/icons/icon-build.svg",
    location_en: "Abu Dhabi, UAE",
    location_tr: "Abu Dabi, BAE",
    location_ar: "أبو ظبي، الإمارات العربية المتحدة",
    year: 2028,
    client_en: "Abu Dhabi Airports Company (ADAC)",
    client_tr: "Abu Dabi Havalimanları Şirketi (ADAC)",
    client_ar: "شركة مطارات أبوظبي (ADAC)",
    typology_en: "Airport Terminal",
    typology_tr: "Havalimanı Terminali",
    typology_ar: "مبنى ركاب المطار",
    leftTitle_en: "Zayed Airport Midfield Terminal",
    leftTitle_tr: "Zayed Havalimanı Orta Saha Terminali",
    leftTitle_ar: "مبنى المسافرين الأوسط في مطار زايد",
    description_en:
      "Future development of a new Midfield Terminal Complex at Zayed International Airport to significantly boost capacity and offer world-class facilities.",
    description_tr:
      "Zayed Uluslararası Havalimanı'nda kapasiteyi önemli ölçüde artırmak ve dünya standartlarında tesisler sunmak için yeni bir Orta Saha Terminal Kompleksi'nin gelecekteki geliştirilmesi.",
    description_ar:
      "التطوير المستقبلي لمجمع مبنى المسافرين الأوسط الجديد في مطار زايد الدولي لزيادة السعة بشكل كبير وتقديم مرافق عالمية المستوى.",
    details: [],
  },
  {
    src: "/images/valencia-airport.jpg",
    alt: "Valencia International Airport",
    status: "IN_DESIGN",
    icon: "/icons/icon-build.svg",
    location_en: "Valencia, Spain",
    location_tr: "Valensiya, İspanya",
    location_ar: "فالنسيا، إسبانيا",
    year: 2027,
    client_en: "Aena",
    client_tr: "Aena",
    client_ar: "Aena",
    typology_en: "Sustainable Design",
    typology_tr: "Sürdürülebilir Tasarım",
    typology_ar: "تصميم مستدام",
    leftTitle_en: "Valencia Airport Eco-Expansion",
    leftTitle_tr: "Valensiya Havalimanı Eko-Genişletme",
    leftTitle_ar: "التوسعة البيئية لمطار فالنسيا",
    description_en:
      "Planned eco-friendly expansion of Valencia International Airport focusing on sustainable design and energy efficiency.",
    description_tr:
      "Sürdürülebilir tasarım ve enerji verimliliğine odaklanan Valensiya Uluslararası Havalimanı'nın planlanan çevre dostu genişletmesi.",
    description_ar:
      "توسعة صديقة للبيئة مخطط لها في مطار فالنسيا الدولي تركز على التصميم المستدام وكفاءة الطاقة.",
    details: [],
  },
];

async function main() {
  console.log("🌱 Veritabanı seed işlemi başlatılıyor...");

  // Önce mevcut verileri temizle
  await prisma.projectDetail.deleteMany({});
  await prisma.project.deleteMany({});
  console.log("🧹 Mevcut veriler temizlendi");

  // Her projeyi oluştur
  for (const project of projectsData) {
    const { details, ...projectData } = project;

    const createdProject = await prisma.project.create({
      data: {
        ...projectData,
        details: {
          create: details.map((detail) => {
            const base = {
              type: detail.type,
              content: detail.content ?? undefined,
              content_en: detail.content_en ?? undefined,
              content_tr: detail.content_tr ?? undefined,
              content_ar: detail.content_ar ?? undefined,
              order: detail.order ?? undefined,
            };

            if (detail.type === "text") {
              return {
                ...base,
                title_en: detail.title_en ?? undefined,
                title_tr: detail.title_tr ?? undefined,
                title_ar: detail.title_ar ?? undefined,
              };
            }

            return base;
          }),
        },
      },
      include: {
        details: true,
      },
    });

    console.log(
      `✅ Proje oluşturuldu: ${createdProject.alt} (${createdProject.details.length} detay ile)`
    );
  }

  const totalProjects = await prisma.project.count();
  const totalDetails = await prisma.projectDetail.count();

  console.log(`🎉 Seed işlemi tamamlandı!`);
  console.log(
    `📊 Toplam ${totalProjects} proje ve ${totalDetails} detay oluşturuldu.`
  );
}

main()
  .then(() => {
    console.log("✅ Seed işlemi başarıyla tamamlandı!");
  })
  .catch((e) => {
    console.error("❌ Seed işlemi sırasında hata oluştu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
