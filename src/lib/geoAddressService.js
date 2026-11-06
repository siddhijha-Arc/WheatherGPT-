/**
 * GeoAddressService
 * Multi-tier high-precision reverse, forward, and network geocoding for Indian & global coordinates.
 * Queries Google Maps, Mappls MapmyIndia, Open-Meteo Geocoding, and OpenStreetMap Nominatim.
 */

export async function fetchExactAddress(lat, lng, lang = "en") {
  if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) {
    return null;
  }

  const cleanLat = Number(lat.toFixed(6));
  const cleanLng = Number(lng.toFixed(6));

  // 1. First Tier: Dedicated Server-Side High-Accuracy Reverse Geocoding Route
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`/api/geocode/reverse?lat=${cleanLat}&lng=${cleanLng}&lang=${lang}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && (data.city || data.formattedAddress)) {
        return {
          lat: cleanLat,
          lng: cleanLng,
          city: data.city || `${cleanLat.toFixed(3)}°N, ${cleanLng.toFixed(3)}°E`,
          locality: data.locality || data.city,
          street: data.houseStreet || data.locality || data.city,
          houseStreet: data.houseStreet || data.locality || data.city,
          district: data.district || data.city,
          state: data.state || "India",
          pincode: data.pincode || "",
          country: data.country || "India",
          formattedAddress: data.formattedAddress || `${data.city}, ${data.state}, India`,
          source: data.source || "server_geocoding",
          raw: data
        };
      }
    }
  } catch (e) {
    console.warn("Server-side reverse geocode endpoint failed, falling back to direct API:", e);
  }

  // 2. Second Tier: OpenStreetMap Nominatim Direct Reverse Geocoding
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${cleanLat}&lon=${cleanLng}&zoom=18&addressdetails=1`;
    const res = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        "Accept-Language": lang === "hi" ? "hi,en" : "en",
        "User-Agent": "WeatherGPT-India-Meteorological-App"
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const houseNumber = addr.house_number ? `H.No ${addr.house_number}` : "";
      const road = addr.road || addr.street || addr.footway || addr.path || "";
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.subdivision || "";
      const cityDistrict = addr.city_district || addr.subdistrict || addr.tehsil || addr.taluk || addr.mandal || "";
      const city = addr.city || addr.town || addr.village || addr.municipality || cityDistrict || "";
      const district = addr.state_district || addr.county || cityDistrict || city || "";
      const state = addr.state || "India";
      const pincode = addr.postcode ? addr.postcode.replace(/\D/g, "").slice(0, 6) : "";
      const country = addr.country || "India";

      // Build thorough street/locality line
      const streetParts = [houseNumber, road, suburb].filter(Boolean);
      const streetLine = streetParts.join(", ");

      // Build short display city
      let shortCity = city || suburb || district || data.name;
      if (!shortCity || shortCity.length < 2) {
        shortCity = district || state;
      }

      // Build clean, complete formatted address
      const fullParts = [
        streetLine,
        city && city !== suburb ? city : "",
        district && district !== city ? district : "",
        state,
        pincode ? `PIN: ${pincode}` : "",
        country
      ].filter(Boolean);

      const formattedAddress = fullParts.length > 0 ? fullParts.join(", ") : data.display_name;

      return {
        lat: cleanLat,
        lng: cleanLng,
        city: shortCity,
        locality: suburb || road || city || "Local Sector",
        street: streetLine || suburb || city,
        houseStreet: streetLine || suburb || city,
        district: district || city,
        state: state || "India",
        pincode: pincode || "",
        country: country || "India",
        formattedAddress: formattedAddress || `${cleanLat.toFixed(4)}°N, ${cleanLng.toFixed(4)}°E`,
        source: "nominatim_direct",
        raw: data
      };
    }
  } catch (e) {
    console.warn("Nominatim reverse geocode attempt failed, trying BigDataCloud:", e);
  }

  // 3. Third Tier: BigDataCloud Reverse Geocode Client API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${cleanLat}&longitude=${cleanLng}&localityLanguage=${lang === "hi" ? "hi" : "en"}`;
    const res = await fetch(bdcUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const locality = data.locality || data.principalSubdivision || "";
      const city = data.city || data.locality || data.principalSubdivision || "Location";
      const state = data.principalSubdivision || "India";
      const pincode = data.postcode ? data.postcode.replace(/\D/g, "").slice(0, 6) : "";
      const country = data.countryName || "India";

      const formattedAddress = [locality, city !== locality ? city : "", state, pincode ? `PIN ${pincode}` : "", country]
        .filter(Boolean)
        .join(", ");

      return {
        lat: cleanLat,
        lng: cleanLng,
        city: locality ? `${locality}, ${city}` : city,
        locality: locality || city,
        street: locality || city,
        houseStreet: locality || city,
        district: city,
        state: state,
        pincode: pincode,
        country: country,
        formattedAddress: formattedAddress,
        source: "bigdatacloud",
        raw: data
      };
    }
  } catch (e) {
    console.warn("BigDataCloud reverse geocode attempt failed:", e);
  }

  // 4. Fallback Coordinate Heuristic
  return {
    lat: cleanLat,
    lng: cleanLng,
    city: `${cleanLat.toFixed(3)}°N, ${cleanLng.toFixed(3)}°E`,
    locality: `Coordinates ${cleanLat.toFixed(3)}°N, ${cleanLng.toFixed(3)}°E`,
    street: `Sector at ${cleanLat.toFixed(4)}°N, ${cleanLng.toFixed(4)}°E`,
    houseStreet: `Sector at ${cleanLat.toFixed(4)}°N, ${cleanLng.toFixed(4)}°E`,
    district: "Direct Sector",
    state: "India",
    pincode: "",
    country: "India",
    formattedAddress: `${cleanLat.toFixed(4)}°N, ${cleanLng.toFixed(4)}°E, High-Resolution Sector, India`,
    source: "coordinates",
    raw: null
  };
}

