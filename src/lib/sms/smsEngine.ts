import {
  ParsedSmsCommand,
  SmsCommandType,
  SmsExecutionResult,
} from "./smsTypes";
import {
  getFarmerByPhone,
  registerOrUpdateFarmer,
  trackFarmerSmsUsage,
  logSmsTransaction,
  normalizePhoneNumber,
} from "./smsDatabase";
import { resolveAnyIndianPincode } from "@/lib/weather/pincodeVillageDatabase";
import { fetchCityWeather } from "@/lib/weather/weatherService";
import { City } from "@/lib/types";
import { getFarmDecision, extractCropStageFromText } from "@/lib/weather/cropStageDecisionEngine";
import { getPestForecast } from "@/lib/weather/pestForecastEngine";
import { DayForecastSnapshot } from "@/lib/weather/pestForecastTypes";
import { validateSmsCommand } from "@/lib/validation/formValidationEngine";

/**
 * Truncate response to stay within single SMS (160 chars)
 */
function truncateToSingleSms(text: string, maxLength: number = 158): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 2) + "..";
}

/**
 * Parses raw incoming SMS text into command & parameters
 */
export function parseSmsText(rawSms: string): ParsedSmsCommand {
  const trimmed = (rawSms || "").trim();
  if (!trimmed) {
    return {
      raw_text: rawSms,
      command: "HELP",
      parameters: {},
    };
  }

  const tokens = trimmed.split(/\s+/);
  const firstToken = tokens[0].toUpperCase().replace(/[^A-Z0-9]/g, "");

  const params: Record<string, string> = {};

  // 1. LOCATION / PINCODE
  if (firstToken === "LOCATION" || firstToken === "LOC" || firstToken === "PIN" || firstToken === "PINCODE" || firstToken === "STHAN") {
    const pin = tokens.find((t) => /^\d{6}$/.test(t)) || tokens[1] || "";
    return {
      raw_text: rawSms,
      command: "LOCATION",
      parameters: { pincode: pin },
      pincode: pin,
    };
  }

  // 2. REGISTER / CROP REGISTRATION
  if (firstToken === "REGISTER" || firstToken === "REG" || firstToken === "PANJIKARAN") {
    const crop = tokens.slice(1).join(" ").trim() || "Soybean";
    return {
      raw_text: rawSms,
      command: "REGISTER",
      parameters: { crop },
      crop,
      isRegisteredIntent: true,
    };
  }

  // 3. WEATHER / MAUSAM
  if (firstToken === "WEATHER" || firstToken === "MAUSAM" || firstToken === "MOSAM" || firstToken === "TEMP" || firstToken === "BARISH") {
    return {
      raw_text: rawSms,
      command: "WEATHER",
      parameters: {},
    };
  }

  // 4. CROP [crop_name] STAGE [stage]
  if (firstToken === "CROP" || firstToken === "FASAL" || firstToken === "SPRAY") {
    let cropName = "Soybean";
    let stageName = "vegetative";

    // e.g. "CROP soybean STAGE flowering" or "CROP paddy"
    const lower = trimmed.toLowerCase();
    const stageIdx = lower.indexOf("stage");
    const avsthaIdx = lower.indexOf("avastha");

    if (stageIdx !== -1) {
      cropName = trimmed.substring(tokens[0].length, stageIdx).trim() || cropName;
      stageName = trimmed.substring(stageIdx + 5).trim() || stageName;
    } else if (avsthaIdx !== -1) {
      cropName = trimmed.substring(tokens[0].length, avsthaIdx).trim() || cropName;
      stageName = trimmed.substring(avsthaIdx + 7).trim() || stageName;
    } else if (tokens.length > 1) {
      cropName = tokens.slice(1).join(" ");
    }

    return {
      raw_text: rawSms,
      command: "CROP",
      parameters: { crop: cropName, stage: stageName },
      crop: cropName,
      stage: stageName,
    };
  }

  // 5. PEST / KEEDA / BIMARI
  if (firstToken === "PEST" || firstToken === "KEEDA" || firstToken === "KIDA" || firstToken === "BIMARI" || firstToken === "ROG") {
    const crop = tokens.slice(1).join(" ").trim();
    return {
      raw_text: rawSms,
      command: "PEST",
      parameters: crop ? { crop } : {},
      crop: crop || undefined,
    };
  }

  // 6. FORECAST [days]
  if (firstToken === "FORECAST" || firstToken === "ANUMAN" || firstToken === "OUTLOOK") {
    const daysToken = tokens.find((t) => /^[1-7]$/.test(t));
    const days = daysToken ? parseInt(daysToken, 10) : 7;
    return {
      raw_text: rawSms,
      command: "FORECAST",
      parameters: { days: String(days) },
      days,
    };
  }

  // 7. ALERT / CHETAVANI / WARNING
  if (firstToken === "ALERT" || firstToken === "WARNING" || firstToken === "CHETAVANI" || firstToken === "KHATRA") {
    return {
      raw_text: rawSms,
      command: "ALERT",
      parameters: {},
    };
  }

  // 8. HELP / MADAD / MENU
  if (firstToken === "HELP" || firstToken === "MADAD" || firstToken === "MENU" || firstToken === "INFO") {
    return {
      raw_text: rawSms,
      command: "HELP",
      parameters: {},
    };
  }

  // If the user just texted a 6-digit number, treat as LOCATION
  if (/^\d{6}$/.test(trimmed)) {
    return {
      raw_text: rawSms,
      command: "LOCATION",
      parameters: { pincode: trimmed },
      pincode: trimmed,
    };
  }

  return {
    raw_text: rawSms,
    command: "UNKNOWN",
    parameters: {},
  };
}

