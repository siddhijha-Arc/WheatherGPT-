import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  PROVENANCE_TYPES,
  PROVENANCE_EXPLANATIONS,
  getProvenanceExplanation,
  createProvenanceEntry,
  generateCurrentWeatherProvenance,
  generateFishermanConditionsProvenance
} from "../src/lib/provenance.js";
import { getFallbackWeatherForCoords } from "../src/data/indiaWeatherData.js";

describe("Data Source Provenance Tracking Feature", () => {

  // Test Case 1: Live API values receive the 'live' provenance label
  test("1. Live API values receive the 'live' provenance label", () => {
    const liveCurrentData = {
      temp: 32,
      humidity: 65,
      wind_speed: 18,
      wind_direction: "210°",
      pressure: 1009,
      rainfall_mm: 2.4,
      condition: "Partly Cloudy",
      pm2_5: 38,
      pm10: 72
    };

    const currentProv = generateCurrentWeatherProvenance(liveCurrentData, {
      isLive: true,
      isCached: false,
      apiSource: "Open-Meteo Weather API",
      hasLiveAirQuality: true,
      hasLiveUv: true
    });

    // Check direct sensor observations received 'live'
    assert.equal(currentProv.temp.source_type, PROVENANCE_TYPES.LIVE, "temp must be 'live'");
    assert.equal(currentProv.humidity.source_type, PROVENANCE_TYPES.LIVE, "humidity must be 'live'");
    assert.equal(currentProv.wind_speed.source_type, PROVENANCE_TYPES.LIVE, "wind_speed must be 'live'");
    assert.equal(currentProv.wind_direction.source_type, PROVENANCE_TYPES.LIVE, "wind_direction must be 'live'");
    assert.equal(currentProv.pressure.source_type, PROVENANCE_TYPES.LIVE, "pressure must be 'live'");
    assert.equal(currentProv.rainfall_mm.source_type, PROVENANCE_TYPES.LIVE, "rainfall_mm must be 'live'");
    assert.equal(currentProv.condition.source_type, PROVENANCE_TYPES.LIVE, "condition must be 'live'");
    assert.equal(currentProv.pm2_5.source_type, PROVENANCE_TYPES.LIVE, "pm2_5 must be 'live'");
    assert.equal(currentProv.pm10.source_type, PROVENANCE_TYPES.LIVE, "pm10 must be 'live'");

    // Check Fisherman conditions direct live values
    const liveFishermanData = {
      temperature: 28,
      windSpeed: 22,
      windDirection: "SW",
      humidity: 82,
      pressure: 1008,
      condition: "Scattered Coastal Clouds"
    };

    const fishProv = generateFishermanConditionsProvenance(liveFishermanData, {
      isLive: true,
      isCached: false,
      apiSource: "Open-Meteo Marine API"
    });

    assert.equal(fishProv.temperature.source_type, PROVENANCE_TYPES.LIVE, "temperature must be 'live'");
    assert.equal(fishProv.windSpeed.source_type, PROVENANCE_TYPES.LIVE, "windSpeed must be 'live'");
    assert.equal(fishProv.windDirection.source_type, PROVENANCE_TYPES.LIVE, "windDirection must be 'live'");
    assert.equal(fishProv.humidity.source_type, PROVENANCE_TYPES.LIVE, "humidity must be 'live'");
    assert.equal(fishProv.pressure.source_type, PROVENANCE_TYPES.LIVE, "pressure must be 'live'");
    assert.equal(fishProv.condition.source_type, PROVENANCE_TYPES.LIVE, "condition must be 'live'");
  });

  // Test Case 2: Formula-derived values receive the 'estimated' label
  test("2. Formula-derived values receive the 'estimated' label", () => {
    const liveCurrentData = {
      temp: 34,
      humidity: 70,
      pm2_5: 55,
      pm10: 110,
      aqi: 142
    };

    const currentProv = generateCurrentWeatherProvenance(liveCurrentData, {
      isLive: true,
      isCached: false,
      hasLiveAirQuality: true
    });

    // AQI is calculated using piecewise formula from PM2.5/PM10
    assert.equal(currentProv.aqi.source_type, PROVENANCE_TYPES.ESTIMATED, "aqi must be 'estimated'");
    assert.match(currentProv.aqi.method, /CPCB AQI/i);

    // Atmospheric visibility is calculated via aerosol extinction formula
    assert.equal(currentProv.visibility.source_type, PROVENANCE_TYPES.ESTIMATED, "visibility must be 'estimated'");

    // Hazard evaluation is derived through decision engine thresholds
    assert.equal(currentProv.hazard_type.source_type, PROVENANCE_TYPES.ESTIMATED, "hazard_type must be 'estimated'");
    assert.equal(currentProv.hazard_level.source_type, PROVENANCE_TYPES.ESTIMATED, "hazard_level must be 'estimated'");

    // Check Fisherman formula-derived values
    const liveFishData = {
      windSpeed: 25,
      gustSpeed: 34,
      waveHeight: 2.3,
      wavePeriod: 8,
      swellHeight: 1.6,
      seaSurfaceTemp: 28.6,
      chlorophyll: 0.48,
      status: "yellow",
      statusLabel: "Caution Advised",
      safeReturnTime: "Return by 3 PM"
    };

    const fishProv = generateFishermanConditionsProvenance(liveFishData, {
      isLive: true,
      isCached: false
    });

    // Gust speed = 1.35 * windSpeed
    assert.equal(fishProv.gustSpeed.source_type, PROVENANCE_TYPES.ESTIMATED, "gustSpeed must be 'estimated'");
    // Wave height = (windSpeed * 0.08) + 0.3
    assert.equal(fishProv.waveHeight.source_type, PROVENANCE_TYPES.ESTIMATED, "waveHeight must be 'estimated'");
    // Wave period = 5 + waveHeight * 1.5
    assert.equal(fishProv.wavePeriod.source_type, PROVENANCE_TYPES.ESTIMATED, "wavePeriod must be 'estimated'");
    // Swell height = 0.7 * waveHeight
    assert.equal(fishProv.swellHeight.source_type, PROVENANCE_TYPES.ESTIMATED, "swellHeight must be 'estimated'");
    // Sea surface temp = 27.4 + sin(lat) * 1.8
    assert.equal(fishProv.seaSurfaceTemp.source_type, PROVENANCE_TYPES.ESTIMATED, "seaSurfaceTemp must be 'estimated'");
    // Chlorophyll = 0.28 + |cos(lng)| * 0.35
    assert.equal(fishProv.chlorophyll.source_type, PROVENANCE_TYPES.ESTIMATED, "chlorophyll must be 'estimated'");
    // INCOIS safety status
    assert.equal(fishProv.status.source_type, PROVENANCE_TYPES.ESTIMATED, "status must be 'estimated'");
    assert.equal(fishProv.statusLabel.source_type, PROVENANCE_TYPES.ESTIMATED, "statusLabel must be 'estimated'");
    // Return window model
    assert.equal(fishProv.safeReturnTime.source_type, PROVENANCE_TYPES.ESTIMATED, "safeReturnTime must be 'estimated'");
    // PFZ vector calculation
    assert.equal(fishProv.pfzCoordinates.source_type, PROVENANCE_TYPES.ESTIMATED, "pfzCoordinates must be 'estimated'");
    assert.equal(fishProv.pfzDistance.source_type, PROVENANCE_TYPES.ESTIMATED, "pfzDistance must be 'estimated'");
    assert.equal(fishProv.pfzDepth.source_type, PROVENANCE_TYPES.ESTIMATED, "pfzDepth must be 'estimated'");
  });

  // Test Case 3: Fixed fallback values receive the 'default' label
  test("3. Fixed fallback values receive the 'default' label", () => {
    // When offline or fallback data is used
    const fallbackProv = generateCurrentWeatherProvenance({}, {
      isLive: false,
      isCached: false,
      failed: true
    });

    // In fallback mode, raw values must receive 'default'
    assert.equal(fallbackProv.temp.source_type, PROVENANCE_TYPES.DEFAULT, "fallback temp must be 'default'");
    assert.equal(fallbackProv.humidity.source_type, PROVENANCE_TYPES.DEFAULT, "fallback humidity must be 'default'");
    assert.equal(fallbackProv.wind_speed.source_type, PROVENANCE_TYPES.DEFAULT, "fallback wind_speed must be 'default'");
    assert.equal(fallbackProv.pressure.source_type, PROVENANCE_TYPES.DEFAULT, "fallback pressure must be 'default'");
    assert.equal(fallbackProv.rainfall_mm.source_type, PROVENANCE_TYPES.DEFAULT, "fallback rainfall_mm must be 'default'");
    assert.equal(fallbackProv.condition.source_type, PROVENANCE_TYPES.DEFAULT, "fallback condition must be 'default'");

    // Fisherman static regulatory baselines and disclaimers
    const fishLiveProv = generateFishermanConditionsProvenance({}, { isLive: true });
    assert.equal(fishLiveProv.swellDirection.source_type, PROVENANCE_TYPES.DEFAULT, "swellDirection is a regional default");
    assert.equal(fishLiveProv.tides.source_type, PROVENANCE_TYPES.DEFAULT, "tides timetable is a port baseline default");
    assert.equal(fishLiveProv.restrictedAreas.source_type, PROVENANCE_TYPES.DEFAULT, "restrictedAreas is a regulatory default");
    assert.equal(fishLiveProv.shippingLanes.source_type, PROVENANCE_TYPES.DEFAULT, "shippingLanes is a regulatory default");

    // Fisherman offline fallback values
    const fishOfflineProv = generateFishermanConditionsProvenance({}, { isLive: false, failed: true });
    assert.equal(fishOfflineProv.temperature.source_type, PROVENANCE_TYPES.DEFAULT, "offline temperature must be 'default'");
    assert.equal(fishOfflineProv.windSpeed.source_type, PROVENANCE_TYPES.DEFAULT, "offline windSpeed must be 'default'");
    assert.equal(fishOfflineProv.visibility.source_type, PROVENANCE_TYPES.DEFAULT, "offline visibility must be 'default'");
    assert.equal(fishOfflineProv.lightningRisk.source_type, PROVENANCE_TYPES.DEFAULT, "offline lightningRisk must be 'default'");
  });

  // Test Case 4: Missing or invalid source fields are handled safely
  test("4. Missing or invalid source fields are handled safely", () => {
    // Test with undefined, null, empty inputs
    assert.doesNotThrow(() => {
      generateCurrentWeatherProvenance(null, null);
    }, "Null inputs must not throw in current weather provenance");

    assert.doesNotThrow(() => {
      generateFishermanConditionsProvenance(undefined, undefined);
    }, "Undefined inputs must not throw in fisherman conditions provenance");

    const safeCurrent = generateCurrentWeatherProvenance(undefined, { isLive: "invalid" });
    assert.ok(safeCurrent.temp, "Should have temp entry");
    assert.ok(safeCurrent.temp.source_type, "Should have valid source_type");
    assert.ok(safeCurrent.temp.timestamp, "Should have timestamp");

    const safeFish = generateFishermanConditionsProvenance({}, { isLive: false, apiSource: null });
    assert.ok(safeFish.windSpeed, "Should have windSpeed entry");
    assert.equal(safeFish.windSpeed.source_type, PROVENANCE_TYPES.DEFAULT);
    assert.ok(safeFish.waveHeight, "Should have waveHeight entry");
    assert.equal(safeFish.waveHeight.source_type, PROVENANCE_TYPES.ESTIMATED);

    // Invalid source_type in createProvenanceEntry falls back gracefully to default
    const entryWithBogusType = createProvenanceEntry({ sourceType: "unknown_fake_type" });
    assert.equal(entryWithBogusType.source_type, PROVENANCE_TYPES.DEFAULT);
  });

  // Test Case 5: Weather API failure produces a safe response with correct provenance
  test("5. Weather API failure produces a safe response with correct provenance", () => {
    const lat = 18.922;
    const lng = 72.834;
    const city = "Mumbai";

    // Simulate failure fallback generation as performed by the route handler
    const fallbackData = getFallbackWeatherForCoords(lat, lng, city);
    assert.ok(fallbackData, "Fallback weather data must exist");

    const failureMeta = { isLive: false, isCached: false, failed: true };
    const failureProv = generateCurrentWeatherProvenance(fallbackData, failureMeta);

    const safeResponse = {
      ...fallbackData,
      live_available: false,
      message: "Live weather data unavailable.",
      provenance: failureProv,
      source: "climatological_fallback"
    };

    assert.equal(safeResponse.live_available, false, "live_available must be false on API failure");
    assert.equal(safeResponse.message, "Live weather data unavailable.", "Must display clear failure message");
    assert.ok(safeResponse.provenance, "Response must include provenance");
    
    // Ensure no fallback data is mislabeled as 'live'
    for (const [key, record] of Object.entries(safeResponse.provenance)) {
      assert.notEqual(
        record.source_type,
        PROVENANCE_TYPES.LIVE,
        `Field '${key}' must NEVER be labeled 'live' during API failure`
      );
      assert.ok(
        record.source_type === PROVENANCE_TYPES.DEFAULT || record.source_type === PROVENANCE_TYPES.ESTIMATED,
        `Field '${key}' must be 'default' or 'estimated', got '${record.source_type}'`
      );
    }
  });

  // Test Case 6: Both API endpoints include valid provenance information
  test("6. Both API endpoints include valid provenance information", async () => {
    // 1. Simulate /api/weather/current response structure
    const weatherCurrentMock = {
      city: "Visakhapatnam",
      state: "Andhra Pradesh",
      lat: 17.6868,
      lng: 83.2185,
      temp: 31,
      humidity: 84,
      wind_speed: 16,
      wind_direction: "190°",
      pressure: 1008,
      rainfall_mm: 0,
      condition: "Clear Sky",
      aqi: 95,
      pm2_5: 32,
      pm10: 64,
      live_available: true,
      message: "Live weather observations active."
    };
    weatherCurrentMock.provenance = generateCurrentWeatherProvenance(weatherCurrentMock, {
      isLive: true,
      isCached: false,
      apiSource: "Open-Meteo Weather API",
      hasLiveAirQuality: true,
      hasLiveUv: true
    });

    assert.ok(weatherCurrentMock.provenance, "/api/weather/current must have provenance object");
    assert.equal(weatherCurrentMock.provenance.temp.source_type, "live");
    assert.equal(weatherCurrentMock.provenance.wind_speed.source_type, "live");
    assert.equal(weatherCurrentMock.provenance.aqi.source_type, "estimated");

    // 2. Simulate /api/fisherman/conditions response structure
    const fishermanMock = {
      locationName: "Visakhapatnam",
      coordinates: { lat: 17.6868, lng: 83.2185 },
      status: "green",
      statusLabel: "Safe to Go",
      windSpeed: 16,
      windDirection: "SW",
      gustSpeed: 22,
      waveHeight: 1.6,
      wavePeriod: 7,
      swellHeight: 1.1,
      swellDirection: "SW",
      visibility: "8.5 km (Clear Marine Visibility)",
      seaSurfaceTemp: 28.2,
      chlorophyll: 0.42,
      safeReturnTime: "Safe for scheduled trip",
      live_available: true,
      message: "Live marine weather observations active."
    };
    fishermanMock.provenance = generateFishermanConditionsProvenance(fishermanMock, {
      isLive: true,
      isCached: false,
      apiSource: "Open-Meteo Marine API"
    });

    assert.ok(fishermanMock.provenance, "/api/fisherman/conditions must have provenance object");
    assert.equal(fishermanMock.provenance.windSpeed.source_type, "live");
    assert.equal(fishermanMock.provenance.waveHeight.source_type, "estimated");
    assert.equal(fishermanMock.provenance.swellDirection.source_type, "default");
    assert.equal(fishermanMock.provenance.seaSurfaceTemp.source_type, "estimated");
  });

  // Test Case 7: Localization in English and Hindi
  test("7. Bilingual localization: English and Hindi explanations work correctly", () => {
    // English explanations
    const liveEn = getProvenanceExplanation("live", "en");
    assert.equal(liveEn.badge, "LIVE");
    assert.match(liveEn.description, /real-time/i);

    const estEn = getProvenanceExplanation("estimated", "en");
    assert.equal(estEn.badge, "ESTIMATED");
    assert.match(estEn.description, /formula/i);

    const defEn = getProvenanceExplanation("default", "en");
    assert.equal(defEn.badge, "DEFAULT");
    assert.match(defEn.description, /placeholder/i);

    // Hindi explanations
    const liveHi = getProvenanceExplanation("live", "hi");
    assert.equal(liveHi.badge, "लाइव");
    assert.match(liveHi.description, /लाइव डेटा/i);

    const estHi = getProvenanceExplanation("estimated", "hi");
    assert.equal(estHi.badge, "अनुमानित");
    assert.match(estHi.description, /अनुमान/i);

    const defHi = getProvenanceExplanation("default", "hi");
    assert.equal(defHi.badge, "डिफ़ॉल्ट");
    assert.match(defHi.description, /मानक/i);
  });

  // Test Case 8: Cached data is never mislabeled as 'live'
  test("8. Cached data is never mislabeled as 'live'", () => {
    const cachedData = { temp: 28, humidity: 60 };
    const prov = generateCurrentWeatherProvenance(cachedData, {
      isLive: false,
      isCached: true,
      cachedTimestamp: "2026-10-21T20:00:00.000Z"
    });

    for (const [key, record] of Object.entries(prov)) {
      assert.notEqual(
        record.source_type,
        PROVENANCE_TYPES.LIVE,
        `Cached field '${key}' must not be labeled as 'live'`
      );
      assert.equal(
        record.source_type,
        PROVENANCE_TYPES.ESTIMATED,
        `Cached field '${key}' should be marked as estimated/restored`
      );
    }
  });

});