/**
 * Search locations across India and globally using high-accuracy endpoints.
 */
export async function searchExactLocations(query, lang = "en") {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();

  // Try server-side unified search endpoint
  try {
    const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(cleanQuery)}&lang=${lang}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.warn("Server search API failed, falling back to direct Open-Meteo:", e);
  }

  // Fallback: Open-Meteo Geocoding directly
  try {
    const omRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=8&language=en&format=json`);
    if (omRes.ok) {
      const omData = await omRes.json();
      if (omData.results && Array.isArray(omData.results)) {
        return omData.results.map((r) => ({
          city: r.name,
          district: r.admin2 || r.name,
          state: r.admin1 || r.country || "India",
          country: r.country || "India",
          pincode: r.postcodes && r.postcodes[0] ? r.postcodes[0] : "",
          lat: r.latitude,
          lng: r.longitude,
          formattedAddress: [r.name, r.admin2 !== r.name ? r.admin2 : "", r.admin1, r.country].filter(Boolean).join(", "),
          type: r.feature_code || "City",
          source: "open_meteo"
        }));
      }
    }
  } catch (omErr) {
    console.warn("Direct Open-Meteo geocode search failed:", omErr);
  }

  return [];
}

/**
 * High-accuracy multi-tier device pinpoint location resolver.
 * 1. Fast high-accuracy satellite GPS (enableHighAccuracy: true)
 * 2. Fallback device network location (enableHighAccuracy: false)
 * 3. Server-side IP geolocation
 * 4. Reverse geocode to exact street, locality, pincode & district
 */
export async function getPreciseUserLocation(lang = "en") {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation API not available in this browser environment");
      detectNetworkLocation().then(async (netLoc) => {
        const enriched = await fetchExactAddress(netLoc.lat, netLoc.lng, lang);
        resolve({
          ...(enriched || netLoc),
          accuracy: 5000,
          source: "network_ip_fallback",
          isExactGPS: false
        });
      });
      return;
    }

    const tryReverseAndResolve = async (lat, lng, accuracy, source) => {
      const cleanLat = Number(lat.toFixed(6));
      const cleanLng = Number(lng.toFixed(6));
      try {
        const exact = await fetchExactAddress(cleanLat, cleanLng, lang);
        if (exact && exact.city) {
          resolve({
            ...exact,
            lat: cleanLat,
            lng: cleanLng,
            accuracy: Math.round(accuracy || 25),
            source: source,
            isExactGPS: source.startsWith("gps")
          });
          return;
        }
      } catch (e) {
        console.warn("Reverse geocode failed on exact coords:", e);
      }

      // If reverse geocoding was incomplete, return coordinates with formatted fallback
      resolve({
        lat: cleanLat,
        lng: cleanLng,
        city: `${cleanLat.toFixed(3)}°N, ${cleanLng.toFixed(3)}°E`,
        locality: `Coordinates ${cleanLat.toFixed(4)}°N, ${cleanLng.toFixed(4)}°E`,
        houseStreet: `Pinpoint (${cleanLat.toFixed(4)}°N, ${cleanLng.toFixed(4)}°E)`,
        district: "Local Area",
        state: "India",
        pincode: "",
        country: "India",
        formattedAddress: `Pin-point Location (${cleanLat.toFixed(5)}°N, ${cleanLng.toFixed(5)}°E)`,
        accuracy: Math.round(accuracy || 25),
        source: source,
        isExactGPS: source.startsWith("gps")
      });
    };

    // Attempt 1: High Accuracy GPS
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (pos && pos.coords && !isNaN(pos.coords.latitude) && !isNaN(pos.coords.longitude)) {
          tryReverseAndResolve(
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.accuracy || 15,
            "gps_high_precision"
          );
        } else {
          runLowAccuracyFallback();
        }
      },
      (err) => {
        console.warn("High-accuracy GPS failed / timed out, attempting standard GPS:", err.message);
        runLowAccuracyFallback();
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );

    // Attempt 2: Standard GPS / Cellular Triangulation
    const runLowAccuracyFallback = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos && pos.coords && !isNaN(pos.coords.latitude) && !isNaN(pos.coords.longitude)) {
            tryReverseAndResolve(
              pos.coords.latitude,
              pos.coords.longitude,
              pos.coords.accuracy || 65,
              "gps_standard"
            );
          } else {
            runNetworkIpFallback();
          }
        },
        (err2) => {
          console.warn("Standard GPS also failed, falling back to IP geolocation:", err2.message);
          runNetworkIpFallback();
        },
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
      );
    };

    // Attempt 3: IP Geolocation fallback (Client-side browser IP first to avoid backend data-center IP mismatch)
    const runNetworkIpFallback = async () => {
      try {
        const netLoc = await detectNetworkLocation();
        if (netLoc && netLoc.lat && netLoc.lng) {
          const exact = await fetchExactAddress(netLoc.lat, netLoc.lng, lang);
          resolve({
            ...(exact || netLoc),
            accuracy: 8000,
            source: netLoc.source || "client_ip",
            isExactGPS: false
          });
          return;
        }
      } catch (e) {
        console.warn("IP Geolocation fallback failed:", e);
      }

      // Final default: New Delhi India
      resolve({
        lat: 28.6139,
        lng: 77.2090,
        city: "New Delhi",
        state: "Delhi",
        country: "India",
        pincode: "110001",
        formattedAddress: "New Delhi, Delhi 110001, India",
        accuracy: 10000,
        source: "default_fallback",
        isExactGPS: false
      });
    };
  });
}

/**
 * Detect user's network location via direct client-side IP geolocation (capturing actual user IP) with backend backup.
 */
export async function detectNetworkLocation() {
  // 1. Try client-side ipapi.co directly in browser
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city || "New Delhi",
          state: data.region || "Delhi",
          country: data.country_name || "India",
          pincode: data.postal || "110001",
          formattedAddress: `${data.city || "New Delhi"}, ${data.region || "Delhi"}, ${data.country_name || "India"}`,
          source: "client_ipapi_co"
        };
      }
    }
  } catch (e) {
    console.warn("Client-side ipapi.co failed:", e);
  }

  // 2. Try client-side ipwho.is
  try {
    const res = await fetch("https://ipwho.is/");
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city || "New Delhi",
          state: data.region || "Delhi",
          country: data.country || "India",
          pincode: data.postal || "110001",
          formattedAddress: `${data.city || "New Delhi"}, ${data.region || "Delhi"}, ${data.country || "India"}`,
          source: "client_ipwhois"
        };
      }
    }
  } catch (e) {
    console.warn("Client-side ipwho.is failed:", e);
  }

  // 3. Fallback to server-side endpoint
  try {
    const res = await fetch("/api/geocode/ip");
    if (res.ok) {
      const data = await res.json();
      if (data && data.lat && data.lng) {
        return {
          lat: data.lat,
          lng: data.lng,
          city: data.city || "New Delhi",
          state: data.state || "Delhi",
          country: data.country || "India",
          pincode: data.pincode || "110001",
          formattedAddress: data.formattedAddress || `${data.city}, ${data.state}, India`,
          source: data.source || "server_ip"
        };
      }
    }
  } catch (e) {
    console.warn("Server-side IP location detector failed:", e);
  }

  return {
    lat: 28.6139,
    lng: 77.2090,
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    pincode: "110001",
    formattedAddress: "New Delhi, Delhi 110001, India",
    source: "default"
  };
}

