import { Language, NavSection } from "./types";

export interface TranslationDictionary {
  brand: {
    title: string;
    sub: string;
    badge: string;
    tagline: string;
  };
  header: {
    liveFeeds: string;
    systemActive: string;
    istClock: string;
    selectCity: string;
    coordinates: string;
    toggleTheme: string;
    toggleLanguage: string;
    lightMode: string;
    darkMode: string;
    searchCity: string;
  };
  navigation: Record<
    NavSection,
    {
      label: string;
      sub: string;
      desc: string;
    }
  >;
  section: {
    activeLocation: string;
    coordinatesLabel: string;
    statusBadge: string;
    moduleStatusTitle: string;
    architectureTitle: string;
    sectionKey: string;
    languageMode: string;
    streamState: string;
    streamStateValue: string;
    authAndDb: string;
    authAndDbValue: string;
    readinessDescription: string;
    citizenHighlights: {
      heading: string;
      card1Title: string;
      card1Desc: string;
      card2Title: string;
      card2Desc: string;
      card3Title: string;
      card3Desc: string;
    };
    farmerHighlights: {
      heading: string;
      card1Title: string;
      card1Desc: string;
      card2Title: string;
      card2Desc: string;
      card3Title: string;
      card3Desc: string;
    };
    alertsHighlights: {
      heading: string;
      card1Title: string;
      card1Desc: string;
      card2Title: string;
      card2Desc: string;
      card3Title: string;
      card3Desc: string;
    };
    askHighlights: {
      heading: string;
      card1Title: string;
      card1Desc: string;
      card2Title: string;
      card2Desc: string;
      card3Title: string;
      card3Desc: string;
    };
    emergencyHighlights: {
      heading: string;
      card1Title: string;
      card1Desc: string;
      card2Title: string;
      card2Desc: string;
      card3Title: string;
      card3Desc: string;
    };
  };
  footer: {
    sihNote: string;
    techStack: string;
    copyright: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    brand: {
      title: "GaganDrishti",
      sub: "गगनदृष्टि",
      badge: "SIH 2026 Prototype",
      tagline: "Bilingual Weather Intelligence for Citizens & Farmers",
    },
    header: {
      liveFeeds: "Live Feeds",
      systemActive: "Operational",
      istClock: "IST",
      selectCity: "Select City",
      coordinates: "Coordinates",
      toggleTheme: "Switch Theme",
      toggleLanguage: "Switch Language",
      lightMode: "Light",
      darkMode: "Dark",
      searchCity: "Choose monitoring location...",
    },
    navigation: {
      citizen: {
        label: "Citizen",
        sub: "नागरिक",
        desc: "Localized weather intelligence, air quality advisories, and daily mobility planning.",
      },
      farmer: {
        label: "Farmer",
        sub: "किसान",
        desc: "Agro-meteorological advisories, crop advisory calendars, and irrigation risk alerts.",
      },
      alerts: {
        label: "Weather Alerts",
        sub: "मौसम चेतावनी",
        desc: "Severe weather early warnings, IMD radar watch, and high-wind / thunderstorm alerts.",
      },
      ask: {
        label: "Ask GaganDrishti",
        sub: "गगनदृष्टि से पूछें",
        desc: "Interactive weather assistant delivering tailored meteorological answers.",
      },
      emergency: {
        label: "Emergency",
        sub: "आपातकालीन सेवा",
        desc: "SOS protocols, disaster management helplines, and civil defense contingency plans.",
      },
    },
    section: {
      activeLocation: "Active Location",
      coordinatesLabel: "Fixed GPS Coordinates",
      statusBadge: "Live Feed Integration Ready",
      moduleStatusTitle: "Intelligence Module State",
      architectureTitle: "Architectural & Data Compliance",
      sectionKey: "Module Key",
      languageMode: "Active Locale",
      streamState: "Data Feed State",
      streamStateValue: "Pending Live Provider Handshake",
      authAndDb: "State Architecture",
      authAndDbValue: "Global React Context & Local Persistence",
      readinessDescription:
        "Engineered strictly in compliance with SIH 2026 jury standards. No synthetic or mock weather metrics are fabricated. All 10 monitoring cities are mapped with exact fixed coordinates ready for verified radar and IMD open API ingest.",
      citizenHighlights: {
        heading: "Citizen Weather Capabilities",
        card1Title: "Hourly Micro-Cast",
        card1Desc: "Targeted localized forecasts for daily commuting, outdoor activity, and schools.",
        card2Title: "Heatwave & UV Index",
        card2Desc: "Real-time thermal stress index with hydration and sun exposure recommendations.",
        card3Title: "Air Quality & Smog",
        card3Desc: "Bilingual respiratory advisories for children, seniors, and active commuters.",
      },
      farmerHighlights: {
        heading: "Agricultural Meteorological Intelligence",
        card1Title: "Crop Sowing & Harvesting Advisories",
        card1Desc: "Phenological stage alerts mapped to regional precipitation windows.",
        card2Title: "Soil Moisture & Evapotranspiration",
        card2Desc: "Precision irrigation guidance to prevent water logging and drought stress.",
        card3Title: "Frost & Hailstorm Warnings",
        card3Desc: "Pre-emptive agro-protection notices sent before severe convective storms.",
      },
      alertsHighlights: {
        heading: "Early Warning & Disaster Watch",
        card1Title: "Severe Thunderstorm Radar",
        card1Desc: "Color-coded severity tiers: Yellow (Watch), Orange (Alert), Red (Warning).",
        card2Title: "Flash Flood & Cloudburst Alert",
        card2Desc: "Drainage basin risk levels and inundation warnings for low-lying areas.",
        card3Title: "Cyclone & Gale Advisories",
        card3Desc: "Coastal and inland wind speed thresholds with infrastructure cautions.",
      },
      askHighlights: {
        heading: "Conversational Meteorological Assistant",
        card1Title: "Bilingual Natural Queries",
        card1Desc: "Ask in plain English or Hindi for immediate farming or citizen weather guidance.",
        card2Title: "Context-Aware City State",
        card2Desc: "All responses automatically adapt to the currently selected city's geography.",
        card3Title: "Action-Oriented Insights",
        card3Desc: "Provides clear, direct advice on whether to irrigate, travel, or seek shelter.",
      },
      emergencyHighlights: {
        heading: "Civil Defense & Emergency Response",
        card1Title: "District Disaster Authority (DDMA)",
        card1Desc: "Direct helpline linkages and nearest relief shelter coordination directory.",
        card2Title: "Flood & Landslide Protocols",
        card2Desc: "Step-by-step survival guidelines verified by national disaster agencies.",
        card3Title: "Power & Infrastructure Outage Status",
        card3Desc: "Monitored utility reliability notices during severe atmospheric events.",
      },
    },
    footer: {
      sihNote: "Smart India Hackathon (SIH) 2026 Prototype — Ministry & Jury Demonstration Shell",
      techStack: "Next.js App Router • TypeScript • Tailwind CSS • Lucide React",
      copyright: "GaganDrishti Weather Intelligence Platform. All rights reserved.",
    },
  },
  hi: {
    brand: {
      title: "गगनदृष्टि",
      sub: "GaganDrishti",
      badge: "एस.आई.एच 2026 प्रोटोटाइप",
      tagline: "नागरिकों और किसानों के लिए द्विभाषी मौसम आसूचना प्रणाली",
    },
    header: {
      liveFeeds: "लाइव फीड्स",
      systemActive: "सक्रिय प्रणाली",
      istClock: "भा.मा.स (IST)",
      selectCity: "शहर चुनें",
      coordinates: "निर्देशांक",
      toggleTheme: "थीम बदलें",
      toggleLanguage: "भाषा बदलें",
      lightMode: "लाइट",
      darkMode: "डार्क",
      searchCity: "निगरानी क्षेत्र चुनें...",
    },
    navigation: {
      citizen: {
        label: "नागरिक",
        sub: "Citizen",
        desc: "दैनिक आवागमन, वायु गुणवत्ता और नागरिक मौसम परामर्श।",
      },
      farmer: {
        label: "किसान",
        sub: "Farmer",
        desc: "कृषि-मौसम सलाह, फसल सुरक्षा कैलेंडर एवं सिंचाई जोखिम चेतावनी।",
      },
      alerts: {
        label: "मौसम चेतावनी",
        sub: "Weather Alerts",
        desc: "गंभीर मौसमी आपदाएं, भारी वर्षा, आंधी-तूफान एवं वज्रपात पूर्व चेतावनी।",
      },
      ask: {
        label: "गगनदृष्टि से पूछें",
        sub: "Ask GaganDrishti",
        desc: "प्राकृतिक भाषा मौसम सहायक - मौसम व कृषि संबंधी प्रश्नों के उत्तर।",
      },
      emergency: {
        label: "आपातकालीन सेवा",
        sub: "Emergency",
        desc: "आपदा प्रबंधन हेल्पलाइन, नागरिक सुरक्षा उपाय एवं आपातकालीन संपर्क।",
      },
    },
    section: {
      activeLocation: "सक्रिय स्थान",
      coordinatesLabel: "निश्चित जीपीएस निर्देशांक",
      statusBadge: "लाइव डेटा फीड संयोजन हेतु तैयार",
      moduleStatusTitle: "आसूचना मॉड्यूल स्थिति",
      architectureTitle: "वास्तुकला एवं डेटा अनुपालन",
      sectionKey: "मॉड्यूल कुंजी",
      languageMode: "सक्रिय भाषा",
      streamState: "डेटा प्रवाह स्थिति",
      streamStateValue: "लाइव मौसम सेवा हैंडशेक प्रतीक्षित",
      authAndDb: "राज्य संरचना",
      authAndDbValue: "ग्लोबल रिएक्ट संदर्भ एवं स्थानीय संचयन",
      readinessDescription:
        "एस.आई.एच 2026 मानकों के पूर्ण अनुपालन में निर्मित। कोई कृत्रिम या नकली मौसम आंकड़े प्रस्तुत नहीं किए गए हैं। सभी 10 शहर सटीक जीपीएस निर्देशांकों के साथ भारतीय मौसम विभाग (IMD) ओपन डेटा पाइपलाइन हेतु तैयार हैं।",
      citizenHighlights: {
        heading: "नागरिक मौसम सुविधाएं",
        card1Title: "घंटेवार स्थानीय पूर्वानुमान",
        card1Desc: "दैनिक यात्रा, स्कूली बच्चों और बाहरी गतिविधियों हेतु सटीक पूर्वानुमान।",
        card2Title: "लू एवं यूवी सूचकांक परामर्श",
        card2Desc: "गर्मी के तनाव से बचाव, जल सेवन एवं धूप से सुरक्षा के वास्तविक उपाय।",
        card3Title: "वायु गुणवत्ता एवं स्मॉग सूचकांक",
        card3Desc: "वरिष्ठ नागरिकों और बच्चों के स्वास्थ्य के लिए स्पष्ट द्विभाषी स्वास्थ्य सलाह।",
      },
      farmerHighlights: {
        heading: "कृषि-मौसम आसूचना क्षमताएं",
        card1Title: "बुवाई एवं कटाई कृषि सलाह",
        card1Desc: "वर्षा के चक्र और मिट्टी की नमी के अनुसार फसलों हेतु चरणबद्ध मार्गदर्शन।",
        card2Title: "मिट्टी नमी एवं वाष्पोत्सर्जन",
        card2Desc: "जलभराव और सूखे से बचाव हेतु सटीक सिंचाई समय-सारणी।",
        card3Title: "ओलावृष्टि एवं पाला पूर्व चेतावनी",
        card3Desc: "फसल क्षति से बचाव हेतु प्राकृतिक आपदा से पूर्व त्वरित अलर्ट।",
      },
      alertsHighlights: {
        heading: "आपदा पूर्व चेतावनी निगरानी",
        card1Title: "तूफान एवं वज्रपात रडार",
        card1Desc: "रंग-आधारित चेतावनी स्तर: पीला (निगरानी), नारंगी (सतर्कता), लाल (चेतावनी)।",
        card2Title: "अचानक बाढ़ एवं बादल फटना",
        card2Desc: "जल निकासी बेसिन जोखिम एवं निचले इलाकों हेतु जलभराव चेतावनी।",
        card3Title: "चक्रवात एवं तेज आंधी चेतावनी",
        card3Desc: "तटीय व मैदानी क्षेत्रों में वायु वेग सीमा व सुरक्षित आश्रय निर्देश।",
      },
      askHighlights: {
        heading: "संवादात्मक मौसम सहायक",
        card1Title: "सरल भाषा में प्रश्न पूछें",
        card1Desc: "मौसम और खेती संबंधी कोई भी प्रश्न हिंदी या अंग्रेजी में पूछें।",
        card2Title: "चयनित शहर के अनुकूल उत्तर",
        card2Desc: "सभी उत्तर आपके वर्तमान में चुने गए शहर के भूगोल के अनुरूप होंगे।",
        card3Title: "कार्रवाई योग्य परामर्श",
        card3Desc: "सिंचाई करनी चाहिए या नहीं, यात्रा सुरक्षित है या नहीं - स्पष्ट सलाह।",
      },
      emergencyHighlights: {
        heading: "नागरिक सुरक्षा एवं आपदा मोचन",
        card1Title: "जिला आपदा प्रबंधन प्राधिकरण (DDMA)",
        card1Desc: "सीधे संपर्क नंबर, राहत शिविर सूची एवं आपातकालीन नियंत्रण कक्ष।",
        card2Title: "बाढ़ व भूस्खलन सुरक्षा मानक",
        card2Desc: "राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA) द्वारा प्रमाणित सुरक्षा दिशानिर्देश।",
        card3Title: "विद्युत व आवश्यक सेवाएं स्थिति",
        card3Desc: "गंभीर मौसम के दौरान बुनियादी ढांचे और संचार सेवा स्थिति।",
      },
    },
    footer: {
      sihNote: "स्मार्ट इंडिया हैकाथॉन (SIH) 2026 प्रोटोटाइप — मंत्रालय एवं जूरी प्रदर्शन शेल",
      techStack: "Next.js ऐप रूटर • टाइपस्क्रिप्ट • टेलविंड सीएसएस • ल्यूसिड रिएक्ट",
      copyright: "गगनदृष्टि मौसम आसूचना मंच। सर्वाधिकार सुरक्षित।",
    },
  },
};
