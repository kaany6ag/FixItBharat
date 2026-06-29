/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Mail, Download, RefreshCw, Sparkles, Building2, PhoneCall } from 'lucide-react';
import { translations } from '../translations';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useCity } from '../CityContext';

interface ScorecardProps {
  language: 'en' | 'hi';
  currentCity: string;
}

export default function Scorecard({ language, currentCity }: ScorecardProps) {
  const t = translations[language];
  const { cityWardsList } = useCity();
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showMailDraft, setShowMailDraft] = useState(false);
  const [commissionerMail, setCommissionerMail] = useState('');

  // seeded department records
  const departments = [
    { name: 'Water Resources (जल विभाग)', assigned: 48, resolved: 42, avgSpeed: '2.4 Days', overdue: 2, grade: 'A' },
    { name: 'Public Works Dept (PWD)', assigned: 35, resolved: 21, avgSpeed: '5.8 Days', overdue: 9, grade: 'C' },
    { name: 'Solid Waste / Garbage (स्वच्छता)', assigned: 62, resolved: 58, avgSpeed: '1.2 Days', overdue: 1, grade: 'A+' },
    { name: 'Electricity Board (विद्युत)', assigned: 28, resolved: 24, avgSpeed: '3.1 Days', overdue: 3, grade: 'B' }
  ];

  // Seeded officer list
  const officers = [
    { name: 'Shri R.K. Dixit', ward: cityWardsList[0] || 'Morar (Ward 12)', score: 92, phone: '+91 98452 10245', email: `dixit.${currentCity}@mp.gov.in` },
    { name: 'Smt. Suman Tomar', ward: cityWardsList[1] || 'Lashkar (Ward 7)', score: 85, phone: '+91 94562 31215', email: 'tomar.suman@mp.gov.in' },
    { name: 'Shri Manoj Hazari', ward: cityWardsList[2] || 'Hazira (Ward 3)', score: 64, phone: '+91 91235 48785', email: 'hazari.manoj@mp.gov.in' }
  ];

  const chartData = departments.map(d => ({
    name: d.name.split(' (')[0],
    Assigned: d.assigned,
    Resolved: d.resolved
  }));

  const loadGeminiReportCard = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/gemini/report-card-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departments, city: currentCity, language })
      });
      const data = await res.json();
      setSummary(data.summary);
      
      // Prefill mail draft
      setCommissionerMail(
        `To,\nThe Municipal Commissioner,\nGwalior Municipal Corporation,\n\nSubject: Feedback regarding Department Performance in ${currentCity.toUpperCase()}\n\nRespected Sir/Madam,\n\nI am writing to draw your attention to our latest community civic dashboard records. While Solid Waste Management scored a highly encouraging A+ grade, the Public Works Department (PWD) currently exhibits 9 overdue cases with an average resolution lag of 5.8 days.\n\nWe request your direct review and expedited action to optimize public services in delayed zones.\n\nThank you.\nSincerely,\nA Concerned Citizen`
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    loadGeminiReportCard();
  }, [currentCity]);

  const handleDownloadReport = () => {
    const textContent = `FixItBharat City Report Card - ${currentCity.toUpperCase()}\nDate: ${new Date().toLocaleDateString()}\n\nDEPARTMENT GRADES:\n` + 
      departments.map(d => `- ${d.name}: Grade ${d.grade} (Assigned: ${d.assigned}, Resolved: ${d.resolved}, Overdue: ${d.overdue})`).join('\n') + 
      `\n\nOFFICER SCORES:\n` + 
      officers.map(o => `- ${o.name} (${o.ward}): Score ${o.score}%`).join('\n') + 
      `\n\nAI SUMMARY:\n${summary}`;
      
    const element = document.createElement("a");
    const file = new Blob([textContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `FixItBharat_Report_Card_${currentCity}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-rangoli min-h-screen py-16 font-hind">
      <div className="max-w-[1100px] mx-auto px-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-baloo text-4xl font-extrabold text-[#1A1A1A] leading-tight">
              Who's Actually Fixing Things? 👀
            </h1>
            <p className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wider">Department Performance & Public Official Grades</p>
          </div>
          <button 
            onClick={handleDownloadReport}
            className="pill bg-[#FF9A3C] hover:bg-[#e0832d] text-white font-bold px-6 py-2.5 text-sm flex items-center gap-2 cursor-pointer hover:scale-102 transition-transform shadow-md"
          >
            <Download className="w-4 h-4" /> Download City Report Card
          </button>
        </div>

        {/* 1. Department Performance Table */}
        <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow overflow-hidden">
          <div className="p-5 border-b border-[#EDE0CC] bg-[#FDF6EC]/30">
            <h3 className="font-baloo text-xl font-bold text-[#1A1A1A]">Municipal Department Grades</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-medium text-sm text-[#6B6B6B]">
              <thead>
                <tr className="bg-[#FDF6EC]/10 border-b border-[#EDE0CC] text-[#1A1A1A] font-bold text-xs uppercase tracking-wider">
                  <th className="p-4 sm:p-5">Department</th>
                  <th className="p-4">Assigned</th>
                  <th className="p-4">Resolved</th>
                  <th className="p-4">Avg Speed</th>
                  <th className="p-4">Overdue</th>
                  <th className="p-4 text-center">Public Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE0CC]">
                {departments.map((dept, i) => (
                  <tr key={i} className="hover:bg-[#FDF6EC]/10 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-[#1A1A1A] flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-[#FF9A3C]" /> {dept.name}
                    </td>
                    <td className="p-4 font-space font-semibold text-[#1A1A1A]">{dept.assigned}</td>
                    <td className="p-4 font-space font-semibold text-[#2D9B5A]">{dept.resolved}</td>
                    <td className="p-4 font-space">{dept.avgSpeed}</td>
                    <td className="p-4 font-space font-semibold text-[#E8472A]">{dept.overdue}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1.5 rounded-full font-space font-black text-xs inline-block shadow-sm ${
                        dept.grade.startsWith('A') 
                          ? 'bg-[#2D9B5A]/10 text-[#2D9B5A]' 
                          : (dept.grade.startsWith('B') ? 'bg-amber-100 text-amber-700' : 'bg-[#E8472A]/10 text-[#E8472A]')
                      }`}>
                        {dept.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Officers Scorecard & Email Commissioner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Officers scorecard table */}
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-5 lg:col-span-2 space-y-4">
            <h3 className="font-baloo text-xl font-bold text-[#1A1A1A] border-b border-[#EDE0CC] pb-3">
              Ward Officer Public Scorecards
            </h3>
            <div className="space-y-4">
              {officers.map((off, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-[#EDE0CC] rounded-xl bg-[#FDF6EC]/10 hover:bg-white transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FF9A3C]/10 flex items-center justify-center font-bold text-[#FF9A3C]">
                      {off.name.replace('Shri ', '').replace('Smt. ', '').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1A1A1A] text-sm">{off.name}</h4>
                      <p className="text-xs text-[#6B6B6B]">{off.ward}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1 text-[#6B6B6B]">
                      <PhoneCall className="w-4.5 h-4.5" /> {off.phone}
                    </span>
                    <span className={`px-2.5 py-1 rounded font-space font-black ${
                      off.score >= 85 ? 'bg-[#2D9B5A]/10 text-[#2D9B5A]' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {off.score}% Score
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email to Commissioner Box */}
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-5 card-shadow flex flex-col justify-between">
            <div>
              <h3 className="font-baloo text-xl font-bold text-[#1A1A1A] border-b border-[#EDE0CC] pb-3">
                Hold them Accountable!
              </h3>
              <p className="text-xs text-[#6B6B6B] font-medium leading-relaxed mt-2">
                Use our prefilled email drafts to send direct performance reports from this dashboard directly to the Municipal Commissioner's official email inbox.
              </p>
            </div>
            {showMailDraft ? (
              <div className="space-y-3 mt-4">
                <textarea 
                  rows={6}
                  value={commissionerMail}
                  onChange={(e) => setCommissionerMail(e.target.value)}
                  className="w-full border border-[#EDE0CC] rounded-lg p-2 text-xs font-mono text-[#6B6B6B] leading-relaxed"
                ></textarea>
                <div className="flex justify-between">
                  <button onClick={() => setShowMailDraft(false)} className="text-xs text-[#6B6B6B] font-bold">Cancel</button>
                  <a 
                    href={`mailto:commissioner.gwalior@mp.gov.in?subject=Feedback regarding Department Performance&body=${encodeURIComponent(commissionerMail)}`}
                    className="pill bg-[#FF9A3C] text-white text-xs font-bold px-4 py-1.5 flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" /> Send official Email
                  </a>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowMailDraft(true)}
                className="w-full pill border-2 border-[#FF9A3C] text-[#FF9A3C] hover:bg-[#FF9A3C]/5 py-3 font-bold text-sm mt-4 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Mail className="w-4 h-4" /> Email Municipal Commissioner
              </button>
            )}
          </div>

        </div>

        {/* 3. Recharts Graph & Gemini monthly summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart */}
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-6 card-shadow flex flex-col">
            <h3 className="font-baloo text-xl font-bold text-[#1A1A1A] mb-4">Assigned vs Resolved Complaints</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#6B6B6B" fontSize={10} fontWeight="bold" />
                  <YAxis stroke="#6B6B6B" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="Assigned" fill="#FF9A3C" name="Assigned / सौंपे गए" />
                  <Bar dataKey="Resolved" fill="#2D9B5A" name="Resolved / पूर्ण" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Monthly report summary */}
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-6 sm:p-8 card-shadow flex flex-col">
            <div className="border-b border-[#EDE0CC] pb-4 mb-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-baloo text-xl font-bold text-[#1A1A1A]">Monthly AI Audit Report</h3>
                  <p className="text-xs text-[#6B6B6B]">Performance scorecard synthesis for {currentCity.toUpperCase()}</p>
                </div>
              </div>
              <span className="bg-[#FF9A3C]/10 text-[#FF9A3C] font-extrabold px-3 py-1 rounded-full text-[10px] uppercase">GMC Approved</span>
            </div>

            {loadingSummary ? (
              <div className="flex-grow flex flex-col items-center justify-center gap-2 py-10">
                <RefreshCw className="w-8 h-8 text-[#FF9A3C] animate-spin" />
                <span className="text-xs font-bold text-[#FF9A3C]">Synthesizing monthly data...</span>
              </div>
            ) : (
              <div className="bg-[#FDF6EC] p-5 rounded-xl border border-[#EDE0CC] text-xs sm:text-sm text-[#6B6B6B] leading-relaxed font-medium flex-grow whitespace-pre-wrap font-sans shadow-inner">
                {summary}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
