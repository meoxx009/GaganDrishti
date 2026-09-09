export type EmergencyCategory =
  | "heavy_rain"
  | "lightning"
  | "heatwave"
  | "strong_wind";

export interface PrecautionItem {
  doList: string[];
  dontList: string[];
  criticalTips: string[];
}

export interface EmergencyTopic {
  id: EmergencyCategory;
  titleEn: string;
  titleHi: string;
  severityLabelEn: string;
  severityLabelHi: string;
  badgeLevel: "HIGH" | "MODERATE" | "SEVERE";
  iconName: "CloudRain" | "Zap" | "Sun" | "Wind";
  summaryEn: string;
  summaryHi: string;
  en: PrecautionItem;
  hi: PrecautionItem;
}

export interface OfficialHelpline {
  number: string;
  nameEn: string;
  nameHi: string;
  agencyEn: string;
  agencyHi: string;
  descEn: string;
  descHi: string;
  isTollFree: boolean;
}

export const OFFICIAL_HELPLINES: OfficialHelpline[] = [
  {
    number: "112",
    nameEn: "National Emergency Number (ERSS)",
    nameHi: "राष्ट्रीय आपातकालीन नंबर (ERSS)",
    agencyEn: "Ministry of Home Affairs / State Police",
    agencyHi: "गृह मंत्रालय / राज्य पुलिस",
    descEn: "Unified 24x7 emergency response for Police, Fire, and Medical emergencies across India.",
    descHi: "भारत भर में पुलिस, दमकल और चिकित्सा सहायता हेतु 24x7 एकीकृत आपातकालीन नंबर।",
    isTollFree: true,
  },
  {
    number: "1078",
    nameEn: "NDRF Disaster Helpline",
    nameHi: "एनडीआरएफ आपदा हेल्पलाइन",
    agencyEn: "National Disaster Response Force (NDRF)",
    agencyHi: "राष्ट्रीय आपदा मोचन बल (NDRF)",
    descEn: "National control room for specialized search, rescue, and flood/cyclone disaster response.",
    descHi: "बाढ़, चक्रवात एवं गंभीर आपदाओं में त्वरित खोज एवं बचाव दल सहायता हेतु नियंत्रण कक्ष।",
    isTollFree: true,
  },
  {
    number: "1070",
    nameEn: "State Disaster Management (SDMA)",
    nameHi: "राज्य आपदा प्रबंधन प्राधिकरण (SDMA)",
    agencyEn: "State Disaster Management Authority",
    agencyHi: "राज्य आपदा प्रबंधन प्राधिकरण",
    descEn: "State emergency operation center for regional alerts, relief logistics, and shelter status.",
    descHi: "राज्य आपातकालीन संचालन केंद्र - क्षेत्रीय चेतावनी, राहत सामग्री और आश्रय सूचना हेतु।",
    isTollFree: true,
  },
  {
    number: "1077",
    nameEn: "District Disaster Control Room (DDMA)",
    nameHi: "जिला आपदा नियंत्रण कक्ष (DDMA)",
    agencyEn: "District Magistrate / Collectorate",
    agencyHi: "जिलाधिकारी / कलेक्ट्रेट नियंत्रण कक्ष",
    descEn: "Direct helpline to the local District Disaster Management Authority for municipal and village assistance.",
    descHi: "स्थानीय जिला प्रशासन एवं नगर निगम/तहसील स्तर पर राहत व बचाव सहायता के लिए।",
    isTollFree: true,
  },
  {
    number: "108",
    nameEn: "Emergency Medical & Ambulance",
    nameHi: "आपातकालीन चिकित्सा एवं एम्बुलेंस",
    agencyEn: "National Health Mission / State Health Services",
    agencyHi: "राष्ट्रीय स्वास्थ्य मिशन / राज्य स्वास्थ्य सेवाएं",
    descEn: "24x7 emergency medical transport and first-aid response during severe incidents.",
    descHi: "गंभीर दुर्घटना या बीमारी के समय 24x7 आपातकालीन चिकित्सा परिवहन सेवा।",
    isTollFree: true,
  },
  {
    number: "101",
    nameEn: "Fire & Rescue Services",
    nameHi: "दमकल एवं बचाव सेवा",
    agencyEn: "State Fire and Emergency Services",
    agencyHi: "राज्य अग्निशमन एवं आपातकालीन सेवा",
    descEn: "Fire-fighting, building evacuation, and urban search & rescue operations.",
    descHi: "आग, भवन ढहने और जलभराव से नागरिकों के त्वरित बचाव हेतु।",
    isTollFree: true,
  },
];

