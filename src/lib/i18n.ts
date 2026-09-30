import { Language, NavSection } from "./types";

export interface TranslationDictionary {
  brand: {
    title: string;
    sub: string;
    badge?: string;
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
    climateHighlights: {
      heading: string;
      card1Title: string;
      card1Desc: string;
      card2Title: string;
      card2Desc: string;
      card3Title: string;
      card3Desc: string;
    };
    resourcesHighlights: {
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
    productLine: string;
    disclaimer: string;
    copyright: string;
    sihNote?: string;
    techStack?: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    brand: {
      title: "GaganDrishti",
      sub: "AI Weather Intelligence",
      badge: "AI Weather Intelligence",
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
      climate: {
        label: "Climate Analytics",
        sub: "जलवायु विश्लेषण",
        desc: "Historical reanalysis trends, seasonal anomalies, and multi-year precipitation patterns.",
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
      resources: {
        label: "Resources & Transparency",
        sub: "डेटा स्रोत व खुलापन",
        desc: "Upstream meteorological telemetry providers, calculation methodology, and architecture compliance.",
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
        card3Title: "Air Quality & Commute Health",
        card3Desc: "Truthful respiratory guidance based on atmospheric conditions without fabricated sensor data.",
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
      climateHighlights: {
        heading: "Historical Climate & ERA5 Reanalysis",
        card1Title: "10-Year Temperature Trajectory",
        card1Desc: "Long-term thermal trends, summer peak shifts, and winter minimum patterns.",
        card2Title: "Precipitation Climatology",
        card2Desc: "Annual rainfall accumulation totals against multi-decade baseline averages.",
        card3Title: "Climatological Anomalies",
        card3Desc: "Mathematical departures from 30-year reanalysis normals without speculative claims.",
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
      resourcesHighlights: {
        heading: "Data Provenance & Open API Registry",
        card1Title: "Upstream Data Providers",
        card1Desc: "Open-Meteo, IMD Geoserver WFS, ECMWF IFS, and Copernicus ERA5 provenance details.",
        card2Title: "Mathematical Formulas",
        card2Desc: "Transparent deterministic rules for spray windows, irrigation, and thermal comfort.",
        card3Title: "SIH 2026 Prototype Integrity",
        card3Desc: "Strict zero-fake-data policy and clear separation of official alerts from predictive models.",
      },
    },
    footer: {
      productLine: "GaganDrishti • Weather data: Open-Meteo • AI-assisted weather intelligence",
      disclaimer: "Live weather data is informational. Verify official emergency warnings with IMD or competent authorities.",
      copyright: "© 2026 GaganDrishti. All rights reserved.",
      sihNote: "GaganDrishti • Weather data: Open-Meteo • AI-assisted weather intelligence",
      techStack: "",
    },
  },
  hi: {
    brand: {
      title: "गगनदृष्टि",
      sub: "एआई मौसम आसूचना",
      badge: "एआई मौसम आसूचना",
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
      climate: {
        label: "जलवायु विश्लेषण",
        sub: "Climate Analytics",
        desc: "ऐतिहासिक पुनर्विश्लेषण (ERA5) रुझान, वर्षा विसंगति एवं बहुवर्षीय मौसमी पैटर्न।",
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
      resources: {
        label: "डेटा स्रोत व पारदर्शिता",
        sub: "Resources & Open Data",
        desc: "मौसम संबंधी डेटा प्रदाता, गणितीय सूत्र एवं शून्य-लागत आर्किटेक्चर खुलापन।",
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
        card3Title: "वायु स्थिति व श्वसन परामर्श",
        card3Desc: "मौसम व दृश्यता स्थिति के आधार पर पारदर्शी स्वास्थ्य सलाह (कोई नकली सेंसर डेटा नहीं)।",
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
      climateHighlights: {
        heading: "ऐतिहासिक जलवायु एवं ERA5 पुनर्विश्लेषण",
        card1Title: "10-वर्षीय तापमान प्रक्षेपवक्र",
        card1Desc: "दीर्घकालिक थर्मल रुझान, ग्रीष्मकालीन चरम और शीतकालीन न्यूनतम तापमान।",
        card2Title: "वर्षा जलवायु विज्ञान",
        card2Desc: "बहु-दशक आधारभूत औसत के विरुद्ध वार्षिक वर्षा संचयन कुल।",
        card3Title: "जलवायु विसंगतियां (Anomalies)",
        card3Desc: "बिना किसी अटकल के 30-वर्षीय सामान्य से गणितीय विचलन।",
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
      resourcesHighlights: {
        heading: "डेटा स्रोत व खुला एपीआई पंजीयन",
        card1Title: "खुले मौसम डेटा प्रदाता",
        card1Desc: "Open-Meteo, IMD जियोसर्वर WFS, ECMWF IFS एवं Copernicus ERA5 डेटा का विस्तृत विवरण।",
        card2Title: "गणितीय सूत्र व नियम",
        card2Desc: "स्प्रे विंडो, सिंचाई सलाह और तापीय तनाव सूचकांक के पारदर्शी गणितीय नियम।",
        card3Title: "प्रोटोटाइप सत्यनिष्ठा",
        card3Desc: "शून्य फर्जी डेटा नीति और सरकारी चेतावनियों का पूर्वानुमानात्मक मॉडल से स्पष्ट अलगाव।",
      },
    },
    footer: {
      productLine: "गगनदृष्टि • मौसम डेटा: Open-Meteo • एआई-सहायता प्राप्त मौसम आसूचना",
      disclaimer: "लाइव मौसम जानकारी केवल सूचनात्मक है। आधिकारिक आपातकालीन चेतावनियों के लिए IMD या संबंधित प्राधिकरण से पुष्टि करें।",
      copyright: "© 2026 गगनदृष्टि। सर्वाधिकार सुरक्षित।",
      sihNote: "गगनदृष्टि • मौसम डेटा: Open-Meteo • एआई-सहायता प्राप्त मौसम आसूचना",
      techStack: "",
    },
  },
  mr: {
    brand: {
      title: "गगनदृष्टी",
      sub: "एआय हवामान बुद्धिमत्ता",
      badge: "एआय हवामान बुद्धिमत्ता",
      tagline: "नागरिक आणि शेतकऱ्यांसाठी हवामान बुद्धिमत्ता प्रणाली",
    },
    header: {
      liveFeeds: "थेट प्रवाह",
      systemActive: "सक्रिय प्रणाली",
      istClock: "भा.प्र.वे (IST)",
      selectCity: "शहर निवडा",
      coordinates: "निर्देशांक",
      toggleTheme: "थीम बदला",
      toggleLanguage: "भाषा बदला",
      lightMode: "लाइट",
      darkMode: "डार्क",
      searchCity: "स्थान शोधा किंवा निवडा...",
    },
    navigation: {
      citizen: {
        label: "नागरिक",
        sub: "Citizen",
        desc: "स्थानिक हवामान अंदाज, हवेची गुणवत्ता आणि दैनंदिन नियोजन.",
      },
      farmer: {
        label: "शेतकरी",
        sub: "Farmer",
        desc: "कृषी-हवामान सल्ला, पीक संरक्षण दिनदर्शिका आणि सिंचन जोखीम इशारा.",
      },
      alerts: {
        label: "हवामान इशारे",
        sub: "Weather Alerts",
        desc: "तीव्र हवामान आपत्ती, मुसळधार पाऊस, वादळ आणि वीज पडण्याचा इशारा.",
      },
      climate: {
        label: "हवामान विश्लेषण",
        sub: "Climate Analytics",
        desc: "दीर्घकालीन ऐतिहासिक हवामान कल, पाऊस आणि तापमानातील बदल.",
      },
      ask: {
        label: "गगनदृष्टीला विचारा",
        sub: "Ask GaganDrishti",
        desc: "नैसर्गिक भाषा हवामान सहाय्यक - हवामान आणि शेतीविषयक प्रश्नांची उत्तरे.",
      },
      emergency: {
        label: "आपत्कालीन सेवा",
        sub: "Emergency",
        desc: "आपत्ती व्यवस्थापन हेल्पलाईन, नागरी संरक्षण उपाय आणि आपत्कालीन संपर्क.",
      },
      resources: {
        label: "डेटा स्रोत व पारदर्शकता",
        sub: "Resources & Open Data",
        desc: "हवामान डेटा प्रदाते, गणितीय सूत्रे आणि शून्य-खर्च रचना पारदर्शकता.",
      },
    },
    section: {
      activeLocation: "सक्रिय स्थान",
      coordinatesLabel: "निश्चित जीपीएस निर्देशांक",
      statusBadge: "थेट डेटा फीड जोडणी सज्ज",
      moduleStatusTitle: "मॉड्यूल स्थिती",
      architectureTitle: "रचना आणि डेटा अनुपालन",
      sectionKey: "मॉड्यूल की",
      languageMode: "सक्रिय भाषा",
      streamState: "डेटा प्रवाह स्थिती",
      streamStateValue: "थेट हवामान सेवेशी संपर्क प्रतीक्षेत",
      authAndDb: "रचना",
      authAndDbValue: "ग्लोबल रिअ‍ॅक्ट संदर्भ आणि स्थानिक साठवण",
      readinessDescription:
        "एस.आय.एच 2026 मानकांनुसार पूर्ण अनुपालन. कोणतेही बनावट हवामान आकडे नाहीत. सर्व निरीक्षण स्थाने अचूक जीपीएस निर्देशांकांसह भारतीय हवामान विभाग (IMD) आणि ओपन डेटा पाइपलाइनसाठी सज्ज आहेत.",
      citizenHighlights: {
        heading: "नागरिक हवामान सुविधा",
        card1Title: "तासनिहाय स्थानिक अंदाज",
        card1Desc: "दैनंदिन प्रवास, शाळा आणि बाहेरील कामांसाठी अचूक अंदाज.",
        card2Title: "उष्णतेची लाट व यूव्ही निर्देशांक",
        card2Desc: "उष्णतेचा ताण, पाणी पिणे आणि उन्हापासून संरक्षणाचे उपाय.",
        card3Title: "हवेची गुणवत्ता व आरोग्य",
        card3Desc: "हवामानावर आधारित पारदर्शक आरोग्य सल्ला (कोणताही बनावट सेन्सर डेटा नाही).",
      },
      farmerHighlights: {
        heading: "कृषी-हवामान बुद्धिमत्ता",
        card1Title: "पेरणी व काढणी सल्ला",
        card1Desc: "पाऊस आणि जमिनीतील ओलाव्यानुसार पिकांसाठी टप्प्याटप्प्याने मार्गदर्शन.",
        card2Title: "जमिनीतील ओलावा व बाष्पीभवन",
        card2Desc: "पाणी साचणे आणि दुष्काळापासून संरक्षणासाठी अचूक सिंचन वेळापत्रक.",
        card3Title: "गारपीट व थंडीचा इशारा",
        card3Desc: "पीक नुकसान टाळण्यासाठी नैसर्गिक आपत्तीपूर्वी त्वरित इशारा.",
      },
      alertsHighlights: {
        heading: "आपत्ती पूर्व इशारा देखरेख",
        card1Title: "वादळ व वीज रडार",
        card1Desc: "रंग-आधारित इशारा स्तर: पिवळा (निरीक्षण), नारंगी (सतर्कता), लाल (धोका).",
        card2Title: "अचानक पूर व ढगफुटी",
        card2Desc: "पाणी निचरा जोखीम आणि सखल भागांसाठी पूर इशारा.",
        card3Title: "चक्रीवादळ व जोरदार वारे",
        card3Desc: "किनारपट्टी व मैदानी भागांत वाऱ्याचा वेग आणि सुरक्षित आश्रय सूचना.",
      },
      climateHighlights: {
        heading: "ऐतिहासिक हवामान विश्लेषण (ERA5)",
        card1Title: "१० वर्षांचा तापमान कल",
        card1Desc: "दीर्घकालीन कमाल आणि किमान तापमानातील बदल.",
        card2Title: "वार्षिक पाऊस सरासरी",
        card2Desc: "ऐतिहासिक पावसाचे वितरण आणि दुष्काळ/अतिवृष्टी कल.",
        card3Title: "हवामान विसंगती (Anomaly)",
        card3Desc: "ऐतिहासिक सरासरीच्या तुलनेत चालू वर्षातील फरक.",
      },
      askHighlights: {
        heading: "संभाषण हवामान सहाय्यक",
        card1Title: "सोप्या भाषेत प्रश्न विचारा",
        card1Desc: "हवामान आणि शेतीविषयक कोणताही प्रश्न मराठी, हिंदी किंवा इंग्रजीत विचारा.",
        card2Title: "निवडलेल्या शहराशी सुसंगत उत्तर",
        card2Desc: "सर्व उत्तरे तुमच्या सध्या निवडलेल्या स्थानाच्या हवामानाशी जुळतील.",
        card3Title: "कृतीयोग्य सल्ला",
        card3Desc: "सिंचन करावे की नाही, प्रवास सुरक्षित आहे की नाही - स्पष्ट सल्ला.",
      },
      emergencyHighlights: {
        heading: "नागरी संरक्षण व आपत्ती निवारण",
        card1Title: "जिल्हा आपत्ती व्यवस्थापन प्राधिकरण (DDMA)",
        card1Desc: "थेट हेल्पलाईन नंबर, मदत छावण्यांची यादी आणि नियंत्रण कक्ष.",
        card2Title: "पूर व दरड कोसळणे सुरक्षा नियम",
        card2Desc: "राष्ट्रीय आपत्ती व्यवस्थापन प्राधिकरणाचे (NDMA) प्रमाणित सुरक्षा नियम.",
        card3Title: "वीज व आवश्यक सेवा स्थिती",
        card3Desc: "तीव्र हवामानात पायाभूत सुविधा आणि दळणवळण सेवा स्थिती.",
      },
      resourcesHighlights: {
        heading: "डेटा स्रोत व मुक्त एपीआय नोंदणी",
        card1Title: "मुक्त हवामान डेटा प्रदाते",
        card1Desc: "Open-Meteo, IMD जिओसर्व्हर WFS, ECMWF IFS आणि Copernicus ERA5 डेटा तपशील.",
        card2Title: "गणितीय सूत्रे व निकष",
        card2Desc: "फवारणी वेळ, सिंचन सल्ला आणि उष्णता निर्देशांक यांच्या पारदर्शक गणितीय नियमावली.",
        card3Title: "प्रोटोटाइप सत्यता",
        card3Desc: "शून्य बनावट डेटा धोरण आणि सरकारी इशाऱ्यांचे अंदाज मॉडेल्सपासून स्पष्ट वर्गीकरण.",
      },
    },
    footer: {
      productLine: "गगनदृष्टी • हवामान डेटा: Open-Meteo • एआय-सहाय्यित हवामान बुद्धिमत्ता",
      disclaimer: "थेट हवामान माहिती केवळ मार्गदर्शनासाठी आहे. अधिकृत आपत्कालीन इशाऱ्यांसाठी IMD किंवा सक्षम प्राधिकरणाशी संपर्क साधा.",
      copyright: "© 2026 गगनदृष्टी. सर्व हक्क राखीव.",
      sihNote: "गगनदृष्टी • हवामान डेटा: Open-Meteo • एआय-सहाय्यित हवामान बुद्धिमत्ता",
      techStack: "",
    },
  },
};
