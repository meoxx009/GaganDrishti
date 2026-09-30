# GaganDrishti: REST API Documentation

This document specifies the primary serverless API routes available in GaganDrishti.

---

## 1. Weather & Village Intelligence

### `GET /api/village-weather`
Fetches real-time weather and agronomic indicators for a 6-digit Indian PIN code.
- **Parameters**:
  - `pincode` (string, required): 6-digit postal code (e.g. `462001`).
- **Response**:
```json
{
  "success": true,
  "pincode": "462001",
  "location": {
    "village": "Bhopal Center",
    "district": "Bhopal",
    "state": "Madhya Pradesh",
    "lat": 23.2599,
    "lon": 77.4126
  },
  "current": {
    "temperature": 31.8,
    "humidity": 45,
    "condition": "Partly cloudy",
    "wind_speed": 12.4,
    "rain_probability": 10
  },
  "is_cached": true,
  "cache_age_minutes": 14
}
```

### `GET /api/weather/cache`
Direct interface to the 2-hour multi-tier weather cache.
- **Parameters**:
  - `pincode` (string, required)
  - `force_refresh` (boolean, optional, default `false`)

---

## 2. Farmer Advisory & Crowdsourced Feedback

### `POST /api/farmer-feedback`
Submits crowdsourced ground truth feedback and field outcome rating.
- **Request Body**:
```json
{
  "farmer_name": "Rameshwar Patel",
  "phone_number": "9826012345",
  "pincode": "462001",
  "village_name": "Kolar",
  "crop_name": "Soybean",
  "crop_stage": "Flowering",
  "activity_today": "Spraying",
  "action_taken": "Applied Neem oil 5ml/liter for early aphid control",
  "weather_today": "Humid morning with clear sunny afternoon",
  "outcome_rating": 5,
  "outcome_notes": "Significant drop in pest population",
  "photo_url": "data:image/webp;base64,..."
}
```
- **Response**:
```json
{
  "success": true,
  "feedback_id": "fb_98412",
  "message": "Feedback recorded successfully",
  "timestamp": "2026-09-30T17:20:00Z"
}
```

---

## 3. SMS & Feature Phone Gateway

### `POST /api/sms/webhook`
Twilio inbound SMS webhook handling farmer feature-phone text messages.
- **Payload**: Form URL-encoded containing `From`, `Body`, and `MessageSid`.
- **Supported Commands**:
  - `WEATHER <PIN>` → Hyperlocal 24h weather summary.
  - `KHARIF` → Kharif crop stage recommendations.
  - `ALERT` → Active IMD weather warnings for registered district.
  - `HELP` → Bilingual command syntax guide.

---

## 4. Administrative & Telemetry Endpoints

### `GET /api/admin/monitoring`
Returns aggregated 24h health metrics, table logs, and active incident alerts.

### `GET /api/admin/pre-launch`
Returns full 48-item verification status across 9 sections, launch timeline, and signoff approval.

### `POST /api/admin/pre-launch`
Executes interactive verification tests:
- `action: "test_sql_injection"`
- `action: "test_xss"`
- `action: "test_rate_limit"`
- `action: "test_pii_masking"`
- `action: "signoff"`

### `GET /api/admin/database-indexes`
Returns index definitions, fragmentation status, seek counts, and before/after benchmarks.
