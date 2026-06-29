/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface IssuePlaceholderProps {
  type: string;
}

export default function IssuePlaceholder({ type }: IssuePlaceholderProps) {
  const colors: Record<string, string> = {
    pothole: '#FF9A3C',
    waterlogging: '#3B82F6',
    garbage: '#2D9B5A',
    broken_streetlight: '#F59E0B',
    sewage: '#8B5CF6',
    sewage_overflow: '#8B5CF6',
    damaged_road: '#EF4444',
    other: '#6B7280'
  };

  const emojis: Record<string, string> = {
    pothole: '🕳️',
    waterlogging: '💧',
    garbage: '🗑️',
    broken_streetlight: '💡',
    sewage: '🚰',
    sewage_overflow: '🚰',
    damaged_road: '🛣️',
    other: '⚠️'
  };

  const key = colors[type] ? type : 'other';

  return (
    <div style={{
      height: '200px',
      background: colors[key] + '20',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '64px',
      borderRadius: '12px 12px 0 0'
    }}>
      {emojis[key]}
    </div>
  );
}
