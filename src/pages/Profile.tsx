/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Award, User, Settings, SlidersHorizontal, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { translations } from '../translations';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useCity } from '../CityContext';

interface ProfileProps {
  language: 'en' | 'hi';
  currentCity: string;
  userWard: string;
  onUpdatePreferences: (pref: { ward: string; lang: 'en' | 'hi' }) => void;
  issues: any[];
}

export default function Profile({ language, currentCity, userWard, onUpdatePreferences, issues }: ProfileProps) {
  const t = translations[language];
  const { selectedCity, cityWardsList } = useCity();

  // User details
  const [prefWard, setPrefWard] = useState(userWard);
  const [prefLang, setPrefLang] = useState(language);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    if (cityWardsList && cityWardsList.length > 0 && !cityWardsList.includes(prefWard)) {
      setPrefWard(cityWardsList[0]);
    }
  }, [selectedCity.id, cityWardsList]);

  // User stats derived from mock records
  const userIssues = issues.filter(i => i.reportedBy === 'Priya Sharma');
  const userXP = 2450;
  const level = 12;
  const nextLevelXP = 3000;
  const levelPercentage = (userXP / nextLevelXP) * 100;
  
  // Honesty Score is based on verified reports (seeded 98%)
  const honestyScore = 98;
  const honestyData = [
    { name: 'Honesty', value: honestyScore, color: '#2D9B5A' },
    { name: 'Unverified', value: 100 - honestyScore, color: '#EDE0CC' }
  ];

  // 8 badge classifications (unlocked vs grey locked)
  const badges = [
    { id: 1, name: 'Pioneer Reporter', desc: 'First validated civic report', icon: '📸', unlocked: true },
    { id: 2, name: 'Truth Teller', desc: 'Maintained 95%+ validation score', icon: '⚖️', unlocked: true },
    { id: 3, name: 'Map Master', desc: 'Tagged 5+ issues with high precision', icon: '📍', unlocked: true },
    { id: 4, name: 'Civic Guardian', desc: 'Submitted verified resolution confirms', icon: '🛡️', unlocked: true },
    { id: 5, name: 'Flood Sentinel', desc: 'Helped waterlog mappings', icon: '🌧️', unlocked: true },
    { id: 6, name: 'Gold Citizen Medal', desc: 'Top 3 monthly leaderboard spot', icon: '🥇', unlocked: true },
    { id: 7, name: 'Officer Ally', desc: 'Drafted 3 officer appreciations', icon: '🤝', unlocked: false },
    { id: 8, name: 'RTI Campaigner', desc: 'Drafted a 30-day legal petition', icon: '📄', unlocked: false }
  ];

  const handleSavePreferences = () => {
    onUpdatePreferences({ ward: prefWard, lang: prefLang });
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  return (
    <div className="bg-rangoli min-h-screen py-16 font-hind">
      <div className="max-w-[1100px] mx-auto px-6 space-y-8">
        
        {/* Preference Saved Toast inside profile */}
        {showSavedToast && (
          <div className="fixed top-6 right-6 bg-[#2D9B5A] text-white px-5 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 z-50 animate-fade-in">
            <ShieldCheck className="w-5 h-5" />
            <span>Preferences Saved Successfully!</span>
          </div>
        )}

        {/* 1. Header user card */}
        <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF9A3C] to-[#E8472A] text-white font-baloo font-extrabold text-3xl flex items-center justify-center shadow-md">
              PS
            </div>
            <div>
              <h2 className="font-baloo text-3xl font-extrabold text-[#1A1A1A]">Priya Sharma</h2>
              <p className="text-xs text-[#6B6B6B] font-semibold uppercase tracking-wider flex items-center gap-1">
                📍 {prefWard} | {currentCity.toUpperCase()}
              </p>
              <span className="inline-block mt-2 bg-[#FF9A3C]/10 text-[#FF9A3C] font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                Sanchcha Nagrik Level {level}
              </span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full max-w-sm font-semibold space-y-2 text-xs">
            <div className="flex justify-between text-[#6B6B6B]">
              <span>Progress to Level {level + 1}</span>
              <span className="font-space font-bold">{userXP} / {nextLevelXP} XP</span>
            </div>
            <div className="w-full bg-[#FDF6EC] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#FF9A3C] h-full transition-all duration-500" style={{ width: `${levelPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* 2. Honesty score circular gauge & Badges segment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Honesty Score Circle */}
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-6 text-center flex flex-col items-center justify-between">
            <div>
              <h3 className="font-baloo text-xl font-bold text-[#1A1A1A] border-b border-[#EDE0CC] pb-3 w-full">
                My Honesty Score ⚖️
              </h3>
              <p className="text-xs text-[#6B6B6B] font-medium leading-relaxed mt-2">
                Your civic credibility index is verified dynamically by public municipal officers based on genuine, verified photos and zero fake report submissions.
              </p>
            </div>

            <div className="h-44 w-44 my-4 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={honestyData}
                    innerRadius={55}
                    outerRadius={70}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    {honestyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute font-space font-black text-3xl text-[#2D9B5A] flex flex-col items-center leading-none">
                <span>{honestyScore}%</span>
                <span className="text-[10px] text-[#6B6B6B] font-bold mt-1 uppercase">Credible</span>
              </div>
            </div>

            <span className="bg-[#2D9B5A]/10 text-[#2D9B5A] px-4 py-1 rounded-full text-xs font-bold">
              🎖️ Excellent Rating
            </span>
          </div>

          {/* Badges Grid */}
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-6 lg:col-span-2 space-y-4">
            <h3 className="font-baloo text-xl font-bold text-[#1A1A1A] border-b border-[#EDE0CC] pb-3">
              Civic Badges Cabinet
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {badges.map((badge) => (
                <div 
                  key={badge.id}
                  className={`p-3 border rounded-xl text-center flex flex-col items-center justify-between transition-all hover:scale-105 duration-300 ${
                    badge.unlocked 
                      ? 'bg-white border-[#EDE0CC] shadow-sm' 
                      : 'bg-gray-50 border-gray-100 opacity-40 grayscale'
                  }`}
                >
                  <div className="text-3xl mb-1">{badge.icon}</div>
                  <h4 className="font-bold text-xs text-[#1A1A1A] leading-tight mb-1">{badge.name}</h4>
                  <p className="text-[9px] text-[#6B6B6B] leading-normal font-medium">{badge.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 3. Reported complaints history & preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* List of user's reported complaints */}
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-6 lg:col-span-2 space-y-4">
            <h3 className="font-baloo text-xl font-bold text-[#1A1A1A] border-b border-[#EDE0CC] pb-3">
              My Reporting History
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {userIssues.map((issue) => (
                <div key={issue.id} className="p-3 border border-[#EDE0CC] rounded-xl bg-[#FDF6EC]/10 flex justify-between items-center hover:bg-white transition-colors text-xs font-semibold">
                  <div>
                    <h4 className="font-bold text-[#1A1A1A] text-sm mb-1">{issue.title}</h4>
                    <p className="text-[10px] text-[#6B6B6B]">📍 {issue.location.ward} | Severity: {issue.severity}/10</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    issue.status === 'Resolved' ? 'bg-[#2D9B5A]/10 text-[#2D9B5A]' : 'bg-orange-100 text-[#FF9A3C]'
                  }`}>
                    {issue.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences Settings Form */}
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-baloo text-xl font-bold text-[#1A1A1A] border-b border-[#EDE0CC] pb-3 flex items-center gap-1.5">
                <Settings className="w-5 h-5 text-[#FF9A3C]" /> Preferences Settings
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">My Default Ward</label>
                  <select 
                    value={prefWard}
                    onChange={(e) => setPrefWard(e.target.value)}
                    className="w-full border border-[#EDE0CC] rounded-xl px-4 py-2.5 text-sm font-bold bg-[#FDF6EC]/40"
                  >
                    {cityWardsList.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Interface Language</label>
                  <select 
                    value={prefLang}
                    onChange={(e) => setPrefLang(e.target.value as 'en' | 'hi')}
                    className="w-full border border-[#EDE0CC] rounded-xl px-4 py-2.5 text-sm font-bold bg-[#FDF6EC]/40"
                  >
                    <option value="en">English (अंग्रेजी)</option>
                    <option value="hi">Devanagari Hindi (हिन्दी)</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSavePreferences}
              className="w-full pill bg-[#FF9A3C] hover:bg-[#e0832d] text-white py-3 font-bold text-sm mt-6 cursor-pointer shadow-sm hover:scale-102 transition-transform"
            >
              Save Preferences
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