/**
 * Creates temporary virtual city object from pincode record for weather queries
 */
function createVirtualCityFromPincode(pincode: string): City {
  const loc = resolveAnyIndianPincode(pincode);
  return {
    id: `pin_${loc.pincode}`,
    nameEn: loc.village_name,
    nameHi: loc.village_name_hi,
    nameMr: loc.village_name,
    stateEn: loc.state,
    stateHi: loc.state_hi,
    stateMr: loc.state,
    lat: loc.latitude,
    lon: loc.longitude,
  };
}

/**
 * Main incoming SMS processor
 */
export async function processIncomingSms(
  rawPhone: string,
  smsText: string,
  channel: "Twilio" | "Simulator" | "Direct" = "Simulator"
): Promise<SmsExecutionResult> {
  const startTime = Date.now();
  const phone = normalizePhoneNumber(rawPhone);
  let farmer = getFarmerByPhone(phone);

  const validation = validateSmsCommand(
    smsText,
    !!farmer,
    farmer?.sms_sent_today || 0
  );

  if (!validation.is_valid) {
    const reply = validation.reply_message;
    const elapsed = Date.now() - startTime;
    logSmsTransaction({
      phone_number: phone,
      incoming_sms: smsText,
      command_parsed: validation.matched_command || "INVALID",
      parameters: "",
      outgoing_sms: reply,
      status: reply.includes("limit") ? "Rate_Limited" : "Invalid_Command",
      response_time_ms: elapsed,
      channel,
    });
    return {
      reply,
      command: (validation.matched_command as any) || "UNKNOWN",
      status: reply.includes("limit") ? "Rate_Limited" : "Invalid_Command",
      farmer: farmer || null,
      execution_time_ms: elapsed,
      char_count: reply.length,
      fits_single_sms: reply.length <= 160,
    };
  }

  const parsed = parseSmsText(smsText);

  // Handle Unregistered Phone
  if (!farmer) {
    if (parsed.command === "LOCATION") {
      const pin = parsed.pincode || "462001";
      const resolved = resolveAnyIndianPincode(pin);
      farmer = registerOrUpdateFarmer(phone, {
        pincode: resolved.pincode,
        village_name: resolved.village_name,
        district: resolved.district,
        state: resolved.state,
        primary_crop: "Soybean",
      });

      const reply = truncateToSingleSms(
        `✅ ${resolved.village_name} (${resolved.pincode}, ${resolved.district}) सेट हुआ। अब सटीक मौसम मिलेगा। WEATHER या CROP भेजें।`
      );

      const elapsed = Date.now() - startTime;
      logSmsTransaction({
        phone_number: phone,
        incoming_sms: smsText,
        command_parsed: "LOCATION",
        parameters: `pincode=${resolved.pincode}`,
        outgoing_sms: reply,
        status: "Success",
        response_time_ms: elapsed,
        channel,
      });

      return {
        reply,
        command: "LOCATION",
        status: "Success",
        farmer,
        execution_time_ms: elapsed,
        char_count: reply.length,
        fits_single_sms: reply.length <= 160,
      };
    } else if (parsed.command === "HELP") {
      const reply =
        "Commands: CROP [crop] STAGE [stage] | WEATHER | FORECAST 7 | PEST | ALERT | REGISTER [crop] | LOCATION [pincode]";
      const elapsed = Date.now() - startTime;
      logSmsTransaction({
        phone_number: phone,
        incoming_sms: smsText,
        command_parsed: "HELP",
        parameters: "",
        outgoing_sms: reply,
        status: "Success",
        response_time_ms: elapsed,
        channel,
      });
      return {
        reply,
        command: "HELP",
        status: "Success",
        farmer: null,
        execution_time_ms: elapsed,
        char_count: reply.length,
        fits_single_sms: true,
      };
    } else {
      // Prompt user to register location
      const reply =
        "First SMS: LOCATION [pincode] (जैसे: LOCATION 462001) भेजें ताकि आपके गांव का मौसम मिल सके। या HELP भेजें।";
      const elapsed = Date.now() - startTime;
      logSmsTransaction({
        phone_number: phone,
        incoming_sms: smsText,
        command_parsed: "UNREGISTERED",
        parameters: "",
        outgoing_sms: reply,
        status: "Invalid_Command",
        response_time_ms: elapsed,
        channel,
      });
      return {
        reply,
        command: "UNKNOWN",
        status: "Invalid_Command",
        farmer: null,
        execution_time_ms: elapsed,
        char_count: reply.length,
        fits_single_sms: true,
      };
    }
  }

  // Registered Farmer: Check Daily Quota Rate Limit
  const quota = trackFarmerSmsUsage(phone);
  if (!quota.allowed) {
    const reply = "Daily limit (5 SMS) reached. कल फिर भेजें या आपातकाल में ग्राम कृषि मित्र से संपर्क करें।";
    const elapsed = Date.now() - startTime;
    logSmsTransaction({
      phone_number: phone,
      incoming_sms: smsText,
      command_parsed: parsed.command,
      parameters: "rate_limited",
      outgoing_sms: reply,
      status: "Rate_Limited",
      response_time_ms: elapsed,
      channel,
    });
    return {
      reply,
      command: parsed.command,
      status: "Rate_Limited",
      farmer,
      execution_time_ms: elapsed,
      char_count: reply.length,
      fits_single_sms: true,
    };
  }

  // Execute Commands
  let reply = "";
  let status: "Success" | "Error" | "Invalid_Command" = "Success";
  const pin = farmer.pincode || "462001";
  const virtualCity = createVirtualCityFromPincode(pin);

  try {
    switch (parsed.command) {
      case "LOCATION": {
        const newPin = parsed.pincode || pin;
        const resolved = resolveAnyIndianPincode(newPin);
        farmer = registerOrUpdateFarmer(phone, {
          pincode: resolved.pincode,
          village_name: resolved.village_name,
          district: resolved.district,
          state: resolved.state,
        });
        reply = truncateToSingleSms(
          `✅ ${resolved.village_name} (${resolved.pincode}, ${resolved.district}) सेट किया। अब सटीक मौसम मिलेगा। WEATHER भेजें।`
        );
        break;
      }

      case "REGISTER": {
        const crop = parsed.crop || "Soybean";
        farmer = registerOrUpdateFarmer(phone, { primary_crop: crop });
        reply = truncateToSingleSms(
          `✅ ${crop} registered। हर दिन सलाह पाएं। WEATHER या CROP भेजें। Menu: HELP`
        );
        break;
      }

      case "WEATHER": {
        const weather = await fetchCityWeather(virtualCity);
        if (!weather) {
          reply = `${farmer.village_name}: मौसम सेवा अस्थाई रूप से अनुपलब्ध है। कृपया कुछ देर बाद WEATHER भेजें।`;
          break;
        }
        const cur = weather.current;
        const rainProb = weather.daily[0]?.precipitationProbabilityMax ?? 0;
        const rainMm = weather.daily[0]?.precipitationSum ?? 0;
        const advice = rainProb >= 60 ? "बारिश संभावना, छिड़काव टालें।" : "मौसम सामान्य है, कार्य जारी रखें।";

        reply = truncateToSingleSms(
          `${farmer.village_name}: ${cur.temperature}°C, ${rainProb}% बारिश (${rainMm}mm), हवा ${cur.windSpeed}km/h। ${advice}`
        );
        break;
      }

      case "CROP": {
        const weather = await fetchCityWeather(virtualCity);
        const cropToUse = validation.normalized_params?.crop || parsed.crop || farmer.primary_crop || "Soybean";
        const stageNum = extractCropStageFromText(validation.normalized_params?.stage || parsed.stage || "vegetative").stageNumber || 2;

        const curTemp = weather?.current?.temperature ?? 28;
        const curHum = weather?.current?.relativeHumidity ?? 65;
        const curWind = weather?.current?.windSpeed ?? 10;
        const curGust = weather?.current?.windGusts ?? 15;
        const rainProb = weather?.daily?.[0]?.precipitationProbabilityMax ?? 15;
        const rainSum = weather?.daily?.[0]?.precipitationSum ?? 0;

        const decision = getFarmDecision({
          crop_name: cropToUse,
          crop_stage: stageNum,
          current_temperature: curTemp,
          current_humidity: curHum,
          rain_probability: rainProb,
          rain_sum_24h: rainSum,
          current_wind_speed: curWind,
          current_wind_gusts: curGust,
        });

        const decText = decision.decision === "DON'T SPRAY" ? "आज SPRAY मत करो" : decision.decision === "CAUTION SPRAY" ? "सावधानी से SPRAY करें" : "SPRAY अनुकूल है";
        const actionText = decision.recommended_action_hi[0] ? decision.recommended_action_hi[0].substring(0, 45) : decision.best_window_hi;

        const prefix = validation.assumption_note ? `${validation.assumption_note} ` : "";
        reply = truncateToSingleSms(
          `${prefix}${decision.crop} (${decision.stage_hi}): ${decText}! ${actionText}। Rain: ${rainProb}%।`
        );
        break;
      }

      case "PEST": {
        const weather = await fetchCityWeather(virtualCity);
        const cropToUse = parsed.crop || farmer.primary_crop || "Soybean";

        const snapshots: DayForecastSnapshot[] = (weather?.daily || []).slice(0, 7).map((d, i) => ({
          dayIndex: i,
          dateIso: d.date || `Day ${i + 1}`,
          tempMin: d.tempMin,
          tempMax: d.tempMax,
          tempAvg: Math.round(((d.tempMin + d.tempMax) / 2) * 10) / 10,
          humidityAvg: weather?.current?.relativeHumidity ?? 70,
          rainProbability: d.precipitationProbabilityMax ?? 10,
          precipitationMm: d.precipitationSum ?? 0,
          windSpeed: weather?.current?.windSpeed ?? 10,
        }));

        const pestOutput = getPestForecast({
          crop_name: cropToUse,
          crop_stage: "Vegetative / Flowering",
          daily_forecast: snapshots,
        });

        if (pestOutput.predicted_alerts.length > 0) {
          const top = pestOutput.predicted_alerts[0];
          const chem = top.recommended_chemicals.split(",")[0] || "कीटनाशक";
          reply = truncateToSingleSms(
            `${top.risk_level} RISK: ${top.pest_disease_name_hi} (${top.predicted_date_label})। Dawa: ${chem}। Urgency: ${top.action_urgency}।`
          );
        } else {
          reply = truncateToSingleSms(
            `LOW RISK: अगले 7 दिनों में ${pestOutput.crop_hi} पर किसी गंभीर कीट प्रकोप का संकेत नहीं। खेत निगरानी रखें।`
          );
        }
        break;
      }

      case "FORECAST": {
        const weather = await fetchCityWeather(virtualCity);
        const days = parsed.days || 7;
        const dailySlice = (weather?.daily || []).slice(0, days);

        const rainDays = dailySlice.filter((d) => (d.precipitationProbabilityMax ?? 0) >= 40).length;
        const totalMm = Math.round(dailySlice.reduce((acc, d) => acc + (d.precipitationSum ?? 0), 0) * 10) / 10;
        const minT = Math.min(...dailySlice.map((d) => d.tempMin));
        const maxT = Math.max(...dailySlice.map((d) => d.tempMax));

        reply = truncateToSingleSms(
          `अगले ${days} दिन (${farmer.district}): ${rainDays} दिन बारिश (${totalMm}mm)। Temp ${minT}-${maxT}°C। छिड़काव हेतु Day 1-2 अनुकूल।`
        );
        break;
      }

      case "ALERT": {
        const weather = await fetchCityWeather(virtualCity);
        const cur = weather?.current;
        const day0 = weather?.daily?.[0];

        const rainMm = day0?.precipitationSum ?? 0;
        const gusts = cur?.windGusts ?? 0;
        const temp = cur?.temperature ?? 30;

        if (rainMm >= 25 || gusts >= 38 || temp >= 42 || temp <= 6) {
          const trigger = rainMm >= 25 ? `भारी बारिश (${rainMm}mm)` : gusts >= 38 ? `तेज हवा/आंधी (${gusts}km/h)` : `अत्यधिक तापमान (${temp}°C)`;
          reply = truncateToSingleSms(
            `⚠️ ${farmer.district} ALERT: अगले 24h में ${trigger} की संभावना। पकी फसल व जल निकासी का ध्यान रखें।`
          );
        } else {
          reply = truncateToSingleSms(
            `${farmer.district}: कोई गंभीर मौसमी चेतावनी नहीं। तापमान ${temp}°C, वर्षा ${day0?.precipitationProbabilityMax ?? 0}%। सामान्य कार्य जारी रखें।`
          );
        }
        break;
      }

      case "HELP": {
        reply =
          "Commands: CROP [crop] STAGE [stage] | WEATHER | FORECAST 7 | PEST | ALERT | REGISTER [crop] | LOCATION [pincode]";
        break;
      }

      default: {
        status = "Invalid_Command";
        reply =
          "अमान्य कमांड। सही कमांड: WEATHER, CROP, PEST, ALERT, FORECAST, LOCATION [pincode]। पूरी लिस्ट हेतु HELP भेजें।";
        break;
      }
    }
  } catch (err) {
    status = "Error";
    reply = "सिस्टम में त्रुटि हुई। कृपया कुछ समय बाद पुनः प्रयास करें या HELP भेजें।";
    console.error("Error processing SMS command:", err);
  }

  const elapsed = Date.now() - startTime;
  logSmsTransaction({
    phone_number: phone,
    incoming_sms: smsText,
    command_parsed: parsed.command,
    parameters: Object.entries(parsed.parameters)
      .map(([k, v]) => `${k}=${v}`)
      .join(", "),
    outgoing_sms: reply,
    status,
    response_time_ms: elapsed,
    channel,
  });

  return {
    reply,
    command: parsed.command,
    status,
    farmer,
    execution_time_ms: elapsed,
    char_count: reply.length,
    fits_single_sms: reply.length <= 160,
  };
}
