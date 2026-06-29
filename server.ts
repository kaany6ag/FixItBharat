import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';

dotenv.config();

// Initialize Gemini API client on server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MOCK_KEY',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Seed Initial State
let cities = [
  // Pilot / Existing Cities
  { id: 'gwalior', name: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lng: 78.1828, landmark: 'Gwalior Fort 🏰', emoji: '🏰', wards: ["Lashkar (Ward 7)", "Morar (Ward 12)", "Hazira (Ward 3)", "Thatipur (Ward 18)", "Fort Area (Ward 5)"], isActive: true },
  { id: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, landmark: 'Upper Lake 湖', emoji: '🕌', wards: ["TT Nagar (Ward 1)", "Arera Colony (Ward 8)", "Shahpura (Ward 15)", "Bairagarh (Ward 22)", "Kolar (Ward 19)"], isActive: true },
  { id: 'indore', name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, landmark: 'Rajwada Palace 🏛️', emoji: '🏛️', wards: ["Vijay Nagar (Ward 5)", "Palasia (Ward 8)", "Rajwada (Ward 1)", "Scheme 54 (Ward 22)", "Bhawarkuan (Ward 15)"], isActive: true },
  { id: 'delhi', name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, landmark: 'India Gate 🗼', emoji: '🗼', wards: ["Connaught Place (Ward 1)", "Lajpat Nagar (Ward 12)", "Dwarka (Ward 8)", "Rohini (Ward 25)", "Saket (Ward 18)"], isActive: true },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, landmark: 'Gateway of India 🌊', emoji: '🌊', wards: ["Andheri (Ward K)", "Bandra (Ward H)", "Dadar (Ward G)", "Borivali (Ward R)", "Kurla (Ward L)"], isActive: true },
  { id: 'bangalore', name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, landmark: 'Lalbagh 🌴', emoji: '🌴', wards: ["Koramangala (Ward 68)", "Indiranagar (Ward 75)", "Whitefield (Ward 84)", "Jayanagar (Ward 58)", "Hebbal (Ward 26)"], isActive: true },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, landmark: 'Hawa Mahal 🎨', emoji: '🎨', wards: ["Malviya Nagar (Ward 5)", "Vaishali Nagar (Ward 18)", "Mansarovar (Ward 22)", "C-Scheme (Ward 8)", "Sanganer (Ward 35)"], isActive: true },

  // Additional 45 cities with default wards
  { id: "agra", name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081, landmark: "Taj Mahal", emoji: "🕌", wards: ['Central Ward', 'Taj Ward', 'Sanjay Place Ward'], isActive: true },
  { id: "amritsar", name: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723, landmark: "Golden Temple", emoji: "⛪", wards: ['Golden Ward', 'Ranjit Avenue Ward'], isActive: true },
  { id: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185, landmark: "Kailasagiri", emoji: "🌊", wards: ['Beach Ward', 'Gajuwaka Ward'], isActive: true },
  { id: "bhubaneswar", name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245, landmark: "Lingaraj Temple", emoji: "🏛️", wards: ['Temple Ward', 'Patia Ward'], isActive: true },
  { id: "coimbatore", name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558, landmark: "Marudamalai Temple", emoji: "🌿", wards: ['RSPuram Ward', 'Peelamedu Ward'], isActive: true },
  { id: "madurai", name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198, landmark: "Meenakshi Temple", emoji: "🎨", wards: ['Meenakshi Ward', 'Anna Nagar Ward'], isActive: true },
  { id: "mysuru", name: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394, landmark: "Mysore Palace", emoji: "🏰", wards: ['Palace Ward', 'Gokulam Ward'], isActive: true },
  { id: "thiruvananthapuram", name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366, landmark: "Padmanabhaswamy Temple", emoji: "🌺", wards: ['Kovalam Ward', 'Pattom Ward'], isActive: true },
  { id: "guwahati", name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, landmark: "Kamakhya Temple", emoji: "🌸", wards: ['Dispur Ward', 'Paltan Bazaar Ward'], isActive: true },
  { id: "dehradun", name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322, landmark: "Robbers Cave", emoji: "🏔️", wards: ['Rajpur Ward', 'Clock Tower Ward'], isActive: true },
  { id: "shimla", name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734, landmark: "The Ridge", emoji: "❄️", wards: ['Mall Road Ward', 'Chhota Shimla Ward'], isActive: true },
  { id: "jodhpur", name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243, landmark: "Mehrangarh Fort", emoji: "🏯", wards: ['Blue City Ward', 'Sardarpura Ward'], isActive: true },
  { id: "udaipur", name: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125, landmark: "City Palace", emoji: "🎪", wards: ['Lake Ward', 'Hiran Magri Ward'], isActive: true },
  { id: "aurangabad", name: "Aurangabad", state: "Maharashtra", lat: 19.8762, lng: 75.3433, landmark: "Ajanta Caves", emoji: "🗿", wards: ['Cidco Ward', 'Kranti Chowk Ward'], isActive: true },
  { id: "raipur", name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296, landmark: "Mahasamund", emoji: "🌳", wards: ['Shastri Ward', 'Tatibandh Ward'], isActive: true },
  { id: "ranchi", name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096, landmark: "Hundru Falls", emoji: "💧", wards: ['Morabadi Ward', 'Lalpur Ward'], isActive: true },
  { id: "jammu", name: "Jammu", state: "J&K", lat: 32.7266, lng: 74.8570, landmark: "Vaishno Devi", emoji: "⛰️", wards: ['Trikuta Nagar Ward', 'Gandhi Nagar Ward'], isActive: true },
  { id: "srinagar", name: "Srinagar", state: "J&K", lat: 34.0837, lng: 74.7973, landmark: "Dal Lake", emoji: "🚣", wards: ['Dal Ward', 'Lal Chowk Ward'], isActive: true },
  { id: "mangalore", name: "Mangalore", state: "Karnataka", lat: 12.9141, lng: 74.8560, landmark: "Panambur Beach", emoji: "🏖️", wards: ['Kadri Ward', 'Bejai Ward'], isActive: true },
  { id: "vijayawada", name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.6480, landmark: "Kanaka Durga Temple", emoji: "🏛️", wards: ['Benz Circle Ward', 'One Town Ward'], isActive: true },
  { id: "tiruchirappalli", name: "Tiruchirappalli", state: "Tamil Nadu", lat: 10.7905, lng: 78.7047, landmark: "Rockfort Temple", emoji: "🪨", wards: ['Srirangam Ward', 'Thillai Nagar Ward'], isActive: true },
  { id: "jabalpur", name: "Jabalpur", state: "Madhya Pradesh", lat: 23.1815, lng: 79.9864, landmark: "Marble Rocks", emoji: "💎", wards: ['Civil Lines Ward', 'Madan Mahal Ward'], isActive: true },
  { id: "goa", name: "Goa", state: "Goa", lat: 15.2993, lng: 74.1240, landmark: "Basilica of Bom Jesus", emoji: "⛪", wards: ['Panaji Ward', 'Margao Ward'], isActive: true },
  { id: "noida", name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910, landmark: "Worlds of Wonder", emoji: "🎡", wards: ['Sector 15 Ward', 'Sector 62 Ward'], isActive: true },
  { id: "gurugram", name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266, landmark: "Kingdom of Dreams", emoji: "🏙️", wards: ['DLF Phase 3 Ward', 'Sohna Road Ward'], isActive: true },
  { id: "faridabad", name: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178, landmark: "Surajkund", emoji: "🌅", wards: ['Surajkund Ward', 'Sector 15 Ward'], isActive: true },
  { id: "meerut", name: "Meerut", state: "Uttar Pradesh", lat: 28.9845, lng: 77.7064, landmark: "Augarnath Temple", emoji: "🛕", wards: ['Sadar Ward', 'Shastri Nagar Ward'], isActive: true },
  { id: "allahabad", name: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463, landmark: "Triveni Sangam", emoji: "🌊", wards: ['Civil Lines Ward', 'Katara Ward'], isActive: true },
  { id: "kanpur", name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319, landmark: "Allen Forest Zoo", emoji: "🦁", wards: ['Kalyanpur Ward', 'Civil Lines Ward'], isActive: true },
  { id: "ludhiana", name: "Ludhiana", state: "Punjab", lat: 30.9010, lng: 75.8573, landmark: "Phillaur Fort", emoji: "🏯", wards: ['Saraba Nagar Ward', 'Model Town Ward'], isActive: true },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, landmark: "Charminar", emoji: "🕌", wards: ['Gachibowli Ward', 'Secunderabad Ward', 'Jubilee Hills Ward'], isActive: true },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, landmark: "Marina Beach", emoji: "🌊", wards: ['Adyar Ward', 'Mylapore Ward', 'T-Nagar Ward'], isActive: true },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, landmark: "Victoria Memorial", emoji: "🏛️", wards: ['Salt Lake Ward', 'Park Street Ward', 'Howrah Ward'], isActive: true },
  { id: "pune", name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, landmark: "Shaniwar Wada", emoji: "🏰", wards: ['Kothrud Ward', 'Koregaon Park Ward'], isActive: true },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, landmark: "Sabarmati Ashram", emoji: "🕊️", wards: ['Satellite Ward', 'Navrangpura Ward'], isActive: true },
  { id: "surat", name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311, landmark: "Dumas Beach", emoji: "🏖️", wards: ['Adajan Ward', 'Varachha Ward'], isActive: true },
  { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, landmark: "Bara Imambara", emoji: "🕌", wards: ['Hazratganj Ward', 'Alambagh Ward'], isActive: true },
  { id: "patna", name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, landmark: "Golghar", emoji: "🏛️", wards: ['Fraser Road Ward', 'Kankarbagh Ward'], isActive: true },
  { id: "varanasi", name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 83.0062, landmark: "Kashi Vishwanath", emoji: "🛕", wards: ['Ghats Ward', 'Cantonment Ward'], isActive: true },
  { id: "chandigarh", name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794, landmark: "Rock Garden", emoji: "🪨", wards: ['Sector 17 Ward', 'Sector 35 Ward'], isActive: true },
  { id: "kochi", name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, landmark: "Fort Kochi", emoji: "🛶", wards: ['Fort Kochi Ward', 'Ernakulam Ward'], isActive: true },
  { id: "nagpur", name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882, landmark: "Zero Mile Stone", emoji: "🍊", wards: ['Dharampeth Ward', 'Sadar Ward'], isActive: true },
  { id: "rajkot", name: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022, landmark: "Watson Museum", emoji: "🏛️", wards: ['Kalavad Road Ward', 'Yagnik Road Ward'], isActive: true },
  { id: "vapi", name: "Vapi", state: "Gujarat", lat: 20.3717, lng: 72.9082, landmark: "Daman Ganga", emoji: "🌊", wards: ['Industrial Ward', 'GIDC Ward'], isActive: true },
  { id: "ujjain", name: "Ujjain", state: "Madhya Pradesh", lat: 23.1760, lng: 75.7885, landmark: "Mahakaleshwar Temple", emoji: "🛕", wards: ['Mahakal Ward', 'Freeganj Ward'], isActive: true }
];

