/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TranslationSet {
  // Common
  appName: string;
  tagline: string;
  reportIssue: string;
  viewDashboard: string;
  home: string;
  report: string;
  dashboard: string;
  leaders: string;
  shame: string;
  nearby: string;
  successWall: string;
  profile: string;
  login: string;
  logout: string;
  guestMode: string;
  selectCity: string;
  cityLabel: string;
  searchCity: string;
  pilotBadge: string;
  save: string;
  cancel: string;
  back: string;
  next: string;
  submit: string;
  anonymous: string;
  anonymousPill: string;
  loading: string;
  confirm: string;
  success: string;
  warning: string;
  error: string;
  severity: string;
  status: string;
  department: string;
  ward: string;
  address: string;
  date: string;
  resolved: string;
  pending: string;
  critical: string;
  high: string;
  medium: string;
  low: string;
  daysPending: string;
  fixedInDays: string;
  details: string;
  comments: string;
  addComment: string;
  sentimentLabel: string;
  history: string;

  // Hero section
  heroHeadline: string;
  heroSubheadline: string;
  heroBody: string;
  quickReportBadge: string;
  trustFree: string;
  trustAI: string;
  trustBharat: string;

  // Stats bar
  totalIssuesReported: string;
  resolvedThisMonth: string;
  activeCitizens: string;
  citiesLiveCount: string;

  // How it works
  howItWorksTitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;

  // Features Grid
  featuresTitle: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  feature4Title: string;
  feature4Desc: string;
  feature5Title: string;
  feature5Desc: string;
  feature6Title: string;
  feature6Desc: string;

  // Report Form Steps
  stepLabelPhoto: string;
  stepLabelLocation: string;
  stepLabelHistory: string;
  stepLabelDuplicate: string;
  stepLabelSubmit: string;
  uploadZonePrompt: string;
  uploadZoneFormats: string;
  aiAnalyzing: string;
  invalidIssueError: string;
  aiAnalysisSuccess: string;
  severityScore: string;
  willBeSentTo: string;
  editDetails: string;
  useMyLocation: string;
  wardDetected: string;
  historyHeading: string;
  lastReported: string;
  timesIn12Months: string;
  lastResolved: string;
  avgDaysBreakdown: string;
  recurrenceRiskTitle: string;
  prediction: string;
  recommendation: string;
  duplicateWarning: string;
  upvoteInstead: string;
  submitNewReport: string;
  issueTitleLabel: string;
  issueDescLabel: string;
  voiceComplaintBtn: string;
  voiceListening: string;
  sosEmergencyBanner: string;
  sosEmergencyBtn: string;
  whatsappShareMsg: string;
  downloadComplaintBtn: string;

  // Issue Details
  timelineReported: string;
  timelineVerified: string;
  timelineInProgress: string;
  timelineResolved: string;
  communityVerification: string;
  seenThisIssueBtn: string;
  markAsResolvedBtn: string;
  problemIsBackBtn: string;
  problemReturnedTimes: string;
  escalationTitle: string;
  escalationDay7: string;
  escalationDay15: string;
  escalationDay30: string;
  elapsedDays: string;
  generateRtiBtn: string;
  witnessVerifyBanner: string;
  witnessVerifyPrompt: string;
  beforeAfterTitle: string;
  aiVerificationResult: string;

  // Dashboard
  totalIssuesMap: string;
  liveBadge: string;
  realtimeUpdateText: string;
  heatmapToggle: string;
  markersToggle: string;
  filterAll: string;
  filterWard: string;
  filterStatus: string;
  filterSeverity: string;
  compareWardsTitle: string;
  aiInsight: string;
  weeklyWardNewsletter: string;
  shareNewsletterWhatsapp: string;

  // Department Scorecard
  scorecardTitle: string;
  scorecardTableDept: string;
  scorecardTableAssigned: string;
  scorecardTableResolved: string;
  scorecardTableRate: string;
  scorecardTableAvgDays: string;
  scorecardTableOverdue: string;
  scorecardTableGrade: string;
  wardOfficerPerfTitle: string;
  officerCol: string;
  aiAnalysisSection: string;
  downloadMonthlyReport: string;
  emailCommissioner: string;

  // Leaderboard
  leaderboardTabCitizens: string;
  leaderboardTabOfficers: string;
  leaderboardTabWards: string;
  sachchaNagrikMonth: string;
  rewardEligible: string;
  rewardClaimPrompt: string;
  tableRank: string;
  tableCitizen: string;
  tableXP: string;
  tableHonesty: string;
  xpSystemTitle: string;
  antiFakeTitle: string;
  antiFakeDesc: string;
  tabSachchaNagrik: string;
  tabTopFixers: string;
  tabTopWards: string;
  officerLetterTitle: string;
  wardCertificateTitle: string;

  // Shame Board
  shameTitle: string;
  shameSubtitle: string;
  responsibleDept: string;

  // Nearby Feed
  nearbyTitle: string;
  nearbySubtitle: string;
  verifyThisIssue: string;

  // Success Wall
  successWallTitle: string;
  successWallSubtitle: string;
}

