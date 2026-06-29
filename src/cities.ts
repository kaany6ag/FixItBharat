export interface City {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  landmark: string;
  emoji: string;
}

export const MASTER_CITIES: City[] = [
  // Pilot / Existing Cities
  { id: "gwalior", name: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lng: 78.1828, landmark: "Gwalior Fort", emoji: "🏰" },
  { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, landmark: "Upper Lake", emoji: "🌊" },
  { id: "indore", name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577, landmark: "Rajwada Palace", emoji: "✨" },
  { id: "delhi", name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, landmark: "India Gate", emoji: "🏛️" },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777, landmark: "Gateway of India", emoji: "🌇" },
  { id: "bangalore", name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946, landmark: "Lalbagh", emoji: "🌴" },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, landmark: "Hawa Mahal", emoji: "🎨" },

  // User Specified Additional Cities
  { id: "agra", name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081, landmark: "Taj Mahal", emoji: "🕌" },
  { id: "amritsar", name: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723, landmark: "Golden Temple", emoji: "⛪" },
  { id: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185, landmark: "Kailasagiri", emoji: "🌊" },
  { id: "bhubaneswar", name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245, landmark: "Lingaraj Temple", emoji: "🏛️" },
  { id: "coimbatore", name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558, landmark: "Marudamalai Temple", emoji: "🌿" },
  { id: "madurai", name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198, landmark: "Meenakshi Temple", emoji: "🎨" },
  { id: "mysuru", name: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394, landmark: "Mysore Palace", emoji: "🏰" },
  { id: "thiruvananthapuram", name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366, landmark: "Padmanabhaswamy Temple", emoji: "🌺" },
  { id: "guwahati", name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, landmark: "Kamakhya Temple", emoji: "🌸" },
  { id: "dehradun", name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322, landmark: "Robbers Cave", emoji: "🏔️" },
  { id: "shimla", name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734, landmark: "The Ridge", emoji: "❄️" },
  { id: "jodhpur", name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243, landmark: "Mehrangarh Fort", emoji: "🏯" },
  { id: "udaipur", name: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125, landmark: "City Palace", emoji: "🎪" },
  { id: "aurangabad", name: "Aurangabad", state: "Maharashtra", lat: 19.8762, lng: 75.3433, landmark: "Ajanta Caves", emoji: "🗿" },
  { id: "raipur", name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296, landmark: "Mahasamund", emoji: "🌳" },
  { id: "ranchi", name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096, landmark: "Hundru Falls", emoji: "💧" },
  { id: "jammu", name: "Jammu", state: "J&K", lat: 32.7266, lng: 74.8570, landmark: "Vaishno Devi", emoji: "⛰️" },
  { id: "srinagar", name: "Srinagar", state: "J&K", lat: 34.0837, lng: 74.7973, landmark: "Dal Lake", emoji: "🚣" },
  { id: "mangalore", name: "Mangalore", state: "Karnataka", lat: 12.9141, lng: 74.8560, landmark: "Panambur Beach", emoji: "🏖️" },
  { id: "vijayawada", name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.6480, landmark: "Kanaka Durga Temple", emoji: "🏛️" },
  { id: "tiruchirappalli", name: "Tiruchirappalli", state: "Tamil Nadu", lat: 10.7905, lng: 78.7047, landmark: "Rockfort Temple", emoji: "🪨" },
  { id: "jabalpur", name: "Jabalpur", state: "Madhya Pradesh", lat: 23.1815, lng: 79.9864, landmark: "Marble Rocks", emoji: "💎" },
  { id: "goa", name: "Goa", state: "Goa", lat: 15.2993, lng: 74.1240, landmark: "Basilica of Bom Jesus", emoji: "⛪" },
  { id: "noida", name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910, landmark: "Worlds of Wonder", emoji: "🎡" },
  { id: "gurugram", name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266, landmark: "Kingdom of Dreams", emoji: "🏙️" },
  { id: "faridabad", name: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178, landmark: "Surajkund", emoji: "🌅" },
  { id: "meerut", name: "Meerut", state: "Uttar Pradesh", lat: 28.9845, lng: 77.7064, landmark: "Augarnath Temple", emoji: "🛕" },
  { id: "allahabad", name: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463, landmark: "Triveni Sangam", emoji: "🌊" },
  { id: "kanpur", name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319, landmark: "Allen Forest Zoo", emoji: "🦁" },
  { id: "ludhiana", name: "Ludhiana", state: "Punjab", lat: 30.9010, lng: 75.8573, landmark: "Phillaur Fort", emoji: "🏯" },

  // Added Extra to reach 50+ (52 cities total)
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, landmark: "Charminar", emoji: "🕌" },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, landmark: "Marina Beach", emoji: "🌊" },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, landmark: "Victoria Memorial", emoji: "🏛️" },
  { id: "pune", name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, landmark: "Shaniwar Wada", emoji: "🏰" },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, landmark: "Sabarmati Ashram", emoji: "🕊️" },
  { id: "surat", name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311, landmark: "Dumas Beach", emoji: "🏖️" },
  { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, landmark: "Bara Imambara", emoji: "🕌" },
  { id: "patna", name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, landmark: "Golghar", emoji: "🏛️" },
  { id: "varanasi", name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 83.0062, landmark: "Kashi Vishwanath", emoji: "🛕" },
  { id: "chandigarh", name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794, landmark: "Rock Garden", emoji: "🪨" },
  { id: "kochi", name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, landmark: "Fort Kochi", emoji: "🛶" },
  { id: "nagpur", name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882, landmark: "Zero Mile Stone", emoji: "🍊" },
  { id: "rajkot", name: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022, landmark: "Watson Museum", emoji: "🏛️" },
  { id: "vapi", name: "Vapi", state: "Gujarat", lat: 20.3717, lng: 72.9082, landmark: "Daman Ganga", emoji: "🌊" },
  { id: "ujjain", name: "Ujjain", state: "Madhya Pradesh", lat: 23.1760, lng: 75.7885, landmark: "Mahakaleshwar Temple", emoji: "🛕" }
];

