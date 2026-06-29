/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function Logo() {
  return (
    <span style={{
      fontFamily: "'Baloo 2', sans-serif",
      fontWeight: 800,
      fontSize: '24px',
      letterSpacing: '-0.5px'
    }} className="inline-block select-none">
      <span style={{color: '#2D9B5A'}}>FixIt</span>
      <span style={{color: '#FF9A3C'}}>Bharat</span>
    </span>
  );
}
