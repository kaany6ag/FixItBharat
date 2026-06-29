/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trophy, Award, FileText, Download, ShieldCheck, Sparkles } from 'lucide-react';
import { translations } from '../translations';

interface LeaderboardProps {
  language: 'en' | 'hi';
}

export default function Leaderboard({ language }: LeaderboardProps) {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'nagrik' | 'fixers' | 'wards'>('nagrik');

  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  // Appreciation letter prefill
  const [appreciationLetter, setAppreciationLetter] = useState('');
  const [draftingLetter, setDraftingLetter] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState('Shri R.K. Dixit');

  // Ward Certificate prefill
  const [certificateText, setCertificateText] = useState('');
  const [draftingCertificate, setDraftingCertificate] = useState(false);
  const [selectedWard, setSelectedWard] = useState('Morar (Ward 12)');

  // Seeded citizens data
  const citizens = [
    { rank: 1, name: 'Priya Sharma', xp: 2450, badges: 6, level: 12, city: 'Gwalior', award: 'Gold' },
    { rank: 2, name: 'Arjun Singh', xp: 2110, badges: 5, level: 10, city: 'Gwalior', award: 'Silver' },
    { rank: 3, name: 'Rahul Khan', xp: 1890, badges: 4, level: 9, city: 'Bhopal', award: 'Bronze' },
    { rank: 4, name: 'Meera Vyas', xp: 1620, badges: 4, level: 8, city: 'Indore' },
    { rank: 5, name: 'Amit Solanki', xp: 1480, badges: 3, level: 7, city: 'Gwalior' }
  ];

  // Seeded top wards
  const wards = [
    { rank: 1, name: 'Morar (Ward 12)', efficiency: '94%', solved: 142, rate: '2.1 Days' },
    { rank: 2, name: 'Lashkar (Ward 7)', efficiency: '88%', solved: 112, rate: '2.5 Days' },
    { rank: 3, name: 'Fort Area (Ward 5)', efficiency: '85%', solved: 95, rate: '2.8 Days' }
  ];

  // Draft appreciation letter by Gemini simulation/api
  const handleDraftAppreciation = async (officerName: string) => {
    setDraftingLetter(true);
    try {
      const res = await fetch('/api/gemini/officer-appreciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerName, language })
      });
      const data = await res.json();
      setAppreciationLetter(data.letter);
    } catch (e) {
      console.error(e);
    } finally {
      setDraftingLetter(false);
    }
  };

  // Draft ward certificate
  const handleDraftCertificate = async (wardName: string) => {
    setDraftingCertificate(true);
    try {
      const res = await fetch('/api/gemini/ward-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wardName, language })
      });
      const data = await res.json();
      setCertificateText(data.certificate);
    } catch (e) {
      console.error(e);
    } finally {
      setDraftingCertificate(false);
    }
  };

  const handleClaimReward = () => {
    setClaimStatus('Processing claim with GMC...');
    setTimeout(() => {
      setClaimStatus(language === 'hi' 
        ? 'बधाई हो! आपका ₹500 का सच्चा नागरिक वाउचर स्वीकृत कर दिया गया है। विवरण आपके ईमेल पर भेजे गए हैं। 🎁' 
        : 'Congratulations! Your ₹500 Sachcha Nagrik cash coupon is approved by Gwalior Municipal Corp. Instructions sent to your email! 🎁'
      );
    }, 1500);
  };

  return (
    <div className="bg-rangoli min-h-screen py-16 font-hind">
      <div className="max-w-[1100px] mx-auto px-6 space-y-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="font-baloo text-5xl font-extrabold text-[#1A1A1A] leading-tight">
            Gwalior Civic Champions 🏆
          </h1>
          <p className="text-[#6B6B6B] text-sm sm:text-base font-semibold uppercase tracking-wider mt-2">
            Recognizing citizens, wards, and officers keeping the city clean
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center border-b border-[#EDE0CC] gap-2">
          <button 
            onClick={() => setActiveTab('nagrik')}
            className={`pb-3 px-6 font-baloo font-bold text-lg border-b-4 transition-colors cursor-pointer ${
              activeTab === 'nagrik' ? 'border-[#FF9A3C] text-[#FF9A3C]' : 'border-transparent text-[#6B6B6B]'
            }`}
          >
            👤 {t.tabSachchaNagrik}
          </button>
          <button 
            onClick={() => setActiveTab('fixers')}
            className={`pb-3 px-6 font-baloo font-bold text-lg border-b-4 transition-colors cursor-pointer ${
              activeTab === 'fixers' ? 'border-[#FF9A3C] text-[#FF9A3C]' : 'border-transparent text-[#6B6B6B]'
            }`}
          >
            🔧 {t.tabTopFixers}
          </button>
          <button 
            onClick={() => setActiveTab('wards')}
            className={`pb-3 px-6 font-baloo font-bold text-lg border-b-4 transition-colors cursor-pointer ${
              activeTab === 'wards' ? 'border-[#FF9A3C] text-[#FF9A3C]' : 'border-transparent text-[#6B6B6B]'
            }`}
          >
            🛡️ {t.tabTopWards}
          </button>
        </div>

        {/* TAB 1: SACHCHA NAGRIK PODIUM */}
        {activeTab === 'nagrik' && (
          <div className="space-y-8">
            
            {/* Gold, Silver, Bronze Podium blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-10">
              
              {/* Silver #2 */}
              <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-6 text-center hover:scale-105 transition-transform order-2 md:order-1">
                <div className="text-4xl mb-2">🥈</div>
                <h4 className="font-baloo text-xl font-bold text-[#1A1A1A]">{citizens[1].name}</h4>
                <p className="text-xs text-[#6B6B6B] font-semibold mb-3">{citizens[1].city}</p>
                <div className="inline-block bg-[#FDF6EC] border border-[#EDE0CC] rounded-full px-4 py-1 text-sm font-bold text-[#FF9A3C] font-space">
                  {citizens[1].xp} XP
                </div>
              </div>

              {/* Gold #1 */}
              <div className="bg-white rounded-[16px] border-2 border-[#FF9A3C] card-shadow p-8 text-center hover:scale-105 transition-transform order-1 md:order-2 md:-translate-y-4">
                <div className="text-5xl mb-2">👑 🥇</div>
                <h4 className="font-baloo text-2xl font-extrabold text-[#1A1A1A]">{citizens[0].name}</h4>
                <p className="text-xs text-[#6B6B6B] font-semibold mb-4">{citizens[0].city}</p>
                <div className="inline-block bg-gradient-to-r from-[#FF9A3C] to-orange-500 rounded-full px-6 py-1.5 text-base font-bold text-white font-space mb-4 shadow-md">
                  {citizens[0].xp} XP
                </div>
                <div className="text-xs text-amber-600 font-extrabold flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 fill-current" /> Leader of the Month
                </div>
              </div>

              {/* Bronze #3 */}
              <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-6 text-center hover:scale-105 transition-transform order-3">
                <div className="text-4xl mb-2">🥉</div>
                <h4 className="font-baloo text-xl font-bold text-[#1A1A1A]">{citizens[2].name}</h4>
                <p className="text-xs text-[#6B6B6B] font-semibold mb-3">{citizens[2].city}</p>
                <div className="inline-block bg-[#FDF6EC] border border-[#EDE0CC] rounded-full px-4 py-1 text-sm font-bold text-[#FF9A3C] font-space">
                  {citizens[2].xp} XP
                </div>
              </div>

            </div>

            {/* Reward Claim Segment */}
            <div className="bg-[#2D9B5A]/5 border border-[#2D9B5A]/20 rounded-[16px] p-6 max-w-xl mx-auto text-center shadow-inner">
              <h4 className="font-baloo text-lg font-bold text-[#2D9B5A] mb-1">🎁 Claim Your Citizen Level Reward</h4>
              <p className="text-xs text-[#6B6B6B] leading-relaxed mb-4">Are you featured in the top 3? Redeem your municipal cash voucher or civic merit badge instantly here.</p>
              {claimStatus ? (
                <div className="p-3 bg-white border rounded-xl font-bold text-xs text-green-700">
                  {claimStatus}
                </div>
              ) : (
                <button 
                  onClick={handleClaimReward}
                  className="pill bg-[#2D9B5A] hover:bg-green-700 text-white font-bold px-6 py-2 text-xs flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  Claim My ₹500 Reward
                </button>
              )}
            </div>

            {/* List */}
            <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow overflow-hidden">
              <div className="p-5 border-b border-[#EDE0CC]">
                <h3 className="font-baloo text-lg font-bold text-[#1A1A1A]">Citizen Leaderboard List</h3>
              </div>
              <div className="divide-y divide-[#EDE0CC]">
                {citizens.map((cit, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 hover:bg-[#FDF6EC]/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="font-space font-black text-sm text-[#6B6B6B] w-6 text-center">#{cit.rank}</span>
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-xs text-[#FF9A3C]">
                        {cit.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#1A1A1A]">{cit.name}</h4>
                        <p className="text-[10px] text-[#6B6B6B] font-semibold uppercase tracking-wide">{cit.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold font-space text-[#6B6B6B]">
                      <span>Level {cit.level || 5}</span>
                      <span>•</span>
                      <span className="text-[#FF9A3C] font-bold">{cit.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anti-fake explanation banner */}
            <div className="bg-[#FF9A3C]/5 border border-[#FF9A3C]/20 rounded-[16px] p-5 flex gap-4 text-sm font-medium">
              <ShieldCheck className="w-8 h-8 text-[#FF9A3C] shrink-0" />
              <div>
                <h4 className="font-bold text-[#FF9A3C] mb-1">{t.antiFakeTitle}</h4>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">{t.antiFakeDesc}</p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: TOP FIXERS / APPRECIATION LETTER */}
        {activeTab === 'fixers' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Officers Selection */}
            <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-6 space-y-4">
              <h3 className="font-baloo text-xl font-bold text-[#1A1A1A] border-b border-[#EDE0CC] pb-3">
                Send Officer Appreciation Letter 💖
              </h3>
              <p className="text-xs text-[#6B6B6B] font-medium leading-relaxed">
                Choose a leading public officer who has resolved issues diligently, and draft an official appreciation letter powered by Gemini to encourage civic accountability.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Select Officer</label>
                  <select 
                    value={selectedOfficer} 
                    onChange={(e) => setSelectedOfficer(e.target.value)}
                    className="w-full border border-[#EDE0CC] rounded-xl px-4 py-2.5 text-sm font-bold bg-[#FDF6EC]/40"
                  >
                    <option>Shri R.K. Dixit</option>
                    <option>Smt. Suman Tomar</option>
                    <option>Shri Manoj Hazari</option>
                  </select>
                </div>
                <button 
                  onClick={() => handleDraftAppreciation(selectedOfficer)}
                  disabled={draftingLetter}
                  className="pill bg-[#FF9A3C] text-white hover:bg-[#e0832d] py-2 px-6 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> {draftingLetter ? 'Drafting...' : 'Draft appreciation letter'}
                </button>
              </div>
            </div>

            {/* Letter Result display */}
            <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-baloo text-xl font-bold text-[#1A1A1A] border-b border-[#EDE0CC] pb-3 flex justify-between items-center">
                  <span>Letter Preview</span>
                  <span className="bg-[#2D9B5A]/10 text-[#2D9B5A] text-[10px] uppercase font-extrabold px-2 py-0.5 rounded">Ready to Send</span>
                </h3>
                {appreciationLetter ? (
                  <div className="bg-[#FDF6EC] p-4 rounded-xl border border-[#EDE0CC] font-mono text-xs text-[#6B6B6B] whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto mt-4">
                    {appreciationLetter}
                  </div>
                ) : (
                  <p className="text-xs text-[#6B6B6B] font-medium italic mt-8 text-center">Click Draft appreciation letter to load the AI-generated citizen appreciation letter.</p>
                )}
              </div>
              {appreciationLetter && (
                <div className="flex justify-end pt-4 border-t border-[#EDE0CC] mt-4">
                  <button 
                    onClick={() => {
                      const el = document.createElement("a");
                      const file = new Blob([appreciationLetter], {type: 'text/plain'});
                      el.href = URL.createObjectURL(file);
                      el.download = `Appreciation_Letter_${selectedOfficer.replace(' ', '_')}.txt`;
                      document.body.appendChild(el);
                      el.click();
                      document.body.removeChild(el);
                    }}
                    className="pill bg-[#2D9B5A] text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Letter
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: TOP WARDS / WARD CERTIFICATE */}
        {activeTab === 'wards' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Top Wards list & select */}
            <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-6 space-y-6">
              <h3 className="font-baloo text-xl font-bold text-[#1A1A1A] border-b border-[#EDE0CC] pb-3">
                Top Performing Gwalior Wards
              </h3>
              
              <div className="space-y-4">
                {wards.map((w, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border border-[#EDE0CC] rounded-xl bg-[#FDF6EC]/10">
                    <div className="flex items-center gap-3 font-bold">
                      <span className="text-sm font-space">#{w.rank}</span>
                      <span className="text-sm text-[#1A1A1A]">{w.name}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#6B6B6B] font-space text-right">
                      <p className="text-[#2D9B5A]">{w.efficiency} Resolved</p>
                      <p>{w.rate} Resolution Rate</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-[#EDE0CC]">
                <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Generate Ward Civic Merit Certificate</label>
                <div className="flex gap-2">
                  <select 
                    value={selectedWard} 
                    onChange={(e) => setSelectedWard(e.target.value)}
                    className="flex-grow border border-[#EDE0CC] rounded-xl px-4 py-2 text-sm font-bold bg-[#FDF6EC]/40"
                  >
                    <option>Morar (Ward 12)</option>
                    <option>Lashkar (Ward 7)</option>
                    <option>Fort Area (Ward 5)</option>
                  </select>
                  <button 
                    onClick={() => handleDraftCertificate(selectedWard)}
                    disabled={draftingCertificate}
                    className="pill bg-[#FF9A3C] text-white hover:bg-[#e0832d] font-bold px-4 text-xs"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>

            {/* Ward Certificate Result display */}
            <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-baloo text-xl font-bold text-[#1A1A1A] border-b border-[#EDE0CC] pb-3">
                  AI Ward Certificate Draft
                </h3>
                {certificateText ? (
                  <div className="bg-[#FDF6EC] p-4 rounded-xl border border-[#EDE0CC] font-mono text-xs text-[#6B6B6B] whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto mt-4">
                    {certificateText}
                  </div>
                ) : (
                  <p className="text-xs text-[#6B6B6B] font-medium italic mt-8 text-center">Click Generate to compile the AI-generated Ward Civic merit certificate.</p>
                )}
              </div>
              {certificateText && (
                <div className="flex justify-end pt-4 border-t border-[#EDE0CC] mt-4">
                  <button 
                    onClick={() => {
                      const el = document.createElement("a");
                      const file = new Blob([certificateText], {type: 'text/plain'});
                      el.href = URL.createObjectURL(file);
                      el.download = `Civic_Merit_Certificate_${selectedWard.replace(' ', '_')}.txt`;
                      document.body.appendChild(el);
                      el.click();
                      document.body.removeChild(el);
                    }}
                    className="pill bg-[#2D9B5A] text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Certificate
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
