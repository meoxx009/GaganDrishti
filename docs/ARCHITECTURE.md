# GaganDrishti: Technical Architecture & System Design

## 1. System Topology Overview

```mermaid
flowchart TD
    subgraph Clients["Edge & Mobile Clients"]
        SmartPhone["Smartphone Web / PWA (Next.js)"]
        FeaturePhone["Feature Phone (SMS Gateway)"]
        AdminDesk["District Collector / Admin Web Portal"]
    end

    subgraph CDNLayer["CDN & Edge Caching"]
        EdgeWorker["Edge Cache & Static Assets (Next.js Turbopack)"]
        SecHeaders["HSTS, NoSniff, SameOrigin Security Gate"]
    end

    subgraph AppServer["Next.js App Serverless Core"]
        AuthModule["Admin Auth & 2FA Gateway"]
        WeatherAPI["Village Weather & Cache Engine"]
        DecisionEngine["Crop Stage & Agronomic Engine"]
        PestEngine["Pest & Disease Forecasting Engine"]
        SMSWorker["Twilio SMS Webhook & Broadcast Router"]
        ResearchAPI["Proprietary Dataset & Analysis Engine"]
        MonitoringEngine["System Health, Telemetry & Alert Logger"]
        PreLaunchEngine["48-Item Pre-Launch Verification Engine"]
    end

    subgraph DataStorage["Data & In-Memory Storage"]
        PincodeDB["500k+ Indian PIN Codes (Indexed)"]
        WeatherCache["2-Hour Weather Cache (WEATHER_CACHE)"]
        FeedbackDB["Farmer Feedback & Ground Truth (FARMER_FEEDBACK)"]
        SMSDB["SMS Registry & Outbox (SMS_LOGS)"]
        AuditLogs["6 Audit Repositories (API, DB, Errors, Sessions)"]
    end

    subgraph ExternalServices["Upstream Meteorological & Telephony APIs"]
        OpenMeteo["Open-Meteo API (NWP ECMWF / GFS)"]
        IMD["India Meteorological Department (District Feeds)"]
        Twilio["Twilio Telephony & SMS API"]
        Gemini["Google Gemini 2.5 Flash (Conversational AI)"]
    end

    SmartPhone --> CDNLayer
    AdminDesk --> CDNLayer
    CDNLayer --> SecHeaders
    SecHeaders --> AppServer

    FeaturePhone <--> Twilio
    Twilio <--> SMSWorker

    WeatherAPI <--> OpenMeteo
    WeatherAPI <--> WeatherCache
    DecisionEngine <--> PincodeDB
    DecisionEngine <--> FeedbackDB
    PestEngine <--> OpenMeteo
    AppServer <--> AuditLogs
    AppServer <--> Gemini
```

---

## 2. Core Subsystems

### A. Hyperlocal Weather & 2-Hour Caching Engine
- **Endpoint**: `/api/village-weather` and `/api/weather/cache`
- **Mechanism**:
  1. Incoming requests check the `WEATHER_CACHE` table indexed by 6-digit postal code.
  2. If fresh (`cached_at + 2 hours > NOW()`), returns sub-10ms response immediately (`is_cached: true`).
  3. If expired or missing, triggers a resilient 5-second fetch to Open-Meteo, computes 12h curves and 7d forecasts, and stores in cache.
  4. If upstream API fails, automatically falls back to last-known stale cache with user warnings.
  5. An automated 3 AM maintenance job cleans expired records.

### B. Crop-Stage Decision Engine
- **Modules**: `cropStageDecisionEngine.ts` and `farmerDecisionEngine.ts`
- **Agronomic Logic**:
  - Models 10 crops (Soybean, Wheat, Mustard, Paddy, Cotton, Maize, Gram, Sugarcane, Potato, Tomato) across distinct phenological stages.
  - Computes Accumulated Growing Degree Days ($GDD = \frac{T_{\max} + T_{\min}}{2} - T_{\text{base}}$).
  - Determines Spraying Feasibility Window (wind speed $< 15\text{ km/h}$, rain probability $< 30\%$, temperature $< 35^\circ\text{C}$).
  - Evaluates Soil Moisture & Irrigation urgency based on 72h precipitation deficit.

### C. Pest & Disease Forecast Engine
- **Module**: `pestForecastEngine.ts`
- **Epidemiological Logic**:
  - Matches 45-day rolling meteorological averages against vulnerable crop stages.
  - Predicts risks for Fall Armyworm, Aphids, Whitefly, Rust, Blast, and Pod Borer.
  - Flags High/Medium/Low outbreaks with biological intervention advice (Neem oil, Trichoderma, pheromone traps).

### D. Security & Data Governance
- **Module**: `securityService.ts`
- **Protection**:
  - Server-side regex pattern detection for SQL injection and XSS threats.
  - Sliding-window in-memory rate limiting (max 20 req/min).
  - Strict PII masking on phone numbers, emails, and names.
  - DPDPA 2023 compliant data governance with published privacy policy.

### E. Telemetry & Administrative Monitoring
- **Module**: `monitoringEngine.ts`
- **Features**:
  - 6 persistent audit log tables: `API_CALL_LOGS`, `FORM_SUBMISSION_LOGS`, `SMS_LOGS`, `ERROR_LOGS`, `PERFORMANCE_LOGS`, `USER_SESSION_LOGS`.
  - 5 real-time threshold alert rules.
  - Daily 7:00 AM automated email health digest.
  - Pre-launch verification engine evaluating 48 parameters across 9 functional categories.
