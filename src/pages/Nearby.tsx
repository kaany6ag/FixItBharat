/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, ThumbsUp, Eye, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { translations } from '../translations';
import IssuePlaceholder from '../components/IssuePlaceholder';

interface NearbyProps {
  language: 'en' | 'hi';
  currentCity: string;
  issues: any[];
  onNavigate: (page: string) => void;
  onRefreshIssues: () => void;
}

export default function Nearby({ language, currentCity, issues, onNavigate, onRefreshIssues }: NearbyProps) {
  const t = translations[language];

  // Map coordinates (distance calculator simulated)
  const userLat = 26.2183;
  const userLng = 78.1828;

  const nearbyIssues = issues
    .filter(i => i.cityId === currentCity)
    .map(i => {
      // Haversine approximation
      const dy = i.location.lat - userLat;
      const dx = i.location.lng - userLng;
      const dist = Math.sqrt(dx*dx + dy*dy) * 111; // Approx km
      return { ...i, distance: Math.max(0.1, dist) };
    })
    .filter(i => i.distance <= 2.0) // Within 2km
    .sort((a, b) => a.distance - b.distance);

  const handleUpvote = async (id: string) => {
    try {
      await fetch(`/api/issues/${id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userUid: 'nearby_upvote' })
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
          <span className="bg-[#FF9A3C]/10 text-[#FF9A3C] font-extrabold text-xs tracking-widest px-4 py-1.5 rounded-full uppercase inline-flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#FF9A3C]" /> {language === 'hi' ? 'मेरे पास की समस्याएं' : 'Active Issues Near You'}
          </span>
          <h1 className="font-baloo text-5xl font-extrabold text-[#1A1A1A] leading-tight mt-3">
            Civic Watch: 2km Radius
          </h1>
          <p className="text-[#6B6B6B] text-sm sm:text-base font-semibold uppercase tracking-wider mt-1">
            Browse, verify and upvote issues reported close to your location
          </p>
        </div>

        {/* Nearby Feed list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nearbyIssues.length > 0 ? (
            nearbyIssues.map((issue) => (
              <div 
                key={issue.id} 
                style={{
                  borderLeft: `5px solid ${
                    issue.severity >= 8 ? '#E8472A' :
                    issue.severity >= 5 ? '#FF9A3C' : '#2D9B5A'
                  }`
                }}
                className="bg-white rounded-[16px] border-y border-r border-y-[#EDE0CC] border-r-[#EDE0CC] hover:border-y-[#FF9A3C] hover:border-r-[#FF9A3C] card-shadow p-5 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1"
              >
                <div>
                  {/* Photo thumbnail */}
                  {issue.photos && issue.photos.length > 0 ? (
                    <img 
                      src={issue.photos[0]} 
                      alt={issue.title} 
                      className="w-full h-40 object-cover rounded-xl mb-4 border border-[#EDE0CC]"
                    />
                  ) : (
                    <div className="mb-4 overflow-hidden rounded-xl">
                      <IssuePlaceholder type={issue.type} />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                    <span className="text-[10px] bg-orange-100 text-[#FF9A3C] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      {issue.type.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                      issue.severity >= 8 ? 'bg-red-100 text-[#E8472A]' :
                      issue.severity >= 5 ? 'bg-orange-100 text-[#FF9A3C]' : 'bg-green-100 text-[#2D9B5A]'
                    }`}>
                      {issue.severity >= 8 ? '🚨 Emergency' : (issue.severity >= 5 ? '🟠 Medium' : '🟢 Low')} ({issue.severity}/10)
                    </span>
                    <span className="text-xs font-space font-extrabold text-[#6B6B6B] flex items-center gap-1">
                      📍 {issue.distance.toFixed(1)} km away
                    </span>
                  </div>

                  <h3 
                    onClick={() => onNavigate(`#issue/${issue.id}`)}
                    className="font-baloo text-lg font-bold text-[#1A1A1A] group-hover:text-[#FF9A3C] cursor-pointer transition-colors"
                  >
                    {issue.title}
                  </h3>
                  <p className="text-xs text-[#6B6B6B] font-medium leading-relaxed mb-4 line-clamp-2">
                    {issue.description}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#EDE0CC] mt-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    issue.status === 'Resolved' ? 'bg-[#2D9B5A]/10 text-[#2D9B5A]' : 'bg-orange-50 text-[#FF9A3C]'
                  }`}>
                    {issue.status}
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpvote(issue.id)}
                      className="pill bg-white border-2 border-[#FF9A3C] text-[#FF9A3C] px-3.5 py-1 font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-orange-50/20"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> Upvote ({issue.upvotes})
                    </button>
                    <button 
                      onClick={() => onNavigate(`#issue/${issue.id}`)}
                      className="pill bg-[#FF9A3C] text-white px-3.5 py-1 font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm hover:scale-102"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-8 text-center text-sm font-bold text-[#6B6B6B] col-span-2">
              <AlertCircle className="w-8 h-8 text-[#FF9A3C] mx-auto mb-2" />
              <span>No nearby active complaints detected within your 2km radius area. Keep up the good work!</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
