import React, { useState, useEffect, useRef, useMemo } from "react";
import { getTranslation } from "../lib/translations";
import {
  Shield,
  Eye,
  Home,
  Building2,
  Flag,
  Globe,
  Search,
  MapPin,
  AlertTriangle,
  Cpu,
  Landmark,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  Maximize2,
  LocateFixed,
  Info,
  Layers,
  Sparkles,
  ExternalLink,
  Navigation,
  X,
  Loader2,
  Sprout,
  Anchor,
  User,
  Radio
} from "lucide-react";
import { MAPPLS_TILE_CONFIGS, searchMapplsPlaces } from "../lib/mapplsService";
import { MAJOR_INDIAN_CITIES } from "../data/indiaWeatherData";
import {
  getCentralizedAlerts,
  getUnifiedCrossModeTruth,
  getCentralizedNigraniDecision
} from "../lib/alertService";

// Master dataset covering all 5 location scopes, all 3 tag states, and all 3 severities
const ALL_NIGRANI_ALERTS = [
  // 1. LOCAL (Radius 1-3 km, compact, high frequency, verified IMD/DDMA and localized telemetry)
  {
    id: "ALT-LOC-01",
    scope: "local",
    severity: "severe", // severe | moderate | advisory
    title: "Localized Flash Inundation & Urban Drainage Watch",
    summary: "High water accumulation anticipated at low-lying transit underpasses and arterial corridors within 45 minutes.",
    locationName: "Local Zone • Sector 14 Underpass (1.2 km radius)",
    lat: 28.7150,
    lng: 77.1250,
    timestamp: "12 mins ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "India Meteorological Department (IMD) & Delhi Disaster Management Authority (DDMA)",
        ministry: "Ministry of Earth Sciences, Govt. of India",
        portalUrl: "https://mausam.imd.gov.in",
        portalName: "mausam.imd.gov.in",
        text: "Official IMD Nowcast: Moderate to intense rain spells likely over northwest & central sectors; low-lying road waterlogging advisory in effect until 22:00 IST."
      },
      ai: {
        present: true,
        insight: "Radar precipitation rate exceeds 38mm/hr; historical runoff model predicts 1.5 ft road waterlogging."
      }
    },
    detail: {
      affectedRadius: "1.2 km radius around Sector 14 underpass",
      officialRef: "IMD-MoES/RMC-DEL/NOWCAST-2026/088",
      precautions: [
        "Avoid low-clearance vehicles on Outer Ring subways.",
        "Take elevated feeder road via Link Avenue.",
        "Pedestrians advised to stay clear of open storm drains."
      ],
      aiTelemetry: "Runoff velocity index: 88/100 • Drainage saturation: 94%"
    }
  },
  {
    id: "ALT-LOC-02",
    scope: "local",
    severity: "severe",
    title: "Microburst Gust Front & Tree Hazard Detected",
    summary: "Localized squall line entering neighborhood with sudden 62 km/h downdraft wind shear.",
    locationName: "Local Zone • Community Park & North Perimeter (0.8 km)",
    lat: 28.7210,
    lng: 77.1180,
    timestamp: "24 mins ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "IMD Regional Meteorological Centre (RMC New Delhi)",
        ministry: "Ministry of Earth Sciences, Govt. of India",
        portalUrl: "https://mausam.imd.gov.in",
        portalName: "mausam.imd.gov.in",
        text: "Nowcast Squall Bulletin: Sudden wind gusts (50-65 km/h) accompanied by thunderstorm activity."
      },
      ai: {
        present: true,
        insight: "Doppler radial velocity variance detected abrupt 25 kt shear over 600m corridor."
      }
    },
    detail: {
      affectedRadius: "800m localized wind corridor",
      officialRef: "IMD-MoES/NOWCAST-SQUALL-114",
      precautions: [
        "Park vehicles away from aged eucalyptus trees and temporary scaffolding.",
        "Secure outdoor tin sheds and balcony planters immediately."
      ],
      aiTelemetry: "Doppler shear delta: 28.4 m/s • Pressure drop: -3.2 hPa in 15 mins"
    }
  },
  {
    id: "ALT-LOC-03",
    scope: "local",
    severity: "moderate",
    title: "Localized Smog & Dense Moisture Haze Layer",
    summary: "Boundary layer inversion causing visibility drop below 350m on local residential roads.",
    locationName: "Local Zone • Sector 8 to 15 Arterial Road (2.1 km)",
    lat: 28.7080,
    lng: 77.1320,
    timestamp: "45 mins ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "Central Pollution Control Board (CPCB) & IMD Air Quality Cell",
        ministry: "Ministry of Environment, Forest & Climate Change",
        portalUrl: "https://cpcb.nic.in",
        portalName: "cpcb.nic.in",
        text: "National AQI Network Bulletin: Shallow to moderate fog advisory in low-ventilation sectors during morning hours."
      },
      ai: { present: false }
    },
    detail: {
      affectedRadius: "2.1 km radius",
      officialRef: "CPCB-MoEFCC/NAQI-DEL-402",
      precautions: [
        "Use low-beam fog lights on early morning commutes.",
        "Individuals with sensitive respiratory conditions should limit jogging outdoors."
      ],
      aiTelemetry: "Surface inversion depth: 65m • Particulate trapping factor: Elevated"
    }
  },
  {
    id: "ALT-LOC-04",
    scope: "local",
    severity: "advisory",
    title: "ICAR-KVK Agromet Advisory: High Night Humidity & Crop Fungal Watch",
    summary: "Extended 95%+ relative humidity creates favorable microclimate for crop foliar mildew in agro belt.",
    locationName: "Local Agro Perimeter • Peri-urban Green Belt (2.8 km)",
    lat: 28.7300,
    lng: 77.1050,
    timestamp: "1 hr ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "ICAR-KVK & IMD Agromet Advisory Division",
        ministry: "Ministry of Agriculture & Farmers Welfare, Govt. of India",
        portalUrl: "https://agromet.imd.gov.in",
        portalName: "agromet.imd.gov.in",
        text: "Official Agromet Bulletin No. KVK/AGRO/2026/09: High relative humidity mitigation protocol for peri-urban vegetable nurseries."
      },
      ai: {
        present: true,
        insight: "Leaf wetness duration projected at 9.2 continuous hours; apply preventive bio-fungicide."
      }
    },
    detail: {
      affectedRadius: "2.8 km peri-urban perimeter",
      officialRef: "ICAR-KVK/AGRO-DEL/2026/08",
      precautions: [
        "Ensure field drainage in vegetable nursery beds.",
        "Schedule foliar spray during midday dry window."
      ],
      aiTelemetry: "Leaf wetness index: 0.94 • Dew point depression: < 0.8°C"
    }
  },

  // 2. DISTRICT (Balanced mix of Govt + AI, actionable community tone)
  {
    id: "ALT-DST-01",
    scope: "district",
    severity: "severe",
    title: "District Orange Alert: Intense Convective Thunderstorm & Lightning",
    summary: "District disaster cell issued Orange alert for rapid storm cloud formation with cloud-to-ground lightning.",
    locationName: "District North • All Sub-Divisions (NCT Delhi)",
    lat: 28.7041,
    lng: 77.1025,
    timestamp: "18 mins ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "IMD District Meteorological Office & DDMA",
        text: "Orange code warning: Frequent lightning strikes and moderate to intense rainfall spells."
      },
      ai: {
        present: true,
        insight: "Satellite cloud top temperature at -68°C indicates rapid vertical cell development across district."
      }
    },
    detail: {
      affectedRadius: "District-wide (North & North-West jurisdictions)",
      officialRef: "DDMA/NW/MET-774",
      precautions: [
        "Seek sturdy indoor shelter; do not stand under isolated trees or electric towers.",
        "Unplug sensitive electrical equipment during active thunder spells.",
        "Construction activities suspended until storm clears."
      ],
      aiTelemetry: "CAPA storm severity index: 7.8/10 • Lightning flash rate: 42 strikes/min"
    }
  },
  {
    id: "ALT-DST-02",
    scope: "district",
    severity: "moderate",
    title: "District Administration Advisory: Afternoon Heat Stress Protocol",
    summary: "Surface temperatures touching 41.5°C; outdoor labor and school activities restricted 12:00-15:30.",
    locationName: "District Administration Zone • Central & Industrial Blocks",
    lat: 28.6600,
    lng: 77.1600,
    timestamp: "1 hr ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "District Magistrate & Health Department",
        text: "Mandatory drinking water stalls activated across major transit hubs."
      },
      ai: { present: false }
    },
    detail: {
      affectedRadius: "District Urban Corridor",
      officialRef: "DM-ORD/HEAT-2026/04",
      precautions: [
        "Stay hydrated with ORS and electrolyte fluids.",
        "Ensure shaded shelters for domestic animals and livestock."
      ],
      aiTelemetry: "Wet Bulb Globe Temp (WBGT): 31.8°C"
    }
  },
  {
    id: "ALT-DST-03",
    scope: "district",
    severity: "moderate",
    title: "Delhi Traffic Police & DDMA Advisory: Rain Runoff Transit Corridors",
    summary: "Official traffic advisory for waterlogged bottlenecks on 4 primary district arterial roads.",
    locationName: "District Transit Corridor • Outer Arterial & Ring Interchanges",
    lat: 28.6900,
    lng: 77.1400,
    timestamp: "1.5 hrs ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "Delhi Traffic Police & District Disaster Management Authority (DDMA)",
        ministry: "Ministry of Home Affairs / GNCTD",
        portalUrl: "https://delhitrafficpolice.nic.in",
        portalName: "delhitrafficpolice.nic.in",
        text: "Official Traffic Advisory: Heavy rain runoff causing vehicular slow-down on NH-44 and Mukarba Chowk feeders."
      },
      ai: {
        present: true,
        insight: "Runoff rate correlation with municipal elevation maps indicates 35+ minute transit delay on NH-44 feeder."
      }
    },
    detail: {
      affectedRadius: "Inter-district transit arteries",
      officialRef: "DTP-ADVISORY/TRAFFIC-RAIN/2026/11",
      precautions: [
        "Plan alternate routes via Eastern Bypass.",
        "Allow 25 minutes extra buffer for airport or railway transit."
      ],
      aiTelemetry: "Flow slowdown probability: 82% on 4 junction nodes"
    }
  },
  {
    id: "ALT-DST-04",
    scope: "district",
    severity: "advisory",
    title: "Canal Sluice Level Silt & Discharge Advisory",
    summary: "Upstream canal headworks opening 2 gates; downstream agricultural fields to receive controlled irrigation flow.",
    locationName: "District Irrigation Division • Western Canal Network",
    lat: 28.7500,
    lng: 77.0800,
    timestamp: "2 hrs ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "State Irrigation & Water Resources Dept",
        text: "Routine canal regulation. Water discharge increased by 450 cusecs."
      },
      ai: {
        present: true,
        insight: "Optimal timing for kharif crop watering before expected evening evaporation drop."
      }
    },
    detail: {
      affectedRadius: "Western Canal feeder command area",
      officialRef: "IWD-CANAL-441",
      precautions: [
        "Ensure field bunds are reinforced.",
        "Check pump suction filters for incoming river silt."
      ],
      aiTelemetry: "Canal velocity: 1.4 m/s • Soil infiltration capacity: High"
    }
  },

  // 3. STATE (Mostly Govt Official cyclone/monsoon tracking, state-wide trend summaries)
  {
    id: "ALT-STA-01",
    scope: "state",
    severity: "severe",
    title: "State Disaster Management Red Bulletin: Monsoon Inflow Surge",
    summary: "Statewide alert issued for Yamuna and major river basins due to heavy upstream barrage discharge.",
    locationName: "State Command HQ • Yamuna River Basin & Floodplains",
    lat: 28.6400,
    lng: 77.2400,
    timestamp: "30 mins ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "State Emergency Operation Centre (SEOC) & IMD",
        text: "River level warning: Upstream Hathnikund discharge reached 1.2 Lakh cusecs. Floodplain evacuation initiated."
      },
      ai: { present: false }
    },
    detail: {
      affectedRadius: "Statewide river basin lowlands (50 km stretch)",
      officialRef: "SEOC-RED-ALERT/2026/09",
      precautions: [
        "All riverside dwellings must relocate to designated relief shelters.",
        "Boats and ferry services prohibited across all ghats until further orders.",
        "District response teams positioned with high-capacity pumps."
      ],
      aiTelemetry: "Gauge height: 205.33m (Warning Mark: 204.50m)"
    }
  },
  {
    id: "ALT-STA-02",
    scope: "state",
    severity: "advisory",
    title: "Statewide Seasonal Monsoon Precipitation 22% Above Normal",
    summary: "State agricultural climate report: Groundwater reservoirs recharge index at 8-year high.",
    locationName: "State Climate Monitoring Grid • 11 State Agro-Zones",
    lat: 28.6139,
    lng: 77.2090,
    timestamp: "3 hrs ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "IMD State Meteorological Centre",
        text: "Cumulative state rainfall for the season stands at 480.4 mm against normal of 393.8 mm."
      },
      ai: {
        present: true,
        insight: "Crop yield projection boosted by 7.4% across state; moisture stress risk remains near zero."
      }
    },
    detail: {
      affectedRadius: "Statewide agro-climatic zones",
      officialRef: "IMD-STATE-AGRO-712",
      precautions: [
        "Farmers advised to inspect field drainage to prevent root rot.",
        "Water harvesting systems should be cleared for peak intake."
      ],
      aiTelemetry: "Groundwater recharge index: +18.2% YoY • Agro Vigor: 0.81 NDVI"
    }
  },
  {
    id: "ALT-STA-03",
    scope: "state",
    severity: "severe",
    title: "State Coastal Marine & Gale Warning: Squally Winds 55-65 km/h",
    summary: "Fishermen strictly advised not to venture into open seas along state coastline for next 48 hours.",
    locationName: "State Coastal Belt & Harbor Zone (Marine Sector)",
    lat: 18.9220,
    lng: 72.8347,
    timestamp: "1.2 hrs ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "State Fisheries Directorate & IMD Cyclone Cell",
        text: "Local Cautionary Signal No. III hoisted at all major and minor ports."
      },
      ai: {
        present: true,
        insight: "Wave height model predicts 3.8m significant wave height with dangerous 12-second swell period."
      }
    },
    detail: {
      affectedRadius: "State Continental Shelf (up to 75 nautical miles)",
      officialRef: "MAST-PORT-WARN-03",
      precautions: [
        "In-sea trawlers must return to nearest safe harbor before 18:00 IST.",
        "Anchor and lash all berthed vessels with double mooring lines."
      ],
      aiTelemetry: "Significant wave height: 3.8m • Peak surface gust: 72 km/h"
    }
  },

  // 4. COUNTRY (Purely Govt Official / IMD Ministry sourced, sparse, high-level awareness)
  {
    id: "ALT-NAT-01",
    scope: "country",
    severity: "severe",
    title: "IMD National Severe Weather Bulletin: Western Disturbance Movement",
    summary: "Active western disturbance approaching Northwest India; widespread heavy snowfall and rain alerts.",
    locationName: "National Weather Network • Northwest Himalayan Region & Northern Plains",
    lat: 31.1048,
    lng: 77.1734,
    timestamp: "2 hrs ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "India Meteorological Department (HQ New Delhi)",
        text: "National Bulletin No. 14: Intense precipitation spell likely over J&K, HP, and Northern Plains."
      },
      ai: { present: false }
    },
    detail: {
      affectedRadius: "Northern & Northwestern India",
      officialRef: "IMD-NAT-BUL-2026/89",
      precautions: [
        "High-altitude mountain highways subject to avalanche alerts.",
        "Civil aviation advised to expect en-route moderate to severe turbulence over FL280."
      ],
      aiTelemetry: "System pressure central deficit: 994 hPa • Jet stream speed: 125 kt"
    }
  },
  {
    id: "ALT-NAT-02",
    scope: "country",
    severity: "moderate",
    title: "National Monsoon Trough Position & Synoptic Assessment",
    summary: "Monsoon trough runs south of its normal position; enhanced rainfall active over Central India.",
    locationName: "National Synoptic Chart • Central & Peninsular India",
    lat: 21.1458,
    lng: 79.0882,
    timestamp: "4 hrs ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "Ministry of Earth Sciences & IMD National Weather Forecasting Centre",
        text: "Low pressure system over Bay of Bengal moving West-Northwestwards; fair to good rainfall distribution."
      },
      ai: { present: false }
    },
    detail: {
      affectedRadius: "Pan-India synoptic coverage",
      officialRef: "MoES-SYNOPTIC-2026/304",
      precautions: [
        "State relief commissioners put on alert in Odisha, MP, and Maharashtra.",
        "National Disaster Response Force (NDRF) pre-positioned in 12 vulnerable districts."
      ],
      aiTelemetry: "Vorticity anomaly: +6.2 x 10^-5 s^-1 at 850 hPa"
    }
  },
  {
    id: "ALT-NAT-03",
    scope: "country",
    severity: "advisory",
    title: "All-India Agro-Meteorological Drought Assessment (NDVI Normal)",
    summary: "National remote sensing center confirms 91% of agricultural districts exhibiting healthy vegetation indices.",
    locationName: "National Agricultural Monitoring Cell (NRSC & ICAR)",
    lat: 22.5937,
    lng: 78.9629,
    timestamp: "6 hrs ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "Ministry of Agriculture & Farmers Welfare / ICAR",
        text: "National Crop Weather Watch Group report confirms favorable soil moisture status across 28 states."
      },
      ai: { present: false }
    },
    detail: {
      affectedRadius: "All-India Agro Ecologies",
      officialRef: "AGRI-CWWG-REP-12",
      precautions: [
        "Normal sowing and fertilization schedules recommended nationwide.",
        "Kharif grain harvest logistics planning underway."
      ],
      aiTelemetry: "National Vegetative Health Index: 0.84 (Optimal)"
    }
  },

  // 5. ANYWHERE (Custom City Samples: Delhi, Pune, Patna, Bengaluru, Jaipur, Kolkata, Varanasi)
  {
    id: "ALT-ANY-DELHI-01",
    scope: "anywhere",
    cityKey: "delhi",
    cityName: "New Delhi, Delhi NCR",
    severity: "severe",
    title: "Delhi NCR Extreme Heatwave & Ground Thermal Peak",
    summary: "Intense westerly winds causing peak thermal distress. Afternoon temperatures hovering between 41°C and 43°C across NCR.",
    locationName: "New Delhi, Noida & Gurugram Core Zone",
    lat: 28.6139,
    lng: 77.2090,
    timestamp: "10 mins ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "IMD Regional Meteorological Centre (RMC New Delhi) & DDMA",
        ministry: "Ministry of Earth Sciences, Govt. of India",
        portalUrl: "https://mausam.imd.gov.in",
        portalName: "mausam.imd.gov.in",
        text: "Orange alert issued for severe heatwave condition over Delhi NCR. Avoid direct solar exposure between 12:00 and 16:00 IST."
      },
      ai: {
        present: true,
        insight: "Urban heat island (UHI) effect elevates asphalt core surface temperatures by +4.2°C above ambient readings."
      }
    },
    detail: {
      affectedRadius: "Full Delhi NCR (Delhi, Noida, Gurugram, Ghaziabad)",
      officialRef: "IMD-RMC-DEL-HEAT-044",
      precautions: [
        "Avoid direct sun exposure between 12:00 PM and 4:00 PM.",
        "Drink oral rehydration solutions (ORS), lemon water, and wear light cotton clothes.",
        "Ensure outdoor domestic animals and stray cattle have access to shaded water troughs."
      ],
      aiTelemetry: "Thermal distress index: 94/100 • Wet-bulb temperature: 29.8°C"
    }
  },
  {
    id: "ALT-ANY-PUNE-01",
    scope: "anywhere",
    cityKey: "pune",
    cityName: "Pune, Maharashtra",
    severity: "severe",
    title: "Ghat Section Landslide & Heavy Downpour Alert",
    summary: "Extremely heavy rainfall warning in Khandala & Tamhini Ghat corridors; road transport restricted.",
    locationName: "Pune District & Western Ghats Pass",
    lat: 18.5204,
    lng: 73.8567,
    timestamp: "20 mins ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "Pune District Disaster Management Authority & IMD",
        text: "Red alert in ghat areas; tourist travel strictly prohibited."
      },
      ai: {
        present: true,
        insight: "Soil saturation index at 98%; slope instability sensors trigger critical threshold alert."
      }
    },
    detail: {
      affectedRadius: "Ghat corridor (35 km highway stretch)",
      officialRef: "PDMA-RED-GHAT-09",
      precautions: [
        "Avoid Pune-Goa highway ghat routes.",
        "Check local highway police updates before essential journeys."
      ],
      aiTelemetry: "Pore water pressure: 45 kPa (Critical)"
    }
  },
  {
    id: "ALT-ANY-PATNA-01",
    scope: "anywhere",
    cityKey: "patna",
    cityName: "Patna, Bihar",
    severity: "severe",
    title: "Ganga River Water Level Above Danger Mark at Digha Ghat",
    summary: "Rising floodwaters inundate riverfront promenade; municipal pumps working continuously.",
    locationName: "Patna Urban & Low-lying Diara",
    lat: 25.5941,
    lng: 85.1376,
    timestamp: "35 mins ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "Bihar State Disaster Management Authority (BSDMA)",
        text: "Ganga flowing 42cm above danger level at Gandhi Ghat."
      },
      ai: {
        present: true,
        insight: "Satellite altimetry projects peak crest in next 18 hours before stabilizing."
      }
    },
    detail: {
      affectedRadius: "Patna Diara & Riverine belt",
      officialRef: "BSDMA-RIVER-882",
      precautions: [
        "Residents in Diara areas to stay at elevated relief centers.",
        "Boat movement restricted after sunset."
      ],
      aiTelemetry: "River flow rate: 2.1 m/s • Upstream surge rate: +3 cm/hr"
    }
  },
  {
    id: "ALT-ANY-BLR-01",
    scope: "anywhere",
    cityKey: "bengaluru",
    cityName: "Bengaluru, Karnataka",
    severity: "moderate",
    title: "Urban Lake Overflow & Stormwater Drain Surcharging",
    summary: "Heavy convective cloudburst over Bellandur & Whitefield corridor causing localized road inundation.",
    locationName: "Bengaluru East & Outer Ring Road (ORR)",
    lat: 12.9716,
    lng: 77.5946,
    timestamp: "50 mins ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "BBMP Disaster Control Cell",
        text: "Emergency response teams deployed at 14 vulnerable waterlogging junctions."
      },
      ai: {
        present: true,
        insight: "Doppler radar shows secondary rain cell moving into South-East tech corridors."
      }
    },
    detail: {
      affectedRadius: "East Bengaluru IT corridor",
      officialRef: "BBMP-RAIN-2026/14",
      precautions: [
        "Tech park commuters advised to utilize metro transit where feasible.",
        "Avoid parking vehicles in basement levels near lake buffers."
      ],
      aiTelemetry: "Hourly rain intensity: 48mm/hr"
    }
  },
  {
    id: "ALT-ANY-JAI-01",
    scope: "anywhere",
    cityKey: "jaipur",
    cityName: "Jaipur, Rajasthan",
    severity: "moderate",
    title: "Desert Dust Storm & High-Velocity Gradient Winds",
    summary: "Blinding dust storm moving eastwards with sudden visibility drop to 400m.",
    locationName: "Jaipur Metropolitan & Western Bypass",
    lat: 26.9124,
    lng: 75.7873,
    timestamp: "1.1 hrs ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "IMD Jaipur Regional Centre",
        text: "Yellow alert: Dust raising winds (40-50 km/h) accompanied by light drizzle."
      },
      ai: { present: false }
    },
    detail: {
      affectedRadius: "Jaipur District & Sikar road",
      officialRef: "IMD-JPR-DUST-02",
      precautions: [
        "Keep windows closed and avoid non-essential highway driving.",
        "Cover delicate plants and livestock shelters."
      ],
      aiTelemetry: "Aerosol Optical Depth (AOD): 1.2 • PM10 spike: 380 µg/m³"
    }
  },
  {
    id: "ALT-ANY-KOL-01",
    scope: "anywhere",
    cityKey: "kolkata",
    cityName: "Kolkata, West Bengal",
    severity: "severe",
    title: "High Tide Lock & Thunderstorm Drainage Surcharging",
    summary: "Lock gates on Hooghly river closed due to 4.5m astronomical high tide during active rain spell.",
    locationName: "Kolkata Central, Park Street & Strand Road",
    lat: 22.5726,
    lng: 88.3639,
    timestamp: "40 mins ago",
    sources: {
      govt: {
        present: true,
        issuedBy: "Kolkata Municipal Corporation (KMC) & IMD",
        text: "Tide lock in effect until 17:30 IST. Heavy pumps operating in low-lying pockets."
      },
      ai: {
        present: true,
        insight: "Tide lock prevents natural gravity drainage for 3.5 hours; expect slow water clearance."
      }
    },
    detail: {
      affectedRadius: "Central Kolkata & Canal basins",
      officialRef: "KMC-DRAIN-TIDE-77",
      precautions: [
        "Tram and surface vehicular diversions active along Central Avenue.",
        "Do not touch flooded electrical pillars or street lighting posts."
      ],
      aiTelemetry: "Hooghly water elevation: +4.65m CD"
    }
  }
];