export const cityWards: Record<string, string[]> = {
  gwalior: ["Lashkar (Ward 7)", "Morar (Ward 12)", 
    "Hazira (Ward 3)", "Thatipur (Ward 18)", 
    "Fort Area (Ward 5)"],
  bhopal: ["TT Nagar (Ward 1)", "Arera Colony (Ward 8)",
    "Shahpura (Ward 15)", "Bairagarh (Ward 22)",
    "Kolar (Ward 19)"],
  delhi: ["Connaught Place (Ward 1)", "Lajpat Nagar (Ward 12)",
    "Dwarka (Ward 8)", "Rohini (Ward 25)",
    "Saket (Ward 18)"],
  mumbai: ["Andheri (Ward K)", "Bandra (Ward H)",
    "Dadar (Ward G)", "Borivali (Ward R)",
    "Kurla (Ward L)"],
  bangalore: ["Koramangala (Ward 68)", "Indiranagar (Ward 75)",
    "Whitefield (Ward 84)", "Jayanagar (Ward 58)",
    "Hebbal (Ward 26)"],
  jaipur: ["Malviya Nagar (Ward 5)", "Vaishali Nagar (Ward 18)",
    "Mansarovar (Ward 22)", "C-Scheme (Ward 8)",
    "Sanganer (Ward 35)"],
  hyderabad: ["Banjara Hills (Ward 8)", "Jubilee Hills (Ward 10)",
    "Secunderabad (Ward 15)", "Kukatpally (Ward 18)",
    "Madhapur (Ward 12)"],
  lucknow: ["Hazratganj (Ward 5)", "Gomti Nagar (Ward 22)",
    "Aliganj (Ward 18)", "Indira Nagar (Ward 25)",
    "Alambagh (Ward 15)"],
  kolkata: ["Park Street (Ward 62)", "Salt Lake (Ward 34)",
    "Howrah (Ward 12)", "Dumdum (Ward 8)",
    "Tollygunge (Ward 85)"],
  chennai: ["T Nagar (Ward 128)", "Anna Nagar (Ward 72)",
    "Velachery (Ward 174)", "Adyar (Ward 161)",
    "Tambaram (Ward 195)"],
  pune: ["Shivajinagar (Ward 8)", "Kothrud (Ward 22)",
    "Hadapsar (Ward 35)", "Aundh (Ward 15)",
    "Wanowrie (Ward 28)"],
  ahmedabad: ["Navrangpura (Ward 5)", "Vastrapur (Ward 18)",
    "Bopal (Ward 32)", "Maninagar (Ward 22)",
    "Satellite (Ward 15)"],
  indore: ["Vijay Nagar (Ward 5)", "Palasia (Ward 8)",
    "Rajwada (Ward 1)", "Scheme 54 (Ward 22)",
    "Bhawarkuan (Ward 15)"]
};

export const getCityWards = (cityId: string): string[] => {
  const wards = cityWards[cityId];
  if (wards) return wards;
  // Fallback default wards for other 50+ cities
  return [
    "Central Ward (Ward 1)",
    "North Ward (Ward 2)",
    "South Ward (Ward 3)",
    "East Ward (Ward 4)",
    "West Ward (Ward 5)"
  ];
};

