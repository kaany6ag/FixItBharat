/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, RefreshCw, Send, Share2, Sparkles } from 'lucide-react';
import { translations } from '../translations';
import LeafletMap from '../components/LeafletMap';
import CountUp from '../components/CountUp';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCity } from '../CityContext';

interface DashboardProps {
  language: 'en' | 'hi';
  currentCity: string;
  issues: any[];
  activityFeed: any[];
}

export default function Dashboard({ language, currentCity, issues, activityFeed }: DashboardProps) {
  const t = translations[language];
  const { selectedCity, cityWardsList } = useCity();

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [heatmapMode, setHeatmapMode] = useState(false);

  // Ward comparison
  const [wardA, setWardA] = useState(cityWardsList[0] || 'Lashkar (Ward 7)');
  const [wardB, setWardB] = useState(cityWardsList[1] || 'Morar (Ward 12)');
  const [wardComparisonInsight, setWardComparisonInsight] = useState('');
  const [comparing, setComparing] = useState(false);

  // Weekly Ward Newsletter
  const [bulletinWard, setBulletinWard] = useState(cityWardsList[0] || 'Lashkar (Ward 7)');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [loadingNewsletter, setLoadingNewsletter] = useState(false);

  useEffect(() => {
    if (cityWardsList && cityWardsList.length > 0) {
      setWardA(cityWardsList[0]);
      setWardB(cityWardsList[1] || cityWardsList[0]);
      setBulletinWard(cityWardsList[0]);
    }
    setSelectedWard('all');
  }, [selectedCity.id, cityWardsList]);

  // Filter issues based on selections
  const filteredIssues = issues.filter(issue => {
    if (issue.cityId !== currentCity) return false;
    if (selectedCategory !== 'all' && issue.type !== selectedCategory) return false;
    if (selectedWard !== 'all' && issue.location.ward !== selectedWard) return false;
    if (selectedStatus !== 'all' && issue.status !== selectedStatus) return false;
    return true;
  });

  const resolvedCount = filteredIssues.filter(i => i.status === 'Resolved').length;
  const pendingCount = filteredIssues.filter(i => i.status !== 'Resolved').length;

  // Pie chart data
  const pieData = [
    { name: 'Resolved / समाधानित', value: resolvedCount, color: '#2D9B5A' },
    { name: 'Pending / लंबित', value: pendingCount, color: '#FF9A3C' }
  ];

  // Ward data for Bar Chart comparison
  const barData = cityWardsList.map(ward => {
    const wardIssues = issues.filter(i => i.cityId === currentCity && i.location.ward === ward);
    const wardReported = currentCity === 'gwalior' 
      ? (ward === 'Lashkar (Ward 7)' ? 26 : ward === 'Morar (Ward 12)' ? 34 : ward === 'Hazira (Ward 3)' ? 22 : ward === 'Thatipur (Ward 18)' ? 30 : 15)
      : wardIssues.length;
    const wardResolved = currentCity === 'gwalior'
      ? (ward === 'Lashkar (Ward 7)' ? 21 : ward === 'Morar (Ward 12)' ? 24 : ward === 'Hazira (Ward 3)' ? 12 : ward === 'Thatipur (Ward 18)' ? 10 : 14)
      : wardIssues.filter(i => i.status === 'Resolved').length;

    return {
      name: ward,
      Reported: wardReported,
      Resolved: wardResolved
    };
  });

  // Call comparison Gemini API
  const handleCompareWards = async () => {
    setComparing(true);
    try {
      const wa = barData.find(b => b.name === wardA) || barData[0];
      const wb = barData.find(b => b.name === wardB) || barData[1];

      const res = await fetch('/api/gemini/ward-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ward1: wa, ward2: wb, language })
      });
      const data = await res.json();
      setWardComparisonInsight(data.insight);
    } catch (e) {
      console.error(e);
    } finally {
      setComparing(false);
    }
  };

  // Call Newsletter bulletin Gemini API
  const handleLoadNewsletter = async () => {
    setLoadingNewsletter(true);
    try {
      const res = await fetch(`/api/newsletters/${currentCity}/${encodeURIComponent(bulletinWard)}?lang=${language}`);
      const data = await res.json();
      setNewsletterContent(data.content);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNewsletter(false);
    }
  };

  useEffect(() => {
    handleCompareWards();
    handleLoadNewsletter();
  }, [wardA, wardB, bulletinWard]);

  const handleShareNewsletter = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(newsletterContent)}`);
  };

  return (
    <div className="bg-rangoli min-h-screen py-16">
      <div className="max-w-[1100px] mx-auto px-6 space-y-8">
        
        {/* Title row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-baloo text-4xl font-extrabold text-[#1A1A1A] leading-tight">
              {t.totalIssuesMap} ({currentCity.toUpperCase()})
            </h1>
            {filteredIssues.length === 0 ? (
              <div className="mt-4 p-5 bg-[#FFF9E6] border-2 border-dashed border-[#FF9A3C]/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full max-w-[800px] shadow-sm animate-fade-in">
                <p className="text-sm sm:text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                  <span>🌟 Be the first to report an issue in {selectedCity.name}! FixItBharat is now live here.</span>
                </p>
                <button
                  onClick={() => window.location.hash = '#report'}
                  className="pill bg-[#FF9A3C] hover:bg-[#e0832d] text-white px-5 py-2.5 font-bold text-xs sm:text-sm shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 transition-all"
                >
                  📢 Report First Issue
                </button>
              </div>
            ) : (
              <p className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span>{filteredIssues.length} {t.realtimeUpdateText}</span>
              </p>
            )}
          </div>

          {/* Heatmap Toggle */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 border border-[#EDE0CC] rounded-full card-shadow text-sm font-bold">
            <span>📍 Markers</span>
            <button 
              onClick={() => setHeatmapMode(!heatmapMode)}
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${heatmapMode ? 'bg-[#FF9A3C]' : 'bg-gray-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${heatmapMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
            <span>🔥 {t.heatmapToggle}</span>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-4 card-shadow flex flex-wrap gap-4 items-center">
          <SlidersHorizontal className="w-5 h-5 text-[#FF9A3C] shrink-0" />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-[#EDE0CC] rounded-full px-4 py-2 text-sm font-semibold bg-[#FDF6EC]/40"
          >
            <option value="all">{t.filterAll}</option>
            <option value="pothole">Pothole / गड्ढा</option>
            <option value="waterlogging">Waterlogging / जलभराव</option>
            <option value="garbage">Garbage Pile / कचरा ढेर</option>
            <option value="broken_streetlight">Streetlight / स्ट्रीटलाइट</option>
            <option value="sewage_overflow">Sewage Leak / सीवेज रिसाव</option>
            <option value="damaged_road">Broken Road / टूटी सड़क</option>
            <option value="encroachment">Encroachment / अतिक्रमण</option>
          </select>

          <select 
            value={selectedWard} 
            onChange={(e) => setSelectedWard(e.target.value)}
            className="border border-[#EDE0CC] rounded-full px-4 py-2 text-sm font-semibold bg-[#FDF6EC]/40"
          >
            <option value="all">{t.filterWard}</option>
            {cityWardsList.map((ward) => (
              <option key={ward} value={ward}>{ward}</option>
            ))}
          </select>

          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-[#EDE0CC] rounded-full px-4 py-2 text-sm font-semibold bg-[#FDF6EC]/40"
          >
            <option value="all">{t.filterStatus}</option>
            <option value="Reported">Reported / दर्ज</option>
            <option value="Verified">Verified / सत्यापित</option>
            <option value="In Progress">In Progress / प्रगति पर</option>
            <option value="Resolved">Resolved / समाधानित</option>
          </select>
        </div>

        {/* Split Section: Map on left, Live feed on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Map */}
          <div className="lg:col-span-2 h-[450px] min-h-[350px] w-full">
            <LeafletMap 
              city={selectedCity}
              center={{ lat: selectedCity.lat, lng: selectedCity.lng }}
              pins={filteredIssues}
              issues={issues}
              heatmapMode={heatmapMode}
            />
          </div>

          {/* Live Feed Sidebar */}
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-5 card-shadow flex flex-col h-[450px] min-h-[350px]">
            <div className="border-b border-[#EDE0CC] pb-3 mb-4 flex justify-between items-center">
              <span className="font-baloo font-extrabold text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                {language === 'hi' ? 'लाइव हलचल' : 'Live Activity Stream'}
              </span>
              <span className="bg-[#FF9A3C]/10 text-[#FF9A3C] font-extrabold px-3 py-1 rounded-full text-[10px] uppercase">onSnapshot active</span>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-3 font-medium text-xs sm:text-sm text-[#6B6B6B]">
              {activityFeed.map((activity, idx) => (
                <div key={idx} className="p-3 bg-[#FDF6EC]/30 border border-[#EDE0CC] rounded-xl hover:bg-orange-50/20 transition-colors">
                  {activity.text}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Graphs Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recharts Bar chart comparison */}
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-6 card-shadow flex flex-col">
            <h3 className="font-baloo text-xl font-extrabold text-[#1A1A1A] mb-4 flex justify-between items-center">
              <span>{t.compareWardsTitle}</span>
              <div className="flex gap-2 text-xs font-semibold text-[#6B6B6B]">
                <select value={wardA} onChange={(e) => setWardA(e.target.value)} className="border rounded px-2 py-1">
                  {cityWardsList.map(ward => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                </select>
                <select value={wardB} onChange={(e) => setWardB(e.target.value)} className="border rounded px-2 py-1">
                  {cityWardsList.map(ward => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                </select>
              </div>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData.filter(b => b.name === wardA || b.name === wardB)}>
                  <XAxis dataKey="name" stroke="#6B6B6B" fontSize={11} fontWeight="bold" />
                  <YAxis stroke="#6B6B6B" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="Reported" fill="#FF9A3C" name="Reported / दर्ज" />
                  <Bar dataKey="Resolved" fill="#2D9B5A" name="Resolved / हल किया" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Ward Comparison Insight by Gemini */}
            <div className="mt-4 bg-[#FDF6EC] p-4 rounded-xl border border-[#EDE0CC]">
              <div className="flex items-center gap-1 font-baloo font-bold text-sm text-[#FF9A3C] mb-1">
                <Sparkles className="w-4 h-4" /> <span>{t.aiInsight}</span>
              </div>
              <p className="text-xs text-[#6B6B6B] italic leading-relaxed">
                {comparing ? 'Analyzing Ward parameters...' : wardComparisonInsight || 'Comparison insight ready.'}
              </p>
            </div>
          </div>

          {/* Recharts Pie Chart summary */}
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-6 card-shadow flex flex-col justify-between">
            <h3 className="font-baloo text-xl font-extrabold text-[#1A1A1A] mb-4">
              {language === 'hi' ? 'प्रस्तावित बनाम पूर्ण कार्य' : 'Resolution Ratio Breakdown'}
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 text-xs sm:text-sm font-bold text-[#6B6B6B]">
                <p className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#2D9B5A] rounded-full inline-block"></span>
                  <span>Resolved / समाधानित: <strong className="text-[#2D9B5A]">{resolvedCount}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FF9A3C] rounded-full inline-block"></span>
                  <span>Pending / लंबित: <strong className="text-[#FF9A3C]">{pendingCount}</strong></span>
                </p>
                <p className="bg-[#FDF6EC] px-3 py-1.5 rounded-full text-[11px] text-center border border-[#EDE0CC]">
                  Avg Civic Efficiency: {filteredIssues.length > 0 ? ((resolvedCount / filteredIssues.length) * 100).toFixed(0) : '0'}%
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Weekly Newsletter bulletin generator */}
        <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-6 sm:p-8 card-shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[#EDE0CC] pb-4">
            <div>
              <h3 className="font-baloo text-2xl font-extrabold text-[#1A1A1A]">
                {t.weeklyWardNewsletter}
              </h3>
              <p className="text-xs text-[#6B6B6B] font-medium mt-0.5">Community civic updates for your local ward, generated weekly by AI.</p>
            </div>
            <select 
              value={bulletinWard} 
              onChange={(e) => setBulletinWard(e.target.value)}
              className="border border-[#EDE0CC] rounded-full px-4 py-2 text-sm font-semibold bg-[#FDF6EC]/40 cursor-pointer"
            >
              {cityWardsList.map(ward => (
                <option key={ward} value={ward}>{ward}</option>
              ))}
            </select>
          </div>

          {loadingNewsletter ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <RefreshCw className="w-8 h-8 text-[#FF9A3C] animate-spin" />
              <span className="text-sm font-bold text-[#FF9A3C]">{t.loading}</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#FDF6EC] p-6 rounded-[16px] border border-[#EDE0CC] text-sm leading-relaxed text-[#6B6B6B] font-medium whitespace-pre-wrap font-sans">
                {newsletterContent}
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleShareNewsletter}
                  className="pill bg-[#2D9B5A] hover:bg-green-700 text-white font-bold px-6 py-2.5 text-sm flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Share2 className="w-4 h-4" /> {t.shareNewsletterWhatsapp}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
