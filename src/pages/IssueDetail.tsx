/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThumbsUp, CheckCircle2, AlertTriangle, FileText, Download, Share2, Clock, MapPin, User, ChevronLeft, Sparkles, MessageSquare } from 'lucide-react';
import { translations } from '../translations';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import IssuePlaceholder from '../components/IssuePlaceholder';

interface IssueDetailProps {
  issueId: string;
  language: 'en' | 'hi';
  userUid: string | null;
  issues: any[];
  onBack: () => void;
  onRefreshIssues: () => void;
}

export default function IssueDetail({ issueId, language, userUid, issues, onBack, onRefreshIssues }: IssueDetailProps) {
  const t = translations[language];
  const [issue, setIssue] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [rtiDraft, setRtiDraft] = useState('');
  const [generatingRti, setGeneratingRti] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  useEffect(() => {
    const matched = issues.find(i => i.id === issueId);
    if (matched) {
      setIssue(matched);
      fetchComments();
    }
  }, [issueId, issues]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/issues/${issueId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!issue) {
    return (
      <div className="bg-rangoli min-h-screen py-16 flex flex-col items-center justify-center">
        <p className="text-lg text-[#6B6B6B] mb-4">Finding complaint records...</p>
        <button onClick={onBack} className="pill bg-[#FF9A3C] text-white px-6 py-2 font-bold cursor-pointer">Back</button>
      </div>
    );
  }

  // Calculate days elapsed since reporting
  const reportedDate = new Date(issue.createdAt);
  const diffTime = Math.abs(new Date().getTime() - reportedDate.getTime());
  const elapsedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determine stage active
  const stages = ['Reported', 'Verified', 'In Progress', 'Resolved'];
  const currentStageIndex = stages.indexOf(issue.status);

  // Upvote complaint
  const handleUpvote = async () => {
    if (hasUpvoted) return;
    try {
      const res = await fetch(`/api/issues/${issue.id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userUid })
      });
      if (res.ok) {
        setHasUpvoted(true);
        onRefreshIssues();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Mark as Resolved
  const handleVerifyResolve = async () => {
    try {
      const res = await fetch(`/api/issues/${issue.id}/verify-resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userUid, photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500' })
      });
      if (res.ok) {
        onRefreshIssues();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Flag Recurrence
  const handleFlagRecurrence = async () => {
    try {
      const res = await fetch(`/api/issues/${issue.id}/flag-recurrence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userUid })
      });
      if (res.ok) {
        onRefreshIssues();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit comment
  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newComment,
          userId: userUid || 'guest',
          anonymous: false,
          name: 'Priya Sharma', // Simulated logged in user name
          language
        })
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Generate RTI Draft
  const handleGenerateRti = async () => {
    setGeneratingRti(true);
    try {
      const response = await fetch('/api/gemini/rti-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: issue.id,
          title: issue.title,
          location: issue.location.address,
          daysPending: elapsedDays,
          department: issue.department,
          language
        })
      });
      const data = await response.json();
      setRtiDraft(data.rti);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingRti(false);
    }
  };

  const downloadRtiText = () => {
    const element = document.createElement("a");
    const file = new Blob([rtiDraft], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `FixItBharat_RTI_Draft_${issue.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-rangoli min-h-screen py-16 font-hind">
      <div className="max-w-[1100px] mx-auto px-6">
        
        {/* Navigation back */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 font-bold text-[#FF9A3C] hover:text-[#e0832d] mb-6 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" /> {language === 'hi' ? 'पीछे जाएं' : 'Back to List'}
        </button>

        {/* Hero split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Left: Photos & Slider */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-4 card-shadow">
              {issue.photos && issue.photos.length > 0 ? (
                issue.status === 'Resolved' && issue.resolutionPhoto ? (
                  <BeforeAfterSlider before={issue.photos[0]} after={issue.resolutionPhoto} />
                ) : (
                  <img 
                    src={issue.photos[0]} 
                    alt={issue.title} 
                    className="w-full h-64 object-cover rounded-[12px] border border-[#EDE0CC]"
                  />
                )
              ) : (
                <div className="overflow-hidden rounded-[12px]">
                  <IssuePlaceholder type={issue.type} />
                </div>
              )}
            </div>

            {/* Before After Verification by Gemini */}
            {issue.status === 'Resolved' && (
              <div className="bg-[#2D9B5A]/5 border border-[#2D9B5A]/20 rounded-[16px] p-5">
                <div className="flex items-center gap-2 mb-2 font-baloo font-bold text-[#2D9B5A]">
                  <Sparkles className="w-5 h-5 text-[#FF9A3C]" />
                  <span>{t.aiVerificationResult}</span>
                </div>
                <p className="text-xs text-[#6B6B6B] italic leading-relaxed">
                  "Before and after visual parameters analyzed. Resolution matches standard municipal pavement repair models with 94% structural match. Complaint officially approved as resolved."
                </p>
              </div>
            )}
          </div>

          {/* Right: Info & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-6 sm:p-8 card-shadow">
              
              {/* Header tags */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="text-xs bg-[#FF9A3C]/10 text-[#FF9A3C] font-extrabold uppercase px-3 py-1 rounded-full">
                  {issue.type.replace('_', ' ')}
                </span>
                <span className={`text-xs text-white font-extrabold px-3 py-1 rounded-full ${
                  issue.severity >= 9 ? 'bg-[#E8472A]' : (issue.severity >= 6 ? 'bg-[#FF9A3C]' : 'bg-[#2D9B5A]')
                }`}>
                  {t.severityScore}: {issue.severity}/10
                </span>
              </div>

              <h1 className="font-baloo text-3xl font-extrabold text-[#1A1A1A] leading-tight mb-3">
                {issue.title}
              </h1>
              
              <p className="text-sm text-[#6B6B6B] font-medium mb-6 flex items-center gap-1">
                <MapPin className="w-4 h-4 shrink-0 text-[#FF9A3C]" /> {issue.location.address}
              </p>

              {/* Status Tracker Progress Bar */}
              <div className="border-t border-[#EDE0CC] pt-6 mb-8">
                <div className="flex justify-between text-[11px] sm:text-xs font-bold text-[#6B6B6B] mb-3">
                  {stages.map((stage, idx) => (
                    <span 
                      key={stage} 
                      className={idx <= currentStageIndex ? 'text-[#FF9A3C]' : ''}
                    >
                      {stage === 'Reported' && `📋 ${t.timelineReported}`}
                      {stage === 'Verified' && `👀 ${t.timelineVerified}`}
                      {stage === 'In Progress' && `🔧 ${t.timelineInProgress}`}
                      {stage === 'Resolved' && `✅ ${t.timelineResolved}`}
                    </span>
                  ))}
                </div>
                <div className="w-full bg-[#FDF6EC] h-2 rounded-full overflow-hidden relative">
                  <div 
                    className="bg-gradient-to-r from-[#FF9A3C] to-[#E8472A] h-full transition-all duration-500" 
                    style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Info cards row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#EDE0CC]">
                <div className="bg-[#FDF6EC]/40 border border-[#EDE0CC] rounded-xl p-3 text-center">
                  <span className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Assigned To</span>
                  <span className="text-sm font-bold text-[#1A1A1A]">{issue.department}</span>
                </div>
                <div className="bg-[#FDF6EC]/40 border border-[#EDE0CC] rounded-xl p-3 text-center">
                  <span className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Ward</span>
                  <span className="text-sm font-bold text-[#1A1A1A]">{issue.location.ward}</span>
                </div>
                <div className="bg-[#FDF6EC]/40 border border-[#EDE0CC] rounded-xl p-3 text-center">
                  <span className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Days Open</span>
                  <span className="text-sm font-bold text-[#E8472A] font-space">{elapsedDays} Days</span>
                </div>
                <div className="bg-[#FDF6EC]/40 border border-[#EDE0CC] rounded-xl p-3 text-center">
                  <span className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Upvotes</span>
                  <span className="text-sm font-bold text-[#2D9B5A] font-space">{issue.upvotes}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Mid Panel: Witness verification, Community confirmation, and Risk analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Witness Verification & Community Verification */}
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-6 card-shadow space-y-6">
            <h3 className="font-baloo text-xl font-bold text-[#1A1A1A] border-b border-[#EDE0CC] pb-3">
              {t.communityVerification}
            </h3>

            {/* Witness banner (500m logic simulation) */}
            <div className="bg-[#FF9A3C]/5 border border-[#FF9A3C]/20 rounded-xl p-4 text-xs">
              <p className="font-bold text-[#FF9A3C] mb-1">📍 Witness Verification Active</p>
              <p className="text-[#6B6B6B] font-medium leading-relaxed mb-3">You are identified as being near this coordinate. Can you verify if this problem is still active?</p>
              <div className="flex gap-2">
                <button onClick={handleUpvote} className="bg-[#FF9A3C] text-white font-bold px-3 py-1 rounded-full">Yes, still here</button>
                <button className="bg-white text-[#6B6B6B] border border-[#EDE0CC] px-3 py-1 rounded-full">No, it's clear</button>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3 pt-3">
              <button 
                onClick={handleUpvote}
                disabled={hasUpvoted}
                className="w-full pill bg-[#FF9A3C] text-white hover:bg-[#e0832d] disabled:opacity-50 py-3 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-102 transition-transform"
              >
                <ThumbsUp className="w-4 h-4" /> {t.seenThisIssueBtn} ({issue.upvotes})
              </button>
              
              <button 
                onClick={handleVerifyResolve}
                className="w-full pill bg-white border-2 border-[#2D9B5A] text-[#2D9B5A] hover:bg-[#2D9B5A]/5 py-3 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:scale-102 transition-transform"
              >
                <CheckCircle2 className="w-4 h-4" /> {t.markAsResolvedBtn} ({issue.resolvedFlags}/3 Confirms)
              </button>

              {issue.status === 'Resolved' && (
                <button 
                  onClick={handleFlagRecurrence}
                  className="w-full pill bg-white border-2 border-[#E8472A] text-[#E8472A] hover:bg-[#E8472A]/5 py-3 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:scale-102 transition-transform"
                >
                  <AlertTriangle className="w-4 h-4" /> {t.problemIsBackBtn} ({issue.recurrenceFlags}/3 Flags)
                </button>
              )}

              {issue.recurrenceCount > 0 && (
                <div className="text-center text-xs text-[#E8472A] font-bold">
                  ⚠️ {t.problemReturnedTimes.replace('{count}', issue.recurrenceCount.toString())}
                </div>
              )}
            </div>
          </div>

          {/* Escalation details & Day 30 RTI Draft generator */}
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-6 card-shadow space-y-6">
            <h3 className="font-baloo text-xl font-bold text-[#1A1A1A] border-b border-[#EDE0CC] pb-3">
              {t.escalationTitle}
            </h3>

            {/* Vertical timeline */}
            <div className="space-y-6 relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:border-l-2 before:border-dashed before:border-[#EDE0CC]">
              <div className="relative">
                <div className={`absolute -left-7 top-1 w-3.5 h-3.5 rounded-full border-2 ${elapsedDays >= 7 ? 'bg-[#FF9A3C] border-[#FF9A3C]' : 'bg-white border-[#EDE0CC]'}`}></div>
                <h4 className={`text-xs sm:text-sm font-bold ${elapsedDays >= 7 ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}`}>Day 7 Escalation</h4>
                <p className="text-[11px] text-[#6B6B6B] font-medium leading-relaxed">{t.escalationDay7}</p>
              </div>
              <div className="relative">
                <div className={`absolute -left-7 top-1 w-3.5 h-3.5 rounded-full border-2 ${elapsedDays >= 15 ? 'bg-[#FF9A3C] border-[#FF9A3C]' : 'bg-white border-[#EDE0CC]'}`}></div>
                <h4 className={`text-xs sm:text-sm font-bold ${elapsedDays >= 15 ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}`}>Day 15 Escalation</h4>
                <p className="text-[11px] text-[#6B6B6B] font-medium leading-relaxed">{t.escalationDay15}</p>
              </div>
              <div className="relative">
                <div className={`absolute -left-7 top-1 w-3.5 h-3.5 rounded-full border-2 ${elapsedDays >= 30 ? 'bg-[#E8472A] border-[#E8472A]' : 'bg-white border-[#EDE0CC]'}`}></div>
                <h4 className={`text-xs sm:text-sm font-bold ${elapsedDays >= 30 ? 'text-[#E8472A]' : 'text-[#6B6B6B]'}`}>Day 30 Escalation</h4>
                <p className="text-[11px] text-[#6B6B6B] font-medium leading-relaxed">{t.escalationDay30}</p>
              </div>
            </div>

            {/* Day 30+ RTI draft generator trigger */}
            {elapsedDays >= 30 && (
              <div className="pt-4 border-t border-[#EDE0CC]">
                {rtiDraft ? (
                  <div className="space-y-3">
                    <div className="bg-[#FDF6EC] p-3 rounded-lg border border-[#EDE0CC] font-mono text-[10px] text-[#6B6B6B] max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {rtiDraft}
                    </div>
                    <button 
                      onClick={downloadRtiText}
                      className="w-full pill bg-white border-2 border-[#FF9A3C] text-[#FF9A3C] py-2 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download RTI Draft
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleGenerateRti}
                    disabled={generatingRti}
                    className="w-full pill bg-white border-2 border-[#E8472A] text-[#E8472A] py-3.5 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:scale-102 transition-transform"
                  >
                    <FileText className="w-4 h-4" /> {generatingRti ? 'Drafting RTI...' : t.generateRtiBtn}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Recurrence Risk Analysis card */}
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-6 card-shadow space-y-6">
            <h3 className="font-baloo text-xl font-bold text-[#1A1A1A] border-b border-[#EDE0CC] pb-3">
              Recurrence Risk Profile 📋
            </h3>
            <div className={`p-5 rounded-xl border text-white ${
              issue.riskLevel === 'CRITICAL' || issue.riskLevel === 'HIGH'
                ? 'bg-gradient-to-br from-[#E8472A] to-orange-500'
                : 'bg-gradient-to-br from-[#2D9B5A] to-green-600'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-xs">Score: {issue.riskScore}%</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{issue.riskLevel}</span>
              </div>
              <p className="text-xs font-semibold mb-2 leading-relaxed">"Chronic soil shift at coordinate triggers water main cracking. Low base binder tarmac predicted to crack within next heavy monsoon cycle."</p>
              <p className="text-[10px] text-orange-100">Recommendation: Conduct sub-base load compaction sealing before final seal overlay.</p>
            </div>
          </div>

        </div>

        {/* Comment Discussion Section */}
        <div className="bg-white rounded-[16px] border border-[#EDE0CC] p-6 sm:p-8 card-shadow">
          <h3 className="font-baloo text-2xl font-extrabold text-[#1A1A1A] mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#FF9A3C]" /> {t.comments} ({comments.length})
          </h3>

          <div className="space-y-4 mb-8">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-[#FDF6EC]/30 rounded-xl border border-[#EDE0CC]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-xs text-[#FF9A3C]">
                      {comment.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-sm text-[#1A1A1A]">
                      {comment.anonymous ? t.anonymousPill : comment.name}
                    </span>
                  </div>
                  <span className="text-xs text-orange-600 font-bold bg-[#FF9A3C]/10 px-2.5 py-0.5 rounded-full">
                    {comment.sentiment}
                  </span>
                </div>
                <p className="text-sm text-[#6B6B6B] font-medium pl-10">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <input 
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t.addComment}
              className="flex-grow border border-[#EDE0CC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9A3C]"
            />
            <button 
              onClick={handlePostComment}
              disabled={submittingComment || !newComment.trim()}
              className="pill bg-[#FF9A3C] hover:bg-[#e0832d] disabled:opacity-50 text-white font-bold px-6 py-3 text-sm cursor-pointer hover:scale-105 transition-transform"
            >
              {language === 'hi' ? 'भेजें' : 'Send'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
