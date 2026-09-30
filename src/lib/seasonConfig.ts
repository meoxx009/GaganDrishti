import { SeasonId } from "./crops";

export interface SeasonInfo {
  id: SeasonId;
  nameEn: string;
  nameHi: string;
  subTitleEn: string;
  subTitleHi: string;
  periodEn: string;
  periodHi: string;
  descriptionEn: string;
  descriptionHi: string;
}

export const SEASONS: Record<SeasonId, SeasonInfo> = {
  kharif: {
    id: "kharif",
    nameEn: "Kharif",
    nameHi: "खरीफ",
    subTitleEn: "Monsoon Season",
    subTitleHi: "मानसून कालीन फसलें",
    periodEn: "June – October",
    periodHi: "जून से अक्टूबर",
    descriptionEn: "Sown at the onset of monsoon rains; heavily dependent on southwest monsoon patterns.",
    descriptionHi: "मानसून की शुरुआत के साथ बोई जाने वाली फसलें; दक्षिण-पश्चिम मानसूनी वर्षा पर निर्भर।",
  },
  rabi: {
    id: "rabi",
    nameEn: "Rabi",
    nameHi: "रबी",
    subTitleEn: "Winter Season",
    subTitleHi: "शीतकालीन फसलें",
    periodEn: "October / November – March / April",
    periodHi: "अक्टूबर/नवंबर से मार्च/अप्रैल",
    descriptionEn: "Sown in winter after the monsoon retreat; harvested in spring; thrives in cool vegetative conditions.",
    descriptionHi: "मानसून की समाप्ति के बाद सर्दियों में बोई जाने वाली फसलें; बसंत में कटाई; ठंड में अच्छी बढ़वार।",
  },
  zaid: {
    id: "zaid",
    nameEn: "Zaid",
    nameHi: "जायद",
    subTitleEn: "Summer Season",
    subTitleHi: "ग्रीष्मकालीन फसलें",
    periodEn: "March / April – June",
    periodHi: "मार्च/अप्रैल से जून",
    descriptionEn: "Short warm-season crops grown between Rabi harvest and Kharif sowing with assured irrigation.",
    descriptionHi: "रबी की कटाई और खरीफ की बुवाई के बीच गर्मी में उगाई जाने वाली अल्पकालिक फसलें; सुनिश्चित सिंचाई आवश्यक।",
  },
};

/**
 * Deterministically suggest the active Indian crop season based on the calendar month in Asia/Kolkata.
 * 
 * Truthfulness rule:
 * Open-Meteo does NOT provide agricultural crop seasons.
 * This helper calculates the agricultural season from the calendar date in India (IST):
 * - June (month 6) through October (month 10): Kharif
 * - November (month 11) through March (month 3): Rabi
 * - April (month 4) through May (month 5): Zaid
 */
export function getSuggestedSeason(date: Date = new Date()): SeasonId {
  // Format month in Asia/Kolkata timezone to avoid client UTC discrepancies
  const istFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    month: "numeric",
  });
  const month = parseInt(istFormatter.format(date), 10);

  // June (6) to October (10) -> Kharif
  if (month >= 6 && month <= 10) {
    return "kharif";
  }

  // April (4) to May (5) -> Zaid
  if (month >= 4 && month <= 5) {
    return "zaid";
  }

  // November (11), December (12), January (1), February (2), March (3) -> Rabi
  return "rabi";
}
