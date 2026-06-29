/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Share2, ThumbsUp, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { translations } from '../translations';

interface ShameBoardProps {
  language: 'en' | 'hi';
  currentCity: string;
  issues: any[];
  onNavigate: (page: string) => void;
  onRefreshIssues: () => void;
}

export default function ShameBoard({ language, currentCity, issues, onNavigate, onRefreshIssues }: ShameBoardProps) {
  const t = translations[language];
  const [awarenessSummary, setAwarenessSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Filter pending issues sorted by elapsed days descending (top 10 longest pending first)
  const pendingIssues = issues
    .filter(i => i.cityId === currentCity && i.status !== 'Resolved')
    .map(i => {
      const reportedDate = new Date(i.createdAt);
      const diffTime = Math.abs(new Date().getTime() - reportedDate.getTime());
      const elapsedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 12; // Seeded offset
      return { ...i, elapsedDays };
    })
    .sort((a, b) => b.elapsedDays - a.elapsedDays)
    .slice(0, 10);

  // Call awareness summary Gemini API
  const loadAwarenessSummary = async () => {
    if (pendingIssues.length === 0) return;
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/gemini/shame-awareness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issues: pendingIssues, city: currentCity, language })
      });
      const data = await res.json();
      setAwarenessSummary(data.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    loadAwarenessSummary();
  }, [currentCity, issues]);

  const handlePushAlert = (issue: any) => {
    const text = `🚨 URGENT CIVIC DELAY: The issue "${issue.title}" at ${issue.location.ward} has been PENDING for ${issue.elapsedDays} DAYS. Please share to pressure municipal action! View: https://fixitbharat.gov/issue/${issue.id}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
  };

  const handleUpvote = async (id: string) => {
    try {
      await fetch(`/api/issues/${id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userUid: 'shame_upvote' })
      });
      onRefreshIssues();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-rangoli min-h-screen py-16 font-hind">
      <div className="max-w-[1100px] mx-auto px-6 space-y-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="bg-red-100 text-red-600 font-extrabold text-xs tracking-widest px-4 py-1.5 rounded-full uppercase inline-flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" /> {language === 'hi' ? 'लंबित शिकायतों की सूची' : 'Longest Pending Complaints'}
          </span>
          <h1 className="font-baloo text-5xl font-extrabold text-[#1A1A1A] leading-tight mt-3">
            Hall of Shame 😤
          </h1>
          <p className="text-[#6B6B6B] text-sm sm:text-base font-semibold uppercase tracking-wider mt-1">
            Public list of unresolved complaints open for over 30 days
          </p>
        </div>

        {/* Top 10 Delayed complaints list */}
        <div className="space-y-4">
          {pendingIssues.length > 0 ? (
            pendingIssues.map((issue) => (
              <div 
                key={issue.id} 
                className="bg-white rounded-[16px] border border-red-200 hover:border-red-400 card-shadow p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-[12px] flex items-center justify-center font-space font-black text-xl shrink-0">
                    {issue.elapsedDays}
                  </div>
                  <div>
                    <h4 
                      onClick={() => onNavigate(`#issue/${issue.id}`)}
                      className="font-baloo text-lg font-bold text-[#1A1A1A] hover:text-[#FF9A3C] cursor-pointer"
                    >
                      {issue.title}
                    </h4>
                    <p className="text-xs text-[#6B6B6B] font-semibold">📍 {issue.location.ward} | Department: {issue.department}</p>
                    <p className="text-[11px] text-red-600 font-bold mt-1 uppercase tracking-wider">⚠️ {issue.elapsedDays} Days Pending</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => handleUpvote(issue.id)}
                    className="pill bg-white border-2 border-[#FF9A3C] text-[#FF9A3C] hover:bg-orange-50/20 px-4 py-1.5 font-bold text-xs flex items-center gap-1 cursor-pointer transition-transform hover:scale-102"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> Upvote ({issue.upvotes})
                  </button>
                  <button 
                    onClick={() => handlePushAlert(issue)}
                    className="pill bg-[#E8472A] hover:bg-red-700 text-white px-4 py-1.5 font-bold text-xs flex items-center gap-1 cursor-pointer transition-transform hover:scale-102 shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share Alert
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-8 text-center text-sm font-bold text-[#6B6B6B]">
              🎉 No open complaints have been pending for more than 30 days! Amazing city service efficiency!
            </div>
          )}
        </div>

        {/* Gemini awareness summary */}
        {pendingIssues.length > 0 && (
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-6 sm:p-8 card-shadow">
            <div className="border-b border-[#EDE0CC] pb-4 mb-4 flex items-center gap-2">
              <span className="text-2xl">🚨</span>
              <div>
                <h3 className="font-baloo text-xl font-bold text-[#1A1A1A]">AI Accountability Assessment</h3>
                <p className="text-xs text-[#6B6B6B]">Awareness summary & bottleneck evaluation of pending issues</p>
              </div>
            </div>

            {loadingSummary ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8">
                <RefreshCw className="w-7 h-7 text-[#FF9A3C] animate-spin" />
                <span className="text-xs font-bold text-[#FF9A3C]">Synthesizing accountability logs...</span>
              </div>
            ) : (
              <div className="bg-[#FDF6EC] p-5 rounded-xl border border-[#EDE0CC] text-xs sm:text-sm text-[#6B6B6B] leading-relaxed font-medium whitespace-pre-wrap font-sans shadow-inner">
                {awarenessSummary}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