export const EMERGENCY_TOPICS: EmergencyTopic[] = [
  {
    id: "heavy_rain",
    titleEn: "Heavy Rain & Flood Safety",
    titleHi: "भारी वर्षा एवं बाढ़ सुरक्षा",
    severityLabelEn: "Inundation & Flash Flood Hazard",
    severityLabelHi: "जलभराव एवं बाढ़ जोखिम",
    badgeLevel: "HIGH",
    iconName: "CloudRain",
    summaryEn: "Procedures for urban waterlogging, swollen rivers, flash floods, and inundated roads.",
    summaryHi: "शहरी जलभराव, उफनती नदियों, अचानक आई बाढ़ एवं जलमग्न रास्तों के लिए सुरक्षा निर्देश।",
    en: {
      criticalTips: [
        "Never walk or drive through flowing water; just 6 inches of moving water can knock you down, and 1-2 feet can float a vehicle.",
        "Turn off the main electrical switch and LPG cylinder valve if water enters your home.",
        "Move vulnerable family members, vital documents, medicines, and drinking water to upper floors.",
      ],
      doList: [
        "Monitor local administration radio and verified emergency broadcasts.",
        "Keep emergency torches, power banks, and clean drinking water ready.",
        "Follow official evacuation orders issued by the local DDMA without delay.",
        "Help elderly neighbors, pregnant women, and young children reach safer ground.",
        "Boil all drinking water or use purification tablets after flood waters recede.",
      ],
      dontList: [
        "Do not touch submerged electrical sockets, wires, or fallen power poles.",
        "Do not drive past roadblocks or barricades erected near flooded bridges or underpasses.",
        "Do not eat food that has come into direct contact with flood waters.",
        "Do not allow children to swim or play in waterlogged streets or drainage canals.",
      ],
    },
    hi: {
      criticalTips: [
        "बहते पानी में कभी भी पैदल या वाहन से न निकलें; मात्र 6 इंच गहरा बहता पानी आपको गिरा सकता है और 1-2 फीट पानी कार को बहा सकता है।",
        "घर में पानी भरने लगे तो मुख्य बिजली स्विच और गैस सिलेंडर रेगुलेटर तुरंत बंद करें।",
        "ज़रूरी दस्तावेज़, दवाइयां, सूखा राशन और पीने का पानी घर के ऊपरी हिस्से में सुरक्षित रखें।",
      ],
      doList: [
        "स्थानीय प्रशासन और रेडियो द्वारा प्रसारित आधिकारिक चेतावनियों पर ध्यान दें।",
        "टॉर्च, मोबाइल पावर बैंक, प्राथमिक चिकित्सा किट और स्वच्छ पेयजल तैयार रखें।",
        "जिला प्रशासन (DDMA) द्वारा जारी निकासी आदेश का बिना किसी देरी के पालन करें।",
        "बुजुर्गों, बच्चों और पशुओं को पहले सुरक्षित व ऊंचे स्थान पर पहुंचाने में मदद करें।",
        "बाढ़ का पानी उतरने के बाद भी पानी उबालकर ही पिएं ताकि संक्रामक बीमारियों से बचा जा सके।",
      ],
      dontList: [
        "पानी में डूबे हुए बिजली के खंभों, तारों या उपकरणों को कतई न छुएं।",
        "जलमग्न पुलों, अंडरपास या अवरुद्ध सड़कों पर जबरन वाहन न ले जाएं।",
        "बाढ़ के पानी के संपर्क में आया कोई भी खाद्य पदार्थ न खाएं।",
        "बच्चों को जलभराव वाली गलियों या नालों के पास खेलने न दें।",
      ],
    },
  },
  {
    id: "lightning",
    titleEn: "Lightning & Thunderstorm Safety",
    titleHi: "वज्रपात एवं आंधी-तूफान सुरक्षा",
    severityLabelEn: "Severe Electrical & Hail Risk",
    severityLabelHi: "विद्युत आघात एवं ओलावृष्टि जोखिम",
    badgeLevel: "SEVERE",
    iconName: "Zap",
    summaryEn: "Life-saving 30-30 rule and outdoor field precautions during electrical thunderstorm events.",
    summaryHi: "वज्रपात के दौरान 30-30 सुरक्षा नियम एवं खुले खेतों में काम करने वाले किसानों हेतु जीवनरक्षक उपाय।",
    en: {
      criticalTips: [
        "Practice the 30-30 Rule: If the time between lightning flash and thunder is less than 30 seconds, immediately seek shelter inside a sturdy building. Remain inside for at least 30 minutes after the last thunderclap.",
        "Never seek shelter under isolated trees, tin sheds, mobile towers, or metallic fences.",
        "If caught in an open field with no shelter: Crouch low on the balls of your feet with heels touching, head tucked down, and hands over ears (Lightning Crouch). Never lie flat on the ground.",
      ],
      doList: [
        "Quickly get inside a pucca building or an enclosed metal-roof vehicle with windows rolled up.",
        "Farmers should immediately pause field operations and move away from tractors and metal farm equipment.",
        "Unplug sensitive electrical appliances before the peak of the storm.",
        "Stay away from windows, doors, and plumbing pipes that conduct electrical surges.",
      ],
      dontList: [
        "Do not use corded landline phones or handle wired electrical devices during lightning.",
        "Do not stand in open fields, high ridges, or near bodies of water (ponds, canals, rivers).",
        "Do not hold metal umbrellas, iron tools, fishing rods, or metal implements.",
        "Do not group closely together; maintain at least 15 feet distance between individuals in the open.",
      ],
    },
    hi: {
      criticalTips: [
        "30-30 नियम याद रखें: बिजली चमकने और गड़गड़ाहट के बीच यदि 30 सेकंड से कम अंतर हो, तो तुरंत पक्के मकान में जाएं। अंतिम गड़गड़ाहट के 30 मिनट बाद तक बाहर न निकलें।",
        "अकेले ऊंचे पेड़, टिन शेड, बिजली के खंभे या धातु की बाड़ के नीचे कभी शरण न लें।",
        "यदि खुले खेत में फंस जाएं और कोई पक्का आश्रय न हो, तो उकड़ू (पंजों के बल) बैठ जाएं, सिर घुटनों के बीच रखें व कान ढक लें। जमीन पर कभी सीधा न लेटें।",
      ],
      doList: [
        "तुरंत किसी पक्के मकान या बंद शीशों वाली कार/बस में शरण लें।",
        "किसान भाई तुरंत हल, ट्रैक्टर और लोहे के कृषि औजारों से दूर हट जाएं।",
        "आंधी-तूफान शुरू होते ही टीवी, फ्रिज और अन्य संवेदनशील बिजली उपकरण अनप्लग कर दें।",
        "खिड़कियों, दरवाजों और धातु के नलों/पाइपों से दूरी बनाकर रखें।",
      ],
      dontList: [
        "बिजली कड़कने के दौरान तार वाले फोन या चार्जिंग पर लगे मोबाइल का प्रयोग न करें।",
        "तालाबों, नहरों, खुले मैदानों या ऊंची पहाड़ियों पर खड़े न रहें।",
        "लोहे की छतरी या धातु की छड़ों को हाथ में लेकर न घूमें।",
        "यदि कई लोग साथ हों, तो एक जगह झुंड बनाकर न खड़े हों; आपस में कम से कम 15 फीट की दूरी रखें।",
      ],
    },
  },
  {
    id: "heatwave",
    titleEn: "Heatwave & Extreme Heat Safety",
    titleHi: "लू एवं अत्यधिक गर्मी सुरक्षा",
    severityLabelEn: "Heatstroke & Dehydration Hazard",
    severityLabelHi: "लू (हीटस्ट्रोक) एवं निर्जलीकरण जोखिम",
    badgeLevel: "HIGH",
    iconName: "Sun",
    summaryEn: "Protection against heat exhaustion, dehydration, and sunstroke during peak summer temperatures.",
    summaryHi: "गर्मियों में अत्यधिक तापमान के दौरान हीटस्ट्रोक, निर्जलीकरण एवं शारीरिक थकावट से बचाव के उपाय।",
    en: {
      criticalTips: [
        "Avoid strenuous outdoor work between 12:00 PM and 3:30 PM when solar radiation is at its peak.",
        "Drink water frequently, even if you do not feel thirsty. Carry ORS, buttermilk (chaach), coconut water, or lemon water.",
        "Recognize Heatstroke Symptoms: High body temperature, cessation of sweating, confusion, nausea, or dizziness require immediate medical attention (Call 108).",
      ],
      doList: [
        "Wear loose, light-colored, lightweight cotton clothing.",
        "Cover your head with a cloth, towel, hat, or umbrella when stepping outdoors.",
        "Keep domestic animals and pets in the shade and ensure they have ample fresh water.",
        "Cool down overheated individuals by moving them to shade, applying wet cloths to neck and forehead, and fanning.",
      ],
      dontList: [
        "Never leave children, elderly people, or pets locked inside parked vehicles.",
        "Avoid alcohol, tea, coffee, and carbonated soft drinks that accelerate dehydration.",
        "Avoid heavy, high-protein, and stale spicy foods during peak afternoon hours.",
        "Do not step directly from intense heat into freezing air-conditioned rooms abruptly.",
      ],
    },
    hi: {
      criticalTips: [
        "दोपहर 12:00 बजे से 3:30 बजे के बीच तेज धूप में कड़ा परिश्रम या अनावश्यक बाहर निकलने से बचें।",
        "प्यास न लगने पर भी समय-समय पर पर्याप्त पानी पिएं। ओआरएस (ORS), छाछ, नारियल पानी या नींबू पानी का सेवन करें।",
        "लू के लक्षण पहचानें: अत्यधिक शरीर का गर्म होना, पसीना बंद होना, चक्कर आना, उल्टी होना - ऐसा होने पर तुरंत 108 पर एम्बुलेंस बुलाएं।",
      ],
      doList: [
        "ढीले, हल्के रंग के सूती कपड़े पहनें।",
        "धूप में बाहर निकलते समय सिर को गमछे, टोपी या छतरी से अवश्य ढकें।",
        "दुधारू पशुओं को छायादार स्थान पर बांधें और उन्हें दिन में 3-4 बार स्वच्छ व ताजा पानी पिलाएं।",
        "यदि किसी को लू लग जाए तो उसे तुरंत छायादार जगह पर लिटाकर माथे और गर्दन पर ठंडे पानी की पट्टी रखें।",
      ],
      dontList: [
        "खड़ी कार में बच्चों या पालतू जानवरों को बंद करके कभी न छोड़ें।",
        "शराब, बहुत अधिक चाय, कॉफी या अत्यधिक मीठे कोल्ड ड्रिंक्स से बचें, ये शरीर में पानी कम करते हैं।",
        "दोपहर के समय भारी, बासी या अत्यधिक तला-भुना भोजन न करें।",
        "कड़ी धूप से आकर तुरंत बहुत ठंडा बर्फ का पानी न पिएं।",
      ],
    },
  },
  {
    id: "strong_wind",
    titleEn: "Strong Wind & Gale Precautions",
    titleHi: "तेज आंधी व चक्रवाती हवाएं सुरक्षा",
    severityLabelEn: "Structural Damage & Flying Debris",
    severityLabelHi: "ढांचागत क्षति एवं उड़ते मलबे का खतरा",
    badgeLevel: "MODERATE",
    iconName: "Wind",
    summaryEn: "Safeguards against high wind gusts, falling trees, roof dislodgement, and road hazards.",
    summaryHi: "तेज झक्कड़, गिरते पेड़ों, टिन की छतों के उखड़ने एवं सड़क खतरों से बचाव के आवश्यक कदम।",
    en: {
      criticalTips: [
        "Stay away from aging trees, large billboards, temporary hoardings, and loose construction scaffolding.",
        "Secure outdoor furniture, tin roofing sheets, plastic tanks, and loose farm implements before high winds arrive.",
        "Motorcyclists and cyclists should immediately pull over to a sheltered spot away from power lines and trees.",
      ],
      doList: [
        "Keep all doors, windows, and ventilators securely latched inside homes.",
        "Park vehicles away from trees, electric poles, and precarious walls in covered garages.",
        "Inspect electrical wiring around the house for loose hanging connections.",
        "Store sufficient non-perishable food and flashlights in case high winds disrupt local power grids.",
      ],
      dontList: [
        "Do not venture out on motorcycles or light two-wheelers during gale-force winds.",
        "Do not stand near glass facades or large unprotected picture windows.",
        "Do not attempt to secure roofs or climb ladders while high winds are actively blowing.",
        "Do not touch fallen wires on roadways; always presume them to be electrically energized.",
      ],
    },
    hi: {
      criticalTips: [
        "पुराने पेड़ों, बड़े होर्डिंग्स, साइनबोर्ड और निर्माणाधीन इमारतों के पास कतई न खड़े हों।",
        "आंधी आने से पहले छतों पर रखी टिन शेड, प्लास्टिक की टंकियां और खुले सामान को मजबूती से बांधें या नीचे रख लें।",
        "दोपहिया वाहन चालक तेज हवा में वाहन चलाना बंद कर सुरक्षित पक्के भवन में रुक जाएं।",
      ],
      doList: [
        "घर की सभी खिड़कियां, दरवाजे और रोशनदान मजबूती से बंद रखें।",
        "वाहनों को पेड़ों या बिजली के खंभों के नीचे पार्क न करें।",
        "घर के आसपास झूलते बिजली के तारों की सूचना तुरंत विद्युत विभाग को दें।",
        "बिजली आपूर्ति बाधित होने की आशंका के चलते टॉर्च, मोमबत्ती और मोबाइल चार्ज रखें।",
      ],
      dontList: [
        "तेज आंधी के दौरान मोटरसाइकिल या साइकिल से यात्रा करने का जोखिम न उठाएं।",
        "बड़ी कांच की खिड़कियों के ठीक सामने खड़े होकर बाहर का दृश्य न देखें।",
        "आंधी चलने के दौरान छतों पर चढ़कर तिरपाल या चादरें बांधने का प्रयास न करें।",
        "सड़क पर गिरे हुए किसी भी बिजली के तार को कभी न छुएं, उसमें करंट हो सकता है।",
      ],
    },
  },
];
