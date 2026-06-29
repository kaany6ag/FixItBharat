/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Home as HomeIcon, MapPin, AlertOctagon, Trophy, BarChart3, Users, Heart, LogIn, ChevronDown, CheckCircle, Globe, Search, Menu } from 'lucide-react';
import { translations } from './translations';
import { MASTER_CITIES } from './cities';
import { useCity } from './CityContext';

// Import subpages
import Home from './pages/Home';
import Report from './pages/Report';
import IssueDetail from './pages/IssueDetail';
import Dashboard from './pages/Dashboard';
import Scorecard from './pages/Scorecard';
import Leaderboard from './pages/Leaderboard';
import ShameBoard from './pages/ShameBoard';
import Nearby from './pages/Nearby';
import SuccessWall from './pages/SuccessWall';
import Profile from './pages/Profile';

// Import helpers
import FixBot from './components/FixBot';
import Logo from './components/Logo';
import confetti from 'canvas-confetti';

export default function App() {
  const { selectedCity, setSelectedCity } = useCity();
  const currentCity = selectedCity.id;

  // Global States
  const [language, setLanguage] = useState<'en' | 'hi'>(() => {
    return (localStorage.getItem('fixit_lang') as 'en' | 'hi') || 'en';
  });

  const [userWard, setUserWard] = useState<string>(() => {
    return localStorage.getItem('fixit_ward') || 'Morar (Ward 12)';
  });

  const [activePage, setActivePage] = useState<string>('#home');
  const [issues, setIssues] = useState<any[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);

  // Modals & Popups
  const [showCityModal, setShowCityModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [activeStateTab, setActiveStateTab] = useState('All');
  
  // Simulated Logged in user State
  const [userUid, setUserUid] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Toast notification overlay state
  const [toast, setToast] = useState<{ text: string; show: boolean }>({ text: '', show: false });

  const t = translations[language];

  // Seeded horizontal activity feed lines
  const [activityFeed, setActivityFeed] = useState<any[]>([
    { text: language === 'hi' ? '🚨 मुरार वार्ड 12 में भारी जलभराव की सूचना मिली!' : '🚨 Heavy waterlogging reported in Morar Ward 12!' },
    { text: language === 'hi' ? '✅ हजीरा वार्ड 3 में सड़क का गड्ढा ठीक किया गया!' : '✅ Road pothole resolved in Hazira Ward 3!' },
    { text: language === 'hi' ? '🏆 प्रिया शर्मा ने सच्चा नागरिक पदक जीता!' : '🏆 Priya Sharma won the Sachcha Nagrik Medal!' },
    { text: language === 'hi' ? '📢 लश्कर वार्ड 7 में टूटे जलभराव की नई रिपोर्ट दर्ज की गई!' : '📢 New broken water pipe report filed in Lashkar Ward 7!' }
  ]);

  // Cities selection catalog dynamically derived from MASTER_CITIES
  const cities = MASTER_CITIES.map(c => {
    let localizedName = c.name;
    if (language === 'hi') {
      if (c.id === 'gwalior') localizedName = 'ग्वालियर 🎵';
      else if (c.id === 'bhopal') localizedName = 'भोपाल 🌊';
      else if (c.id === 'indore') localizedName = 'इन्दौर ✨';
      else if (c.id === 'delhi') localizedName = 'दिल्ली 🏛️';
      else if (c.id === 'mumbai') localizedName = 'मुंबई 🌇';
      else if (c.id === 'bangalore') localizedName = 'बैंगलोर 🌴';
      else if (c.id === 'jaipur') localizedName = 'जयपुर 🎨';
      else localizedName = c.name;
    } else {
      localizedName = `${c.name} ${c.emoji}`;
    }

    let desc = language === 'hi' ? `${c.landmark} के पास` : `Near ${c.landmark}`;
    if (c.id === 'gwalior') desc = language === 'hi' ? 'तानसेन की नगरी (पायलट शहर)' : 'City of Tansen (Pilot City)';
    else if (c.id === 'bhopal') desc = language === 'hi' ? 'झीलों की नगरी' : 'City of Lakes';
    else if (c.id === 'indore') desc = language === 'hi' ? 'भारत का सबसे स्वच्छ शहर' : 'Cleanest City in India';

    return {
      ...c,
      name: localizedName,
      desc
    };
  });

  // Fetch real-time issues list from custom server state
  const loadIssues = async (cityId: string = selectedCity.id) => {
    setLoadingIssues(true);
    try {
      const res = await fetch(`/api/issues?cityId=${cityId}`);
      const data = await res.json();
      setIssues(data);
    } catch (e) {
      console.error('Error fetching issue records', e);
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    loadIssues(selectedCity.id);
    
    // Hash change routing deep-linking listener
    const handleHashChange = () => {
      const hash = window.location.hash || '#home';
      setActivePage(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Init

    // Check if city modal needs to open (first visit welcome)
    if (!localStorage.getItem('fixit_city')) {
      setShowCityModal(true);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [selectedCity.id]);

  // Update preferences from Profile page
  const handleUpdatePreferences = (pref: { ward: string; lang: 'en' | 'hi' }) => {
    setLanguage(pref.lang);
    localStorage.setItem('fixit_lang', pref.lang);
    setUserWard(pref.ward);
    localStorage.setItem('fixit_ward', pref.ward);
  };

  // Switch pilot city with 8-step flow
  const selectCity = (cityId: string) => {
    const newCity = MASTER_CITIES.find(c => c.id === cityId);
    if (!newCity) return;

    // Step 1: setSelectedCity(newCity)
    setSelectedCity(newCity);

    // Step 2: localStorage.setItem('selectedCity', JSON.stringify(newCity)) -> Done inside setSelectedCity, but also set here explicitly
    localStorage.setItem('selectedCity', JSON.stringify(newCity));

    // Step 3: map.setView([newCity.lat, newCity.lng], 12) -> This happens automatically because the LeafletMap center prop updates reactively, triggering setView with zoom 12!

    // Step 4: Update ward dropdown with cityWards[newCity.id] -> Handled automatically because child pages read cityWardsList from CityContext and update on city change.

    // Step 5: Re-fetch Firebase issues filtered by: where('cityId', '==', newCity.id)
    loadIssues(newCity.id);

    // Step 6: Update ALL stats for new city -> Handled reactively as issues state gets set with newly fetched city's issues.

    // Step 7: Update navbar to show new city name -> Handled reactively as selectedCity.name is used in navbar.

    // Step 8: Update page title to show new city -> Handled reactively in CityContext and document.title.

    setShowCityModal(false);
    triggerToast(language === 'hi' ? `शहर ${newCity.name} में बदला गया` : `City switched to ${newCity.name}`);
  };

  // Toggle Language
  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('fixit_lang', nextLang);
    triggerToast(nextLang === 'hi' ? 'भाषा बदलकर हिन्दी की गई' : 'Language switched to English');
  };

  // Trigger Slide Toast alert
  const triggerToast = (text: string) => {
    setToast({ text, show: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Simulated Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setUserUid('u_priya');
    setUserName('Priya Sharma');
    setShowLoginModal(false);
    triggerToast(language === 'hi' ? 'सफलतापूर्वक लॉगिन किया गया!' : 'Successfully Logged In!');
  };

  // Simulate Log out
  const handleLogout = () => {
    setUserUid(null);
    setUserName(null);
    triggerToast(language === 'hi' ? 'सफलतापूर्वक लॉगआउट किया गया' : 'Logged out successfully');
  };

  const handleReportSuccess = (newIssue: any) => {
    // Blast Indian tricolor confetti
    confetti({
      particleCount: 150,
      spread: 85,
      colors: ['#FF9A3C', '#2D9B5A', '#FFFFFF'], // Orange, Green, White
      origin: { y: 0.6 }
    });

    // Add to local activity ticker stream
    const tickerLine = language === 'hi' 
      ? `📢 नई शिकायत: "${newIssue.title}" वार्ड में दर्ज!` 
      : `📢 New report: "${newIssue.title}" filed in ward!`;
    setActivityFeed(prev => [ { text: tickerLine }, ...prev ]);

    triggerToast(language === 'hi' ? 'शिकायत दर्ज की गई! 🎉' : 'Report Filed Successfully! 🎉');
    loadIssues();
  };

  // Router parsing
  const renderActivePage = () => {
    if (activePage === '#home' || activePage === '') {
      return (
        <Home 
          language={language}
          onNavigate={(p) => window.location.hash = p}
          activityFeed={activityFeed}
          issues={issues}
        />
      );
    }
    if (activePage === '#report') {
      return (
        <Report 
          language={language}
          currentCity={currentCity || 'gwalior'}
          userUid={userUid}
          onNavigate={(p) => window.location.hash = p}
          onSubmitSuccess={handleReportSuccess}
          issues={issues}
        />
      );
    }
    if (activePage.startsWith('#issue/')) {
      const id = activePage.split('#issue/')[1];
      return (
        <IssueDetail 
          issueId={id}
          language={language}
          userUid={userUid}
          issues={issues}
          onBack={() => window.location.hash = '#dashboard'}
          onRefreshIssues={loadIssues}
        />
      );
    }
    if (activePage === '#dashboard') {
      return (
        <Dashboard 
          language={language}
          currentCity={currentCity || 'gwalior'}
          issues={issues}
          activityFeed={activityFeed}
        />
      );
    }
    if (activePage === '#scorecard') {
      return (
        <Scorecard 
          language={language}
          currentCity={currentCity || 'gwalior'}
        />
      );
    }
    if (activePage === '#leaders') {
      return (
        <Leaderboard 
          language={language}
        />
      );
    }
    if (activePage === '#shame') {
      return (
        <ShameBoard 
          language={language}
          currentCity={currentCity || 'gwalior'}
          issues={issues}
          onNavigate={(p) => window.location.hash = p}
          onRefreshIssues={loadIssues}
        />
      );
    }
    if (activePage === '#nearby') {
      return (
        <Nearby 
          language={language}
          currentCity={currentCity || 'gwalior'}
          issues={issues}
          onNavigate={(p) => window.location.hash = p}
          onRefreshIssues={loadIssues}
        />
      );
    }
    if (activePage === '#success') {
      return (
        <SuccessWall 
          language={language}
          currentCity={currentCity || 'gwalior'}
          issues={issues}
        />
      );
    }
    if (activePage === '#profile') {
      return (
        <Profile 
          language={language}
          currentCity={currentCity || 'gwalior'}
          userWard={userWard}
          onUpdatePreferences={handleUpdatePreferences}
          issues={issues}
        />
      );
    }
    return <div className="text-center py-20">Page Not Found</div>;
  };

  // Sort cities by popularity rank so most popular cities are shown first
  const POPULARITY_ORDER = ['gwalior', 'bhopal', 'indore', 'delhi', 'mumbai', 'bangalore', 'jaipur', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad'];
  
  const getCityPopularityIndex = (cityId: string) => {
    const idx = POPULARITY_ORDER.indexOf(cityId);
    return idx === -1 ? 999 : idx;
  };

  const sortedCities = [...cities].sort((a, b) => {
    const idxA = getCityPopularityIndex(a.id);
    const idxB = getCityPopularityIndex(b.id);
    if (idxA !== idxB) return idxA - idxB;
    return a.name.localeCompare(b.name);
  });

  // Filter cities listed in modal search & state tabs
  const filteredCities = sortedCities.filter(c => {
    // 1. Search filter
    const matchesSearch = c.name.toLowerCase().includes(citySearchQuery.toLowerCase()) || 
                          c.state.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
                          c.id.toLowerCase().includes(citySearchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // 2. State tab filter
    if (activeStateTab === 'All') return true;
    
    const MAIN_STATES = ['Madhya Pradesh', 'Maharashtra', 'Uttar Pradesh', 'Rajasthan', 'Karnataka', 'Tamil Nadu'];
    if (activeStateTab === 'Others') {
      return !MAIN_STATES.includes(c.state);
    }
    
    return c.state === activeStateTab;
  });

  return (
    <div className="flex flex-col min-h-screen bg-rangoli text-[#1A1A1A] font-hind">
      
      {/* 1. Header Navigation Bar */}
      <header className="bg-white border-b border-[#EDE0CC] sticky top-0 z-40 card-shadow shrink-0">
        <div className="max-w-[1100px] mx-auto px-6 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => window.location.hash = '#home'}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Logo />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-[15px] font-hind font-bold text-[#1A1A1A]">
            <a href="#home" className={`hover:text-[#FF9A3C] transition-colors ${activePage === '#home' ? 'text-[#FF9A3C] underline decoration-2' : 'text-[#1A1A1A]'}`}>
              {language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}
            </a>
            <a href="#report" className={`hover:text-[#FF9A3C] transition-colors ${activePage === '#report' ? 'text-[#FF9A3C] underline decoration-2' : 'text-[#1A1A1A]'}`}>
              {language === 'hi' ? 'रिपोर्ट' : 'Report'}
            </a>
            <a href="#dashboard" className={`hover:text-[#FF9A3C] transition-colors ${activePage === '#dashboard' ? 'text-[#FF9A3C] underline decoration-2' : 'text-[#1A1A1A]'}`}>
              {language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
            </a>
            <a href="#leaders" className={`hover:text-[#FF9A3C] transition-colors ${activePage === '#leaders' ? 'text-[#FF9A3C] underline decoration-2' : 'text-[#1A1A1A]'}`}>
              {language === 'hi' ? 'लीडरबोर्ड' : 'Leaders'}
            </a>
            <a href="#shame" className={`hover:text-[#FF9A3C] transition-colors ${activePage === '#shame' ? 'text-[#FF9A3C] underline decoration-2' : 'text-[#1A1A1A]'}`}>
              {language === 'hi' ? 'शेम बोर्ड' : 'Shame'}
            </a>
            <a href="#nearby" className={`hover:text-[#FF9A3C] transition-colors ${activePage === '#nearby' ? 'text-[#FF9A3C] underline decoration-2' : 'text-[#1A1A1A]'}`}>
              {language === 'hi' ? 'आस-पास' : 'Nearby'}
            </a>
          </nav>

          {/* Right Header Buttons */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Language Switcher Toggle */}
            <button 
              onClick={toggleLanguage}
              className="pill bg-[#FDF6EC]/50 border border-[#EDE0CC] hover:bg-[#FF9A3C]/10 px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer text-[#1A1A1A] transition-colors"
            >
              <Globe className="w-4 h-4 text-[#FF9A3C]" />
              <span>{language === 'en' ? 'हिन्दी (HI)' : 'ENGLISH (EN)'}</span>
            </button>

            {/* City Pill Selector */}
            <button 
              onClick={() => setShowCityModal(true)}
              className="pill bg-[#FF9A3C] text-white hover:bg-[#e0832d] px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
            >
              <MapPin className="w-4 h-4" />
              <span>{currentCity ? currentCity.toUpperCase() : 'SELECT CITY'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* User Profile / Login Button */}
            {userUid ? (
              <div 
                onClick={() => window.location.hash = '#profile'}
                className="w-9 h-9 rounded-full bg-[#E8472A]/15 text-[#E8472A] font-baloo font-extrabold flex items-center justify-center text-sm border-2 border-[#E8472A]/35 cursor-pointer shadow-sm hover:scale-110 transition-transform"
              >
                PS
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="pill border-2 border-[#FF9A3C] text-[#FF9A3C] hover:bg-[#FF9A3C]/5 px-4 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <LogIn className="w-4 h-4" /> {language === 'hi' ? 'लॉगिन' : 'LOGIN'}
              </button>
            )}

          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-[#FF9A3C] hover:bg-[#FF9A3C]/10 rounded-full cursor-pointer focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu Panel */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-[#EDE0CC] px-6 py-4 space-y-3 flex flex-col transition-all duration-300">
            {/* Language Switcher */}
            <button 
              onClick={() => {
                toggleLanguage();
                setShowMobileMenu(false);
              }}
              className="w-full pill bg-[#FDF6EC]/50 border border-[#EDE0CC] hover:bg-[#FF9A3C]/10 px-4 py-2.5 text-xs font-bold flex items-center justify-between cursor-pointer text-[#1A1A1A]"
            >
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#FF9A3C]" />
                <span>{language === 'en' ? 'हिन्दी (HI)' : 'ENGLISH (EN)'}</span>
              </div>
            </button>

            {/* City Selector */}
            <button 
              onClick={() => {
                setShowCityModal(true);
                setShowMobileMenu(false);
              }}
              className="w-full pill bg-[#FF9A3C] text-white hover:bg-[#e0832d] px-4 py-2.5 text-xs font-bold flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{currentCity ? currentCity.toUpperCase() : 'SELECT CITY'}</span>
              </div>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* User Profile / Login */}
            {userUid ? (
              <div 
                onClick={() => {
                  window.location.hash = '#profile';
                  setShowMobileMenu(false);
                }}
                className="w-full py-2 flex items-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#E8472A]/15 text-[#E8472A] font-baloo font-extrabold flex items-center justify-center text-sm border-2 border-[#E8472A]/35">
                  PS
                </div>
                <span className="text-sm font-bold text-[#1A1A1A]">Priya Sharma</span>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setShowLoginModal(true);
                  setShowMobileMenu(false);
                }}
                className="w-full pill border-2 border-[#FF9A3C] text-[#FF9A3C] hover:bg-[#FF9A3C]/5 px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <LogIn className="w-4 h-4" /> {language === 'hi' ? 'लॉगिन' : 'LOGIN'}
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-grow">
        {renderActivePage()}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#EDE0CC] card-shadow z-50 flex justify-around items-center shrink-0">
        <a href="#home" className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activePage === '#home' ? 'text-[#FF9A3C]' : 'text-[#6B6B6B]'}`}>
          <HomeIcon className="w-5 h-5" /> {language === 'hi' ? 'होम' : 'Home'}
        </a>
        <a href="#report" className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activePage === '#report' ? 'text-[#FF9A3C]' : 'text-[#6B6B6B]'}`}>
          <AlertOctagon className="w-5 h-5" /> {language === 'hi' ? 'रिपोर्ट' : 'Report'}
        </a>
        <a href="#dashboard" className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activePage === '#dashboard' ? 'text-[#FF9A3C]' : 'text-[#6B6B6B]'}`}>
          <BarChart3 className="w-5 h-5" /> {language === 'hi' ? 'नक्शा' : 'Dashboard'}
        </a>
        <a href="#leaders" className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activePage === '#leaders' ? 'text-[#FF9A3C]' : 'text-[#6B6B6B]'}`}>
          <Trophy className="w-5 h-5" /> {language === 'hi' ? 'विजेता' : 'Leaders'}
        </a>
        <a href="#profile" className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activePage === '#profile' ? 'text-[#FF9A3C]' : 'text-[#6B6B6B]'}`}>
          <Users className="w-5 h-5" /> {language === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}
        </a>
      </div>

      {/* Floating AI Chatbot Assistant */}
      <FixBot 
        currentCity={currentCity || 'gwalior'}
        userWard={userWard}
        language={language}
      />

      {/* Slide Toast notification */}
      {toast.show && (
        <div className="fixed bottom-20 right-6 z-50 bg-[#1A1A1A] text-white px-5 py-3 rounded-[16px] shadow-lg flex items-center gap-2 animate-fade-in font-medium text-xs sm:text-sm">
          <CheckCircle className="w-5 h-5 text-[#2D9B5A]" />
          <span>{toast.text}</span>
        </div>
      )}

      {/* MODAL 1: City Selection Modal (First visit welcome screen) */}
      {showCityModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-6">
          <div className="bg-white rounded-[16px] max-w-lg w-full card-shadow overflow-hidden border border-[#EDE0CC] animate-fade-in">
            {/* Header */}
            <div className="bg-[#FF9A3C] p-6 text-white text-center flex flex-col items-center justify-center">
              <div className="bg-white px-4 py-1.5 rounded-full mb-3 shadow-sm inline-block">
                <Logo />
              </div>
              <h3 className="font-baloo text-2xl font-extrabold leading-tight">
                {language === 'hi' ? 'अपने शहर का चयन करें! (50+ शहर)' : 'Choose Your City! (50+ Cities)'}
              </h3>
              <p className="text-xs text-orange-100 font-medium mt-1 uppercase tracking-wider">
                Active across 50+ cities & pilot districts of India
              </p>
            </div>

            {/* City search bar */}
            <div className="p-4 border-b border-[#EDE0CC] flex items-center gap-2">
              <Search className="w-5 h-5 text-[#6B6B6B]" />
              <input 
                type="text" 
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                placeholder={language === 'hi' ? "अपने शहर का नाम खोजें..." : "Search city or state..."}
                className="w-full text-sm font-semibold focus:outline-none"
              />
            </div>

            {/* State-wise filter tabs */}
            <div className="p-3 border-b border-[#EDE0CC] flex gap-1.5 overflow-x-auto scrollbar-none bg-gray-50/50">
              {['All', 'Madhya Pradesh', 'Maharashtra', 'Uttar Pradesh', 'Rajasthan', 'Karnataka', 'Tamil Nadu', 'Others'].map((stateName) => (
                <button
                  key={stateName}
                  onClick={() => setActiveStateTab(stateName)}
                  className={`px-3 py-1 text-[11px] font-extrabold rounded-full transition-all border whitespace-nowrap cursor-pointer ${
                    activeStateTab === stateName
                      ? 'bg-[#FF9A3C] text-white border-[#FF9A3C] shadow-sm'
                      : 'bg-white text-[#6B6B6B] border-[#EDE0CC] hover:bg-[#FDF6EC]/30'
                  }`}
                >
                  {stateName === 'All' ? (language === 'hi' ? 'सभी राज्य' : 'All') :
                   stateName === 'Others' ? (language === 'hi' ? 'अन्य राज्य' : 'Others') :
                   stateName}
                </button>
              ))}
            </div>

            {/* Total count header */}
            <div className="px-4 py-2 bg-[#FDF6EC]/40 border-b border-[#EDE0CC] flex justify-between items-center text-[11px] text-[#6B6B6B] font-bold">
              <span>{language === 'hi' ? 'कुल: 50+ शहर उपलब्ध' : 'Total: 50+ Cities Available'}</span>
              <span>{language === 'hi' ? 'दिखाए जा रहे हैं:' : 'Showing:'} {filteredCities.length} {language === 'hi' ? 'शहर' : 'cities'}</span>
            </div>

            {/* Cities cards list */}
            <div className="p-4 max-h-72 overflow-y-auto space-y-3">
              {filteredCities.map((city) => {
                const count = issues.filter(i => i.cityId === city.id).length;
                let badgeStyle = '';
                let badgeText = '';

                if (city.id === 'gwalior') {
                  badgeStyle = 'bg-yellow-100 text-yellow-800 border border-yellow-300 font-extrabold';
                  badgeText = language === 'hi' ? '⭐ पायलट शहर' : '⭐ Pilot City';
                } else {
                  badgeStyle = 'bg-teal-50 text-teal-700 border border-teal-200 font-extrabold';
                  badgeText = language === 'hi' ? '🆕 नया' : '🆕 New';
                }

                return (
                  <div 
                    key={city.id}
                    onClick={() => selectCity(city.id)}
                    className="p-4 border border-[#EDE0CC] hover:border-[#FF9A3C] rounded-xl flex items-center justify-between cursor-pointer bg-[#FDF6EC]/10 hover:bg-white transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-baloo text-lg font-bold text-[#1A1A1A] group-hover:text-[#FF9A3C] transition-colors">
                          {city.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-[#8C8C8C] bg-[#EDE0CC]/40 px-1.5 py-0.5 rounded">
                          {city.state}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6B6B] font-semibold mt-0.5">{city.desc}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badgeStyle}`}>
                        {badgeText}
                      </span>
                      {count > 0 && (
                        <span className="text-[10px] text-[#6B6B6B] font-semibold">
                          {count} {language === 'hi' ? 'मुद्दे' : 'issues'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredCities.length === 0 && (
                <div className="text-center py-8 text-sm text-[#6B6B6B] font-bold">
                  {language === 'hi' ? 'कोई शहर नहीं मिला' : 'No cities found'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Citizen Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-6">
          <div className="bg-white rounded-[16px] max-w-sm w-full card-shadow overflow-hidden border border-[#EDE0CC] p-6 relative">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-[#6B6B6B] hover:text-[#1A1A1A] font-bold text-lg"
            >
              ✕
            </button>
            <div className="text-center mb-4">
              <Logo />
              <h3 className="font-baloo text-xl font-extrabold text-[#1A1A1A] mt-2">
                {language === 'hi' ? 'नागरिक लॉगिन' : 'Citizen Login'}
              </h3>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full border border-[#EDE0CC] rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-[#EDE0CC] rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full pill bg-[#FF9A3C] text-white py-3 font-bold text-sm cursor-pointer"
              >
                Sign In
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-[#EDE0CC] text-center text-xs font-semibold text-[#6B6B6B]">
              No account? Submit complaints as guest/anonymous!
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-[#EDE0CC] py-10 mt-auto shrink-0">
        <div className="max-w-[1100px] mx-auto px-6 text-center space-y-4">
          <p className="text-xs text-[#6B6B6B] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5">
            ❤️ Made with Pride in India for Swachh Bharat
          </p>
          <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
            FixItBharat is a unified public accountability portal. Under swachh bharat pilot initiatives, all reports are logged directly to district council desks.
          </p>
          <p className="text-[10px] text-[#6B6B6B] font-semibold">
            &copy; {new Date().getFullYear()} FixItBharat Project. All Rights Reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
