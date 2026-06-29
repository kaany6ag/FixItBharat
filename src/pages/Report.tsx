/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, AlertCircle, AlertOctagon, RefreshCw, ThumbsUp, Send, Download, Share2, Volume2, Mic, CheckCircle } from 'lucide-react';
import { translations } from '../translations';
import LeafletMap from '../components/LeafletMap';
import Logo from '../components/Logo';
import { MASTER_CITIES } from '../cities';
import { useCity } from '../CityContext';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';

interface ReportProps {
  language: 'en' | 'hi';
  currentCity: string;
  userUid: string | null;
  onNavigate: (page: string) => void;
  onSubmitSuccess: (newIssue: any) => void;
  issues: any[];
}

export default function Report({ language, currentCity, userUid, onNavigate, onSubmitSuccess, issues }: ReportProps) {
  const t = translations[language];
  const { selectedCity, cityWardsList } = useCity();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Confetti effect when success page loads
  useEffect(() => {
    if (step === 6) {
      confetti({
        particleCount: 150,
        spread: 80,
        colors: ['#FF9A3C', '#2D9B5A', '#FFD700'],
        origin: { y: 0.6 }
      });
    }
  }, [step]);

  const generateLetter = async (promptText: string) => {
    const res = await fetch('/api/gemini/complaint-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText })
    });
    if (!res.ok) {
      throw new Error('Server error');
    }
    const letterData = await res.json();
    if (!letterData.letter || letterData.letter.trim().includes("Failed to draft letter")) {
      throw new Error('Failed to draft letter');
    }
    return letterData.letter;
  };

  const handleDownloadPDF = () => {
    if (!complaintLetter) return;
    const doc = new jsPDF();
    const margin = 20;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const maxLineWidth = pageWidth - margin * 2;
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    
    const lines = doc.splitTextToSize(complaintLetter, maxLineWidth);
    
    let y = margin;
    lines.forEach((line: string) => {
      if (y + 10 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 7;
    });
    
    doc.save(`FixItBharat_Complaint_${submittedIssueId}.pdf`);
  };

  // Form State
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  // AI analysis results
  const [aiData, setAiData] = useState<any>(null);
  const [isInvalidIssue, setIsInvalidIssue] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Location State
  const [coordinates, setCoordinates] = useState({ lat: selectedCity.lat, lng: selectedCity.lng });
  const [ward, setWard] = useState(cityWardsList[0] || 'Lashkar (Ward 7)');
  const [address, setAddress] = useState('');

  useEffect(() => {
    setCoordinates({ lat: selectedCity.lat, lng: selectedCity.lng });
    if (cityWardsList && cityWardsList.length > 0) {
      setWard(cityWardsList[0]);
    }
  }, [selectedCity, cityWardsList]);

  // Repair History & Recurrence Risk
  const [recurrenceRisk, setRecurrenceRisk] = useState<any>(null);
  const [nearbyCount, setNearbyCount] = useState(0);

  // Duplicate Check
  const [duplicateFound, setDuplicateFound] = useState<any>(null);

  // Final Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  // Submission Results
  const [submittedIssueId, setSubmittedIssueId] = useState<string | null>(null);
  const [complaintLetter, setComplaintLetter] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  // Initialize Speech Recognition if supported
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'hi-IN';
      rec.interimResults = false;

      rec.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        await handleVoiceTranscript(transcript);
      };

      rec.onerror = (e: any) => {
        console.error('Speech error', e);
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Update map center based on city coordinate
  useEffect(() => {
    const matchedCity = MASTER_CITIES.find(c => c.id === currentCity);
    if (matchedCity) {
      setCoordinates({ lat: matchedCity.lat, lng: matchedCity.lng });
    } else {
      setCoordinates({ lat: 26.2183, lng: 78.1828 });
    }
  }, [currentCity]);

  // Handle Photo File Select or Drag & Drop
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhoto(base64String);
      analyzePhotoWithGemini(base64String);
    };
    reader.readAsDataURL(file);
  };

  // call Gemini Vision API
  const analyzePhotoWithGemini = async (base64: string) => {
    setIsAnalyzing(true);
    setIsInvalidIssue(false);
    setAnalysisError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 second timeout

    try {
      // First check for fake report
      const antiFakeRes = await fetch('/api/gemini/anti-fake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
        signal: controller.signal
      });
      const antiFakeData = await antiFakeRes.json();
      
      if (antiFakeData && antiFakeData.is_genuine === false) {
        setIsInvalidIssue(true);
        setRejectionReason(antiFakeData.reason || 'This photo does not look like a genuine municipal civic issue.');
        setIsAnalyzing(false);
        clearTimeout(timeoutId);
        return;
      }

      // Proceed to analyze civic issue details
      const response = await fetch('/api/gemini/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, language }),
        signal: controller.signal
      });
      const data = await response.json();

      clearTimeout(timeoutId);

      if (data.is_valid_civic_issue === false) {
        setIsInvalidIssue(true);
        setRejectionReason(data.rejection_reason || 'Image analyzed is not a municipal problem.');
      } else {
        setAiData(data);
        setTitle(data.issue_type.replace('_', ' ').toUpperCase());
        setDescription(data.description);
        
        // Severity 9 or 10 triggers SOS Emergency Mode
        if (data.severity_score >= 9) {
          setIsEmergency(true);
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error(err);
      if (err.name === 'AbortError') {
        setAnalysisError(language === 'hi'
          ? '⚠️ विश्लेषण में सामान्य से अधिक समय लग रहा है। कृपया पुनः प्रयास करें।'
          : '⚠️ Analysis taking longer than usual.\n Please try again.'
        );
      } else {
        setAnalysisError(language === 'hi'
          ? '⚠️ एआई विश्लेषण विफल रहा। कृपया पुनः प्रयास करें।'
          : '⚠️ AI analysis failed. Please try again.'
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Web Speech API Hindi Recorder
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  const handleVoiceTranscript = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/voice-transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription: text })
      });
      const data = await res.json();
      setTitle(data.issue_type.replace('_', ' ').toUpperCase());
      setDescription(language === 'hi' ? data.description_hindi : data.description_english);
      
      if (data.severity_estimate >= 9) {
        setIsEmergency(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 2: Location Ward update
  const triggerUseLocation = () => {
    // Geolocation API simulation or call
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setCoordinates({ lat, lng });
      setAddress(`Ward Block Main Lane, near coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }, (err) => {
      console.warn("Location permission denied. Mock coordinates updated.");
      setAddress("Morar VIP Road, near Government Hospital, Gwalior");
    });
  };

  // Step 3: Recurrence Risk Score
  const calculateRecurrenceRisk = async () => {
    setIsAnalyzing(true);
    try {
      // Find history within 100m (simulated)
      const nearby = issues.filter(i => i.cityId === currentCity);
      setNearbyCount(nearby.length);

      const historyData = nearby.map(n => ({ date: n.createdAt, status: n.status }));
      const response = await fetch('/api/gemini/recurrence-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyData })
      });
      const data = await response.json();
      setRecurrenceRisk(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 4: Duplicate Check
  const checkDuplicates = () => {
    const similar = issues.find(i => 
      i.cityId === currentCity && 
      i.type === aiData?.issue_type && 
      i.status !== 'Resolved'
    );
    setDuplicateFound(similar || null);
  };

  useEffect(() => {
    if (step === 3 && !recurrenceRisk) {
      calculateRecurrenceRisk();
    }
    if (step === 4) {
      checkDuplicates();
    }
  }, [step]);

  // Final Form Submit Action
  const handleSubmitReport = async () => {
    if (!title || !description) return;

    setIsAnalyzing(true);
    const newIssuePayload = {
      title,
      description,
      type: aiData?.issue_type || 'other',
      severity: aiData?.severity_score || 5,
      cityId: currentCity,
      location: {
        lat: coordinates.lat,
        lng: coordinates.lng,
        address: address || 'Main Road Sector, Gwalior',
        ward: ward
      },
      photos: photo ? [photo] : [],
      status: 'Reported',
      department: aiData?.department || 'Municipal Corporation',
      reportedBy: anonymous ? 'Anonymous Citizen' : 'Priya Sharma',
      reportedByUid: userUid || 'u1',
      anonymous: anonymous,
      isEmergency: isEmergency
    };

    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIssuePayload)
      });
      const data = await response.json();

      setSubmittedIssueId(data.id);

      // Generate Complaint Letter with Gemini with exact user-defined prompt and try-catch
      const letterPrompt = `Write a formal complaint 
letter to ${data.department} department from a citizen 
of ${currentCity}. 
Issue: ${data.title}. 
Location: ${data.location.address}. 
Severity: ${data.severity}/10. 
Complaint ID: ${data.id}. 
Date: ${new Date().toLocaleDateString('en-IN')}.
Request resolution within 7 working days.
Keep it professional and firm.
Maximum 200 words.`;

      try {
        const letter = await generateLetter(letterPrompt);
        setComplaintLetter(letter);
      } catch(error) {
        setComplaintLetter(`Dear Sir/Madam,

I wish to bring to your attention a civic issue 
at ${data.location.address}, ${currentCity}.

Issue Type: ${data.title}
Severity: ${data.severity}/10
Complaint ID: ${data.id}
Date: ${new Date().toLocaleDateString('en-IN')}

I request immediate action and resolution 
within 7 working days.

Yours sincerely,
Concerned Citizen`);
      }

      onSubmitSuccess(data);
      setStep(6); // Success screen
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Download letter utilities
  const handleDownloadLetter = () => {
    const element = document.createElement("a");
    const file = new Blob([complaintLetter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `FixItBharat_Complaint_${submittedIssueId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // WhatsApp share
  const handleWhatsAppShare = () => {
    const link = `https://fixitbharat.gov/issue/${submittedIssueId}`;
    const text = t.whatsappShareMsg
      .replace('{type}', aiData?.issue_type || 'Civic Issue')
      .replace('{location}', ward)
      .replace('{link}', link);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
  };

  return (
    <div className="bg-rangoli min-h-screen py-16">
      <div className="max-w-[1100px] mx-auto px-6">
        
        {/* Animated Stepper Progress Bar */}
        {step <= 5 && (
          <div className="bg-white rounded-[16px] p-6 border border-[#EDE0CC] card-shadow mb-8">
            <div className="flex justify-between text-xs sm:text-sm font-bold text-[#6B6B6B] mb-4">
              <span className={step >= 1 ? 'text-[#FF9A3C]' : ''}>1. {t.stepLabelPhoto}</span>
              <span className={step >= 2 ? 'text-[#FF9A3C]' : ''}>2. {t.stepLabelLocation}</span>
              <span className={step >= 3 ? 'text-[#FF9A3C]' : ''}>3. {t.stepLabelHistory}</span>
              <span className={step >= 4 ? 'text-[#FF9A3C]' : ''}>4. {t.stepLabelDuplicate}</span>
              <span className={step >= 5 ? 'text-[#FF9A3C]' : ''}>5. {t.stepLabelSubmit}</span>
            </div>
            <div className="w-full bg-[#FDF6EC] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#FF9A3C] h-full transition-all duration-500" 
                style={{ width: `${(step - 1) * 25}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* SOS Emergency Banner */}
        {isEmergency && step <= 5 && (
          <div className="bg-red-600 text-white p-4 rounded-[16px] flex items-center justify-between font-bold mb-8 animate-pulse shadow-lg">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-6 h-6 shrink-0" />
              <div>
                <p className="text-sm tracking-wider uppercase">{t.sosEmergencyBanner}</p>
                <p className="text-xs font-normal">This issue was classified as critical severity (9/10). SOS routing active.</p>
              </div>
            </div>
            <button className="pill bg-white text-red-600 px-4 py-1.5 text-xs font-bold hover:scale-102 transition-transform">
              {t.sosEmergencyBtn}
            </button>
          </div>
        )}

        {/* STEP 1: Photo Upload */}
        {step === 1 && (
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-8 flex flex-col items-center">
            <h2 className="font-baloo text-3xl font-extrabold text-center mb-6 text-[#1A1A1A]">
              {language === 'hi' ? 'नागरिक समस्या की फोटो अपलोड करें 📸' : 'Upload Civic Issue Photo 📸'}
            </h2>

            {/* Drag & Drop Zone */}
            <div 
              className="w-full max-w-lg h-64 border-4 border-dashed border-[#EDE0CC] hover:border-[#FF9A3C] rounded-[16px] flex flex-col items-center justify-center cursor-pointer bg-[#FDF6EC]/10 p-6 relative group transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  processFile(e.dataTransfer.files[0]);
                }
              }}
            >
              <input 
                type="file" 
                accept="image/*,video/*"
                onChange={handlePhotoSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {photo ? (
                <img src={photo} alt="Report preview" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#FF9A3C]/10 flex items-center justify-center text-[#FF9A3C] text-3xl mb-4 group-hover:scale-110 transition-transform">📸</div>
                  <h4 className="font-bold text-lg text-[#1A1A1A] mb-1">{t.uploadZonePrompt}</h4>
                  <p className="text-xs text-[#6B6B6B] font-semibold uppercase tracking-wider">{t.uploadZoneFormats}</p>
                </div>
              )}
            </div>

            {/* AI analyzing status */}
            {isAnalyzing && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-[#FF9A3C] animate-spin" />
                <span className="text-sm font-bold text-[#FF9A3C]">{t.aiAnalyzing}</span>
              </div>
            )}

            {/* Timeout / AI analysis error */}
            {analysisError && !isAnalyzing && (
              <div id="ai-analysis-error-card" className="w-full max-w-lg mt-8 bg-amber-50 border border-amber-200 rounded-[16px] p-5 flex flex-col items-center gap-4 text-amber-800 text-center shadow-sm">
                <div className="flex gap-3 items-center text-left">
                  <AlertCircle className="w-6 h-6 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-bold whitespace-pre-line">{analysisError}</p>
                  </div>
                </div>
                <button 
                  id="retry-analysis-btn"
                  onClick={() => photo && analyzePhotoWithGemini(photo)}
                  className="pill bg-[#FF9A3C] hover:bg-[#e0832d] text-white font-bold px-6 py-2 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-transform hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4" /> {language === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
                </button>
              </div>
            )}

            {/* Invalid Feedback */}
            {isInvalidIssue && (
              <div className="w-full max-w-lg mt-8 bg-red-50 border border-red-200 rounded-[16px] p-5 flex gap-3 text-red-700">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm mb-1">{t.invalidIssueError}</h4>
                  <p className="text-xs">{rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Analysis Success details */}
            {aiData && !isAnalyzing && !isInvalidIssue && (
              <div className="w-full max-w-lg mt-8 bg-[#2D9B5A]/5 border border-[#2D9B5A]/20 rounded-[16px] p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-baloo text-lg font-bold text-[#2D9B5A]">{t.aiAnalysisSuccess}</h4>
                  <span className="px-3 py-1 bg-[#2D9B5A]/10 text-[#2D9B5A] text-xs font-bold rounded-full">
                    Confidence: {(aiData.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="space-y-3 font-medium text-sm text-[#1A1A1A]">
                  <p><strong className="text-[#6B6B6B]">Category:</strong> {aiData.issue_type.replace('_', ' ').toUpperCase()}</p>
                  <p><strong className="text-[#6B6B6B]">Severity Score:</strong> {aiData.severity_score}/10</p>
                  <p><strong className="text-[#6B6B6B]">Auto-routed to:</strong> {aiData.department}</p>
                  <p className="bg-white p-3 rounded-lg border border-[#EDE0CC] text-[#6B6B6B] italic">"{aiData.description}"</p>
                </div>
              </div>
            )}

            {/* Action control */}
            <div className="w-full max-w-lg mt-8 flex justify-end">
              <button 
                onClick={() => setStep(2)}
                disabled={!photo || isInvalidIssue || isAnalyzing || !aiData || !!analysisError}
                className="pill bg-[#FF9A3C] hover:bg-[#e0832d] disabled:opacity-50 text-white font-bold px-8 py-3 cursor-pointer hover:scale-105 transition-transform"
              >
                {t.next}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Location Selector */}
        {step === 2 && (
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-8">
            <h2 className="font-baloo text-3xl font-extrabold text-center mb-6 text-[#1A1A1A]">
              {language === 'hi' ? 'समस्या का स्थान अंकित करें 📍' : 'Tag the Location 📍'}
            </h2>

            {/* Location buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button 
                onClick={triggerUseLocation}
                className="pill bg-[#FF9A3C] text-white font-bold px-6 py-2.5 flex items-center justify-center gap-2 hover:scale-102 transition-transform cursor-pointer"
              >
                <MapPin className="w-5 h-5" /> {t.useMyLocation}
              </button>
              
              {/* Hindi Voice complaint inside location selection */}
              <button 
                onClick={toggleRecording}
                className={`pill border-2 px-6 py-2.5 flex items-center justify-center gap-2 font-bold hover:scale-102 transition-transform cursor-pointer ${
                  isRecording 
                    ? 'bg-red-100 text-red-600 border-red-500 animate-pulse' 
                    : 'bg-white text-[#FF9A3C] border-[#FF9A3C]'
                }`}
              >
                <Mic className="w-5 h-5" /> {isRecording ? t.voiceListening : t.voiceComplaintBtn}
              </button>
            </div>

            {/* Draggable pin Leaflet map placeholder */}
            <div className="h-[350px] min-h-[350px] w-full rounded-xl mb-6 border border-[#EDE0CC] overflow-hidden">
              <LeafletMap 
                city={selectedCity}
                center={coordinates}
                pins={[]}
                issues={issues}
                heatmapMode={false}
              />
            </div>

            {/* Fields */}
            <div className="space-y-4 max-w-lg mx-auto">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#6B6B6B] uppercase mb-1">{t.ward}</label>
                <select 
                  value={ward} 
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full border border-[#EDE0CC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9A3C] font-semibold"
                >
                  {cityWardsList.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#6B6B6B] uppercase mb-1">{t.address}</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={language === 'hi' ? "गली का नाम, स्थल का पता..." : "Street name, landmark address..."}
                  className="w-full border border-[#EDE0CC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9A3C] font-medium"
                />
              </div>
            </div>

            {/* Stepper Controls */}
            <div className="flex justify-between mt-10">
              <button 
                onClick={() => setStep(1)}
                className="pill border-2 border-[#FF9A3C] text-[#FF9A3C] hover:bg-[#FF9A3C]/5 font-bold px-8 py-3 cursor-pointer"
              >
                {t.back}
              </button>
              <button 
                onClick={() => setStep(3)}
                disabled={!address}
                className="pill bg-[#FF9A3C] hover:bg-[#e0832d] disabled:opacity-50 text-white font-bold px-8 py-3 cursor-pointer hover:scale-105 transition-transform"
              >
                {t.next}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Repair History */}
        {step === 3 && (
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-8">
            <h2 className="font-baloo text-3xl font-extrabold text-center mb-6 text-[#1A1A1A]">
              {language === 'hi' ? 'मरम्मत का पुराना इतिहास विश्लेषण 📋' : 'Repair History Analysis 📋'}
            </h2>

            {isAnalyzing && (
              <div className="flex flex-col items-center gap-3 py-10">
                <RefreshCw className="w-8 h-8 text-[#FF9A3C] animate-spin" />
                <span className="text-sm font-bold text-[#FF9A3C]">{t.loading}</span>
              </div>
            )}

            {recurrenceRisk && !isAnalyzing && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="bg-[#FDF6EC] p-5 rounded-[16px] border border-[#EDE0CC]">
                  <h4 className="font-baloo text-lg font-bold text-[#1A1A1A] mb-2">{t.historyHeading}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                    <p><span className="text-[#6B6B6B]">{t.lastReported}:</span> June 2025</p>
                    <p><span className="text-[#6B6B6B]">{t.timesIn12Months}:</span> 3 reports</p>
                    <p><span className="text-[#6B6B6B]">{t.lastResolved}:</span> Sept 2025</p>
                    <p><span className="text-[#6B6B6B]">{t.avgDaysBreakdown}:</span> 45 days</p>
                  </div>
                </div>

                {/* Risk scoring card */}
                <div className={`p-6 rounded-[16px] border text-white shadow-sm ${
                  recurrenceRisk.risk_level === 'Critical' || recurrenceRisk.risk_level === 'High'
                    ? 'bg-gradient-to-r from-[#E8472A] to-orange-600 border-red-500'
                    : 'bg-gradient-to-r from-[#2D9B5A] to-[#2D9B5A]/80 border-green-500'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-baloo text-xl font-bold uppercase tracking-wider">{t.recurrenceRiskTitle}</h3>
                    <span className="px-3 py-1 bg-white/20 rounded-full font-bold text-xs">
                      {recurrenceRisk.risk_level} Risk Level
                    </span>
                  </div>
                  <div className="text-4xl font-space font-extrabold mb-4">{recurrenceRisk.risk_score}%</div>
                  <p className="text-sm font-semibold mb-2 italic">"{recurrenceRisk.prediction}"</p>
                  <p className="text-xs text-orange-100">{recurrenceRisk.recommendation}</p>
                </div>
              </div>
            )}

            {/* Stepper Controls */}
            <div className="flex justify-between mt-10">
              <button 
                onClick={() => setStep(2)}
                className="pill border-2 border-[#FF9A3C] text-[#FF9A3C] hover:bg-[#FF9A3C]/5 font-bold px-8 py-3 cursor-pointer"
              >
                {t.back}
              </button>
              <button 
                onClick={() => setStep(4)}
                className="pill bg-[#FF9A3C] hover:bg-[#e0832d] text-white font-bold px-8 py-3 cursor-pointer hover:scale-105 transition-transform"
              >
                {t.next}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Duplicate Check */}
        {step === 4 && (
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-8 text-center">
            <h2 className="font-baloo text-3xl font-extrabold mb-6 text-[#1A1A1A]">
              {language === 'hi' ? 'समानता की जाँच करें 🔍' : 'Check for Duplicates 🔍'}
            </h2>

            {duplicateFound ? (
              <div className="max-w-lg mx-auto bg-amber-50 border border-amber-200 rounded-[16px] p-6 text-left shadow-sm">
                <div className="flex gap-3 text-amber-800 mb-4">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <div>
                    <h4 className="font-bold text-base mb-1">{t.duplicateWarning}</h4>
                    <p className="text-xs">Another similar issue has already been reported nearby recently. To help resolve it faster, upvote that complaint instead of creating a duplicate.</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#EDE0CC] mb-6">
                  <h5 className="font-bold text-[#1A1A1A] mb-1">{duplicateFound.title}</h5>
                  <p className="text-xs text-[#6B6B6B] mb-2">📍 {duplicateFound.location.ward}</p>
                  <p className="text-xs font-semibold text-amber-600">Status: {duplicateFound.status} | Upvotes: {duplicateFound.upvotes}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => onNavigate(`#issue/${duplicateFound.id}`)}
                    className="pill bg-[#FF9A3C] text-white font-bold px-6 py-2.5 flex items-center justify-center gap-2 hover:scale-102 transition-transform cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4" /> {t.upvoteInstead}
                  </button>
                  <button 
                    onClick={() => setStep(5)}
                    className="pill bg-white border-2 border-[#6B6B6B]/20 text-[#6B6B6B] font-bold px-6 py-2.5 hover:bg-gray-50 cursor-pointer"
                  >
                    {t.submitNewReport}
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-lg mx-auto py-8">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">✓</div>
                <h4 className="font-baloo text-xl font-bold text-[#1A1A1A] mb-2">
                  {language === 'hi' ? 'कोई समान शिकायत नहीं मिली!' : 'No duplicates found!'}
                </h4>
                <p className="text-sm text-[#6B6B6B]">You are good to go! No duplicate issues detected within 200 meters of your tagged site.</p>
              </div>
            )}

            {/* Stepper Controls */}
            <div className="flex justify-between mt-10">
              <button 
                onClick={() => setStep(3)}
                className="pill border-2 border-[#FF9A3C] text-[#FF9A3C] hover:bg-[#FF9A3C]/5 font-bold px-8 py-3 cursor-pointer"
              >
                {t.back}
              </button>
              {!duplicateFound && (
                <button 
                  onClick={() => setStep(5)}
                  className="pill bg-[#FF9A3C] hover:bg-[#e0832d] text-white font-bold px-8 py-3 cursor-pointer hover:scale-105 transition-transform"
                >
                  {t.next}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Submit Form */}
        {step === 5 && (
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-8">
            <h2 className="font-baloo text-3xl font-extrabold text-center mb-6 text-[#1A1A1A]">
              {language === 'hi' ? 'शिकायत का अंतिम सत्यापन 📢' : 'Final Complaint Verification 📢'}
            </h2>

            <div className="space-y-6 max-w-lg mx-auto">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#6B6B6B] uppercase mb-1">{t.issueTitleLabel}</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-[#EDE0CC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9A3C] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#6B6B6B] uppercase mb-1">{t.issueDescLabel}</label>
                <textarea 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-[#EDE0CC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9A3C] font-medium"
                ></textarea>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="anon"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="w-5 h-5 rounded border-[#EDE0CC] accent-[#FF9A3C]"
                />
                <label htmlFor="anon" className="text-sm font-bold text-[#6B6B6B] select-none cursor-pointer">
                  {t.anonymous}
                </label>
              </div>

              {isAnalyzing && (
                <div className="flex justify-center py-4">
                  <RefreshCw className="w-8 h-8 text-[#FF9A3C] animate-spin" />
                </div>
              )}

              {/* Stepper Controls */}
              <div className="flex justify-between pt-6">
                <button 
                  onClick={() => setStep(4)}
                  className="pill border-2 border-[#FF9A3C] text-[#FF9A3C] hover:bg-[#FF9A3C]/5 font-bold px-8 py-3 cursor-pointer"
                >
                  {t.back}
                </button>
                <button 
                  onClick={handleSubmitReport}
                  disabled={isAnalyzing || !title || !description}
                  className="pill bg-[#FF9A3C] hover:bg-[#e0832d] disabled:opacity-50 text-white font-bold px-10 py-3.5 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center gap-2 card-shadow"
                >
                  <Send className="w-5 h-5" /> {t.submit}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Success screen */}
        {step === 6 && (
          <div className="bg-white rounded-[16px] border border-[#EDE0CC] card-shadow p-10 text-center max-w-2xl mx-auto">
            <div className="mb-4">
              <Logo />
            </div>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              <CheckCircle className="w-12 h-12" />
            </div>
            
            <h2 className="font-baloo text-4xl font-extrabold text-[#1A1A1A] mb-2">
              {language === 'hi' ? 'शिकायत सफलतापूर्वक दर्ज! 🎉' : 'Report Filed Successfully! 🎉'}
            </h2>
            <p className="text-sm text-[#6B6B6B] font-medium mb-6">
              Complaint ID: <strong className="text-[#FF9A3C] font-space">{submittedIssueId}</strong> is officially submitted and routed to municipal desks.
            </p>

            {/* complaint letter draft download inside a styled card with Download PDF button */}
            {complaintLetter && (
              <div className="mb-8 text-left">
                <div className="bg-white border-2 border-[#EDE0CC] rounded-[20px] p-6 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#EDE0CC] pb-3 mb-4">
                    <span className="font-baloo font-bold text-sm text-[#1A1A1A] uppercase tracking-wider">📄 Official Complaint Draft</span>
                    <button
                      onClick={handleDownloadPDF}
                      className="pill bg-white border border-[#FF9A3C] text-[#FF9A3C] hover:bg-[#FF9A3C]/5 px-3.5 py-1.5 font-bold text-xs flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto font-mono text-xs text-[#6B6B6B] whitespace-pre-wrap leading-relaxed">
                    {complaintLetter}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handleDownloadPDF}
                className="pill bg-white border-2 border-[#FF9A3C] text-[#FF9A3C] hover:bg-[#FF9A3C]/5 px-6 py-3 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:scale-102 transition-transform"
              >
                <Download className="w-4 h-4" /> Download Complaint Letter
              </button>
              <button 
                onClick={handleWhatsAppShare}
                className="pill bg-[#25D366] hover:bg-green-600 text-white px-6 py-3 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:scale-102 transition-transform shadow-md"
              >
                <Share2 className="w-4 h-4" /> Share on WhatsApp
              </button>
              <button 
                onClick={() => onNavigate('#dashboard')}
                className="pill bg-[#FF9A3C] hover:bg-[#e0832d] text-white px-8 py-3 font-bold text-sm cursor-pointer hover:scale-102 transition-transform shadow-md"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
