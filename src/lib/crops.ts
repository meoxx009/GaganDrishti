export type SeasonId = "kharif" | "rabi" | "zaid";

export type CropCategory =
  | "cereal"
  | "pulse"
  | "oilseed"
  | "cash"
  | "vegetable"
  | "fruit";

export interface CropItem {
  id: string;
  nameEn: string;
  nameHi: string;
  seasons: SeasonId[];
  isPriority: boolean;
  category: CropCategory;
  descriptionEn: string;
  descriptionHi: string;
  iconName: string;
}

export const CROPS_CATALOG: CropItem[] = [
  // --- KHARIF CROPS (Monsoon Season) ---
  {
    id: "soybean",
    nameEn: "Soybean",
    nameHi: "सोयाबीन",
    seasons: ["kharif"],
    isPriority: true,
    category: "oilseed",
    descriptionEn: "Key oilseed crop of Central India; sensitive to waterlogging at flowering.",
    descriptionHi: "मध्य भारत की मुख्य तिलहन फसल; फूल अवस्था में जलभराव के प्रति अत्यधिक संवेदनशील।",
    iconName: "Leaf",
  },
  {
    id: "paddy",
    nameEn: "Paddy / Rice",
    nameHi: "धान",
    seasons: ["kharif"],
    isPriority: true,
    category: "cereal",
    descriptionEn: "Monsoon staple requiring substantial field moisture during vegetative phases.",
    descriptionHi: "मानसून की प्रमुख खाद्यान्न फसल जिसे विकास के दौरान पर्याप्त जल की आवश्यकता होती है।",
    iconName: "Sprout",
  },
  {
    id: "maize",
    nameEn: "Maize / Corn",
    nameHi: "मक्का",
    seasons: ["kharif", "zaid"],
    isPriority: true,
    category: "cereal",
    descriptionEn: "Versatile grain crop; requires well-drained soil and moderate rainfall.",
    descriptionHi: "बहुमुखी अनाज फसल; जल निकासी वाली मिट्टी और संतुलित वर्षा उपयुक्त।",
    iconName: "Tractor",
  },
  {
    id: "cotton",
    nameEn: "Cotton",
    nameHi: "कपास",
    seasons: ["kharif"],
    isPriority: true,
    category: "cash",
    descriptionEn: "Commercial fiber crop; sensitive to sustained waterlogging and bollworms in humid periods.",
    descriptionHi: "व्यावसायिक रेशा फसल; अत्यधिक नमी और जलभराव से गूलर सड़ने का जोखिम।",
    iconName: "Flower",
  },
  {
    id: "groundnut",
    nameEn: "Groundnut / Peanut",
    nameHi: "मूंगफली",
    seasons: ["kharif", "zaid"],
    isPriority: true,
    category: "oilseed",
    descriptionEn: "Pod development requires friable well-aerated soil; susceptible to water stagnation.",
    descriptionHi: "फलियों के विकास के लिए भुरभुरी मिट्टी आवश्यक; जलजमाव से नुकसान।",
    iconName: "Leaf",
  },
  {
    id: "arhar",
    nameEn: "Pigeon Pea / Arhar",
    nameHi: "अरहर (तुअर)",
    seasons: ["kharif"],
    isPriority: true,
    category: "pulse",
    descriptionEn: "Long-duration pulse; resilient to mild dry spells but vulnerable to field submergence.",
    descriptionHi: "दीर्घकालिक दलहनी फसल; सूखे के प्रति सहनशील परंतु जलभराव में जड़ सड़न की संभावना।",
    iconName: "Sprout",
  },
  {
    id: "moong_kharif",
    nameEn: "Green Gram / Moong",
    nameHi: "मूंग (खरीफ)",
    seasons: ["kharif"],
    isPriority: false,
    category: "pulse",
    descriptionEn: "Short duration pulse crop; rains during maturity affect seed quality.",
    descriptionHi: "कम अवधि की दलहन फसल; पकने के समय वर्षा से दानों की गुणवत्ता प्रभावित होती है।",
    iconName: "Sprout",
  },
  {
    id: "urad",
    nameEn: "Black Gram / Urad",
    nameHi: "उड़द",
    seasons: ["kharif"],
    isPriority: false,
    category: "pulse",
    descriptionEn: "Fast maturing pulse; susceptible to foliar moisture stress and yellow mosaic in damp weather.",
    descriptionHi: "तेजी से बढ़ने वाली दलहन फसल; लगातार नमी में रोगों के प्रति सतर्कता आवश्यक।",
    iconName: "Sprout",
  },
  {
    id: "bajra",
    nameEn: "Pearl Millet / Bajra",
    nameHi: "बाजरा",
    seasons: ["kharif"],
    isPriority: false,
    category: "cereal",
    descriptionEn: "Drought-hardy coarse grain; requires dry sunny weather during grain formation.",
    descriptionHi: "कम पानी में होने वाला मोटा अनाज; दाना बनते समय खिली धूप लाभदायक।",
    iconName: "Wheat",
  },
  {
    id: "jowar",
    nameEn: "Sorghum / Jowar",
    nameHi: "ज्वार",
    seasons: ["kharif"],
    isPriority: false,
    category: "cereal",
    descriptionEn: "Hardy cereal and fodder crop; tolerates moderate dry spells.",
    descriptionHi: "सहनशील अनाज एवं चारा फसल; सूखे की स्थिति में भी अच्छी वृद्धि।",
    iconName: "Tractor",
  },

  // --- RABI CROPS (Winter / Post-Monsoon Season) ---
  {
    id: "wheat",
    nameEn: "Wheat",
    nameHi: "गेहूँ",
    seasons: ["rabi"],
    isPriority: true,
    category: "cereal",
    descriptionEn: "Primary winter food crop of Central and North India; cool temperatures favor tillering.",
    descriptionHi: "उत्तर एवं मध्य भारत की मुख्य रबी फसल; कल्ले फूटने के लिए ठंडी जलवायु आवश्यक।",
    iconName: "Wheat",
  },
  {
    id: "mustard",
    nameEn: "Mustard / Rapeseed",
    nameHi: "सरसों",
    seasons: ["rabi"],
    isPriority: true,
    category: "oilseed",
    descriptionEn: "Major rabi oilseed; aphid monitoring needed in cloudy/humid weather; avoids frost.",
    descriptionHi: "रबी की प्रमुख तिलहन फसल; बादल छाए रहने पर कीट निगरानी एवं पाले से बचाव आवश्यक।",
    iconName: "Flower",
  },
  {
    id: "gram",
    nameEn: "Chickpea / Chana",
    nameHi: "चना",
    seasons: ["rabi"],
    isPriority: true,
    category: "pulse",
    descriptionEn: "Key pulse in Madhya Pradesh; highly sensitive to excessive rain or cloudy spells during podding.",
    descriptionHi: "मध्य प्रदेश की प्रमुख दलहन फसल; फूल व घेंघा बनते समय अधिक वर्षा से बचाव जरूरी।",
    iconName: "Sprout",
  },
  {
    id: "lentil",
    nameEn: "Lentil / Masoor",
    nameHi: "मसूर",
    seasons: ["rabi"],
    isPriority: true,
    category: "pulse",
    descriptionEn: "Cold tolerant pulse requiring light irrigation; sensitive to waterlogging.",
    descriptionHi: "कम पानी वाली दलहनी फसल; जलभराव के प्रति संवेदनशील।",
    iconName: "Sprout",
  },
  {
    id: "barley",
    nameEn: "Barley / Jau",
    nameHi: "जौ",
    seasons: ["rabi"],
    isPriority: true,
    category: "cereal",
    descriptionEn: "Tolerant to salinity and low moisture; benefits from cool winter spell.",
    descriptionHi: "कम पानी एवं लवणीय मिट्टी में भी उगने वाला मजबूत रबी अनाज।",
    iconName: "Wheat",
  },
  {
    id: "potato",
    nameEn: "Potato",
    nameHi: "आलू",
    seasons: ["rabi"],
    isPriority: true,
    category: "vegetable",
    descriptionEn: "Tuber formation requires cool nights and disciplined earthing-up.",
    descriptionHi: "कंद विकास के लिए ठंडी रातें एवं उचित मिट्टी चढ़ाना लाभकारी।",
    iconName: "Leaf",
  },
  {
    id: "pea",
    nameEn: "Field Pea / Matar",
    nameHi: "मटर",
    seasons: ["rabi"],
    isPriority: false,
    category: "pulse",
    descriptionEn: "Cool season legume; requires well-timed light irrigation.",
    descriptionHi: "शीतकालीन दलहन; फूल आने पर हल्की सिंचाई उपयुक्त।",
    iconName: "Sprout",
  },
  {
    id: "linseed",
    nameEn: "Linseed / Alsi",
    nameHi: "अलसी",
    seasons: ["rabi"],
    isPriority: false,
    category: "oilseed",
    descriptionEn: "Hardy rabi oilseed suitable for dryland and utera/relay cropping.",
    descriptionHi: "कम पानी में तैयार होने वाली औषधीय तिलहन फसल।",
    iconName: "Flower",
  },
  {
    id: "sugarcane",
    nameEn: "Sugarcane",
    nameHi: "गन्ना",
    seasons: ["kharif", "rabi"],
    isPriority: false,
    category: "cash",
    descriptionEn: "Long-duration cash crop requiring heavy irrigation and thermal stability.",
    descriptionHi: "दीर्घकालिक नकदी फसल जिसे प्रचुर जल एवं संतुलित तापमान की आवश्यकता होती है।",
    iconName: "Tractor",
  },
  {
    id: "garlic",
    nameEn: "Garlic / Lahsun",
    nameHi: "लहसुन",
    seasons: ["rabi"],
    isPriority: false,
    category: "vegetable",
    descriptionEn: "High-value bulb spice; requires sunny dry weather during bulb curing.",
    descriptionHi: "कंद विकास और खुदाई के बाद सुखाने के लिए खिली धूप आवश्यक।",
    iconName: "Leaf",
  },
  {
    id: "coriander",
    nameEn: "Coriander / Dhaniya",
    nameHi: "धनिया",
    seasons: ["rabi"],
    isPriority: false,
    category: "cash",
    descriptionEn: "Aromatic seed crop; vulnerable to frost and heavy untimely rain.",
    descriptionHi: "सुगंधित मसाला फसल; पाले एवं असमय भारी वर्षा से सुरक्षा जरूरी।",
    iconName: "Flower",
  },

  // --- ZAID CROPS (Summer Season) ---
  {
    id: "moong_zaid",
    nameEn: "Summer Moong",
    nameHi: "ग्रीष्मकालीन मूंग",
    seasons: ["zaid"],
    isPriority: true,
    category: "pulse",
    descriptionEn: "60-day summer pulse that enriches soil; requires assured irrigation rounds.",
    descriptionHi: "60 दिनों की ग्रीष्मकालीन दलहन; मिट्टी की उर्वरता बढ़ाती है, सुनिश्चित सिंचाई आवश्यक।",
    iconName: "Sprout",
  },
  {
    id: "watermelon",
    nameEn: "Watermelon / Tarbooj",
    nameHi: "तरबूज",
    seasons: ["zaid"],
    isPriority: true,
    category: "fruit",
    descriptionEn: "Thrives in warm, dry climates with drip/furrow watering; fruit ripening needs sunshine.",
    descriptionHi: "गर्म एवं शुष्क मौसम में उत्तम मिठास; पकते समय शुष्क मौसम लाभदायक।",
    iconName: "Leaf",
  },
  {
    id: "muskmelon",
    nameEn: "Muskmelon / Kharbooja",
    nameHi: "खरबूजा",
    seasons: ["zaid"],
    isPriority: true,
    category: "fruit",
    descriptionEn: "Heat loving cucurbit; avoid overhead watering to prevent fruit rot.",
    descriptionHi: "तेज धूप और गर्मी पसंद करने वाला फल; क्यारियों में नियंत्रित पानी दें।",
    iconName: "Leaf",
  },
  {
    id: "cucumber",
    nameEn: "Cucumber / Kheera",
    nameHi: "खीरा",
    seasons: ["zaid"],
    isPriority: true,
    category: "vegetable",
    descriptionEn: "Quick harvesting vine vegetable; regular morning moisture essential under high heat.",
    descriptionHi: "तेजी से तैयार होने वाली बेल वाली सब्जी; गर्मी में नियमित सुबह की नमी आवश्यक।",
    iconName: "Sprout",
  },
  {
    id: "summer_vegetables",
    nameEn: "Summer Veg (Gourd/Okra)",
    nameHi: "ग्रीष्मकालीन सब्जियां (लौकी/भिंडी)",
    seasons: ["zaid"],
    isPriority: true,
    category: "vegetable",
    descriptionEn: "Bottle gourd, bitter gourd, and bhindi; require frequent light irrigation to combat heat.",
    descriptionHi: "लौकी, तोरई, करेला एवं भिंडी; तेज धूप में नियमित हल्की सिंचाई से उत्तम उपज।",
    iconName: "Leaf",
  },
  {
    id: "summer_fodder",
    nameEn: "Summer Fodder (Chari/Maize)",
    nameHi: "ग्रीष्मकालीन चारा (चरी/मक्का)",
    seasons: ["zaid"],
    isPriority: true,
    category: "cereal",
    descriptionEn: "Green fodder for livestock during hot summer months.",
    descriptionHi: "ग्रीष्मकाल में पशुओं के लिए पौष्टिक हरा चारा।",
    iconName: "Tractor",
  },
  {
    id: "pumpkin",
    nameEn: "Pumpkin / Kaddu",
    nameHi: "कद्दू",
    seasons: ["zaid"],
    isPriority: false,
    category: "vegetable",
    descriptionEn: "Hardy cucurbit crop with high heat tolerance.",
    descriptionHi: "तेज गर्मी सहने वाली मजबूत बेल वर्गीय सब्जी।",
    iconName: "Leaf",
  },
  {
    id: "cluster_bean",
    nameEn: "Cluster Bean / Guar",
    nameHi: "ग्वार फली",
    seasons: ["zaid", "kharif"],
    isPriority: false,
    category: "vegetable",
    descriptionEn: "Drought resistant legume suitable for high temperatures.",
    descriptionHi: "गर्मी और सूखे को सहन करने वाली पौष्टिक सब्जी।",
    iconName: "Sprout",
  },
];