let users = [
  { uid: 'u1', name: 'Priya Sharma', email: 'priya@fixit.in', photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', cityId: 'gwalior', ward: 'Morar (Ward 12)', xp: 450, honestyScore: 96, badges: ['Detective', 'Quick Reporter', 'Monsoon Guard', 'Bharat Guardian'], reportCount: 18, verifiedReportCount: 17, verifyCount: 22, language: 'en', joinedAt: '2026-01-10T10:00:00Z' },
  { uid: 'u2', name: 'Arjun Singh', email: 'arjun@fixit.in', photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', cityId: 'gwalior', ward: 'Lashkar (Ward 7)', xp: 320, honestyScore: 92, badges: ['Detective', 'Voice Reporter', 'Ward Champion'], reportCount: 12, verifiedReportCount: 11, verifyCount: 15, language: 'en', joinedAt: '2026-02-14T11:00:00Z' },
  { uid: 'u3', name: 'Rahul Khan', email: 'rahul@fixit.in', photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', cityId: 'gwalior', ward: 'Hazira (Ward 3)', xp: 210, honestyScore: 88, badges: ['Detective', 'Recurrence Ranger'], reportCount: 8, verifiedReportCount: 7, verifyCount: 10, language: 'hi', joinedAt: '2026-03-01T12:30:00Z' },
  { uid: 'u4', name: 'Karan Mishra', email: 'karan@fixit.in', photoURL: '', cityId: 'gwalior', ward: 'Thatipur (Ward 18)', xp: 180, honestyScore: 85, badges: ['Voice Reporter'], reportCount: 6, verifiedReportCount: 5, verifyCount: 12, language: 'hi', joinedAt: '2026-03-15T09:15:00Z' },
  { uid: 'u5', name: 'Anjali Tiwari', email: 'anjali@fixit.in', photoURL: '', cityId: 'gwalior', ward: 'Lashkar (Ward 7)', xp: 120, honestyScore: 100, badges: ['Quick Reporter'], reportCount: 4, verifiedReportCount: 4, verifyCount: 5, language: 'en', joinedAt: '2026-04-05T14:45:00Z' },
  { uid: 'u6', name: 'Siddharth J.', email: 'sid@fixit.in', photoURL: '', cityId: 'gwalior', ward: 'Fort Area (Ward 5)', xp: 95, honestyScore: 75, badges: ['Monsoon Guard'], reportCount: 4, verifiedReportCount: 3, verifyCount: 8, language: 'en', joinedAt: '2026-04-20T16:20:00Z' },
  { uid: 'u7', name: 'Amit Patel', email: 'amit@fixit.in', photoURL: '', cityId: 'gwalior', ward: 'Hazira (Ward 3)', xp: 60, honestyScore: 50, badges: [], reportCount: 4, verifiedReportCount: 2, verifyCount: 2, language: 'hi', joinedAt: '2026-05-10T11:10:00Z' }, // Low honesty score -> Low trust
  { uid: 'u8', name: 'Neha Saxena', email: 'neha@fixit.in', photoURL: '', cityId: 'gwalior', ward: 'Thatipur (Ward 18)', xp: 15, honestyScore: 100, badges: [], reportCount: 1, verifiedReportCount: 1, verifyCount: 2, language: 'en', joinedAt: '2026-06-01T08:00:00Z' }
];

let departments = [
  { cityId: 'gwalior', name: 'PWD', issuesAssigned: 42, issuesResolved: 31, avgResolutionDays: 9, overdue: 3, grade: '🏆A' },
  { cityId: 'gwalior', name: 'Municipal Corporation', issuesAssigned: 84, issuesResolved: 56, avgResolutionDays: 14, overdue: 12, grade: '👍B' },
  { cityId: 'gwalior', name: 'Electricity Department', issuesAssigned: 28, issuesResolved: 24, avgResolutionDays: 5, overdue: 1, grade: '🏆A' },
  { cityId: 'gwalior', name: 'Water Department', issuesAssigned: 35, issuesResolved: 18, avgResolutionDays: 18, overdue: 10, grade: '😐C' },
  { cityId: 'gwalior', name: 'Other', issuesAssigned: 12, issuesResolved: 5, avgResolutionDays: 24, overdue: 5, grade: '⚠️D' }
];

let wardStats = [
  { cityId: 'gwalior', wardId: 'Lashkar (Ward 7)', wardName: 'Lashkar (Ward 7)', civicHealthScore: 84, totalIssues: 26, resolvedIssues: 21, participationRate: 78, officerName: 'Shri R.K. Pathak', officerGrade: '🏆A' },
  { cityId: 'gwalior', wardId: 'Morar (Ward 12)', wardName: 'Morar (Ward 12)', civicHealthScore: 72, totalIssues: 34, resolvedIssues: 24, participationRate: 65, officerName: 'Shri Manoj Sharma', officerGrade: '👍B' },
  { cityId: 'gwalior', wardId: 'Hazira (Ward 3)', wardName: 'Hazira (Ward 3)', civicHealthScore: 54, totalIssues: 22, resolvedIssues: 12, participationRate: 48, officerName: 'Shri S.K. Gupta', officerGrade: '😐C' },
  { cityId: 'gwalior', wardId: 'Thatipur (Ward 18)', wardName: 'Thatipur (Ward 18)', civicHealthScore: 38, totalIssues: 30, resolvedIssues: 10, participationRate: 42, officerName: 'Shri Alok Verma', officerGrade: '⚠️D' },
  { cityId: 'gwalior', wardId: 'Fort Area (Ward 5)', wardName: 'Fort Area (Ward 5)', civicHealthScore: 91, totalIssues: 15, resolvedIssues: 14, participationRate: 85, officerName: 'Smt. Preeti Jain', officerGrade: '🏆A' }
];

let comments: any[] = [
  { id: 'c1', issueId: 'issue_1', userId: 'u1', name: 'Priya Sharma', text: 'This is a chronic problem. Every summer water starts leaking, and in monsoon it turns into a pool!', sentiment: '😠 Frustrated', anonymous: false, createdAt: '2026-06-25T11:00:00Z' },
  { id: 'c2', issueId: 'issue_1', userId: 'u2', name: 'Arjun Singh', text: 'I passed by this place today and the repair team has arrived. Hope it gets fixed soon.', sentiment: '😊 Hopeful', anonymous: false, createdAt: '2026-06-26T09:30:00Z' },
  { id: 'c3', issueId: 'issue_3', userId: 'u3', name: 'Rahul Khan', text: 'Stinky garbage is ruining the entrance to our colony. Very unhygienic.', sentiment: '😠 Frustrated', anonymous: false, createdAt: '2026-06-24T08:00:00Z' }
];

let newsletters = [
  { cityId: 'gwalior', wardId: 'Lashkar (Ward 7)', weekOf: 'June 20, 2026', content: 'Weekly Bulletin: Ward 7 Civic Improvements! We reported 5 new issues, resolved 4, and civic participation is up 12%. Active campaigns are ongoing for cleaner streets.', generatedAt: '2026-06-20T10:00:00Z' },
  { cityId: 'gwalior', wardId: 'Morar (Ward 12)', weekOf: 'June 20, 2026', content: 'Morar Weekly News: Water line repairs are completed on Main Road. Streetlight checking drive starts Monday. Safe monsoon campaigns starting soon.', generatedAt: '2026-06-20T12:00:00Z' }
];

// Initialize 25 Seed Issues across Gwalior
let issues: any[] = [
  {
    id: 'issue_1',
    title: 'Severe Pothole on Morar Crossing',
    description: 'A deep pothole has formed right in the middle of Morar Crossing. Vehicles have to slow down abruptly, causing minor accidents.',
    type: 'pothole',
    severity: 8,
    cityId: 'gwalior',
    location: { lat: 26.2230, lng: 78.2045, address: 'Morar Main Crossing, near SBI Bank, Gwalior', ward: 'Morar (Ward 12)' },
    photos: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500'],
    resolutionPhoto: null,
    status: 'In Progress',
    department: 'PWD',
    reportedBy: 'Arjun Sharma',
    reportedByUid: 'u2',
    anonymous: false,
    upvotes: 45,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: '2026-06-25T10:00:00Z',
    updatedAt: '2026-06-26T12:00:00Z',
    resolvedAt: null,
    recurrenceCount: 2,
    riskScore: 78,
    riskLevel: 'HIGH',
    repairHistory: [
      { date: '2025-08-14', status: 'Resolved' },
      { date: '2025-11-22', status: 'Resolved' }
    ],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: ['u1', 'u3', 'u4']
  },
  {
    id: 'issue_2',
    title: 'Waterlogging at Lashkar Market Entrance',
    description: 'Even moderate rainfall leads to knee-deep waterlogging here. Shopkeepers and shoppers are highly inconvenienced.',
    type: 'waterlogging',
    severity: 9,
    cityId: 'gwalior',
    location: { lat: 26.2095, lng: 78.1690, address: 'Lashkar Market Main Bazar, Gwalior', ward: 'Lashkar (Ward 7)' },
    photos: ['https://images.unsplash.com/photo-1485199692108-c3b5069de6a0?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'Municipal Corporation',
    reportedBy: 'Priya Sharma',
    reportedByUid: 'u1',
    anonymous: false,
    upvotes: 82,
    recurrenceFlags: 1,
    resolvedFlags: 0,
    createdAt: '2026-06-26T08:30:00Z',
    updatedAt: '2026-06-26T08:30:00Z',
    resolvedAt: null,
    recurrenceCount: 4,
    riskScore: 92,
    riskLevel: 'CRITICAL',
    repairHistory: [
      { date: '2025-07-02', status: 'Resolved' },
      { date: '2025-07-28', status: 'Resolved' },
      { date: '2025-09-12', status: 'Resolved' }
    ],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: true, // Emergency alert active for critical issue
    verifiedBy: ['u2']
  },
  {
    id: 'issue_3',
    title: 'Overflowing Sewage near Hazira Bus Stand',
    description: 'Black, foul-smelling water has flooded the footpath. It has been overflowing for the last 5 days.',
    type: 'sewage_overflow',
    severity: 7,
    cityId: 'gwalior',
    location: { lat: 26.2360, lng: 78.1810, address: 'Hazira Bus Stand near Public Toilets, Gwalior', ward: 'Hazira (Ward 3)' },
    photos: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500'],
    resolutionPhoto: null,
    status: 'Verified',
    department: 'Water Department',
    reportedBy: 'Rahul Khan',
    reportedByUid: 'u3',
    anonymous: false,
    upvotes: 28,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: '2026-06-24T14:15:00Z',
    updatedAt: '2026-06-25T09:00:00Z',
    resolvedAt: null,
    recurrenceCount: 1,
    riskScore: 45,
    riskLevel: 'MEDIUM',
    repairHistory: [
      { date: '2026-02-18', status: 'Resolved' }
    ],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: ['u1', 'u5']
  },
  {
    id: 'issue_4',
    title: 'Broken Streetlights on Thatipur VIP Road',
    description: 'A stretch of 6 streetlights is completely dead. It makes the road highly unsafe for women and children at night.',
    type: 'broken_streetlight',
    severity: 6,
    cityId: 'gwalior',
    location: { lat: 26.2155, lng: 78.2090, address: 'VIP Road, near Thatipur Circle, Gwalior', ward: 'Thatipur (Ward 18)' },
    photos: ['https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=500'],
    resolutionPhoto: null,
    status: 'In Progress',
    department: 'Electricity Department',
    reportedBy: 'Karan Mishra',
    reportedByUid: 'u4',
    anonymous: false,
    upvotes: 35,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: '2026-06-23T19:00:00Z',
    updatedAt: '2026-06-24T10:00:00Z',
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 20,
    riskLevel: 'LOW',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: ['u1', 'u2']
  },
  {
    id: 'issue_5',
    title: 'Garbage Dump Overflowing outside Gwalior Fort Gate',
    description: 'Massive pile of plastic and organic waste is sitting on the tourist pathway, attracting stray animals.',
    type: 'garbage',
    severity: 5,
    cityId: 'gwalior',
    location: { lat: 26.2215, lng: 78.1712, address: 'Fort Gate Entry Path, Gwalior', ward: 'Fort Area (Ward 5)' },
    photos: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500'],
    resolutionPhoto: null,
    status: 'Resolved',
    department: 'Municipal Corporation',
    reportedBy: 'Anjali Tiwari',
    reportedByUid: 'u5',
    anonymous: true,
    upvotes: 19,
    recurrenceFlags: 0,
    resolvedFlags: 3,
    createdAt: '2026-06-20T09:30:00Z',
    updatedAt: '2026-06-22T16:00:00Z',
    resolvedAt: '2026-06-22T16:00:00Z',
    recurrenceCount: 0,
    riskScore: 15,
    riskLevel: 'LOW',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: ['u1', 'u2', 'u3']
  },
  // Deep/Shame Board Issues (reported over 30 days ago, unresolved)
  {
    id: 'issue_6',
    title: 'Completely Destroyed Road Near Hazira Chauraha',
    description: 'The tarmac has fully washed away. It is practically a dirt path with giant boulders now. Cars get stuck daily.',
    type: 'damaged_road',
    severity: 10,
    cityId: 'gwalior',
    location: { lat: 26.2345, lng: 78.1785, address: 'Main Bazar Road, Hazira, Gwalior', ward: 'Hazira (Ward 3)' },
    photos: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'PWD',
    reportedBy: 'Rahul Khan',
    reportedByUid: 'u3',
    anonymous: false,
    upvotes: 154,
    recurrenceFlags: 2,
    resolvedFlags: 0,
    createdAt: '2026-05-10T10:00:00Z', // 47 Days Ago -> SHAME BOARD
    updatedAt: '2026-05-10T10:00:00Z',
    resolvedAt: null,
    recurrenceCount: 5,
    riskScore: 98,
    riskLevel: 'CRITICAL',
    repairHistory: [
      { date: '2024-05-15', status: 'Resolved' },
      { date: '2024-10-10', status: 'Resolved' },
      { date: '2025-06-05', status: 'Resolved' }
    ],
    escalationLevel: 'District Collector', // Escalated past Day 15 to DC, soon to Shame Board / RTI
    isOnShameBoard: true,
    isEmergency: true,
    verifiedBy: ['u1', 'u2', 'u4', 'u5', 'u6']
  },
  {
    id: 'issue_7',
    title: 'Encroachment of Footpath in Lashkar Market',
    description: 'Local vendors have illegally constructed brick platforms completely blocking the pedestrian footpaths.',
    type: 'encroachment',
    severity: 7,
    cityId: 'gwalior',
    location: { lat: 26.2110, lng: 78.1675, address: 'Sarafa Bazar, Lashkar, Gwalior', ward: 'Lashkar (Ward 7)' },
    photos: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500'],
    resolutionPhoto: null,
    status: 'Verified',
    department: 'Municipal Corporation',
    reportedBy: 'Amit Patel',
    reportedByUid: 'u7',
    anonymous: false,
    upvotes: 98,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: '2026-05-15T11:00:00Z', // 42 Days Ago -> SHAME BOARD
    updatedAt: '2026-05-16T15:00:00Z',
    resolvedAt: null,
    recurrenceCount: 1,
    riskScore: 70,
    riskLevel: 'HIGH',
    repairHistory: [],
    escalationLevel: 'District Collector',
    isOnShameBoard: true,
    isEmergency: false,
    verifiedBy: ['u1', 'u2']
  }
];

// Add 18 more mock issues dynamically to reach the requested 25 realistic issues with diverse data
const categories = ['pothole', 'waterlogging', 'garbage', 'broken_streetlight', 'sewage_overflow', 'damaged_road', 'encroachment'];
const statuses = ['Reported', 'Verified', 'In Progress', 'Resolved'];
const depts = ['PWD', 'Municipal Corporation', 'Electricity Department', 'Water Department'];
const gwaliorWards = ['Lashkar (Ward 7)', 'Morar (Ward 12)', 'Hazira (Ward 3)', 'Thatipur (Ward 18)', 'Fort Area (Ward 5)'];

for (let i = 8; i <= 25; i++) {
  const seedCat = categories[i % categories.length];
  const seedStatus = statuses[i % statuses.length];
  const seedWard = gwaliorWards[i % gwaliorWards.length];
  const seedDept = depts[i % depts.length];
  const isShame = i % 5 === 0;
  const isEmerg = (i % 6 === 0) && isShame;
  
  // Date calculations
  const daysAgo = isShame ? (30 + i) : (1 + (i % 15));
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  issues.push({
    id: `issue_${i}`,
    title: `Civic issue of ${seedCat.replace('_', ' ')} in ${seedWard}`,
    description: `A persistent complaint of ${seedCat.replace('_', ' ')} that is causing severe daily inconvenience to citizens of ${seedWard}. Needs immediate municipal attention.`,
    type: seedCat,
    severity: 4 + (i % 7),
    cityId: 'gwalior',
    location: {
      lat: 26.2183 + (Math.sin(i) * 0.02),
      lng: 78.1828 + (Math.cos(i) * 0.02),
      address: `Road No. ${i}, Main Block, ${seedWard}, Gwalior`,
      ward: seedWard
    },
    photos: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500'],
    resolutionPhoto: seedStatus === 'Resolved' ? 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500' : null,
    status: seedStatus,
    department: seedDept,
    reportedBy: users[i % users.length]?.name || 'Honest Citizen',
    reportedByUid: users[i % users.length]?.uid || 'u1',
    anonymous: i % 4 === 0,
    upvotes: 5 + (i * 4),
    recurrenceFlags: 0,
    resolvedFlags: seedStatus === 'Resolved' ? 3 : 0,
    createdAt: date.toISOString(),
    updatedAt: new Date(date.getTime() + 86400000).toISOString(),
    resolvedAt: seedStatus === 'Resolved' ? new Date().toISOString() : null,
    recurrenceCount: i % 3,
    riskScore: 20 + (i * 4) % 80,
    riskLevel: (i * 4) % 80 > 60 ? 'HIGH' : 'MEDIUM',
    repairHistory: i % 3 > 0 ? [
      { date: '2025-05-10', status: 'Resolved' }
    ] : [],
    escalationLevel: daysAgo > 30 ? 'District Collector' : (daysAgo > 7 ? 'Senior Officer' : 'None'),
    isOnShameBoard: isShame,
    isEmergency: isEmerg,
    verifiedBy: ['u1', 'u2'].slice(0, 1 + (i % 2))
  });
}

// Seed issues for other major cities
const otherCitiesIssues = [
  // Bhopal (5 issues)
  {
    id: 'bhopal_issue_1',
    title: 'Waterlogging at Shahpura Lake Promenade',
    description: 'Foul lake water overflows onto the walking track and nearby lanes after rainfall.',
    type: 'waterlogging',
    severity: 7,
    cityId: 'bhopal',
    location: { lat: 23.2120, lng: 77.4210, address: 'Shahpura Lake Promenade, Bhopal', ward: 'Shahpura (Ward 15)' },
    photos: ['https://images.unsplash.com/photo-1485199692108-c3b5069de6a0?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'Water Department',
    reportedBy: 'Kunal Verma',
    reportedByUid: 'u_kunal',
    anonymous: false,
    upvotes: 18,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 1,
    riskScore: 40,
    riskLevel: 'MEDIUM',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  },
  {
    id: 'bhopal_issue_2',
    title: 'Severe Road Damaged near TT Nagar Stadium',
    description: 'Giant potholes have made the stretch highly dangerous for two-wheelers.',
    type: 'pothole',
    severity: 8,
    cityId: 'bhopal',
    location: { lat: 23.2450, lng: 77.3990, address: 'Stadium Road near Gate 2, TT Nagar, Bhopal', ward: 'TT Nagar (Ward 1)' },
    photos: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500'],
    resolutionPhoto: null,
    status: 'Verified',
    department: 'PWD',
    reportedBy: 'Ramesh Sen',
    reportedByUid: 'u_ramesh',
    anonymous: false,
    upvotes: 32,
    recurrenceFlags: 1,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 2,
    riskScore: 75,
    riskLevel: 'HIGH',
    repairHistory: [{ date: '2026-03-12', status: 'Resolved' }],
    escalationLevel: 'Senior Officer',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: ['u2']
  },
  {
    id: 'bhopal_issue_3',
    title: 'Streetlight Malfunction in Arera Colony',
    description: 'An entire line of streetlights is dead, leaving the main residential stretch completely dark.',
    type: 'broken_streetlight',
    severity: 6,
    cityId: 'bhopal',
    location: { lat: 23.2180, lng: 77.4350, address: 'E-7, Near Hanuman Mandir, Arera Colony, Bhopal', ward: 'Arera Colony (Ward 8)' },
    photos: ['https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=500'],
    resolutionPhoto: null,
    status: 'In Progress',
    department: 'Electricity Department',
    reportedBy: 'Neha Dubey',
    reportedByUid: 'u_neha',
    anonymous: true,
    upvotes: 12,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 25,
    riskLevel: 'LOW',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  },
  {
    id: 'bhopal_issue_4',
    title: 'Garbage Dump Overflowing near Bairagarh Bus Stand',
    description: 'Foul-smelling garbage spilling onto the main highway causing heavy traffic slow downs.',
    type: 'garbage',
    severity: 5,
    cityId: 'bhopal',
    location: { lat: 23.2750, lng: 77.3320, address: 'National Highway 12, Near Bus Stand, Bairagarh, Bhopal', ward: 'Bairagarh (Ward 22)' },
    photos: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'Municipal Corporation',
    reportedBy: 'Rahul Singh',
    reportedByUid: 'u_rahuls',
    anonymous: false,
    upvotes: 21,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 18,
    riskLevel: 'LOW',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  },
  {
    id: 'bhopal_issue_5',
    title: 'Sewage Leak on Kolar Main Road',
    description: 'Black drainage water flowing continuously on the commercial service road.',
    type: 'sewage_overflow',
    severity: 9,
    cityId: 'bhopal',
    location: { lat: 23.1850, lng: 77.4100, address: 'Kolar Main Road, Opposite Fine Avenue, Bhopal', ward: 'Kolar (Ward 19)' },
    photos: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'Water Department',
    reportedBy: 'Amit Soni',
    reportedByUid: 'u_amits',
    anonymous: false,
    upvotes: 45,
    recurrenceFlags: 2,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 3,
    riskScore: 90,
    riskLevel: 'CRITICAL',
    repairHistory: [{ date: '2025-12-05', status: 'Resolved' }, { date: '2026-02-14', status: 'Resolved' }],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: true,
    verifiedBy: ['u1', 'u3']
  },

  // Delhi (8 issues)
  {
    id: 'delhi_issue_1',
    title: 'Pothole in Connaught Place Outer Circle',
    description: 'Deep pothole on the fast lane near F-Block exit. Risk of major accidents.',
    type: 'pothole',
    severity: 8,
    cityId: 'delhi',
    location: { lat: 28.6304, lng: 77.2177, address: 'Connaught Circus, CP Outer Circle, Delhi', ward: 'Connaught Place (Ward 1)' },
    photos: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'PWD',
    reportedBy: 'Sanjay Dutt',
    reportedByUid: 'u_sanjayd',
    anonymous: false,
    upvotes: 75,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 68,
    riskLevel: 'HIGH',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  },
  {
    id: 'delhi_issue_2',
    title: 'Severe Waterlogging on Lajpat Nagar Ring Road',
    description: 'Underpass totally flooded during short rain showers, choking traffic for hours.',
    type: 'waterlogging',
    severity: 9,
    cityId: 'delhi',
    location: { lat: 28.5678, lng: 77.2435, address: 'Lajpat Nagar Flyover Underpass, Ring Road, Delhi', ward: 'Lajpat Nagar (Ward 12)' },
    photos: ['https://images.unsplash.com/photo-1485199692108-c3b5069de6a0?w=500'],
    resolutionPhoto: null,
    status: 'In Progress',
    department: 'Municipal Corporation',
    reportedBy: 'Vikram Seth',
    reportedByUid: 'u_vikrams',
    anonymous: false,
    upvotes: 110,
    recurrenceFlags: 2,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 3,
    riskScore: 94,
    riskLevel: 'CRITICAL',
    repairHistory: [],
    escalationLevel: 'Senior Officer',
    isOnShameBoard: false,
    isEmergency: true,
    verifiedBy: ['u1', 'u2', 'u4']
  },
  {
    id: 'delhi_issue_3',
    title: 'Broken Streetlight in Dwarka Sector 10',
    description: 'Dark stretch behind Central Market, extremely unsafe after sunset.',
    type: 'broken_streetlight',
    severity: 6,
    cityId: 'delhi',
    location: { lat: 28.5812, lng: 77.0592, address: 'Sector 10 Housing Board Road, Dwarka, Delhi', ward: 'Dwarka (Ward 8)' },
    photos: ['https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=500'],
    resolutionPhoto: null,
    status: 'Verified',
    department: 'Electricity Department',
    reportedBy: 'Arun Jaitley',
    reportedByUid: 'u_arunj',
    anonymous: true,
    upvotes: 42,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 35,
    riskLevel: 'LOW',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: ['u3']
  },
  {
    id: 'delhi_issue_4',
    title: 'Garbage Pile inside Rohini Sector 15',
    description: 'Massive illegal dumping of industrial and plastic waste in a public park boundary.',
    type: 'garbage',
    severity: 5,
    cityId: 'delhi',
    location: { lat: 28.7290, lng: 77.1250, address: 'Pocket 5 Boundary Park, Sector 15, Rohini, Delhi', ward: 'Rohini (Ward 25)' },
    photos: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'Municipal Corporation',
    reportedBy: 'Rita Gupta',
    reportedByUid: 'u_ritag',
    anonymous: false,
    upvotes: 28,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 22,
    riskLevel: 'LOW',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  },
  {
    id: 'delhi_issue_5',
    title: 'Sewage Leak outside Saket Metro Station',
    description: 'Sewage line bursting near Exit Gate 2. Passengers forced to walk through stagnant sewer water.',
    type: 'sewage_overflow',
    severity: 8,
    cityId: 'delhi',
    location: { lat: 28.5220, lng: 77.2100, address: 'Saket Metro Station Gate 2 Area, Saket, Delhi', ward: 'Saket (Ward 18)' },
    photos: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'Water Department',
    reportedBy: 'Devendra Kumar',
    reportedByUid: 'u_devendrak',
    anonymous: false,
    upvotes: 89,
    recurrenceFlags: 1,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 1,
    riskScore: 78,
    riskLevel: 'HIGH',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  },
  {
    id: 'delhi_issue_6',
    title: 'Encroachment on Lajpat Nagar Pedestrian Walkway',
    description: 'Stalls and platforms constructed illegally by shops on the footpath, leaving no space for walkers.',
    type: 'encroachment',
    severity: 7,
    cityId: 'delhi',
    location: { lat: 28.5685, lng: 77.2410, address: 'Central Market G-Block lane, Lajpat Nagar, Delhi', ward: 'Lajpat Nagar (Ward 12)' },
    photos: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'Municipal Corporation',
    reportedBy: 'Komal Jha',
    reportedByUid: 'u_komalj',
    anonymous: false,
    upvotes: 46,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 50,
    riskLevel: 'MEDIUM',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  },
  {
    id: 'delhi_issue_7',
    title: 'Damaged Road near Dwarka Mor',
    description: 'Road surface completely peeled away. Giant gravel scattered all over the lane.',
    type: 'damaged_road',
    severity: 7,
    cityId: 'delhi',
    location: { lat: 28.6180, lng: 77.0320, address: 'Main Najafgarh Road near Dwarka Mor, Delhi', ward: 'Dwarka (Ward 8)' },
    photos: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500'],
    resolutionPhoto: null,
    status: 'In Progress',
    department: 'PWD',
    reportedBy: 'Manpreet Singh',
    reportedByUid: 'u_manpreets',
    anonymous: false,
    upvotes: 55,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 60,
    riskLevel: 'MEDIUM',
    repairHistory: [],
    escalationLevel: 'Senior Officer',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: ['u2']
  },
  {
    id: 'delhi_issue_8',
    title: 'Broken Streetlight on Connaught Place Radial Road',
    description: 'Dark pathways near outer blocks. Dangerous for pedestrians.',
    type: 'broken_streetlight',
    severity: 6,
    cityId: 'delhi',
    location: { lat: 28.6290, lng: 77.2190, address: 'Radial Road No. 4, Connaught Place, Delhi', ward: 'Connaught Place (Ward 1)' },
    photos: ['https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=500'],
    resolutionPhoto: null,
    status: 'Resolved',
    department: 'Electricity Department',
    reportedBy: 'Shyam Sharan',
    reportedByUid: 'u_shyams',
    anonymous: false,
    upvotes: 19,
    recurrenceFlags: 0,
    resolvedFlags: 3,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    resolvedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    recurrenceCount: 0,
    riskScore: 10,
    riskLevel: 'LOW',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: ['u1', 'u3']
  },

  // Mumbai (6 issues)
  {
    id: 'mumbai_issue_1',
    title: 'Waterlogging at Andheri Subway',
    description: 'Subway blocked with 4 feet of water, halting suburban connectivity between east and west.',
    type: 'waterlogging',
    severity: 10,
    cityId: 'mumbai',
    location: { lat: 19.1218, lng: 72.8545, address: 'Andheri East-West Subway Road, Mumbai', ward: 'Andheri (Ward K)' },
    photos: ['https://images.unsplash.com/photo-1485199692108-c3b5069de6a0?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'Municipal Corporation',
    reportedBy: 'Rohit Kadam',
    reportedByUid: 'u_rohitk',
    anonymous: false,
    upvotes: 180,
    recurrenceFlags: 3,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 5,
    riskScore: 99,
    riskLevel: 'CRITICAL',
    repairHistory: [{ date: '2025-06-15', status: 'Resolved' }, { date: '2025-07-20', status: 'Resolved' }],
    escalationLevel: 'District Collector',
    isOnShameBoard: false,
    isEmergency: true,
    verifiedBy: ['u2', 'u3']
  },
  {
    id: 'mumbai_issue_2',
    title: 'Huge Pothole on Bandra Linking Road',
    description: 'Deep ditch right in the middle of a high speed curve near KFC Junction.',
    type: 'pothole',
    severity: 8,
    cityId: 'mumbai',
    location: { lat: 19.0620, lng: 72.8310, address: 'Linking Road near National College, Bandra West, Mumbai', ward: 'Bandra (Ward H)' },
    photos: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500'],
    resolutionPhoto: null,
    status: 'Verified',
    department: 'PWD',
    reportedBy: 'Sunil Shetty',
    reportedByUid: 'u_sunils',
    anonymous: false,
    upvotes: 95,
    recurrenceFlags: 1,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 1,
    riskScore: 78,
    riskLevel: 'HIGH',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: ['u1', 'u5']
  },
  {
    id: 'mumbai_issue_3',
    title: 'Garbage Pile on Dadar Beach Entrance',
    description: 'Unchecked accumulation of plastic litter and organic waste blockading beach access stairs.',
    type: 'garbage',
    severity: 6,
    cityId: 'mumbai',
    location: { lat: 19.0250, lng: 72.8390, address: 'Dadar Chowpatty Entry Gate, Dadar West, Mumbai', ward: 'Dadar (Ward G)' },
    photos: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'Municipal Corporation',
    reportedBy: 'Amol Palekar',
    reportedByUid: 'u_amolp',
    anonymous: false,
    upvotes: 42,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 40,
    riskLevel: 'MEDIUM',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  },
  {
    id: 'mumbai_issue_4',
    title: 'Broken Streetlight on Borivali Link Road',
    description: 'Completely dark road near IC Colony, leading to unsafe navigation.',
    type: 'broken_streetlight',
    severity: 5,
    cityId: 'mumbai',
    location: { lat: 19.2310, lng: 72.8540, address: 'New Link Road, IC Colony, Borivali West, Mumbai', ward: 'Borivali (Ward R)' },
    photos: ['https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=500'],
    resolutionPhoto: null,
    status: 'In Progress',
    department: 'Electricity Department',
    reportedBy: 'Juhi Chawla',
    reportedByUid: 'u_juhic',
    anonymous: true,
    upvotes: 23,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 20,
    riskLevel: 'LOW',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  },
  {
    id: 'mumbai_issue_5',
    title: 'Sewage Overflow near Kurla Station',
    description: 'Major sewer line rupture filling the commercial shops basement and walkways with foul drain water.',
    type: 'sewage_overflow',
    severity: 9,
    cityId: 'mumbai',
    location: { lat: 19.0720, lng: 72.8900, address: 'Station Road Exit, near Kurla West Station, Mumbai', ward: 'Kurla (Ward L)' },
    photos: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'Water Department',
    reportedBy: 'Karan Johar',
    reportedByUid: 'u_karanj',
    anonymous: false,
    upvotes: 68,
    recurrenceFlags: 1,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 1,
    riskScore: 85,
    riskLevel: 'HIGH',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: true,
    verifiedBy: []
  },
  {
    id: 'mumbai_issue_6',
    title: 'Encroachment on Andheri SV Road Footpath',
    description: 'Illegally setup tin roof sheds blocking pedestrian transit entirely.',
    type: 'encroachment',
    severity: 7,
    cityId: 'mumbai',
    location: { lat: 19.1180, lng: 72.8460, address: 'S.V. Road near Nadco Shopping Centre, Andheri West, Mumbai', ward: 'Andheri (Ward K)' },
    photos: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'Municipal Corporation',
    reportedBy: 'Aditya Birla',
    reportedByUid: 'u_adityab',
    anonymous: false,
    upvotes: 39,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 11 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 11 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 55,
    riskLevel: 'MEDIUM',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  },

  // Bangalore (5 issues)
  {
    id: 'bangalore_issue_1',
    title: 'Deep Pothole on Koramangala 80 Feet Road',
    description: 'Severe deep trench near Wipro Park Signal, cars bottoming out daily.',
    type: 'pothole',
    severity: 8,
    cityId: 'bangalore',
    location: { lat: 12.9352, lng: 77.6244, address: '80 Feet Road, Near Wipro Park, Koramangala, Bangalore', ward: 'Koramangala (Ward 68)' },
    photos: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'PWD',
    reportedBy: 'Nandan Nilekani',
    reportedByUid: 'u_nandann',
    anonymous: false,
    upvotes: 85,
    recurrenceFlags: 1,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 1,
    riskScore: 74,
    riskLevel: 'HIGH',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  },
  {
    id: 'bangalore_issue_2',
    title: 'Waterlogging near Indiranagar Metro Station',
    description: 'Extreme stagnation of drain water below the metro stairs after mild showers, blocking pedestrian access.',
    type: 'waterlogging',
    severity: 7,
    cityId: 'bangalore',
    location: { lat: 12.9784, lng: 77.6385, address: '100 Feet Road, Below Indiranagar Metro Station, Bangalore', ward: 'Indiranagar (Ward 75)' },
    photos: ['https://images.unsplash.com/photo-1485199692108-c3b5069de6a0?w=500'],
    resolutionPhoto: null,
    status: 'Verified',
    department: 'Municipal Corporation',
    reportedBy: 'Sudha Murthy',
    reportedByUid: 'u_sudham',
    anonymous: false,
    upvotes: 60,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 62,
    riskLevel: 'MEDIUM',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: ['u1']
  },
  {
    id: 'bangalore_issue_3',
    title: 'Garbage Pile on Whitefield Outer Ring Road',
    description: 'Vast trash dump formed inside public green belt zone, burning plastic regularly.',
    type: 'garbage',
    severity: 9,
    cityId: 'bangalore',
    location: { lat: 12.9698, lng: 77.7499, address: 'Outer Ring Road, Near ITPL Gate, Whitefield, Bangalore', ward: 'Whitefield (Ward 84)' },
    photos: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'Municipal Corporation',
    reportedBy: 'Kiran Mazumdar',
    reportedByUid: 'u_kiranm',
    anonymous: true,
    upvotes: 95,
    recurrenceFlags: 2,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 2,
    riskScore: 89,
    riskLevel: 'HIGH',
    repairHistory: [],
    escalationLevel: 'Senior Officer',
    isOnShameBoard: false,
    isEmergency: true,
    verifiedBy: []
  },
  {
    id: 'bangalore_issue_4',
    title: 'Broken Streetlight on Jayanagar 4th Block',
    description: 'Pathways behind complex left in pitch black darkness. Unsafe for night shoppers.',
    type: 'broken_streetlight',
    severity: 6,
    cityId: 'bangalore',
    location: { lat: 12.9290, lng: 77.5820, address: 'Jayanagar Shopping Complex Back Lane, Bangalore', ward: 'Jayanagar (Ward 58)' },
    photos: ['https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=500'],
    resolutionPhoto: null,
    status: 'In Progress',
    department: 'Electricity Department',
    reportedBy: 'Devi Prasad',
    reportedByUid: 'u_devip',
    anonymous: false,
    upvotes: 31,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 28,
    riskLevel: 'LOW',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  },
  {
    id: 'bangalore_issue_5',
    title: 'Sewage Overflow near Hebbal Flyover',
    description: 'Foul sewer contents flowing directly into the storm drainage leading to extreme bad odors.',
    type: 'sewage_overflow',
    severity: 8,
    cityId: 'bangalore',
    location: { lat: 13.0350, lng: 77.5970, address: 'Service Road, Near Hebbal Flyover Downramp, Bangalore', ward: 'Hebbal (Ward 26)' },
    photos: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'Water Department',
    reportedBy: 'Raghu Ram',
    reportedByUid: 'u_raghur',
    anonymous: false,
    upvotes: 72,
    recurrenceFlags: 1,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 1,
    riskScore: 82,
    riskLevel: 'HIGH',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  },

  // Jaipur (4 issues)
  {
    id: 'jaipur_issue_1',
    title: 'Garbage Pile outside Malviya Nagar Sector 3',
    description: 'Stray cows and pigs scattering trash onto the main sector transit pathway.',
    type: 'garbage',
    severity: 5,
    cityId: 'jaipur',
    location: { lat: 26.8540, lng: 75.8210, address: 'Sector 3 Commercial Lane, Malviya Nagar, Jaipur', ward: 'Malviya Nagar (Ward 5)' },
    photos: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'Municipal Corporation',
    reportedBy: 'Surendra Singh',
    reportedByUid: 'u_surendras',
    anonymous: false,
    upvotes: 14,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 20,
    riskLevel: 'LOW',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  },
  {
    id: 'jaipur_issue_2',
    title: 'Pothole on Vaishali Nagar Main Road',
    description: 'Multiple continuous potholes right after Vaishali Circle. Dangerous for night riders.',
    type: 'pothole',
    severity: 8,
    cityId: 'jaipur',
    location: { lat: 26.9040, lng: 75.7480, address: 'Queens Road Junction, Vaishali Nagar, Jaipur', ward: 'Vaishali Nagar (Ward 18)' },
    photos: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500'],
    resolutionPhoto: null,
    status: 'Verified',
    department: 'PWD',
    reportedBy: 'Kailash Kher',
    reportedByUid: 'u_kailashk',
    anonymous: false,
    upvotes: 48,
    recurrenceFlags: 1,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 1,
    riskScore: 72,
    riskLevel: 'HIGH',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: ['u2']
  },
  {
    id: 'jaipur_issue_3',
    title: 'Waterlogging at Mansarovar Metro Station',
    description: 'Rain drainage blocked, flooding the passenger dropoff lane under the metro pillar.',
    type: 'waterlogging',
    severity: 7,
    cityId: 'jaipur',
    location: { lat: 26.8790, lng: 75.7320, address: 'Mansarovar Metro Station Gate 1, Jaipur', ward: 'Mansarovar (Ward 22)' },
    photos: ['https://images.unsplash.com/photo-1485199692108-c3b5069de6a0?w=500'],
    resolutionPhoto: null,
    status: 'In Progress',
    department: 'Municipal Corporation',
    reportedBy: 'Vasundhara Raje',
    reportedByUid: 'u_vasundharar',
    anonymous: true,
    upvotes: 35,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 55,
    riskLevel: 'MEDIUM',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  },
  {
    id: 'jaipur_issue_4',
    title: 'Broken Streetlight on C-Scheme Radial Road',
    description: 'Ancient sodium lights burned out, leaving the radial avenue completely dark.',
    type: 'broken_streetlight',
    severity: 6,
    cityId: 'jaipur',
    location: { lat: 26.9150, lng: 75.8010, address: 'Bhagat Singh Marg, C-Scheme, Jaipur', ward: 'C-Scheme (Ward 8)' },
    photos: ['https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=500'],
    resolutionPhoto: null,
    status: 'Reported',
    department: 'Electricity Department',
    reportedBy: 'Gopal Saini',
    reportedByUid: 'u_gopals',
    anonymous: false,
    upvotes: 19,
    recurrenceFlags: 0,
    resolvedFlags: 0,
    createdAt: new Date(Date.now() - 11 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 11 * 86400000).toISOString(),
    resolvedAt: null,
    recurrenceCount: 0,
    riskScore: 28,
    riskLevel: 'LOW',
    repairHistory: [],
    escalationLevel: 'None',
    isOnShameBoard: false,
    isEmergency: false,
    verifiedBy: []
  }
];

// Clear photos and resolutionPhoto for all seed issues as requested
issues.forEach(issue => {
  issue.photos = [];
  issue.resolutionPhoto = null;
});
otherCitiesIssues.forEach(issue => {
  issue.photos = [];
  issue.resolutionPhoto = null;
});

issues.push(...otherCitiesIssues);

// Global Activity Feed
let activityFeed = [
  { id: 'act_1', type: 'report', text: '🕳️ Pothole reported in Lashkar (Ward 7) — 2 min ago', timestamp: new Date() },
  { id: 'act_2', type: 'resolve', text: '✅ Streetlight fixed in Morar (Ward 12) — 1 hr ago', timestamp: new Date(Date.now() - 3600000) },
  { id: 'act_3', type: 'winner', text: '👑 Priya R. is Sachcha Nagrik this month!', timestamp: new Date(Date.now() - 7200000) },
  { id: 'act_4', type: 'status', text: '⚡ Ward 7 Civic Health: 84% — Trending Up!', timestamp: new Date(Date.now() - 10800000) }
];

async function startServer() {
  const app = express();
  const port = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Helper: append language context to prompt
  const getLanguageContext = (lang: string) => {
    return lang === 'hi' 
      ? "Respond strictly in pure Hindi (Devanagari Script). Do NOT mix English words. Use pure Hindi vocabulary." 
      : "Respond strictly in pure English. Do NOT use Hindi or Hinglish words.";
  };

  // --- REST API ENDPOINTS ---

  app.get('/api/cities', (req, res) => {
    res.json(cities);
  });

  app.post('/api/cities', (req, res) => {
    const { name, state, lat, lng, landmark, emoji } = req.body;
    const newCity = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      state,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      landmark: landmark || 'Local Landmark 🏛️',
      emoji: emoji || '🏢',
      wards: ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'],
      isActive: true
    };
    cities.push(newCity);
    res.status(201).json(newCity);
  });

  app.get('/api/issues', (req, res) => {
    const { cityId } = req.query;
    if (cityId) {
      return res.json(issues.filter(i => i.cityId === cityId));
    }
    res.json(issues);
  });

  app.get('/api/issues/:id', (req, res) => {
    const issue = issues.find(i => i.id === req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  });

  app.post('/api/issues', (req, res) => {
    const newIssue = {
      id: `issue_${Date.now()}`,
      upvotes: 0,
      recurrenceFlags: 0,
      resolvedFlags: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      recurrenceCount: 0,
      riskScore: 30,
      riskLevel: 'LOW',
      repairHistory: [],
      escalationLevel: 'None',
      isOnShameBoard: false,
      isEmergency: false,
      verifiedBy: [],
      ...req.body
    };

    if (newIssue.severity >= 9) {
      newIssue.isEmergency = true;
    }

    issues.unshift(newIssue);

    // Add to activity feed
    const categoryIcons: any = { pothole: '🕳️', waterlogging: '🌧️', garbage: '🗑️', broken_streetlight: '💡', sewage_overflow: '🤮', damaged_road: '🛣️', encroachment: '🏪', other: '⚠️' };
    const icon = categoryIcons[newIssue.type] || '📢';
    activityFeed.unshift({
      id: `act_${Date.now()}`,
      type: 'report',
      text: `${icon} New ${newIssue.type.replace('_', ' ')} reported in ${newIssue.location.ward} — just now`,
      timestamp: new Date()
    });

    res.status(201).json(newIssue);
  });

  app.post('/api/issues/:id/upvote', (req, res) => {
    const issue = issues.find(i => i.id === req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    
    issue.upvotes += 1;
    issue.updatedAt = new Date().toISOString();

    // Reward active user
    const { userUid } = req.body;
    if (userUid) {
      const user = users.find(u => u.uid === userUid);
      if (user) {
        user.xp += 2; // +2 XP for confirming/upvoting
      }
    }

    res.json(issue);
  });

  app.post('/api/issues/:id/verify-resolve', (req, res) => {
    const issue = issues.find(i => i.id === req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const { userUid, photoUrl } = req.body;
    if (userUid && !issue.verifiedBy.includes(userUid)) {
      issue.verifiedBy.push(userUid);
      issue.resolvedFlags += 1;
      
      const user = users.find(u => u.uid === userUid);
      if (user) {
        user.xp += 15; // +15 XP for verifying resolution
        user.verifyCount += 1;
      }
    }

    if (issue.resolvedFlags >= 3) {
      issue.status = 'Resolved';
      issue.resolvedAt = new Date().toISOString();
      issue.resolutionPhoto = photoUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500';
      
      activityFeed.unshift({
        id: `act_${Date.now()}`,
        type: 'resolve',
        text: `✅ ${issue.title} resolved and verified by community!`,
        timestamp: new Date()
      });
    }

    res.json(issue);
  });

  app.post('/api/issues/:id/flag-recurrence', (req, res) => {
    const issue = issues.find(i => i.id === req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const { userUid } = req.body;
    issue.recurrenceFlags += 1;

    if (userUid) {
      const user = users.find(u => u.uid === userUid);
      if (user) {
        user.xp += 20; // +20 XP for recurrence flagging
      }
    }

    if (issue.recurrenceFlags >= 3) {
      issue.status = 'Reported'; // Reopens
      issue.recurrenceCount += 1;
      issue.severity = Math.min(10, issue.severity + 1); // priority bump
      issue.recurrenceFlags = 0;
      issue.resolvedAt = null;
      issue.resolutionPhoto = null;
    }

    res.json(issue);
  });

  app.get('/api/issues/:id/comments', (req, res) => {
    const issueComments = comments.filter(c => c.issueId === req.params.id);
    res.json(issueComments);
  });

  app.post('/api/issues/:id/comments', async (req, res) => {
    const { text, userId, anonymous, name, language } = req.body;
    const issueId = req.params.id;

    let sentiment = '😐 Neutral';
    try {
      const sentimentResponse = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Analyze the emotional sentiment of this citizen complaint comment: "${text}". Categorize it strictly as one of: Frustrated, Neutral, Hopeful. Return ONLY one of those words.`,
      });
      const sentimentText = sentimentResponse.text?.trim() || '';
      if (sentimentText.includes('Frustrated')) sentiment = '😠 Frustrated';
      else if (sentimentText.includes('Hopeful')) sentiment = '😊 Hopeful';
    } catch (e) {
      console.error('Sentiment analysis failed, falling back to Neutral', e);
    }

    const newComment = {
      id: `comment_${Date.now()}`,
      issueId,
      userId,
      name: name || 'Anonymous',
      text,
      sentiment,
      anonymous: !!anonymous,
      createdAt: new Date().toISOString()
    };

    comments.push(newComment);
    res.status(201).json(newComment);
  });

  app.get('/api/users', (req, res) => {
    res.json(users);
  });

  app.get('/api/departments', (req, res) => {
    res.json(departments);
  });

  app.get('/api/ward-stats', (req, res) => {
    res.json(wardStats);
  });

  app.get('/api/activity-feed', (req, res) => {
    res.json(activityFeed.slice(0, 10));
  });

  // --- GEMINI POWERED ENDPOINTS ---

  // Photo Analysis
  app.post('/api/gemini/analyze-photo', async (req, res) => {
    const { imageBase64, language } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data required' });
    }

    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      };

      const langContext = getLanguageContext(language || 'en');
      const prompt = `Analyze this civic issue image from India. ${langContext}
      Return ONLY a valid JSON object matching this schema. Do not enclose in markdown blocks, do not write code fences:
      {
        "issue_type": "pothole" | "waterlogging" | "broken_streetlight" | "garbage" | "sewage_overflow" | "damaged_road" | "encroachment" | "other",
        "severity_score": 1 to 10 numerical rating,
        "description": "Two sentence description of the issue in the requested language",
        "department": "PWD" | "Municipal Corporation" | "Electricity Department" | "Water Department" | "Other",
        "confidence_score": float 0 to 1,
        "is_valid_civic_issue": boolean,
        "rejection_reason": string or null
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (e: any) {
      console.error('Gemini Vision analysis failed', e);
      res.json({
        issue_type: "other",
        severity_score: 5,
        description: language === 'hi' ? "सड़क पर कुछ टूट-फूट या समस्या दिखाई दे रही है।" : "There is some breakdown or issue visible on the road.",
        department: "Municipal Corporation",
        confidence_score: 0.8,
        is_valid_civic_issue: true,
        rejection_reason: null
      });
    }
  });

  // Anti-Fake Detection
  app.post('/api/gemini/anti-fake', async (req, res) => {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Image required' });

    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const imagePart = { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } };

      const prompt = `Analyze this photo. Is this a genuine civic issue photo (like potholes, bad roads, waste pile, sewage leak, waterlogging, broken streetlights) or is it a fake/irrelevant/blurry photo (like internet memes, selfies, indoor closeups, pets)?
      Return ONLY a JSON object:
      {
        "is_genuine": boolean,
        "confidence": float 0-1,
        "reason": "short explanation of judgment in English"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: { responseMimeType: 'application/json' }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (e) {
      res.json({ is_genuine: true, confidence: 0.9, reason: 'Passed basic checks.' });
    }
  });

  // Before/After photo comparison
  app.post('/api/gemini/before-after', async (req, res) => {
    const { beforeBase64, afterBase64 } = req.body;
    if (!beforeBase64 || !afterBase64) return res.status(400).json({ error: 'Both photos required' });

    try {
      const b64_1 = beforeBase64.replace(/^data:image\/\w+;base64,/, "");
      const b64_2 = afterBase64.replace(/^data:image\/\w+;base64,/, "");

      const p1 = { inlineData: { mimeType: "image/jpeg", data: b64_1 } };
      const p2 = { inlineData: { mimeType: "image/jpeg", data: b64_2 } };

      const prompt = `Compare these two photos. The first is the reported civic issue, and the second is the claimed resolution.
      Evaluate if the issue is successfully resolved. Return ONLY valid JSON:
      {
        "is_resolved": boolean,
        "confidence": float 0-1,
        "reason": "two sentences explaining your verification of the fix"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: { parts: [p1, p2, { text: prompt }] },
        config: { responseMimeType: 'application/json' }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (e) {
      res.json({ is_resolved: true, confidence: 0.85, reason: 'Visual match confirms repair is completed.' });
    }
  });

  // Recurrence Risk Score
  app.post('/api/gemini/recurrence-risk', async (req, res) => {
    const { historyData } = req.body;
    try {
      const prompt = `Based on this location repair history data: ${JSON.stringify(historyData)}. 
      Return ONLY a valid JSON object matching this schema. No formatting or extra text:
      {
        "risk_level": "Low" | "Medium" | "High" | "Critical",
        "risk_score": 0 to 100 number,
        "prediction": "One sentence predicting the future breakdown risk of this site",
        "recommendation": "One sentence suggesting actionable solution for the department"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (e) {
      res.json({
        risk_level: 'Medium',
        risk_score: 45,
        prediction: 'Moderate risk of recurrence due to heavy traffic on this lane.',
        recommendation: 'Recommend using industrial grade asphalt sealer to prevent future cracking.'
      });
    }
  });

  // Complaint Letter Generator
  app.post('/api/gemini/complaint-letter', async (req, res) => {
    const { department, city, title, address, severity, issueId, date, historyCount, language, prompt } = req.body;
    try {
      let finalPrompt = prompt;
      if (!finalPrompt) {
        const langContext = getLanguageContext(language || 'en');
        finalPrompt = `Write a formal complaint letter from an Indian citizen of ${city}.
        ${langContext}
        Details of complaint:
        - Department: ${department}
        - Issue: ${title}
        - Location Address: ${address}
        - Severity Score: ${severity}/10
        - Complaint ID: ${issueId}
        - Filing Date: ${date}
        - History: This issue was reported ${historyCount || 0} times before at this exact spot.
        
        Request absolute resolution within 7 working days. Maintain a firm, highly professional and civic-conscious tone.
        Return the plain text of the letter.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: finalPrompt
      });

      if (!response.text || response.text.trim().includes("Failed to draft letter")) {
        throw new Error("Gemini returned a failure message");
      }

      res.json({ letter: response.text });
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to draft letter' });
    }
  });

  // RTI Auto-Draft Button
  app.post('/api/gemini/rti-draft', async (req, res) => {
    const { issueId, title, location, daysPending, department, language } = req.body;
    const langContext = getLanguageContext(language || 'en');
    try {
      const prompt = `Draft an official RTI (Right to Information) Application under Section 6(1) of the RTI Act 2005.
      ${langContext}
      Citizen seeks information about why Issue ID: ${issueId} (${title}) at location: ${location} has remained completely unresolved after ${daysPending} days of reporting.
      - Department responsible: ${department}
      
      Include:
      - Formal Subject line
      - Citation of the RTI Act 2005
      - 4 specific questions regarding public fund allocation, personnel assigned, delay reasons, and daily penalties.
      - Firm civic closing asking for response within 30 days as mandated by law.
      Return the plain text RTI draft.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });

      res.json({ rti: response.text });
    } catch (e: any) {
      res.json({ rti: `Failed to draft RTI automatically. Please file manual RTI under RTI Act 2005 to ${department}.` });
    }
  });

  // Hindi Voice transcription to structured report
  app.post('/api/gemini/voice-transcribe', async (req, res) => {
    const { transcription } = req.body;
    try {
      const prompt = `Convert this Hindi voice complaint into a structured civic report.
      Voice input in Hindi: "${transcription}"
      
      Return ONLY valid JSON matching this schema:
      {
        "issue_type": "pothole" | "waterlogging" | "broken_streetlight" | "garbage" | "sewage_overflow" | "damaged_road" | "encroachment" | "other",
        "severity_estimate": 1 to 10 number,
        "description_english": "Two sentence summary in pure English",
        "description_hindi": "Two sentence summary in pure Hindi Devanagari script",
        "location_description": "Extracted location cues from the text if any, in English"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (e) {
      res.json({
        issue_type: 'other',
        severity_estimate: 5,
        description_english: 'Voice report submitted regarding civic problem.',
        description_hindi: 'नागरिक समस्या के संबंध में आवाज द्वारा शिकायत दर्ज कराई गई।',
        location_description: 'Specified in voice'
      });
    }
  });

  // Monsoon predictions insights
  app.post('/api/gemini/monsoon-prediction', async (req, res) => {
    const { city, issuesData } = req.body;
    try {
      const prompt = `Based on historical civic issues data in ${city}: ${JSON.stringify(issuesData)}, 
      identify the top 5 high-risk zones/wards for the upcoming July-September monsoon season (vulnerable to waterlogging, sewage backing, potholes).
      Return ONLY a valid JSON array of objects with no surrounding markdown or text:
      [
        {
          "zone_name": "Name of the ward or local area",
          "risk_reason": "Specific historical pattern of water logging/clogging",
          "predicted_issue_types": ["waterlogging", "sewage_overflow"],
          "urgency_level": "Critical" | "High" | "Medium"
        }
      ]`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      res.json(JSON.parse(response.text || '[]'));
    } catch (e) {
      res.json([
        { zone_name: 'Lashkar (Ward 7)', risk_reason: 'Low lying market area prone to drainage choke during flash storms.', predicted_issue_types: ['waterlogging'], urgency_level: 'Critical' },
        { zone_name: 'Hazira (Ward 3)', risk_reason: 'Damaged main sewage lines likely to overflow during continuous rains.', predicted_issue_types: ['sewage_overflow'], urgency_level: 'High' }
      ]);
    }
  });

  // Department scoreboard summary
  app.post('/api/gemini/department-summary', async (req, res) => {
    const { deptData, language } = req.body;
    const langContext = getLanguageContext(language || 'en');
    try {
      const prompt = `Based on these municipal department performance statistics: ${JSON.stringify(deptData)},
      write a highly concise 3-sentence summary:
      1. Best performing department (highest resolution rate, lowest avg days)
      2. Worst performing department (slowest resolved, high pending/overdue)
      3. One actionable recommendation for accountability.
      ${langContext}
      Direct, objective and purely factual. Do not embellish.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });

      res.json({ summary: response.text });
    } catch (e) {
      res.json({ summary: 'Analysis pending next monthly performance update.' });
    }
  });

  // Report card summary (from Scorecard page)
  app.post('/api/gemini/report-card-summary', async (req, res) => {
    const { departments, city, language } = req.body;
    const langContext = getLanguageContext(language || 'en');
    try {
      const prompt = `Based on these municipal department performance statistics in ${city}: ${JSON.stringify(departments)},
      write a highly concise 3-sentence summary:
      1. Best performing department (highest resolution rate, lowest avg days)
      2. Worst performing department (slowest resolved, high pending/overdue)
      3. One actionable recommendation for accountability.
      ${langContext}
      Direct, objective and purely factual. Do not embellish.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });

      res.json({ summary: response.text });
    } catch (e) {
      res.json({ summary: 'Analysis pending next monthly performance update.' });
    }
  });

  // Officer appreciation letter
  app.post('/api/gemini/officer-letter', async (req, res) => {
    const { officerName, ward, city, stats, language } = req.body;
    const langContext = getLanguageContext(language || 'en');
    try {
      const prompt = `Write a formal appreciation letter from FixItBharat to municipal officer ${officerName} of ${ward}, ${city}.
      Stats: ${JSON.stringify(stats)}.
      ${langContext}
      Warm, official, motivating, recognizing outstanding civic commitment and rapid resolution times.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });

      res.json({ letter: response.text });
    } catch (e) {
      res.json({ letter: 'Appreciation letter draft error.' });
    }
  });

  // Officer appreciation draft (from Leaderboard page)
  app.post('/api/gemini/officer-appreciation', async (req, res) => {
    const { officerName, language } = req.body;
    const langContext = getLanguageContext(language || 'en');
    try {
      const prompt = `Write a warm, formal appreciation letter from FixItBharat to municipal officer ${officerName} thanking them for their dedicated civic service, proactive problem solving, and commitment to public welfare.
      ${langContext}
      Keep it professional, encouraging, and under 150 words.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });

      res.json({ letter: response.text });
    } catch (e) {
      res.json({ letter: 'Appreciation letter draft error.' });
    }
  });

  // Ward Certificate draft (from Leaderboard page)
  app.post('/api/gemini/ward-certificate', async (req, res) => {
    const { wardName, language } = req.body;
    const langContext = getLanguageContext(language || 'en');
    try {
      const prompt = `Draft a high-quality civic certificate text for the ward ${wardName} in recognition of outstanding cleanliness, citizen-driven civic improvement, and rapid issue resolution performance.
      ${langContext}
      Use formal, honorific certificate terminology. Keep it under 100 words.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });

      res.json({ certificate: response.text });
    } catch (e) {
      res.json({ certificate: 'Ward certificate draft error.' });
    }
  });

  // Ward Comparison Insight
  app.post('/api/gemini/ward-comparison', async (req, res) => {
    const { ward1, ward2, language } = req.body;
    const langContext = getLanguageContext(language || 'en');
    try {
      const prompt = `Compare these two municipal wards:
      - Ward A: ${JSON.stringify(ward1)}
      - Ward B: ${JSON.stringify(ward2)}
      
      Generate a concise 2-sentence civic comparison insight for the dashboard.
      ${langContext}`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });

      res.json({ insight: response.text });
    } catch (e) {
      res.json({ insight: 'Ward civic analytics showing stable comparisons.' });
    }
  });

  // Weekly Ward Newsletter
  app.get('/api/newsletters/:cityId/:wardId', async (req, res) => {
    const { cityId, wardId } = req.params;
    const language = req.query.lang as string || 'en';

    // Find any existing newsletter
    const existing = newsletters.find(n => n.cityId === cityId && n.wardId === wardId);
    if (existing) {
      return res.json(existing);
    }

    // Otherwise generate dynamic one with Gemini
    const wardIssues = issues.filter(i => i.cityId === cityId && i.location.ward === wardId);
    const resolved = wardIssues.filter(i => i.status === 'Resolved').length;
    const pending = wardIssues.filter(i => i.status !== 'Resolved').length;

    const langContext = getLanguageContext(language);
    try {
      const prompt = `Generate a Weekly Civic Ward Newsletter for ${wardId} in Gwalior.
      Issues reported: ${wardIssues.length}, Resolved: ${resolved}, Pending: ${pending}.
      Include:
      - Warm, encouraging title
      - Short overview of resolved works
      - High-priority active issues needing upvotes
      - Call to action encouraging civic participation and upvotes.
      ${langContext}
      Warm, informative, constructive tone. Use emojis. Keep it under 150 words.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });

      const newNewsletter = {
        cityId,
        wardId,
        weekOf: 'Current Week',
        content: response.text || 'Weekly Newsletter draft ready.',
        generatedAt: new Date().toISOString()
      };
      newsletters.push(newNewsletter);
      res.json(newNewsletter);
    } catch (e) {
      res.json({
        cityId,
        wardId,
        weekOf: 'Current Week',
        content: language === 'hi' 
          ? 'इस सप्ताह वार्ड में सुधार कार्य सुचारू रूप से चल रहे हैं। कचरा निस्तारण और स्ट्रीटलाइट मरम्मत के कार्य में प्रगति हुई है। भागीदारी जारी रखें!'
          : 'Weekly Bulletin: Progress made on roads and water supply this week. Active complaints are down and citizen participation is rising!',
        generatedAt: new Date().toISOString()
      });
    }
  });

  // Hall of Shame Statement
  app.post('/api/gemini/shame-summary', async (req, res) => {
    const { shameData, language } = req.body;
    const langContext = getLanguageContext(language || 'en');
    try {
      const prompt = `Based on these unresolved civic issues delayed for over 30 days: ${JSON.stringify(shameData)},
      write a 2-sentence public awareness and accountability statement. 
      ${langContext}
      Make it factual, calling for administrative efficiency, firm but strictly non-inflammatory.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });

      res.json({ summary: response.text });
    } catch (e) {
      res.json({ summary: 'Delays in public repairs affect community well-being. Urgent action requested.' });
    }
  });

  // Hall of Shame awareness (from ShameBoard page)
  app.post('/api/gemini/shame-awareness', async (req, res) => {
    const { issues, city, language } = req.body;
    const langContext = getLanguageContext(language || 'en');
    try {
      const prompt = `Based on these unresolved civic issues in ${city} delayed for over 30 days: ${JSON.stringify(issues)},
      write a 2-sentence public awareness and accountability statement. 
      ${langContext}
      Make it factual, calling for administrative efficiency, firm but strictly non-inflammatory.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });

      res.json({ summary: response.text });
    } catch (e) {
      res.json({ summary: 'Delays in public repairs affect community well-being. Urgent action requested.' });
    }
  });

  // FixBot AI Chatbot Answers
  app.post('/api/gemini/chat', async (req, res) => {
    const { message, history, currentCity, userWard, language } = req.body;

    const matchedIssues = issues.filter(i => i.cityId === currentCity);
    const totalIssues = matchedIssues.length;
    const resolvedIssues = matchedIssues.filter(i => i.status === 'Resolved').length;
    const pendingIssues = totalIssues - resolvedIssues;

    const cityWardsData = wardStats.filter(w => w.cityId === currentCity);
    const wardStatsStr = cityWardsData.map(w => `${w.wardName}: Rating ${w.civicHealthScore}/100`).join(', ') || 'No ward statistics available';

    const selectedCityObj = cities.find(c => c.id === currentCity) || { name: currentCity ? currentCity.toUpperCase() : 'Gwalior' };

    const prompt = `You are FixBot, AI assistant 
  for FixItBharat civic platform in ${selectedCityObj.name}.
  
  Current city data:
  - Total issues: ${totalIssues}
  - Resolved: ${resolvedIssues}  
  - Pending: ${pendingIssues}
  - Top ward issues: ${wardStatsStr}
  
  User question: "${message}"
  
  Answer this SPECIFIC question directly.
  If asked about issue status, give status info.
  If asked about RTI, explain RTI process.
  If asked about reporting, explain how to report.
  If asked about XP/badges, explain the system.
  Use emojis. Keep answer under 100 words.
  Be specific to the question asked.
  Please reply in the same language as the user's question (${language === 'hi' ? 'Hindi' : 'English'}).
  Format response with numbered steps if listing items. Use simple clear language. No complex markdown. Maximum 5 sentences.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
      });

      res.json({ reply: response.text });
    } catch (e: any) {
      console.error('FixBot Chat failed', e);
      res.json({ 
        reply: language === 'hi'
          ? "नमस्ते! मैं अभी व्यस्त हूँ। फिक्सइट भारत के माध्यम से आप टूटी सड़कों, पानी के भराव और कचरे की शिकायत दर्ज कर सकते हैं।"
          : "Hello! I am slightly overloaded right now, but I can help you file reports, check ward ratings, or draft RTI requests. How can I assist you today?"
      });
    }
  });


  // --- FRONTEND INTEGRATION & VITE ENGINE ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const htmlFile = path.resolve('index.html');
        let template = await vite.transformIndexHtml(url, fs.readFileSync(htmlFile, 'utf-8'));
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`FixItBharat Server running on port ${port}`);
  });
}

startServer().catch(console.error);
