/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Share2, Sparkles, SlidersHorizontal, Search } from 'lucide-react';
import { translations } from '../translations';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import IssuePlaceholder from '../components/IssuePlaceholder';

interface SuccessWallProps {
  language: 'en' | 'hi';
  currentCity: string;
  issues: any[];
}

export default function SuccessWall({ language, currentCity, issues }: SuccessWallProps) {
  const t = translations[language];
  const [filterType, setFilterType] = useState('all');

  const resolvedIssues = issues.filter(issue => 
    issue.cityId === currentCity && 
    issue.status === 'Resolved' &&
    (filterType === 'all' || issue.type === filterType)
  );

  const handleShareVictory = (issue: any) => {
    const link = `https://fixitbharat.gov/issue/${issue.id}`;
    const text = `🎉 VICTORY! Our local civic issue "${issue.title}" at ${issue.location.ward} has been officially RESOLVED! Check out the amazing before/after fix here: ${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
  };

  return (
    <div className="bg-rangoli min-h-screen py-16 font-hind">
      <div className="max-w-[1100px] mx-auto px-6 space-y-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="bg-[#2D9B5A]/10 text-[#2D9B5A] font-extrabold text-xs tracking-widest px-4 py-1.5 rounded-full uppercase inline-flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-[#2D9B5A] fill-current" /> {language === 'hi' ? 'सफलता की कहानियां' : 'Civic Resolutions Wall'}
          </span>
          <h1 className="font-baloo text-5xl font-extrabold text-[#1A1A1A] leading-tight mt-3">
            Success Wall 🎉
          </h1>
          <p className="text-[#6B6B6B] text-sm sm:text-base font-semibold uppercase tracking-wider mt-1">
            Celebrating completed civic repairs and community victories
          </p>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-4 card-shadow flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#6B6B6B]">
            <SlidersHorizontal className="w-5 h-5 text-[#FF9A3C]" />
            <span>Filter Categories</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['all', 'pothole', 'waterlogging', 'garbage', 'broken_streetlight'].map((type) => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`pill px-4 py-1 text-xs font-bold border cursor-pointer transition-colors ${
                  filterType === type 
                    ? 'bg-[#FF9A3C] border-[#FF9A3C] text-white' 
                    : 'bg-white border-[#EDE0CC] text-[#6B6B6B] hover:bg-orange-50/25'
                }`}
              >
                {type.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Resolutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {resolvedIssues.length > 0 ? (
            resolvedIssues.map((issue) => (
              <div 
                key={issue.id} 
                className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Slider overlay */}
                  {issue.photos && issue.photos.length > 0 && issue.resolutionPhoto ? (
                    <BeforeAfterSlider 
                      before={issue.photos[0]} 
                      after={issue.resolutionPhoto} 
                    />
                  ) : (
                    <div className="overflow-hidden rounded-xl">
                      <IssuePlaceholder type={issue.type} />
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4 mb-2">
                    <span className="text-[10px] bg-green-100 text-[#2D9B5A] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      Resolved in {issue.resolutionDays || 4} Days
                    </span>
                    <span className="text-xs text-[#6B6B6B] font-bold font-space">
                      📍 {issue.location.ward}
                    </span>
                  </div>

                  <h3 className="font-baloo text-xl font-bold text-[#1A1A1A] leading-tight mb-2">
                    {issue.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B6B6B] font-medium leading-relaxed mb-4 line-clamp-2">
                    {issue.description}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#EDE0CC] mt-2">
                  <span className="text-xs font-bold text-[#6B6B6B] italic">Resolved by {issue.department}</span>
                  <button 
                    onClick={() => handleShareVictory(issue)}
                    className="pill bg-[#2D9B5A] hover:bg-green-700 text-white font-bold px-4 py-1.5 text-xs flex items-center gap-1 cursor-pointer transition-transform hover:scale-102 shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share Victory
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-12 text-center text-sm font-bold text-[#6B6B6B] col-span-2">
              <Search className="w-8 h-8 text-[#FF9A3C] mx-auto mb-2" />
              <span>No resolved civic fixes matching this category are registered yet on the Success Wall. Let's work together to report and resolve!</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