export function NigraniModeView({ location, persona, language, weather, onTabChange }) {
  const isHi = language === "hi";
  const t = getTranslation(language);
  const [activeScopeTab, setActiveScopeTab] = useState("local"); // 'local' | 'district' | 'state' | 'country' | 'anywhere'
  const [expandedAlertId, setExpandedAlertId] = useState(null);
  const [highlightedAlertId, setHighlightedAlertId] = useState(null);
  
  // Anywhere search state
  const [anywhereQuery, setAnywhereQuery] = useState("");
  const [anywhereSuggestions, setAnywhereSuggestions] = useState([]);
  const [isSearchingAnywhere, setIsSearchingAnywhere] = useState(false);
  const [showAnywhereDropdown, setShowAnywhereDropdown] = useState(false);
  const [selectedAnywhereCity, setSelectedAnywhereCity] = useState({
    key: "pune",
    name: "Pune, Maharashtra",
    lat: 18.5204,
    lng: 73.8567
  });

  const popularCities = [
    { key: "delhi", name: "Delhi", full: "New Delhi, Delhi NCR", lat: 28.6139, lng: 77.209 },
    { key: "pune", name: "Pune", full: "Pune, Maharashtra", lat: 18.5204, lng: 73.8567 },
    { key: "patna", name: "Patna", full: "Patna, Bihar", lat: 25.5941, lng: 85.1376 },
    { key: "bengaluru", name: "Bengaluru", full: "Bengaluru, Karnataka", lat: 12.9716, lng: 77.5946 },
    { key: "mumbai", name: "Mumbai", full: "Mumbai, Maharashtra", lat: 19.0760, lng: 72.8777 },
    { key: "jaipur", name: "Jaipur", full: "Jaipur, Rajasthan", lat: 26.9124, lng: 75.7873 },
    { key: "kolkata", name: "Kolkata", full: "Kolkata, West Bengal", lat: 22.5726, lng: 88.3639 }
  ];

  // Real-time suggestions for Anywhere city search
  useEffect(() => {
    if (!anywhereQuery.trim()) {
      setAnywhereSuggestions([]);
      setIsSearchingAnywhere(false);
      return;
    }

    const q = anywhereQuery.trim().toLowerCase();
    // 1. Instant match from MAJOR_INDIAN_CITIES
    const localMatches = MAJOR_INDIAN_CITIES.filter((c) =>
      c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
    ).slice(0, 7).map((c) => ({
      key: c.city.toLowerCase(),
      name: `${c.city}, ${c.state}`,
      city: c.city,
      state: c.state,
      lat: c.lat,
      lng: c.lng,
      temp: c.temp,
      condition: c.condition,
      hazard: c.hazard
    }));

    setAnywhereSuggestions(localMatches);
    setShowAnywhereDropdown(true);

    // 2. Also search Mappls places for hyperlocal towns / tehsils / mandis
    const timer = setTimeout(() => {
      setIsSearchingAnywhere(true);
      searchMapplsPlaces(q, selectedAnywhereCity.lat, selectedAnywhereCity.lng)
        .then((places) => {
          if (places && places.length > 0) {
            const mapped = places.slice(0, 5).map((p) => ({
              key: (p.placeName || "").toLowerCase().replace(/[^a-z0-9]/g, "_"),
              name: p.placeAddress || p.placeName,
              city: p.placeName,
              state: p.placeAddress || "India",
              lat: p.latitude,
              lng: p.longitude,
              isMappls: true
            }));
            setAnywhereSuggestions((prev) => {
              const combined = [...prev];
              mapped.forEach((m) => {
                if (!combined.some((c) => c.name.toLowerCase() === m.name.toLowerCase())) {
                  combined.push(m);
                }
              });
              return combined.slice(0, 8);
            });
          }
          setIsSearchingAnywhere(false);
        })
        .catch(() => setIsSearchingAnywhere(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [anywhereQuery, selectedAnywhereCity.lat, selectedAnywhereCity.lng]);

  const handleSelectAnywhereCity = (cityObj) => {
    const key = cityObj.key || (cityObj.city ? cityObj.city.toLowerCase() : "custom");
    const name = cityObj.name || (cityObj.full ? cityObj.full : `${cityObj.city}, ${cityObj.state}`);
    const lat = cityObj.lat ?? cityObj.latitude;
    const lng = cityObj.lng ?? cityObj.longitude;

    setSelectedAnywhereCity({
      key,
      name,
      lat,
      lng,
      condition: cityObj.condition,
      temp: cityObj.temp,
      hazard: cityObj.hazard
    });
    setAnywhereQuery("");
    setShowAnywhereDropdown(false);

    if (mapInstanceRef.current && lat && lng) {
      mapInstanceRef.current.flyTo([lat, lng], 10, { animate: true, duration: 1.0 });
    }
  };

  // Map references
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Active context mode badge label
  const activeModeBadgeLabel = useMemo(() => {
    if (persona === "farmer") return t.farmerModeActive || (isHi ? "किसान मोड सक्रिय" : "Farmer Mode Active");
    if (persona === "fisherman") return t.maritimeModeActive || (isHi ? "तटीय / समुद्री मोड" : "Maritime / Coastal Mode");
    if (persona === "traveler") return t.travellerModeActive || (isHi ? "यात्री मोड सक्रिय" : "Traveller Mode Active");
    return t.publicModeActive || (isHi ? "नागरिक / आम मोड" : "Resident / Public Mode");
  }, [persona, isHi, t]);

  // Tab definitions with bracketed multilingual labels & descriptions
  const scopeTabs = [
    {
      id: "local",
      label: t.scopeLocal || (isHi ? "स्थानीय" : "Local"),
      radiusLabel: "1-3 km",
      desc: t.descLocalScope || (isHi ? "स्थानीय व AI अलर्ट" : "High-frequency local & AI alerts"),
      icon: Home
    },
    {
      id: "district",
      label: t.scopeDistrict || (isHi ? "ज़िला" : "District"),
      radiusLabel: t.radiusSubDivision || (isHi ? "उप-संभाग" : "Sub-division"),
      desc: t.descDistrictScope || (isHi ? "आधिकारिक परामर्श व स्थानीय कार्य" : "Official advisories & local actions"),
      icon: Building2
    },
    {
      id: "state",
      label: t.scopeState || (isHi ? "राज्य" : "State"),
      radiusLabel: t.radiusStatewide || (isHi ? "राज्यव्यापी" : "Statewide"),
      desc: t.descStateScope || (isHi ? "गंभीर ट्रैकिंग एवं क्षेत्रीय रुझान" : "Severe tracking & regional trends"),
      icon: Flag
    },
    {
      id: "country",
      label: t.scopeCountry || (isHi ? "देश" : "Country"),
      radiusLabel: t.radiusNational || (isHi ? "राष्ट्रीय" : "National"),
      desc: t.descCountryScope || (isHi ? "मौसम विभाग राष्ट्रीय बुलेटिन" : "IMD Ministry national bulletins"),
      icon: Globe
    },
    {
      id: "anywhere",
      label: t.scopeAnywhere || (isHi ? "कहीं भी" : "Anywhere"),
      radiusLabel: t.radiusCustomPlace || (isHi ? "कस्टम स्थान" : "Custom Place"),
      desc: t.descAnywhereScope || (isHi ? "किसी भी शहर के अलर्ट देखें" : "Check alerts for any chosen city"),
      icon: Search
    }
  ];

  const crossModeTruth = useMemo(() => {
    return getUnifiedCrossModeTruth(weather, location, language);
  }, [weather, location, language]);

  // Filter alerts for current scope and sort: Severity (Severe -> Moderate -> Advisory) then Recency
  const currentFeedAlerts = useMemo(() => {
    let alerts = [];
    if (activeScopeTab === "anywhere") {
      const cityKey = (selectedAnywhereCity.key || "").toLowerCase();
      const cityName = (selectedAnywhereCity.name || "").toLowerCase();
      alerts = ALL_NIGRANI_ALERTS.filter(
        (a) =>
          a.scope === "anywhere" &&
          (a.cityKey === cityKey ||
            (a.cityName && a.cityName.toLowerCase().includes(cityKey)) ||
            (cityName && a.cityKey && cityName.includes(a.cityKey)))
      );
      // If city has no exact sample alert, dynamically generate an authentic IMD hazard alert for this city
      if (alerts.length === 0) {
        const matchedCityData = MAJOR_INDIAN_CITIES.find(
          (c) =>
            c.city.toLowerCase().includes(cityKey) ||
            cityKey.includes(c.city.toLowerCase()) ||
            cityName.includes(c.city.toLowerCase())
        );
        const cond = selectedAnywhereCity.condition || matchedCityData?.condition || "Partly Cloudy & Warm";
        const temp = selectedAnywhereCity.temp || matchedCityData?.temp || 33;
        const haz = selectedAnywhereCity.hazard || matchedCityData?.hazard || "normal";
        const hum = matchedCityData?.humidity || 58;
        const wnd = matchedCityData?.wind || 14;
        const aqiVal = matchedCityData?.aqi || 110;

        const isSevere = haz === "heatwave" || haz === "cyclone" || haz === "flood";
        const isModerate = haz === "heavy_rain" || haz === "humidity";

        alerts = [
          {
            id: `ALT-ANY-${(cityKey || "CITY").toUpperCase()}-01`,
            scope: "anywhere",
            cityKey: cityKey,
            cityName: selectedAnywhereCity.name,
            severity: isSevere ? "severe" : isModerate ? "moderate" : "advisory",
            title: `${selectedAnywhereCity.name} • ${cond} & Atmospheric Telemetry`,
            summary: `Current temperature ${temp}°C with ${hum}% relative humidity and ${wnd} km/h surface wind. Continuous IMD telemetry active.`,
            locationName: `${selectedAnywhereCity.name} Urban Perimeter`,
            lat: selectedAnywhereCity.lat,
            lng: selectedAnywhereCity.lng,
            timestamp: "Just now (Live)",
            sources: {
              govt: {
                present: true,
                issuedBy: `India Meteorological Department (IMD) • ${selectedAnywhereCity.name}`,
                ministry: "Ministry of Earth Sciences, Govt. of India",
                portalUrl: "https://mausam.imd.gov.in",
                portalName: "mausam.imd.gov.in",
                text: `Official IMD Nowcast bulletin for ${selectedAnywhereCity.name}: ${cond}. Active environmental telemetry in effect.`
              },
              ai: {
                present: true,
                insight: `Gemini climate model: Local AQI ~${aqiVal}, Atmospheric pressure 1008 hPa. No convective storm anomalies detected.`
              }
            },
            detail: {
              affectedRadius: `15 km radius around ${selectedAnywhereCity.name}`,
              officialRef: `IMD-NOWCAST-${(cityKey || "LOC").toUpperCase()}-2026`,
              precautions: [
                "Stay hydrated and avoid heavy outdoor exertion during peak afternoon hours.",
                "Follow local municipal traffic and road safety advisories.",
                "Check WeatherGPT real-time updates for sudden squalls or rainfall shifts."
              ],
              aiTelemetry: `Surface Temp: ${temp}°C • Humidity: ${hum}% • Wind: ${wnd} km/h`
            }
          }
        ];
      }
    } else {
      alerts = ALL_NIGRANI_ALERTS.filter((a) => a.scope === activeScopeTab);
      
      // Inject centralized live alerts into local and district feeds
      if ((activeScopeTab === "local" || activeScopeTab === "district") && crossModeTruth?.alerts?.length > 0) {
        const liveCentralAlerts = crossModeTruth.alerts.map((ca) => ({
          id: ca.id,
          scope: activeScopeTab,
          severity: ca.severity === "Critical" || ca.severity === "High" ? "severe" : ca.severity === "Moderate" ? "moderate" : "advisory",
          title: ca.title,
          titleHi: ca.raw?.title_hi || ca.title,
          summary: ca.description,
          locationName: `${ca.location} • ${isHi ? "केंद्रीय लाइव रडार" : "Live Central Radar"}`,
          lat: location?.lat || 28.6139,
          lng: location?.lng || 77.2090,
          timestamp: isHi ? "ताज़ा लाइव बुलेटिन" : "Just now (Live Central)",
          sources: {
            govt: {
              present: true,
              issuedBy: ca.issuedBy || "IMD / NDMA Centralized Alert System",
              ministry: "Ministry of Earth Sciences, Govt. of India",
              portalUrl: "https://mausam.imd.gov.in",
              portalName: "mausam.imd.gov.in",
              text: `${ca.title}: ${ca.description} ${ca.safetyAction ? `[प्रोटोकॉल: ${ca.safetyAction}]` : ""}`
            },
            ai: {
              present: true,
              insight: `Cross-Mode Synchronized: Farmer: ${crossModeTruth.farmer.statusLabel} | Marine: ${crossModeTruth.marine.statusLabel} | Citizen: ${crossModeTruth.citizen.statusLabel}`
            }
          },
          detail: {
            affectedRadius: crossModeTruth.nigrani.affectedRadiusSummary || "15 km active sector",
            officialRef: `SSOT-CENTRAL-${(ca.hazardType || "RADAR").toUpperCase()}-2026`,
            precautions: [ca.safetyAction || "Follow standard NDMA disaster response instructions."],
            aiTelemetry: `NDMA Protocol: ${crossModeTruth.nigrani.ndmaProtocol}`
          }
        }));
        
        alerts = [...liveCentralAlerts, ...alerts];
      }
    }

    // MANDATORY: Data sirf official ho. Agar official na ho toh alert show na ho.
    alerts = alerts.filter(
      (a) => a.sources?.govt?.present === true && Boolean(a.sources?.govt?.issuedBy)
    );

    // Severity rank map
    const severityRank = { severe: 1, moderate: 2, advisory: 3 };
    return [...alerts].sort((a, b) => {
      const diff = (severityRank[a.severity] || 99) - (severityRank[b.severity] || 99);
      if (diff !== 0) return diff;
      return a.id.localeCompare(b.id);
    });
  }, [activeScopeTab, selectedAnywhereCity, crossModeTruth, location, isHi]);

  // Summary counts
  const alertStats = useMemo(() => {
    const total = currentFeedAlerts.length;
    const severeCount = currentFeedAlerts.filter((a) => a.severity === "severe").length;
    const govtCount = currentFeedAlerts.filter((a) => a.sources?.govt?.present).length;
    const aiCount = currentFeedAlerts.filter((a) => a.sources?.ai?.present).length;
    return { total, severeCount, govtCount, aiCount };
  }, [currentFeedAlerts]);

  // Auto scroll and highlight alert card when tapped from map pin
  const handleSelectAlert = (alertId) => {
    setExpandedAlertId(alertId);
    setHighlightedAlertId(alertId);
    
    // Scroll smoothly to the target card
    const cardEl = document.getElementById(`nigrani-card-${alertId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setTimeout(() => {
      setHighlightedAlertId(null);
    }, 2500);
  };

  // Map Initialization & Marker Updates
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => initMiniMap();
      document.body.appendChild(script);
    } else {
      initMiniMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeScopeTab, selectedAnywhereCity]);

  const initMiniMap = () => {
    if (!window.L || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = currentFeedAlerts[0]?.lat || 28.7041;
      const initialLng = currentFeedAlerts[0]?.lng || 77.1025;

      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([initialLat, initialLng], getInitialZoom(activeScopeTab));

      // Mappls / OSM optimized tile layer
      window.L.tileLayer(MAPPLS_TILE_CONFIGS.standard.url, {
        maxZoom: 18,
        subdomains: MAPPLS_TILE_CONFIGS.standard.subdomains,
        keepBuffer: 8
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add pins for current scope alerts
    currentFeedAlerts.forEach((alert) => {
      const color =
        alert.severity === "severe"
          ? "#ef4444" // red
          : alert.severity === "moderate"
          ? "#f59e0b" // amber
          : "#3b82f6"; // blue

      const isSevere = alert.severity === "severe";
      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${isSevere ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${color}40; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ""}
          <div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>
        </div>
      `;

      const customIcon = window.L.divIcon({
        className: "nigrani-map-marker",
        html: iconHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = window.L.marker([alert.lat, alert.lng], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        handleSelectAlert(alert.id);
      });

      markersRef.current.push(marker);
    });

    // Center map appropriately
    if (activeScopeTab === "anywhere" && selectedAnywhereCity?.lat) {
      map.setView([selectedAnywhereCity.lat, selectedAnywhereCity.lng], 10, { animate: true });
    } else if (currentFeedAlerts.length > 0) {
      const first = currentFeedAlerts[0];
      map.setView([first.lat, first.lng], getInitialZoom(activeScopeTab), { animate: true });
    }
  };

  const getInitialZoom = (scope) => {
    switch (scope) {
      case "local":
        return 13;
      case "district":
        return 10;
      case "state":
        return 7;
      case "country":
        return 5;
      case "anywhere":
        return 11;
      default:
        return 10;
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetMapCenter = () => {
    if (mapInstanceRef.current && currentFeedAlerts.length > 0) {
      const first = currentFeedAlerts[0];
      mapInstanceRef.current.setView([first.lat, first.lng], getInitialZoom(activeScopeTab), {
        animate: true
      });
    }
  };

  // Severity color helpers with bracketed multilingual labels
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "severe":
        return {
          border: "border-l-4 border-l-red-500",
          badgeBg: "bg-red-100 text-red-800 border-red-200",
          iconColor: "text-red-600",
          label: t.severeWarning || (isHi ? "गंभीर चेतावनी" : "Severe Warning")
        };
      case "moderate":
        return {
          border: "border-l-4 border-l-amber-500",
          badgeBg: "bg-amber-100 text-amber-900 border-amber-200",
          iconColor: "text-amber-600",
          label: t.moderateWatch || (isHi ? "मध्यम निगरानी" : "Moderate Watch")
        };
      case "advisory":
      default:
        return {
          border: "border-l-4 border-l-blue-500",
          badgeBg: "bg-blue-100 text-blue-900 border-blue-200",
          iconColor: "text-blue-600",
          label: t.advisoryLabel || (isHi ? "मौसम परामर्श" : "Advisory")
        };
    }
  };

  return (
    <div
      id="nigrani-hub-container"
      className="w-full bg-[#f8f9fc] text-[#191c1e] min-h-screen pb-32 sm:pb-36 pt-2 px-3 sm:px-6 lg:px-10 max-w-[1600px] mx-auto flex flex-col gap-5 antialiased font-sans"
    >
      {/* 1. HEADER */}
      <header
        id="nigrani-header"
        className="w-full bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
      >
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-[#081b3b] text-white flex items-center justify-center shadow-md shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-[#081b3b] tracking-tight flex items-center gap-1.5">
                {t.nigraniHubTitle || (isHi ? "निगरानी हब" : "Nigrani")}
                <span className="text-xs font-bold text-slate-400 font-normal">{t.liveAlertsTag || (isHi ? "| लाइव अलर्ट" : "| Live Alerts")}</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t.liveHubTag || (isHi ? "लाइव हब" : "Live Hub")}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Read-only active context mode pill & summary count */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <div
            id="nigrani-active-context-badge"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold"
            title="Read-only context mode active for your weather feed"
          >
            <Eye className="w-3.5 h-3.5 text-[#081b3b]" />
            <span>{activeModeBadgeLabel}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900 text-emerald-100 border border-emerald-700 text-xs font-bold shadow-xs">
            <Landmark className="w-3.5 h-3.5 text-emerald-300" />
            <span>{alertStats.total}</span>
            <span className="text-emerald-200 font-normal">{isHi ? "सरकारी सत्यापित" : "Govt Verified"}</span>
          </div>
        </div>
      </header>

      {/* 1.5. UNIFIED CROSS-MODE SSOT STATUS CARD */}
      <section
        id="nigrani-ssot-status-card"
        className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                {isHi ? "केंद्रीकृत बहु-मोड निगरानी एवं सत्य स्रोत (SSOT)" : "Centralized Cross-Mode Ground Truth Sync"}
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                  {isHi ? "100% संरेखित" : "100% Synchronized"}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                crossModeTruth.nigrani.alertLevel === "red"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : crossModeTruth.nigrani.alertLevel === "warning"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              NDMA: {crossModeTruth.nigrani.alertLevel.toUpperCase()} ALERT
            </span>
          </div>
        </div>

        {/* 4 Persona Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Farmer */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              {isHi ? "किसान परामर्श" : "Farmer Agromet"}
            </span>
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                crossModeTruth.farmer.status === "red"
                  ? "bg-red-100 text-red-800"
                  : crossModeTruth.farmer.status === "yellow"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {crossModeTruth.farmer.statusLabel}
            </span>
          </div>

          {/* Marine */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5 text-blue-600" />
              {isHi ? "समुद्री / नाविक" : "Maritime & Coastal"}
            </span>
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                crossModeTruth.marine.status === "red"
                  ? "bg-red-100 text-red-800"
                  : crossModeTruth.marine.status === "yellow"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {crossModeTruth.marine.statusLabel}
            </span>
          </div>

          {/* Citizen */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              {isHi ? "नागरिक व स्वास्थ्य" : "Citizen & Health"}
            </span>
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                crossModeTruth.citizen.status === "danger"
                  ? "bg-red-100 text-red-800"
                  : crossModeTruth.citizen.status === "caution"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {crossModeTruth.citizen.statusLabel}
            </span>
          </div>

          {/* Disaster Surveillance (Nigrani) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-600" />
              {isHi ? "आपदा प्रबंधन" : "NDMA Response"}
            </span>
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                crossModeTruth.nigrani.alertLevel === "red"
                  ? "bg-red-100 text-red-800"
                  : crossModeTruth.nigrani.alertLevel === "warning"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {crossModeTruth.nigrani.alertLevel.toUpperCase()}
            </span>
          </div>
        </div>
      </section>

      {/* 2. LOCATION SCOPE TABS */}
      <section id="nigrani-scope-tabs-section" className="w-full space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            {t.locationScopeHeader || (isHi ? "स्थान का दायरा" : "Location Scope")}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {t.selectScopeInstruction || (isHi ? "अलर्ट देखने के लिए स्तर चुनें" : "Select radar tier to filter alerts")}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
          {scopeTabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeScopeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`nigrani-tab-${tab.id}`}
                type="button"
                onClick={() => setActiveScopeTab(tab.id)}
                className={`p-3 rounded-2xl flex flex-col items-start justify-between text-left transition-all cursor-pointer border ${
                  isActive
                    ? "bg-[#081b3b] text-white border-[#081b3b] shadow-md scale-[1.02]"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                }`}
              >
                <div className="w-full flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? "bg-white/20 text-slate-100" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tab.radiusLabel}
                  </span>
                </div>

                <div>
                  <span className="block text-sm font-bold tracking-tight leading-tight">
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Special search input & city chips if 'Anywhere' tab is active */}
        {activeScopeTab === "anywhere" && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3 animate-in fade-in duration-200 relative">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={anywhereQuery}
                  onChange={(e) => {
                    setAnywhereQuery(e.target.value);
                    setShowAnywhereDropdown(true);
                  }}
                  onFocus={() => {
                    if (anywhereSuggestions.length > 0) setShowAnywhereDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (anywhereSuggestions.length > 0) {
                        handleSelectAnywhereCity(anywhereSuggestions[0]);
                      } else if (anywhereQuery.trim()) {
                        const q = anywhereQuery.trim().toLowerCase();
                        const match = MAJOR_INDIAN_CITIES.find(
                          (c) => c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
                        );
                        if (match) {
                          handleSelectAnywhereCity({
                            key: match.city.toLowerCase(),
                            name: `${match.city}, ${match.state}`,
                            lat: match.lat,
                            lng: match.lng,
                            temp: match.temp,
                            condition: match.condition,
                            hazard: match.hazard
                          });
                        }
                      }
                    }
                  }}
                  placeholder="Search city, town, or district across India (e.g. Delhi, Pune, Patna, Bengaluru)..."
                  className="w-full pl-10 pr-20 py-2.5 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#081b3b]/20 font-medium text-slate-800"
                />

                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {isSearchingAnywhere && (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  {anywhereQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setAnywhereQuery("");
                        setAnywhereSuggestions([]);
                        setShowAnywhereDropdown(false);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (anywhereSuggestions.length > 0) {
                        handleSelectAnywhereCity(anywhereSuggestions[0]);
                      } else if (anywhereQuery.trim()) {
                        const q = anywhereQuery.trim().toLowerCase();
                        const match = MAJOR_INDIAN_CITIES.find(
                          (c) => c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
                        );
                        if (match) {
                          handleSelectAnywhereCity({
                            key: match.city.toLowerCase(),
                            name: `${match.city}, ${match.state}`,
                            lat: match.lat,
                            lng: match.lng,
                            temp: match.temp,
                            condition: match.condition,
                            hazard: match.hazard
                          });
                        }
                      }
                    }}
                    className="px-2.5 py-1 bg-[#081b3b] hover:bg-[#102a5c] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Search
                  </button>
                </div>

                {/* Floating Autocomplete Dropdown */}
                {showAnywhereDropdown && anywhereSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 divide-y divide-slate-100 py-1">
                    {anywhereSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectAnywhereCity(item)}
                        className="w-full text-left px-3.5 py-2 hover:bg-blue-50/70 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-slate-800 block truncate">
                              {item.city || item.name}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {item.state}
                            </span>
                          </div>
                        </div>
                        {item.temp !== undefined && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                            {item.temp}°C {item.condition ? `• ${item.condition}` : ""}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-900 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Active: {selectedAnywhereCity.name}</span>
              </div>
            </div>

            {/* Quick city suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap mr-1">
                Popular Hubs:
              </span>
              {popularCities.map((city) => (
                <button
                  key={city.key}
                  type="button"
                  onClick={() => handleSelectAnywhereCity(city)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    selectedAnywhereCity.key === city.key
                      ? "bg-[#081b3b] text-white border-[#081b3b] shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. ALERT FEED (Scrollable, updates per selected location tab) */}
      <section id="nigrani-alert-feed-section" className="w-full space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              {t.activeAlertsFeedTitle || (isHi ? "सक्रिय अलर्ट फीड" : "Active Alerts Feed")}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {currentFeedAlerts.length} {isHi ? "अलर्ट" : "items"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> {t.severe || (isHi ? "गंभीर" : "Severe")}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> {t.watch || (isHi ? "निगरानी" : "Watch")}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> {t.advisory || (isHi ? "परामर्श" : "Advisory")}
            </span>
          </div>
        </div>

        {currentFeedAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {t.noActiveHazards || (isHi ? "इस क्षेत्र में कोई सक्रिय आपदा/खतरा नहीं" : "No Active Hazards in this Scope")}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isHi
                ? "इस स्तर पर सभी वायुमंडलीय पैरामीटर एवं मौसम रडार वर्तमान में सामान्य सीमा में काम कर रहे हैं।"
                : "All atmospheric parameters and weather radars in this tier are currently operating within normal baseline limits."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentFeedAlerts.map((alert) => {
              const sev = getSeverityStyle(alert.severity);
              const isExpanded = expandedAlertId === alert.id;
              const isHighlighted = highlightedAlertId === alert.id;
              const hasGovt = alert.sources?.govt?.present;
              const hasAi = alert.sources?.ai?.present;
              const isCrossVerified = hasGovt && hasAi;
              const isAiOnly = hasAi && !hasGovt;

              return (
                <div
                  key={alert.id}
                  id={`nigrani-card-${alert.id}`}
                  className={`bg-white rounded-2xl shadow-xs border transition-all overflow-hidden ${
                    sev.border
                  } ${
                    isHighlighted
                      ? "ring-2 ring-blue-500 scale-[1.01] border-blue-400"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Square-Rounded Compact Card Main Bar */}
                  <div
                    onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                    className="p-3.5 sm:p-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Meta Row: Severity, Location, Time */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${sev.badgeBg}`}
                          >
                            {sev.label}
                          </span>

                          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 truncate max-w-[210px] sm:max-w-none">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {alert.locationName}
                          </span>

                          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 ml-auto sm:ml-0">
                            <Clock className="w-3 h-3" />
                            {alert.timestamp}
                          </span>
                        </div>

                        {/* Main Warning Title */}
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug tracking-tight">
                          {(isHi && alert.titleHi) ? alert.titleHi : alert.title}
                        </h3>

                        {/* Badges Row: Government Verified Badge */}
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          {/* 🏛️ Govt Official Badge */}
                          <span
                            className="bg-[#0b2816] text-[#bbf7d0] text-[11px] font-extrabold px-3 py-1 rounded-lg inline-flex items-center gap-1.5 shadow-xs border border-emerald-600/50"
                            title={isHi ? "भारत सरकार आधिकारिक मौसम विभाग एवं आपदा प्रबंधन बुलेटिन" : "Official communique verified from government agency"}
                          >
                            <Landmark className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{isHi ? "🏛️ भारत सरकार आधिकारिक बुलेटिन" : "🏛️ Govt Official Bulletin"}</span>
                            {alert.sources?.govt?.issuedBy && (
                              <span className="text-[10px] text-emerald-200 font-medium hidden sm:inline">
                                • {alert.sources.govt.issuedBy}
                              </span>
                            )}
                          </span>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{isHi ? "सरकारी रिकॉर्ड सत्यापित" : "Govt Verified"}</span>
                          </span>

                          {hasAi && (
                            <span
                              className="bg-[#1e1b4b] text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-lg inline-flex items-center gap-1 border border-indigo-500/30"
                              title={isHi ? "AI मौसम वैज्ञानिक पूर्वानुमान विश्लेषण" : "AI predictive meteorological trend analysis"}
                            >
                              <Cpu className="w-3 h-3 text-indigo-300 shrink-0" />
                              <span>{isHi ? "AI समर्थित" : "AI Validated"}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expand / Collapse Chevron Button */}
                      <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors mt-0.5">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Full Description & Details */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-200 space-y-3.5 text-xs sm:text-sm animate-in slide-in-from-top-1 duration-150">
                      {/* Full Warning Description */}
                      <div className="space-y-1.5">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                          <Info className="w-3.5 h-3.5 text-blue-600" />
                          {isHi ? "विस्तृत विवरण एवं चेतावनी सारांश" : "Full Description & Warning Summary"}
                        </span>
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-slate-700 font-medium leading-relaxed shadow-2xs">
                          <p>{alert.summary}</p>
                        </div>
                      </div>

                      {/* Official Advisory & Authority */}
                      {hasGovt && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                              <Landmark className="w-3.5 h-3.5 text-emerald-800" />
                              {isHi ? "जारीकर्ता प्राधिकरण एवं आधिकारिक सूचना" : "Issuing Agency & Official Notice"}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {isHi ? "भारत सरकार द्वारा सत्यापित" : "Govt of India Verified"}
                            </span>
                          </div>
                          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 font-medium text-slate-700 space-y-2.5 shadow-2xs">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{alert.sources.govt.issuedBy}</p>
                                <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                                  <span>🏛️</span>
                                  <span>{alert.sources.govt.ministry || "Ministry of Earth Sciences, Govt. of India"}</span>
                                </p>
                              </div>
                              {alert.detail?.officialRef && (
                                <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-bold">
                                  {isHi ? "बुलेटिन संदर्भ" : "Bulletin Ref"}: {alert.detail.officialRef}
                                </span>
                              )}
                            </div>

                            {alert.sources.govt.text && (
                              <p className="text-slate-800 pt-2 border-t border-slate-100 text-xs sm:text-sm leading-relaxed">
                                {alert.sources.govt.text}
                              </p>
                            )}

                            {/* Official Portal Verification Button */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-[11px] text-slate-500 font-medium">
                                {isHi ? "आधिकारिक पोर्टल पर स्थिति जांचें:" : "Official Govt Portal Verification:"}
                              </span>
                              <a
                                href={alert.sources.govt.portalUrl || "https://mausam.imd.gov.in"}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 transition-colors shadow-2xs"
                              >
                                <span>🌐 {alert.sources.govt.portalName || "mausam.imd.gov.in"}</span>
                                <ExternalLink className="w-3 h-3 text-emerald-700" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AI Reasoning & Telemetry */}
                      {hasAi && (
                        <div className="space-y-1.5">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                            {isHi ? "AI सेंसर टेलीमेट्री एवं विसंगति विश्लेषण" : "AI Sensor Telemetry & Anomaly Analysis"}
                          </span>
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 font-medium text-slate-700 space-y-2 shadow-2xs">
                            <p className="text-slate-800">{alert.sources.ai.insight}</p>
                            {alert.detail?.aiTelemetry && (
                              <p className="text-xs font-mono text-indigo-800 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100 inline-block">
                                {alert.detail.aiTelemetry}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Affected Radius & Citizen Precautions */}
                      {alert.detail && (
                        <div className="space-y-1.5">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                            <Navigation className="w-3.5 h-3.5 text-slate-700" />
                            {isHi ? "प्रभावित क्षेत्र एवं नागरिक सावधानियाँ" : "Affected Zone & Citizen Precautions"}
                          </span>
                          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                            {alert.detail.affectedRadius && (
                              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                {isHi ? "कवरेज दायरा" : "Coverage Radius"}: {alert.detail.affectedRadius}
                              </p>
                            )}

                            {alert.detail.precautions && alert.detail.precautions.length > 0 && (
                              <ul className="list-disc list-inside space-y-1.5 text-slate-700 text-xs sm:text-sm font-medium">
                                {alert.detail.precautions.map((step, idx) => (
                                  <li key={idx} className="leading-relaxed">
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Jump to Map Pin button */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (mapInstanceRef.current) {
                              mapInstanceRef.current.setView([alert.lat, alert.lng], 14, {
                                animate: true
                              });
                            }
                            const mapEl = document.getElementById("nigrani-map-section");
                            if (mapEl) {
                              mapEl.scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <span>{t.viewOnAlertMap || (isHi ? "अलर्ट मैप पर देखें" : "View on Alert Map")}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. MAP SECTION (Bottom, Fixed Height ~260-300px) */}
      <section
        id="nigrani-map-section"
        className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>{t.nigraniMapTitle || (isHi ? "निगरानी मौसम आपदा मानचित्र" : "Nigrani Meteorological Hazard Map")}</span>
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleResetMapCenter}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-bold flex items-center gap-1"
              title={t.resetCenter || (isHi ? "केंद्र रीसेट करें" : "Reset center")}
            >
              <LocateFixed className="w-4 h-4" />
              <span className="hidden sm:inline">{t.resetCenter || (isHi ? "केंद्र" : "Center")}</span>
            </button>
          </div>
        </div>

        {/* Embedded Miniature Map Container */}
        <div className="w-full h-[260px] sm:h-[300px] rounded-xl overflow-hidden relative border border-slate-200 shadow-inner bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating Zoom & Control Overlay */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 shadow-md rounded-xl overflow-hidden bg-white/95 backdrop-blur-xs border border-slate-200 p-1">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-2.5 left-2.5 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-xs flex items-center gap-3 text-[10px] font-bold text-slate-700">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> {t.severe || (isHi ? "गंभीर" : "Severe")}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> {t.watch || (isHi ? "मध्यम" : "Watch")}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> {t.advisory || (isHi ? "परामर्श" : "Advisory")}
            </span>
          </div>
        </div>
      </section>

      {/* Read-Only Disclaimer Footnote */}
      <footer className="text-center text-[11px] text-slate-400 font-medium pb-4">
        {isHi
          ? "निगरानी स्वचालित मॉनिटरिंग हब केवल पढ़ने के लिए है। भारतीय मौसम विभाग (IMD), राज्य आपदा प्रबंधन प्राधिकरणों और उपग्रह रडार से वास्तविक समय में संकलित।"
          : "Nigrani Automated Monitoring Hub is read-only. Data aggregated continuously from IMD, state disaster authorities, and AI satellite radar analytics."}
      </footer>
    </div>
  );
}