export const translations: Record<'en' | 'hi', TranslationSet> = {
  en: {
    appName: "FixItBharat",
    tagline: "Bharat ka apna civic intelligence platform 🏙️",
    reportIssue: "📢 Report an Issue",
    viewDashboard: "📊 View Dashboard",
    home: "🏠 Home",
    report: "📢 Report",
    dashboard: "📊 Dashboard",
    leaders: "🏆 Leaders",
    shame: "😤 Shame",
    nearby: "🗺️ Nearby",
    successWall: "🎉 Success Wall",
    profile: "👤 Profile",
    login: "Login",
    logout: "Logout",
    guestMode: "Continue as Guest",
    selectCity: "Select Your City 🏙️",
    cityLabel: "📍 City",
    searchCity: "Search for your city...",
    pilotBadge: "Pilot ⭐",
    save: "Save",
    cancel: "Cancel",
    back: "Back",
    next: "Next",
    submit: "Submit",
    anonymous: "Submit Anonymously",
    anonymousPill: "Anonymous Citizen",
    loading: "Loading...",
    confirm: "Confirm",
    success: "Success",
    warning: "Warning",
    error: "Error",
    severity: "Severity",
    status: "Status",
    department: "Department",
    ward: "Ward",
    address: "Address",
    date: "Date",
    resolved: "Resolved",
    pending: "Pending",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    daysPending: "DAYS PENDING",
    fixedInDays: "Fixed in {days} days ⚡",
    details: "Details",
    comments: "Comments",
    addComment: "Post a comment",
    sentimentLabel: "Sentiment",
    history: "History",

    // Hero Section
    heroHeadline: "Broken roads. Dim streets. Overflowing drains.",
    heroSubheadline: "Not anymore.",
    heroBody: "AI-powered civic intelligence for every Indian citizen. Report issues in 60 seconds and track their resolution in real time.",
    quickReportBadge: "⚡ Takes less than 60 seconds",
    trustFree: "🔒 Free",
    trustAI: "🤖 AI Powered",
    trustBharat: "Made for Bharat",

    // Stats Bar
    totalIssuesReported: "Total Issues Reported",
    resolvedThisMonth: "Resolved This Month",
    activeCitizens: "Active Citizens",
    citiesLiveCount: "Cities Live",

    // How It Works
    howItWorksTitle: "How It Works ⚙️",
    step1Title: "Photo Upload",
    step1Desc: "Upload or capture a photo of the civic issue.",
    step2Title: "AI Analyzes",
    step2Desc: "Our AI auto-detects type, severity, and department.",
    step3Title: "Community Verifies",
    step3Desc: "Nearby citizens upvote and confirm the issue.",
    step4Title: "Gets Fixed",
    step4Desc: "Routed directly to municipal authorities to resolve.",

    // Features Grid
    featuresTitle: "Everything your municipality isn't. 😤",
    feature1Title: "Repair History Intelligence",
    feature1Desc: "Tracks chronic locations that break repeatedly.",
    feature2Title: "RTI Auto-Draft",
    feature2Desc: "Generates official RTI applications for unresolved issues.",
    feature3Title: "Shame Board",
    feature3Desc: "Publicly displays longest pending community issues.",
    feature4Title: "Hindi Voice Complaints",
    feature4Desc: "Speak in Hindi, AI translates and files the report.",
    feature5Title: "Monsoon Vulnerability Map",
    feature5Desc: "Visualizes predicted high-risk waterlogging zones.",
    feature6Title: "Citizen Rewards System",
    feature6Desc: "Earn badges, climb ranks, and become Sachcha Nagrik.",

    // Report Form
    stepLabelPhoto: "Photo",
    stepLabelLocation: "Location",
    stepLabelHistory: "History",
    stepLabelDuplicate: "Duplicates",
    stepLabelSubmit: "Final Submit",
    uploadZonePrompt: "📸 Drop photo or click to capture",
    uploadZoneFormats: "Supports JPG, PNG, MP4",
    aiAnalyzing: "🤖 AI is analyzing your photo...",
    invalidIssueError: "This doesn't look like a civic issue. Please try again.",
    aiAnalysisSuccess: "AI Analysis Complete ✅",
    severityScore: "Severity Score",
    willBeSentTo: "Will be sent to",
    editDetails: "✏️ Edit details",
    useMyLocation: "📍 Use My Location",
    wardDetected: "Ward Detected ✅",
    historyHeading: "📋 Repair History for this location",
    lastReported: "Last reported",
    timesIn12Months: "Times reported in last 12 months",
    lastResolved: "Last resolved",
    avgDaysBreakdown: "Avg days before breakdown",
    recurrenceRiskTitle: "Recurrence Risk Score",
    prediction: "Prediction",
    recommendation: "Recommendation",
    duplicateWarning: "⚠️ Similar issue reported nearby recently",
    upvoteInstead: "👍 Upvote that instead",
    submitNewReport: "📢 Submit new report anyway",
    issueTitleLabel: "Complaint Title",
    issueDescLabel: "Describe the issue in detail",
    voiceComplaintBtn: "🎤 Speak in Hindi",
    voiceListening: "Listening... speak now",
    sosEmergencyBanner: "🚨 CRITICAL ISSUE!",
    sosEmergencyBtn: "Send Emergency Alert",
    whatsappShareMsg: "I reported a {type} at {location} on FixItBharat. Track it here: {link} #FixItBharat",
    downloadComplaintBtn: "📄 Download Complaint Letter",

    // Issue Details
    timelineReported: "Reported",
    timelineVerified: "Verified",
    timelineInProgress: "In Progress",
    timelineResolved: "Resolved",
    communityVerification: "Community Verification 👥",
    seenThisIssueBtn: "I've seen this issue too",
    markAsResolvedBtn: "Mark as Resolved",
    problemIsBackBtn: "Problem is Back",
    problemReturnedTimes: "Returned {count} times",
    escalationTitle: "Escalation Timeline ⏳",
    escalationDay7: "Auto-escalated to Senior Officer",
    escalationDay15: "Escalated to District Collector",
    escalationDay30: "RTI Draft Available + Shame Board",
    elapsedDays: "{days} days elapsed",
    generateRtiBtn: "📄 Generate RTI Application",
    witnessVerifyBanner: "Witness Verification Banner",
    witnessVerifyPrompt: "📍 You are near this issue — verify it?",
    beforeAfterTitle: "Before / After Comparison",
    aiVerificationResult: "Gemini AI Verification of Fix",

    // Dashboard
    totalIssuesMap: "Civic Map",
    liveBadge: "🔴 LIVE",
    realtimeUpdateText: "issues — updates in real time",
    heatmapToggle: "🔥 Heatmap",
    markersToggle: "📍 Markers",
    filterAll: "All Categories",
    filterWard: "All Wards",
    filterStatus: "All Statuses",
    filterSeverity: "All Severities",
    compareWardsTitle: "Compare Wards ⚔️",
    aiInsight: "🤖 AI Insight",
    weeklyWardNewsletter: "Weekly Ward Newsletter 📰",
    shareNewsletterWhatsapp: "Share Newsletter on WhatsApp",

    // Department Scorecard
    scorecardTitle: "Who's Actually Fixing Things? 👀",
    scorecardTableDept: "Department",
    scorecardTableAssigned: "Assigned",
    scorecardTableResolved: "Resolved",
    scorecardTableRate: "Rate %",
    scorecardTableAvgDays: "Avg Days",
    scorecardTableOverdue: "Overdue",
    scorecardTableGrade: "Grade",
    wardOfficerPerfTitle: "Ward Officer Performance 🏛️",
    officerCol: "Officer",
    aiAnalysisSection: "🤖 AI Analysis",
    downloadMonthlyReport: "Monthly City Report Card",
    emailCommissioner: "📧 Email to Municipal Commissioner",

    // Leaderboard
    leaderboardTabCitizens: "👑 Sachcha Nagrik",
    leaderboardTabOfficers: "⚡ Top Fixers",
    leaderboardTabWards: "🏘️ Top Wards",
    sachchaNagrikMonth: "👑 Sachcha Nagrik of the Month",
    rewardEligible: "🎁 Reward Eligible!",
    rewardClaimPrompt: "Contact us to claim your reward ✨",
    tableRank: "Rank",
    tableCitizen: "Citizen",
    tableXP: "XP",
    tableHonesty: "Honesty %",
    xpSystemTitle: "Citizen Reward & XP System 🏆",
    antiFakeTitle: "Anti-Fake Photo Detection 🛡️",
    antiFakeDesc: "All submitted reports pass real-time model analysis. Fake, duplicate, or generic downloaded images are flagged to prevent gamification system abuse.",
    tabSachchaNagrik: "Sachcha Nagrik",
    tabTopFixers: "Top Fixers",
    tabTopWards: "Top Wards",
    officerLetterTitle: "Officer Appreciation",
    wardCertificateTitle: "Ward Certificate",

    // Shame Board
    shameTitle: "Hall of Shame 😤",
    shameSubtitle: "Ignored the longest. Share. Pressure. Fix.",
    responsibleDept: "Responsible Dept",

    // Nearby Feed
    nearbyTitle: "📍 Issues Near You",
    nearbySubtitle: "Within 2km of your location",
    verifyThisIssue: "Verify issue status",

    // Success Wall
    successWallTitle: "Fixed in Our City! 🎉",
    successWallSubtitle: "Every resolved issue is a victory for our community",
  },
  hi: {
    appName: "फिक्सइट भारत",
    tagline: "भारत का अपना नागरिक समाधान मंच 🏙️",
    reportIssue: "📢 समस्या की रिपोर्ट करें",
    viewDashboard: "📊 डैशबोर्ड देखें",
    home: "🏠 मुख्य पृष्ठ",
    report: "📢 रिपोर्ट",
    dashboard: "📊 डैशबोर्ड",
    leaders: "🏆 लीडरबोर्ड",
    shame: "😤 शेम बोर्ड",
    nearby: "🗺️ आस-पास",
    successWall: "🎉 सफलता दीवार",
    profile: "👤 प्रोफाइल",
    login: "लॉगिन करें",
    logout: "लॉगआउट",
    guestMode: "अतिथि के रूप में जारी रखें",
    selectCity: "अपना शहर चुनें 🏙️",
    cityLabel: "📍 शहर",
    searchCity: "अपना शहर खोजें...",
    pilotBadge: "पायलट शहर ⭐",
    save: "सुरक्षित करें",
    cancel: "रद्द करें",
    back: "पीछे",
    next: "आगे",
    submit: "जमा करें",
    anonymous: "गुमनाम रूप से जमा करें",
    anonymousPill: "गुमनाम नागरिक",
    loading: "लोड हो रहा है...",
    confirm: "पुष्टि करें",
    success: "सफलता",
    warning: "चेतावनी",
    error: "त्रुटि",
    severity: "गंभीरता",
    status: "स्थिति",
    department: "विभाग",
    ward: "वार्ड",
    address: "पता",
    date: "दिनांक",
    resolved: "समाधान हो गया",
    pending: "लंबित",
    critical: "अत्यधिक गंभीर",
    high: "गंभीर",
    medium: "मध्यम",
    low: "कम",
    daysPending: "लंबित दिन",
    fixedInDays: "{days} दिनों में ठीक किया गया ⚡",
    details: "विवरण",
    comments: "टिप्पणियाँ",
    addComment: "अपनी टिप्पणी लिखें",
    sentimentLabel: "भावना",
    history: "इतिहास",

    // Hero Section
    heroHeadline: "टूटी सड़कें। मंद स्ट्रीटलाइट्स। उफनती नालियां।",
    heroSubheadline: "अब और नहीं।",
    heroBody: "हर भारतीय नागरिक के लिए एआई-संचालित नागरिक समाधान। केवल साठ सेकंड में समस्या की रिपोर्ट करें और समाधान को लाइव ट्रैक करें।",
    quickReportBadge: "⚡ साठ सेकंड से भी कम समय लगता है",
    trustFree: "🔒 निशुल्क",
    trustAI: "🤖 एआई द्वारा संचालित",
    trustBharat: "भारत के लिए निर्मित",

    // Stats Bar
    totalIssuesReported: "कुल रिपोर्ट की गई समस्याएं",
    resolvedThisMonth: "इस महीने समाधान किया गया",
    activeCitizens: "सक्रिय नागरिक",
    citiesLiveCount: "सक्रिय शहर",

    // How It Works
    howItWorksTitle: "यह कैसे काम करता है ⚙️",
    step1Title: "फोटो अपलोड",
    step1Desc: "नागरिक समस्या की फोटो अपलोड करें या कैप्चर करें।",
    step2Title: "एआई विश्लेषण",
    step2Desc: "हमारा एआई प्रकार, गंभीरता और विभाग का स्वतः पता लगाता है।",
    step3Title: "समुदाय सत्यापन",
    step3Desc: "आस-पास के नागरिक समस्या की पुष्टि और समर्थन करते हैं।",
    step4Title: "समाधान",
    step4Desc: "नगर निगम के अधिकारियों को सीधे समाधान हेतु भेजा जाता है।",

    // Features Grid
    featuresTitle: "वह सब कुछ जो आपका नगर निगम नहीं है। 😤",
    feature1Title: "मरम्मत इतिहास बुद्धि",
    feature1Desc: "बार-बार खराब होने वाले स्थानों को ट्रैक करता है।",
    feature2Title: "आरटीआई स्वतः प्रारूप",
    feature2Desc: "लंबित समस्याओं के लिए आधिकारिक आरटीआई आवेदन बनाता है।",
    feature3Title: "शेम बोर्ड",
    feature3Desc: "सबसे लंबे समय से लंबित समस्याओं को सार्वजनिक करता है।",
    feature4Title: "हिंदी वॉयस शिकायत",
    feature4Desc: "हिंदी में बोलें, एआई अनुवाद कर रिपोर्ट दर्ज करेगा।",
    feature5Title: "मानसून संवेदनशीलता मानचित्र",
    feature5Desc: "जलभराव के अत्यधिक जोखिम वाले क्षेत्रों को दर्शाता है।",
    feature6Title: "नागरिक पुरस्कार प्रणाली",
    feature6Desc: "बैज कमाएं, रैंक बढ़ाएं और सच्चा नागरिक बनें।",

    // Report Form
    stepLabelPhoto: "फोटो",
    stepLabelLocation: "स्थान",
    stepLabelHistory: "इतिहास",
    stepLabelDuplicate: "समान शिकायत",
    stepLabelSubmit: "अंतिम सबमिट",
    uploadZonePrompt: "📸 फोटो अपलोड करें या खींचें",
    uploadZoneFormats: "जेपीजी, पीएनजी, एमपी4 समर्थित",
    aiAnalyzing: "🤖 एआई आपकी फोटो का विश्लेषण कर रहा है...",
    invalidIssueError: "यह नागरिक समस्या नहीं लग रही है। कृपया पुनः प्रयास करें।",
    aiAnalysisSuccess: "एआई विश्लेषण पूर्ण हुआ ✅",
    severityScore: "गंभीरता स्कोर",
    willBeSentTo: "इस विभाग को भेजा जाएगा",
    editDetails: "✏️ विवरण संपादित करें",
    useMyLocation: "📍 मेरा स्थान उपयोग करें",
    wardDetected: "वार्ड का स्वतः पता चला ✅",
    historyHeading: "📋 इस स्थान का मरम्मत इतिहास",
    lastReported: "पिछली रिपोर्ट",
    timesIn12Months: "पिछले बारह महीनों में दर्ज शिकायतें",
    lastResolved: "पिछला समाधान",
    avgDaysBreakdown: "खराब होने का औसत अंतराल",
    recurrenceRiskTitle: "पुनरावृत्ति जोखिम स्कोर",
    prediction: "पूर्वानुमान",
    recommendation: "विभाग के लिए अनुशंसा",
    duplicateWarning: "⚠️ इस स्थान के पास हाल ही में समान समस्या रिपोर्ट की गई है",
    upvoteInstead: "👍 उसका समर्थन करें",
    submitNewReport: "📢 फिर भी नई रिपोर्ट दर्ज करें",
    issueTitleLabel: "शिकायत का शीर्षक",
    issueDescLabel: "समस्या का विस्तृत विवरण लिखें",
    voiceComplaintBtn: "🎤 हिंदी में बोलें",
    voiceListening: "सुन रहा हूँ... अब बोलें",
    sosEmergencyBanner: "🚨 अत्यधिक गंभीर समस्या!",
    sosEmergencyBtn: "आपातकालीन अलर्ट भेजें",
    whatsappShareMsg: "मैंने फिक्सइट भारत पर {location} में {type} की शिकायत दर्ज की है। ट्रैक करें: {link} #FixItBharat",
    downloadComplaintBtn: "📄 शिकायत पत्र डाउनलोड करें",

    // Issue Details
    timelineReported: "दर्ज की गई",
    timelineVerified: "सत्यापित",
    timelineInProgress: "कार्य प्रगति पर",
    timelineResolved: "समाधान पूर्ण",
    communityVerification: "सामुदायिक सत्यापन 👥",
    seenThisIssueBtn: "मैंने भी यह समस्या देखी है",
    markAsResolvedBtn: "समाधान की पुष्टि करें",
    problemIsBackBtn: "समस्या फिर से आ गई",
    problemReturnedTimes: "समस्या {count} बार वापस आई",
    escalationTitle: "एस्केलेशन समयसीमा ⏳",
    escalationDay7: "वरिष्ठ अधिकारी को स्वतः अग्रेषित",
    escalationDay15: "जिला कलेक्टर को अग्रेषित",
    escalationDay30: "आरटीआई प्रारूप उपलब्ध + शेम बोर्ड",
    elapsedDays: "{days} दिन बीत चुके हैं",
    generateRtiBtn: "📄 आरटीआई आवेदन पत्र तैयार करें",
    witnessVerifyBanner: "साक्षी सत्यापन बैनर",
    witnessVerifyPrompt: "📍 आप इस समस्या के पास हैं — क्या इसकी पुष्टि करते हैं?",
    beforeAfterTitle: "पहले / बाद का तुलनात्मक विश्लेषण",
    aiVerificationResult: "जेमिनी एआई कार्य पूर्णता सत्यापन",

    // Dashboard
    totalIssuesMap: "नागरिक मानचित्र",
    liveBadge: "🔴 लाइव",
    realtimeUpdateText: "समस्याएं — लाइव अपडेट हो रही हैं",
    heatmapToggle: "🔥 हीटमैप",
    markersToggle: "📍 संकेतक",
    filterAll: "सभी श्रेणियां",
    filterWard: "सभी वार्ड",
    filterStatus: "सभी स्थितियां",
    filterSeverity: "सभी गंभीरता",
    compareWardsTitle: "वार्डों की तुलना ⚔️",
    aiInsight: "🤖 एआई विश्लेषण",
    weeklyWardNewsletter: "वार्ड का साप्ताहिक समाचार पत्र 📰",
    shareNewsletterWhatsapp: "व्हाट्सएप पर समाचार साझा करें",

    // Department Scorecard
    scorecardTitle: "वास्तव में कौन काम कर रहा है? 👀",
    scorecardTableDept: "विभाग",
    scorecardTableAssigned: "सौंपे गए",
    scorecardTableResolved: "समाधानित",
    scorecardTableRate: "दर %",
    scorecardTableAvgDays: "औसत दिन",
    scorecardTableOverdue: "विलंबित",
    scorecardTableGrade: "ग्रेड",
    wardOfficerPerfTitle: "वार्ड अधिकारी का प्रदर्शन 🏛️",
    officerCol: "अधिकारी",
    aiAnalysisSection: "🤖 एआई विश्लेषण",
    downloadMonthlyReport: "मासिक शहर रिपोर्ट कार्ड",
    emailCommissioner: "📧 नगर आयुक्त को ईमेल भेजें",

    // Leaderboard
    leaderboardTabCitizens: "👑 सच्चा नागरिक",
    leaderboardTabOfficers: "⚡ सर्वश्रेष्ठ समाधानकर्ता",
    leaderboardTabWards: "🏘️ सर्वश्रेष्ठ वार्ड",
    sachchaNagrikMonth: "👑 इस महीने का सच्चा नागरिक",
    rewardEligible: "🎁 पुरस्कार के पात्र!",
    rewardClaimPrompt: "अपना पुरस्कार प्राप्त करने के लिए हमसे संपर्क करें ✨",
    tableRank: "रैंक",
    tableCitizen: "नागरिक",
    tableXP: "एक्सपी",
    tableHonesty: "ईमानदारी %",
    xpSystemTitle: "नागरिक पुरस्कार एवं एक्सपी प्रणाली 🏆",
    antiFakeTitle: "फर्जी फोटो डिटेक्शन सिस्टम 🛡️",
    antiFakeDesc: "सभी सबमिट की गई रिपोर्ट रीयल-टाइम एआई मॉडल विश्लेषण से गुजरती हैं। इंटरनेट से डाउनलोड की गई नकली छवियों को चिह्नित कर ब्लॉक किया जाता है।",
    tabSachchaNagrik: "सच्चा नागरिक",
    tabTopFixers: "सर्वश्रेष्ठ समाधानकर्ता",
    tabTopWards: "सर्वश्रेष्ठ वार्ड",
    officerLetterTitle: "अधिकारी प्रशंसा पत्र",
    wardCertificateTitle: "वार्ड प्रमाण पत्र",

    // Shame Board
    shameTitle: "हॉल ऑफ शेम 😤",
    shameSubtitle: "सबसे लंबे समय से अनदेखा। साझा करें। दबाव बनाएं। समाधान पाएं।",
    responsibleDept: "जिम्मेदार विभाग",

    // Nearby Feed
    nearbyTitle: "📍 आपके आस-पास की समस्याएं",
    nearbySubtitle: "आपके स्थान से दो किलोमीटर के दायरे में",
    verifyThisIssue: "समस्या की स्थिति सत्यापित करें",

    // Success Wall
    successWallTitle: "हमारे शहर में ठीक हुआ! 🎉",
    successWallSubtitle: "प्रत्येक समाधान हमारे समुदाय की जीत है",
  }
};
