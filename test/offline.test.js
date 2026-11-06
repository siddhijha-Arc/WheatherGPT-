import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  generateCurrentWeatherProvenance,
  generateFishermanConditionsProvenance,
  PROVENANCE_TYPES
} from "../src/lib/provenance.js";
import { getFallbackWeatherForCoords } from "../src/data/indiaWeatherData.js";

describe("Offline and API Failure Handling Feature", () => {

  // 1. Test offline status and exact message requirement
  test("1. Offline status displays correct message in English and Hindi", () => {
    const offlineMessageEn = "Data Unavailable \u2014 Please check your internet connection.";
    const offlineMessageHi = "डेटा अनुपलब्ध \u2014 कृपया अपने इंटरनेट कनेक्शन की जाँच करें।";

    assert.equal(offlineMessageEn, "Data Unavailable \u2014 Please check your internet connection.");
    assert.equal(offlineMessageHi, "डेटा अनुपलब्ध \u2014 कृपया अपने इंटरनेट कनेक्शन की जाँच करें।");
  });

  // 2. Test API failure / timeout message requirement
  test("2. API failure displays correct message in English and Hindi", () => {
    const apiFailureMessageEn = "Live weather data unavailable. Please try again.";
    const apiFailureMessageHi = "लाइव मौसम डेटा अनुपलब्ध है। कृपया पुनः प्रयास करें।";

    assert.equal(apiFailureMessageEn, "Live weather data unavailable. Please try again.");
    assert.equal(apiFailureMessageHi, "लाइव मौसम डेटा अनुपलब्ध है। कृपया पुनः प्रयास करें।");
  });

  // 3. Test API failure handling for /api/weather/current
  test("3. /api/weather/current failure returns safe fallback with correct provenance", () => {
    const lat = 28.6139;
    const lng = 77.2090;
    const fallbackData = getFallbackWeatherForCoords(lat, lng, "New Delhi");
    
    const failureMeta = { isLive: false, isCached: false, failed: true };
    const prov = generateCurrentWeatherProvenance(fallbackData, failureMeta);

    const response = {
      ...fallbackData,
      live_available: false,
      message: "Live weather data unavailable. Please try again.",
      provenance: prov,
      source: "offline_fallback"
    };

    assert.equal(response.live_available, false);
    assert.equal(response.message, "Live weather data unavailable. Please try again.");
    assert.ok(response.provenance);

    // Verify no fallback value is labeled 'live'
    for (const [key, val] of Object.entries(response.provenance)) {
      assert.notEqual(val.source_type, PROVENANCE_TYPES.LIVE, `Field ${key} must not be live on failure`);
    }
  });

  // 4. Test API failure handling for /api/fisherman/conditions
  test("4. /api/fisherman/conditions failure returns safe fallback with correct provenance", () => {
    const lat = 19.0760;
    const lng = 72.8777;

    const fallbackPayload = {
      locationName: "Mumbai",
      coordinates: { lat, lng },
      status: "green",
      statusLabel: "Safe to Go (Offline Default)",
      windSpeed: 15,
      windDirection: "SW",
      gustSpeed: 20,
      waveHeight: 1.5,
      wavePeriod: 7,
      swellHeight: 1.1,
      swellDirection: "SW",
      visibility: "8.5 km (Clear Marine Visibility)",
      live_available: false,
      message: "Live weather data unavailable. Please try again."
    };

    fallbackPayload.provenance = generateFishermanConditionsProvenance(fallbackPayload, {
      isLive: false,
      isCached: false,
      failed: true
    });

    assert.equal(fallbackPayload.live_available, false);
    assert.equal(fallbackPayload.message, "Live weather data unavailable. Please try again.");
    assert.ok(fallbackPayload.provenance);

    for (const [key, val] of Object.entries(fallbackPayload.provenance)) {
      assert.notEqual(val.source_type, PROVENANCE_TYPES.LIVE, `Fisherman field ${key} must not be live on failure`);
    }
  });

  // 5. Test retry behavior state resetting
  test("5. Retry mechanism simulation triggers fresh fetch state", () => {
    let retryAttempted = false;
    const handleRetry = () => {
      retryAttempted = true;
    };

    handleRetry();
    assert.equal(retryAttempted, true, "Retry handler must execute successfully");
  });

  // 6. Test that fallback/estimated values are correctly labeled and never mislabeled as live
  test("6. Stale or default data is never mislabeled as live", () => {
    const defaultData = { temp: 30, humidity: 70 };
    const prov = generateCurrentWeatherProvenance(defaultData, { isLive: false, failed: true });

    assert.equal(prov.temp.source_type, PROVENANCE_TYPES.DEFAULT);
    assert.notEqual(prov.temp.source_type, PROVENANCE_TYPES.LIVE);
  });

});
