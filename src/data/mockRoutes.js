export const PRESET_ROUTES = [
  {
    id: "delhi-jaipur",
    name: "Delhi \u2794 Jaipur (NH 48 / Expressways)",
    from: "New Delhi",
    to: "Jaipur",
    distance: "280 km",
    duration: "4h 30m",
    overallRisk: "High",
    riskColor: "#f59e0b",
    summary: "Severe Heatwave hazard detected along the Rajasthan entry corridor. Surface road temperatures exceed 48\xB0C.",
    coordinates: [
      [28.6139, 77.209],
      // Delhi
      [28.4595, 77.0266],
      // Gurugram
      [28.192, 76.6191],
      // Rewari
      [27.7942, 76.2731],
      // Behror
      [27.3506, 75.9818],
      // Shahpura
      [26.9124, 75.7873]
      // Jaipur
    ],
    hazards: [
      {
        id: "hz-1",
        name: "Gurugram Expressway",
        lat: 28.4595,
        lng: 77.0266,
        hazardType: "Heavy Rain Zone",
        severity: "moderate",
        distanceKm: 32,
        warningText: "Waterlogging possible under IFFCO Chowk & Hero Honda Chowk flyovers."
      },
      {
        id: "hz-2",
        name: "Behror - Kotputli Stretch",
        lat: 27.7942,
        lng: 76.2731,
        hazardType: "Heatwave",
        severity: "high",
        distanceKm: 135,
        warningText: "\u{1F321} Severe Heatwave (43\xB0C+). High risk of tire blowouts. Check tire pressure before departure."
      },
      {
        id: "hz-3",
        name: "Shahpura Outskirts",
        lat: 27.3506,
        lng: 75.9818,
        hazardType: "Heatwave",
        severity: "high",
        distanceKm: 210,
        warningText: "Dry gusty loo winds and blowing dust. Reduced afternoon visibility."
      }
    ]
  },
  {
    id: "mumbai-pune",
    name: "Mumbai \u2794 Pune (Yashwantrao Chavan Expressway)",
    from: "Mumbai",
    to: "Pune",
    distance: "150 km",
    duration: "2h 50m",
    overallRisk: "High",
    riskColor: "#ef4444",
    summary: "Torrential downpours and thick fog in Khandala/Lonavala Ghat section. Reduced brake efficiency and rockfall risk.",
    coordinates: [
      [19.076, 72.8777],
      // Mumbai
      [19.033, 73.0297],
      // Navi Mumbai
      [18.895, 73.195],
      // Panvel
      [18.7557, 73.4091],
      // Lonavala Ghats
      [18.718, 73.682],
      // Talegaon
      [18.5204, 73.8567]
      // Pune
    ],
    hazards: [
      {
        id: "hz-mp-1",
        name: "Panvel Lowlands",
        lat: 18.895,
        lng: 73.195,
        hazardType: "Flood Risk",
        severity: "moderate",
        distanceKm: 42,
        warningText: "\u26A0\uFE0F Minor water pooling reported along service lanes."
      },
      {
        id: "hz-mp-2",
        name: "Bhor Ghat / Khandala Pass",
        lat: 18.7557,
        lng: 73.4091,
        hazardType: "Heavy Rain Zone",
        severity: "high",
        distanceKm: 85,
        warningText: "\u26A0\uFE0F Heavy Rain & Dense Mist (visibility < 50m). Potential landslide caution near Amrutanjan point."
      },
      {
        id: "hz-mp-3",
        name: "Dehu Road Bypass",
        lat: 18.718,
        lng: 73.682,
        hazardType: "Heavy Rain Zone",
        severity: "moderate",
        distanceKm: 120,
        warningText: "Aquaplaning risk on high-speed expressway lanes."
      }
    ]
  },
  {
    id: "chennai-bengaluru",
    name: "Chennai \u2794 Bengaluru (NH 48 via Krishnagiri)",
    from: "Chennai",
    to: "Bengaluru",
    distance: "345 km",
    duration: "5h 45m",
    overallRisk: "Moderate",
    riskColor: "#06b6d4",
    summary: "Localized afternoon convective showers between Vellore and Hosur with gusty crosswinds.",
    coordinates: [
      [13.0827, 80.2707],
      // Chennai
      [12.9719, 79.5315],
      // Kanchipuram
      [12.9165, 79.1325],
      // Vellore
      [12.5266, 78.2146],
      // Krishnagiri
      [12.7409, 77.8253],
      // Hosur
      [12.9716, 77.5946]
      // Bengaluru
    ],
    hazards: [
      {
        id: "hz-cb-1",
        name: "Vellore Valley",
        lat: 12.9165,
        lng: 79.1325,
        hazardType: "Heatwave",
        severity: "moderate",
        distanceKm: 140,
        warningText: "High afternoon humidity & 36\xB0C heat index."
      },
      {
        id: "hz-cb-2",
        name: "Krishnagiri - Hosur Ghat Ascent",
        lat: 12.5266,
        lng: 78.2146,
        hazardType: "Heavy Rain Zone",
        severity: "moderate",
        distanceKm: 260,
        warningText: "Sudden evening squalls and slippery tarmac on incline sections."
      }
    ]
  },
  {
    id: "kolkata-puri",
    name: "Kolkata \u2794 Puri (NH 16 via Kharagpur & Cuttack)",
    from: "Kolkata",
    to: "Puri",
    distance: "500 km",
    duration: "9h 15m",
    overallRisk: "High",
    riskColor: "#ef4444",
    summary: "Cyclone Watch Alert active along the coastal Odisha corridor. High wind gusts and squally rain bands.",
    coordinates: [
      [22.5726, 88.3639],
      // Kolkata
      [22.346, 87.232],
      // Kharagpur
      [21.4934, 86.9135],
      // Balasore
      [20.4625, 85.8828],
      // Cuttack
      [20.2961, 85.8245],
      // Bhubaneswar
      [19.8135, 85.8312]
      // Puri
    ],
    hazards: [
      {
        id: "hz-kp-1",
        name: "Balasore Coastal Belt",
        lat: 21.4934,
        lng: 86.9135,
        hazardType: "Severe Weather",
        severity: "high",
        distanceKm: 240,
        warningText: "\u{1F300} Cyclone outer bands: Wind gusts 65-75 km/h. Avoid parking under tall trees or billboards."
      },
      {
        id: "hz-kp-2",
        name: "Mahanadi Cuttack Bridges",
        lat: 20.4625,
        lng: 85.8828,
        hazardType: "Flood Risk",
        severity: "high",
        distanceKm: 420,
        warningText: "\u26A0\uFE0F High river discharge causing water spray and crosswinds across major bridge spans."
      },
      {
        id: "hz-kp-3",
        name: "Bhubaneswar - Puri Marine Drive",
        lat: 19.8135,
        lng: 85.8312,
        hazardType: "Severe Weather",
        severity: "high",
        distanceKm: 495,
        warningText: "\u{1F300} Coastal storm surge warning. Coastal road travel restricted for light vehicles."
      }
    ]
  }
];
