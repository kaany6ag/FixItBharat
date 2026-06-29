/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { translations } from '../translations';

interface FixBotProps {
  currentCity: string;
  userWard: string;
  language: 'en' | 'hi';
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function FixBot({ currentCity, userWard, language }: FixBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: language === 'hi' 
        ? "नमस्ते! मैं फिक्सबॉट हूँ, आपका नागरिक एआई सहायक। मैं आपकी शिकायत का स्टेटस बताने, आरटीआई प्रारूप बनाने या मंच की विशेषताओं को समझाने में मदद कर सकता हूँ। आप मुझसे क्या पूछना चाहते हैं? 🤖" 
        : "Namaste! I am FixBot, your AI civic assistant. I can help check issue status, explain how to file complaints, auto-draft RTI drafts, or check your ward performance. What would you like to ask? 🤖" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  // Quick reply options based on language
  const quickReplies = language === 'hi' 
    ? [
        "शिकायत कैसे दर्ज करें? 📢",
        "गंभीर जलभराव की स्थिति क्या है? 🌧️",
        "सच्चा नागरिक पुरस्कार क्या है? 🏆",
        "आरटीआई (RTI) कैसे फाइल करें? 📄"
      ]
    : [
        "How to report an issue? 📢",
        "Check status of Gwalior issues 📍",
        "What is Sachcha Nagrik award? 🏆",
        "How to file an RTI? 📄"
      ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-6), // Send last 3 rounds of context
          currentCity,
          userWard,
          language
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: language === 'hi' 
          ? "माफ़ कीजिये, मुझसे जुड़ने में कोई तकनीकी बाधा आ रही है। कृपया थोड़ी देर बाद प्रयास करें। 😭" 
          : "Sorry, I am facing a technical glitch in connecting. Please try again in a bit! 😭" 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 font-hind">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-[#FF9A3C] rounded-full card-shadow flex items-center justify-center text-3xl cursor-pointer hover:scale-110 transition-transform ring-4 ring-white relative focus:outline-none"
        >
          {isOpen ? <X className="text-white w-8 h-8" /> : "🤖"}
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8472A] border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-bounce">
              1
            </div>
          )}
        </button>
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-20 left-0 right-0 w-full h-[65vh] min-h-[350px] max-h-[70vh] rounded-t-[24px] border-t border-x border-[#EDE0CC] md:bottom-24 md:right-6 md:left-auto md:w-[380px] md:h-[550px] md:min-h-[400px] md:max-h-[600px] md:rounded-[16px] md:border bg-white card-shadow flex flex-col overflow-hidden animate-fade-in z-45 font-hind">
          {/* Header */}
          <div className="bg-[#FF9A3C] p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <h4 className="font-baloo font-bold text-lg leading-tight">FixBot</h4>
                <p className="text-xs text-orange-100 font-medium">Active Civic Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white hover:text-orange-200 h-11 w-11 flex items-center justify-center rounded-full cursor-pointer focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow p-4 overflow-y-auto bg-[#FDF6EC]/40 space-y-3">
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-[16px] px-4 py-2.5 text-sm font-medium ${
                    m.role === 'user' 
                      ? 'bg-[#FF9A3C] text-white rounded-br-none' 
                      : 'bg-white text-[#1A1A1A] border border-[#EDE0CC] rounded-bl-none shadow-sm bot-message'
                  }`}
                >
                  {m.role === 'model' ? (
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-[#1A1A1A] border border-[#EDE0CC] rounded-[16px] rounded-bl-none px-4 py-2 shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-[#FF9A3C] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#FF9A3C] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#FF9A3C] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="p-2 border-t border-[#EDE0CC] bg-white overflow-x-auto flex gap-1 shrink-0 no-scrollbar">
            {quickReplies.map((reply, i) => (
              <button 
                key={i}
                onClick={() => handleSendMessage(reply)}
                className="whitespace-nowrap text-xs bg-[#FDF6EC] hover:bg-[#FF9A3C]/10 text-[#6B6B6B] border border-[#EDE0CC] px-3 py-1.5 rounded-full cursor-pointer transition-colors min-h-[36px]"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <div className="p-3 border-t border-[#EDE0CC] bg-white flex gap-2 shrink-0 items-center">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
              placeholder={language === 'hi' ? "फिक्सबॉट से पूछें..." : "Ask FixBot..."}
              className="flex-grow border border-[#EDE0CC] rounded-full px-4 h-11 text-sm focus:outline-none focus:border-[#FF9A3C]"
            />
            <button 
              onClick={() => handleSendMessage(input)}
              className="h-11 w-11 shrink-0 bg-[#FF9A3C] hover:bg-[#e0832d] text-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
