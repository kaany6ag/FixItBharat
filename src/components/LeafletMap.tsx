/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    L: any;
  }
}

interface Pin {
  id: string;
  title: string;
  type: string;
  severity: number;
  location: {
    lat: number;
    lng: number;
    address: string;
    ward?: string;
  };
  status: string;
  cityId?: string;
}

interface LeafletMapProps {
  city?: { id?: string; name?: string; lat: number; lng: number };
  center?: { lat: number; lng: number } | [number, number];
  pins?: Pin[];
  issues?: Pin[];
  heatmapMode?: boolean;
  onPinClick?: (pinId: string) => void;
}

export default function LeafletMap({ city, center, pins, issues, heatmapMode, onPinClick }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Resolve active issues for current city
  const activeIssues = pins || [];
  
  // Resolve all issues across all cities
  const allIssues = issues || [];

  // Local state for tabs
  const [activeTab, setActiveTab] = useState<'current' | 'all'>('current');

  // Resolve initial coordinates
  const resolvedCity = city || (center && !Array.isArray(center) ? center : null);
  const initialLat = resolvedCity?.lat || (Array.isArray(center) ? center[0] : 26.2183);
  const initialLng = resolvedCity?.lng || (Array.isArray(center) ? center[1] : 78.1828);
  const cityName = city?.name || 'Local Area';

  const [viewCenter, setViewCenter] = useState({ lat: initialLat, lng: initialLng });

  // Sync state with incoming props
  useEffect(() => {
    setViewCenter({ lat: initialLat, lng: initialLng });
    setActiveTab('current'); // Default back to local city view when city changes
  }, [initialLat, initialLng]);

  // City ID formatting translator helper
  const getCityDisplayName = (cityId: string) => {
    if (!cityId) return 'Local Area';
    const cId = cityId.toLowerCase();
    if (cId === 'gwalior') return 'Gwalior';
    if (cId === 'bhopal') return 'Bhopal';
    if (cId === 'indore') return 'Indore';
    if (cId === 'delhi') return 'Delhi';
    if (cId === 'mumbai') return 'Mumbai';
    if (cId === 'bangalore') return 'Bangalore';
    if (cId === 'jaipur') return 'Jaipur';
    return cityId.charAt(0).toUpperCase() + cityId.slice(1);
  };

  // Issue icon helper
  const getIssueEmoji = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('pothole')) return '🕳️';
    if (t.includes('garbage') || t.includes('waste')) return '🗑️';
    if (t.includes('water') || t.includes('logging') || t.includes('drain')) return '💧';
    if (t.includes('light') || t.includes('streetlight')) return '💡';
    if (t.includes('sewage') || t.includes('drainage')) return '💧';
    return '⚠️';
  };

  // Decide which list of issues to display
  const listToDisplay = activeTab === 'all' && allIssues.length > 0 ? allIssues : activeIssues;

  // Sort issues: Emergency first, then Medium, then Low
  const sortedIssues = [...listToDisplay].sort((a, b) => b.severity - a.severity);

  // Initialize and keep Leaflet map instance updated
  useEffect(() => {
    const L = window.L;
    if (!L || !mapRef.current) return;

    // Create map instance if it doesn't exist
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [viewCenter.lat, viewCenter.lng],
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });

      // Add a nice light styled TileLayer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      // Pan/Zoom to new coordinates gracefully
      mapInstanceRef.current.setView([viewCenter.lat, viewCenter.lng], 12);
    }

    // Update active markers on the map
    const mapInstance = mapInstanceRef.current;
    
    // Clear old markers safely
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Draw active markers
    sortedIssues.forEach(issue => {
      if (!issue.location?.lat || !issue.location?.lng) return;

      const isEmergency = issue.severity >= 8;
      const isMedium = issue.severity >= 5 && issue.severity < 8;
      
      const markerColor = isEmergency ? '#E8472A' : (isMedium ? '#FF9A3C' : '#2D9B5A');
      const size = isEmergency ? 16 : 12;

      // Create a gorgeous custom circular pin with pure HTML/CSS
      const customIcon = L.divIcon({
        html: `<div style="
          width: ${size}px;
          height: ${size}px;
          background: ${markerColor};
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          cursor: pointer;
        "></div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      // Assemble a lovely popup tooltip card
      const popupContent = `
        <div style="font-family: Hind, sans-serif; padding: 6px; max-width: 200px;">
          <b style="color: #1A1A1A; font-size: 13px;">${getIssueEmoji(issue.type)} ${issue.title}</b>
          <br/>
          <span style="color: ${markerColor}; font-weight: 800; font-size: 11px; display: inline-block; margin-top: 2px;">
            ${isEmergency ? '🔴 Emergency' : (isMedium ? '🟠 Medium' : '🟢 Low')} (${issue.severity}/10)
          </span>
          <br/>
          <span style="color: #6B6B6B; font-size: 11px; display: inline-block; margin-top: 4px;">
            📍 ${issue.location.address || 'Street view address'}
          </span>
          <br/>
          <span style="
            display: inline-block;
            margin-top: 6px;
            background: ${issue.status === 'Resolved' || issue.status === 'resolved' ? '#2D9B5A' : '#FF9A3C'};
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
          ">
            ${issue.status}
          </span>
        </div>
      `;

      const marker = L.marker([issue.location.lat, issue.location.lng], { icon: customIcon })
        .addTo(mapInstance)
        .bindPopup(popupContent, { closeButton: false, offset: L.point(0, -2) });

      // Click callback
      marker.on('click', () => {
        if (onPinClick && issue.id !== 'temp') {
          onPinClick(issue.id);
        }
      });

      markersRef.current.push(marker);
    });

  }, [viewCenter, sortedIssues]);

  // Clean up Leaflet instance when component unmounts
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ 
      position: 'relative', 
      zIndex: 1,
      height: '100%', 
      width: '100%',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '2px solid #EDE0CC',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
    }}>
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Map Header, Switcher & Legend Overlay */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        background: 'rgba(255, 255, 255, 0.98)',
        padding: '12px 16px',
        borderRadius: '14px',
        boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
        fontSize: '13px',
        fontFamily: 'Hind, sans-serif',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backdropFilter: 'blur(8px)',
        border: '1px solid #EDE0CC'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px' }}>📍</span>
            <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '15px', color: '#1A1A1A' }}>
              {cityName}
            </span>
            <span style={{ color: '#E0D2C0' }}>|</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6B' }}>
              {activeIssues.length} Active Local Issues
            </span>
          </div>
          
          {/* Legend displaying colors for emergency, medium, low */}
          <div style={{ display: 'flex', gap: '10px', fontSize: '11px', fontWeight: 'bold', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E8472A', display: 'inline-block' }}></span>
              <span style={{ color: '#E8472A' }}>🔴 Emergency (8-10)</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF9A3C', display: 'inline-block' }}></span>
              <span style={{ color: '#C2410C' }}>🟠 Medium (5-7)</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2D9B5A', display: 'inline-block' }}></span>
              <span style={{ color: '#15803D' }}>🟢 Low (1-4)</span>
            </span>
          </div>
        </div>

        {/* Tab switch logic */}
        {allIssues.length > 0 && (
          <div style={{ 
            display: 'flex', 
            background: '#F5EFE6', 
            borderRadius: '24px', 
            padding: '3px', 
            width: 'fit-content',
            border: '1px solid #EDE0CC'
          }}>
            <button
              onClick={() => setActiveTab('current')}
              style={{
                border: 'none',
                background: activeTab === 'current' ? '#FF9A3C' : 'transparent',
                padding: '4px 14px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 'bold',
                color: activeTab === 'current' ? 'white' : '#6B6B6B',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
            >
              🎯 {cityName} ({activeIssues.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                border: 'none',
                background: activeTab === 'all' ? '#FF9A3C' : 'transparent',
                padding: '4px 14px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 'bold',
                color: activeTab === 'all' ? 'white' : '#6B6B6B',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
            >
              🌏 All Cities ({allIssues.length})
            </button>
          </div>
        )}
      </div>

      {/* Issues list overlay on map (displays scrollable horizontal cards) */}
      {sortedIssues.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          right: 12,
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          zIndex: 1000,
          paddingBottom: '6px',
          scrollbarWidth: 'thin'
        }}>
          {sortedIssues.map(issue => {
            const isEmergency = issue.severity >= 8;
            const isMedium = issue.severity >= 5 && issue.severity < 8;
            
            // Choose color representation based on severity
            const badgeColor = isEmergency ? '#E8472A' : (isMedium ? '#FF9A3C' : '#2D9B5A');
            const badgeBg = isEmergency ? '#FEE2E2' : (isMedium ? '#FFEDD5' : '#D1FAE5');
            const textColor = isEmergency ? '#991B1B' : (isMedium ? '#9A3412' : '#065F46');
            const badgeLabel = isEmergency ? '🔴 Emergency' : (isMedium ? '🟠 Medium' : '🟢 Low');

            return (
              <div 
                key={issue.id} 
                onClick={() => {
                  if (issue.location?.lat && issue.location?.lng) {
                    setViewCenter({ lat: issue.location.lat, lng: issue.location.lng });
                  }
                  if (onPinClick && issue.id !== 'temp') {
                    onPinClick(issue.id);
                  }
                }}
                style={{
                  background: 'white',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  borderLeft: `5px solid ${badgeColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontFamily: 'Hind, sans-serif',
                  minWidth: '220px',
                  maxWidth: '240px',
                  flexShrink: 0,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                className="hover:scale-105 hover:shadow-xl"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 800, color: '#1A1A1A', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {getIssueEmoji(issue.type)} {issue.title}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#6B6B6B' }}>
                    🏙️ {getCityDisplayName(issue.cityId || '')}
                  </span>
                  
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: badgeBg,
                    color: textColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {badgeLabel} ({issue.severity}/10)
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#9CA3AF', marginTop: '1px' }}>
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                    📍 {issue.location.address || 'Street View'}
                  </span>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: issue.status === 'Resolved' ? '#2D9B5A' : '#FF9A3C'
                  }}>
                    {issue.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