export function getCropsBySeason(season: SeasonId): CropItem[] {
  return CROPS_CATALOG.filter((crop) => crop.seasons.includes(season));
}

export function getPriorityCropsBySeason(season: SeasonId): CropItem[] {
  return CROPS_CATALOG.filter(
    (crop) => crop.seasons.includes(season) && crop.isPriority
  );
}

export function searchCrops(season: SeasonId, query: string): CropItem[] {
  const q = query.trim().toLowerCase();
  const seasonCrops = getCropsBySeason(season);
  if (!q) return seasonCrops;

  return seasonCrops.filter(
    (crop) =>
      crop.nameEn.toLowerCase().includes(q) ||
      crop.nameHi.toLowerCase().includes(q) ||
      crop.category.toLowerCase().includes(q) ||
      crop.descriptionEn.toLowerCase().includes(q) ||
      crop.descriptionHi.toLowerCase().includes(q)
  );
}

export function findCropById(cropId: string): CropItem | undefined {
  return CROPS_CATALOG.find((c) => c.id === cropId);
}

const CROP_ALIASES: { id: string; aliases: string[] }[] = [
  { id: "soybean", aliases: ["soybean", "soyabean", "soya", "सोयाबीन", "सोया"] },
  { id: "wheat", aliases: ["wheat", "gehu", "gehun", "गेहूं", "गेहूँ"] },
  { id: "paddy", aliases: ["paddy", "rice", "dhan", "धान", "चावल", "chawal"] },
  { id: "mustard", aliases: ["mustard", "sarson", "sarsonn", "rai", "सरसों", "राई"] },
  { id: "maize", aliases: ["maize", "corn", "makka", "मक्का", "भुट्टा", "bhutta"] },
  { id: "cotton", aliases: ["cotton", "kapas", "कपास"] },
  { id: "gram", aliases: ["gram", "chana", "chickpea", "चना", "चने"] },
  { id: "sugarcane", aliases: ["sugarcane", "cane", "ganna", "गन्ना"] },
  { id: "arhar", aliases: ["arhar", "tur", "tuvar", "अरहर", "तुअर"] },
  { id: "moong", aliases: ["moong", "mung", "मूंग"] },
  { id: "urad", aliases: ["urad", "mash", "उड़द"] },
  { id: "groundnut", aliases: ["groundnut", "peanut", "moongfali", "mungfali", "मूंगफली"] },
  { id: "garlic", aliases: ["garlic", "lahsun", "lasun", "लहसुन"] },
  { id: "onion", aliases: ["onion", "pyaz", "pyaaz", "kanda", "प्याज"] },
  { id: "potato", aliases: ["potato", "aloo", "alu", "आलू"] },
  { id: "tomato", aliases: ["tomato", "tamatar", "टमाटर"] },
  { id: "coriander", aliases: ["coriander", "dhaniya", "धनिया"] },
  { id: "watermelon", aliases: ["watermelon", "tarbooz", "तरबूज"] },
  { id: "muskmelon", aliases: ["muskmelon", "kharbooja", "खरबूजा"] },
  { id: "cucumber", aliases: ["cucumber", "kheera", "खीरा"] },
  { id: "bottle_gourd", aliases: ["bottle gourd", "lauki", "लौकी", "ghiya"] },
  { id: "okra", aliases: ["okra", "bhindi", "ladyfinger", "भिंडी"] },
  { id: "cluster_bean", aliases: ["cluster bean", "guar", "ग्वार"] },
];

export function extractCropFromQuery(query: string): CropItem | undefined {
  const q = query.toLowerCase();
  for (const item of CROP_ALIASES) {
    for (const alias of item.aliases) {
      if (/^[a-z0-9\s]+$/.test(alias)) {
        const regex = new RegExp(`\\b${alias}\\b`, "i");
        if (regex.test(q)) {
          return findCropById(item.id);
        }
      } else {
        if (q.includes(alias)) {
          return findCropById(item.id);
        }
      }
    }
  }
  return undefined;
}
