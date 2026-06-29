/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Award, BookOpen, Volume2, ShieldAlert, Heart } from 'lucide-react';
import { translations } from '../translations';
import CountUp from '../components/CountUp';

interface HomeProps {
  language: 'en' | 'hi';
  onNavigate: (page: string) => void;
  activityFeed: any[];
  issues: any[];
}

export default function Home({ language, onNavigate, activityFeed, issues }: HomeProps) {
  const t = translations[language];
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(0);

  // Stats derived from seeded data
  const totalReported = issues.length + 12425;
  const totalResolved = issues.filter(i => i.status === 'Resolved').length + 8905;
  const activeCitizens = 4210;
  const citiesCount = 19;

  // Winners rotate every 4 seconds
  const winners = [
    { name: language === 'hi' ? 'प्रिया शर्मा' : 'Priya Sharma', ward: 'Morar (Ward 12)', count: 17 },
    { name: language === 'hi' ? 'अर्जुन सिंह' : 'Arjun Singh', ward: 'Lashkar (Ward 7)', count: 11 },
    { name: language === 'hi' ? 'राहुल खान' : 'Rahul Khan', ward: 'Hazira (Ward 3)', count: 7 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWinnerIndex(prev => (prev + 1) % winners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeWinner = winners[currentWinnerIndex];

  return (
    <div className="bg-rangoli min-h-screen">
      
      {/* 2. Live Activity Ticker */}
      <div className="h-10 bg-[#FF9A3C] flex items-center overflow-hidden shrink-0 border-b border-[#EDE0CC] relative">
        <div className="absolute inset-0 flex items-center">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-16 text-white text-xs sm:text-sm font-bold uppercase tracking-wider">
            {activityFeed.map((feed, idx) => (
              <span key={idx} className="flex items-center gap-2">
                {feed.text}
              </span>
            ))}
            {/* Repeat for seamless loop */}
            {activityFeed.map((feed, idx) => (
              <span key={`dup-${idx}`} className="flex items-center gap-2">
                {feed.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-[1100px] mx-auto px-6 py-20 text-center flex flex-col items-center justify-center">
        <span className="bg-[#E8472A]/10 text-[#E8472A] font-extrabold text-xs sm:text-sm tracking-widest px-4 py-1.5 rounded-full mb-6 uppercase inline-flex items-center gap-2">
          <Zap className="w-4 h-4 fill-current" /> {t.quickReportBadge}
        </span>
        
        <h1 className="font-baloo text-5xl sm:text-7xl font-extrabold text-[#1A1A1A] leading-[0.95] tracking-tight max-w-4xl mb-4">
          {t.heroHeadline}
        </h1>
        
        <h2 className="font-baloo text-4xl sm:text-5xl text-[#FF9A3C] font-bold mb-8">
          {t.heroSubheadline}
        </h2>
        
        <p className="text-[#6B6B6B] text-lg sm:text-xl max-w-2xl font-medium leading-relaxed mb-10">
          {t.heroBody}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <button 
            onClick={() => onNavigate('#report')}
            className="pill bg-[#FF9A3C] hover:bg-[#e0832d] text-white px-8 py-4 font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 card-shadow cursor-pointer"
          >
            {t.reportIssue} <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onNavigate('#dashboard')}
            className="pill bg-white border-2 border-[#FF9A3C] text-[#FF9A3C] hover:bg-[#FF9A3C]/5 px-8 py-4 font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            {t.viewDashboard}
          </button>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-[#6B6B6B] text-sm font-bold border-t border-[#EDE0CC] pt-8 w-full max-w-xl">
          <span>{t.trustFree}</span>
          <span className="text-[#EDE0CC] hidden sm:inline">|</span>
          <span>{t.trustAI}</span>
          <span className="text-[#EDE0CC] hidden sm:inline">|</span>
          <span>{t.trustBharat}</span>
        </div>
      </section>

      {/* 3. Rotating Winner Banner */}
      <section className="max-w-[1100px] mx-auto px-6 pb-12">
        <div className="bg-gradient-to-r from-[#FF9A3C] to-[#E8472A] p-[2px] rounded-[16px] card-shadow">
          <div className="bg-white rounded-[14px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">👑</div>
              <div>
                <h4 className="font-baloo text-lg font-bold text-[#1A1A1A]">
                  {language === 'hi' ? 'सच्चा नागरिक पुरस्कार' : 'Sachcha Nagrik of the Month'}
                </h4>
                <p className="text-sm text-[#6B6B6B] font-medium">
                  {activeWinner.name} ({activeWinner.ward})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-[#FF9A3C]/10 text-[#FF9A3C] px-4 py-1.5 rounded-full font-bold text-xs">
                {activeWinner.count} {language === 'hi' ? 'सत्यापित रिपोर्ट' : 'Verified Reports'}
              </span>
              <span className="text-sm text-[#E8472A] font-extrabold flex items-center gap-1 animate-pulse">
                🎁 {language === 'hi' ? 'पुरस्कार योग्य' : 'Reward Eligible'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar (5 cards) */}
      <section className="bg-white border-y border-[#EDE0CC] py-16">
        <div className="max-w-[1100px] mx-auto px-6 grid stats-row gap-6">
          <div className="bg-[#FDF6EC]/40 rounded-[16px] p-6 border border-[#EDE0CC] card-shadow text-center hover:scale-105 transition-transform">
            <div className="text-4xl sm:text-5xl font-bold text-[#FF9A3C] mb-2 font-space">
              <CountUp end={totalReported} />
            </div>
            <div className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wider">
              {t.totalIssuesReported}
            </div>
          </div>
          <div className="bg-[#FDF6EC]/40 rounded-[16px] p-6 border border-[#EDE0CC] card-shadow text-center hover:scale-105 transition-transform">
            <div className="text-4xl sm:text-5xl font-bold text-[#2D9B5A] mb-2 font-space">
              <CountUp end={totalResolved} />
            </div>
            <div className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wider">
              {t.resolvedThisMonth}
            </div>
          </div>
          <div className="bg-[#FDF6EC]/40 rounded-[16px] p-6 border border-[#EDE0CC] card-shadow text-center hover:scale-105 transition-transform">
            <div className="text-4xl sm:text-5xl font-bold text-[#FF9A3C] mb-2 font-space">
              <CountUp end={activeCitizens} />
            </div>
            <div className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wider">
              {t.activeCitizens}
            </div>
          </div>
          <div className="bg-[#FDF6EC]/40 rounded-[16px] p-6 border border-[#EDE0CC] card-shadow text-center hover:scale-105 transition-transform">
            <div className="text-4xl sm:text-5xl font-bold text-[#FF9A3C] mb-2 font-space">
              <CountUp end={citiesCount} />
            </div>
            <div className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wider">
              {t.citiesLiveCount}
            </div>
          </div>
          <div className="bg-[#FDF6EC]/40 rounded-[16px] p-6 border border-[#EDE0CC] card-shadow text-center hover:scale-105 transition-transform">
            <div className="text-4xl sm:text-5xl font-bold text-[#E8472A] mb-2 font-space">
              <CountUp end={124} />
            </div>
            <div className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wider">
              {language === 'hi' ? 'सक्रिय वार्ड' : 'Active Wards'}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-[1100px] mx-auto px-6 py-24">
        <h2 className="font-baloo text-4xl text-center font-extrabold mb-16 text-[#1A1A1A]">
          {t.howItWorksTitle}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-[#FF9A3C] opacity-40 z-0"></div>

          <div className="bg-white p-6 rounded-[16px] card-shadow border border-[#EDE0CC] text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 z-10">
            <div className="w-16 h-16 rounded-full bg-[#FF9A3C]/10 flex items-center justify-center text-2xl mb-4 font-bold text-[#FF9A3C]">📸</div>
            <h3 className="font-baloo text-xl font-bold mb-2 text-[#1A1A1A]">{t.step1Title}</h3>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">{t.step1Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-[16px] card-shadow border border-[#EDE0CC] text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 z-10">
            <div className="w-16 h-16 rounded-full bg-[#FF9A3C]/10 flex items-center justify-center text-2xl mb-4 font-bold text-[#FF9A3C]">🤖</div>
            <h3 className="font-baloo text-xl font-bold mb-2 text-[#1A1A1A]">{t.step2Title}</h3>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">{t.step2Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-[16px] card-shadow border border-[#EDE0CC] text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 z-10">
            <div className="w-16 h-16 rounded-full bg-[#FF9A3C]/10 flex items-center justify-center text-2xl mb-4 font-bold text-[#FF9A3C]">👥</div>
            <h3 className="font-baloo text-xl font-bold mb-2 text-[#1A1A1A]">{t.step3Title}</h3>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">{t.step3Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-[16px] card-shadow border border-[#EDE0CC] text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 z-10">
            <div className="w-16 h-16 rounded-full bg-[#2D9B5A]/10 flex items-center justify-center text-2xl mb-4 font-bold text-[#2D9B5A]">✅</div>
            <h3 className="font-baloo text-xl font-bold mb-2 text-[#1A1A1A]">{t.step4Title}</h3>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">{t.step4Desc}</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white border-t border-[#EDE0CC] py-24">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="font-baloo text-4xl text-center font-extrabold mb-16 text-[#1A1A1A]">
            {t.featuresTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FDF6EC]/20 rounded-[16px] p-6 border-l-4 border-[#FF9A3C] card-shadow border border-y border-r border-[#EDE0CC] hover:scale-102 transition-transform">
              <div className="text-3xl mb-4">📋</div>
              <h3 className="font-baloo text-lg font-bold mb-2 text-[#1A1A1A]">{t.feature1Title}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{t.feature1Desc}</p>
            </div>

            <div className="bg-[#FDF6EC]/20 rounded-[16px] p-6 border-l-4 border-[#FF9A3C] card-shadow border border-y border-r border-[#EDE0CC] hover:scale-102 transition-transform">
              <div className="text-3xl mb-4">📄</div>
              <h3 className="font-baloo text-lg font-bold mb-2 text-[#1A1A1A]">{t.feature2Title}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{t.feature2Desc}</p>
            </div>

            <div className="bg-[#FDF6EC]/20 rounded-[16px] p-6 border-l-4 border-[#FF9A3C] card-shadow border border-y border-r border-[#EDE0CC] hover:scale-102 transition-transform">
              <div className="text-3xl mb-4">😤</div>
              <h3 className="font-baloo text-lg font-bold mb-2 text-[#1A1A1A]">{t.feature3Title}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{t.feature3Desc}</p>
            </div>

            <div className="bg-[#FDF6EC]/20 rounded-[16px] p-6 border-l-4 border-[#FF9A3C] card-shadow border border-y border-r border-[#EDE0CC] hover:scale-102 transition-transform">
              <div className="text-3xl mb-4">🎤</div>
              <h3 className="font-baloo text-lg font-bold mb-2 text-[#1A1A1A]">{t.feature4Title}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{t.feature4Desc}</p>
            </div>

            <div className="bg-[#FDF6EC]/20 rounded-[16px] p-6 border-l-4 border-[#FF9A3C] card-shadow border border-y border-r border-[#EDE0CC] hover:scale-102 transition-transform">
              <div className="text-3xl mb-4">🌧️</div>
              <h3 className="font-baloo text-lg font-bold mb-2 text-[#1A1A1A]">{t.feature5Title}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{t.feature5Desc}</p>
            </div>

            <div className="bg-[#FDF6EC]/20 rounded-[16px] p-6 border-l-4 border-[#FF9A3C] card-shadow border border-y border-r border-[#EDE0CC] hover:scale-102 transition-transform">
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="font-baloo text-lg font-bold mb-2 text-[#1A1A1A]">{t.feature6Title}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{t.feature6Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-[1100px] mx-auto px-6 py-24">
        <h2 className="font-baloo text-4xl text-center font-extrabold mb-16 text-[#1A1A1A]">
          {language === 'hi' ? 'सच्चे नागरिकों की आवाज़ 💬' : 'Voice of True Citizens 💬'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-[16px] p-6 border border-[#EDE0CC] card-shadow">
            <div className="text-amber-400 text-lg mb-3">⭐⭐⭐⭐⭐</div>
            <p className="text-sm text-[#6B6B6B] italic leading-relaxed mb-4">
              {language === 'hi' 
                ? "हमारे मोहल्ले की टूटी स्ट्रीटलाइट 3 दिनों में ठीक हो गई! एआई ने तुरंत शिकायत को सही विभाग में भेज दिया था।" 
                : "The broken streetlight in our colony got repaired within 3 days! The AI routed the complaint directly to the right desk."}
            </p>
            <div className="font-bold text-sm text-[#1A1A1A]">
              Ramesh Dixit, Gwalior
            </div>
          </div>

          <div className="bg-white rounded-[16px] p-6 border border-[#EDE0CC] card-shadow">
            <div className="text-amber-400 text-lg mb-3">⭐⭐⭐⭐⭐</div>
            <p className="text-sm text-[#6B6B6B] italic leading-relaxed mb-4">
              {language === 'hi' 
                ? "मानसून संवेदनशीलता मानचित्र बहुत उपयोगी है। जलभराव वाले क्षेत्रों की पहले से चेतावनी मिल जाती है।" 
                : "Monsoon vulnerability mapping is very useful. It alerts us about waterlogging points well in advance."}
            </p>
            <div className="font-bold text-sm text-[#1A1A1A]">
              Suman Tomar, Morar
            </div>
          </div>

          <div className="bg-white rounded-[16px] p-6 border border-[#EDE0CC] card-shadow">
            <div className="text-amber-400 text-lg mb-3">⭐⭐⭐⭐⭐</div>
            <p className="text-sm text-[#6B6B6B] italic leading-relaxed mb-4">
              {language === 'hi' 
                ? "सच्चा नागरिक लीडरबोर्ड मुझे और बेहतर करने की प्रेरणा देता है। मैंने 8 सफल शिकायतें दर्ज की हैं!" 
                : "The Sachcha Nagrik Leaderboard keeps me motivated. I've already filed 8 verified complaints!"}
            </p>
            <div className="font-bold text-sm text-[#1A1A1A]">
              Animesh Gupta, Lashkar
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
