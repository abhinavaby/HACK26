import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, X, User, Loader2 } from 'lucide-react';

// Helper component to render bold text **text** cleanly
function renderFormattedText(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={i} className="font-extrabold text-white">
          {inner}
        </strong>
      );
    }
    return part;
  });
}

// Cleanly format Markdown, Headers, Lists & LaTeX equations inside chat bubbles
function FormattedMessage({ content, isUser }) {
  if (!content) return null;

  if (isUser) {
    return <div className="text-xs font-bold text-[#07080b] leading-relaxed">{content}</div>;
  }

  // Strip or clean LaTeX tags if present in response string
  let cleaned = content
    .replace(/\\\[\s*/g, '')
    .replace(/\s*\\\]/g, '')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\times/g, '×')
    .replace(/\\approx/g, '≈')
    .replace(/\\div/g, '÷')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥');

  const lines = cleaned.split('\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return null;
        }

        // Section Headers (### or ## or #)
        if (trimmed.startsWith('#')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <div key={idx} className="pt-2 pb-1 border-b border-white/10">
              <h4 className="text-[#b5f639] font-extrabold text-xs tracking-wide uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b5f639]" />
                {renderFormattedText(headerText)}
              </h4>
            </div>
          );
        }

        // Bullet points (- or * or •)
        if (/^[-*•]\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^[-*•]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b5f639] mt-1.5 shrink-0" />
              <div className="flex-1 text-slate-200">{renderFormattedText(bulletText)}</div>
            </div>
          );
        }

        // Numbered lists (1. 2. etc.)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          const [, num, itemText] = numMatch;
          return (
            <div key={idx} className="flex items-start gap-2 bg-[#07080b]/50 p-2.5 rounded-xl border border-white/5 my-1">
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#b5f639]/10 text-[#b5f639] border border-[#b5f639]/20 shrink-0">
                {num}
              </span>
              <div className="flex-1 text-slate-200">{renderFormattedText(itemText)}</div>
            </div>
          );
        }

        // Math / Formula Block (e.g. contains = or × or + or ₹)
        if (trimmed.includes('=') && (trimmed.includes('₹') || trimmed.includes('×') || trimmed.includes('+') || trimmed.includes('-'))) {
          return (
            <div key={idx} className="my-1.5 p-2.5 rounded-xl bg-[#131c10] border border-[#b5f639]/30 text-[#b5f639] font-mono text-[11px] overflow-x-auto shadow-sm">
              {renderFormattedText(trimmed)}
            </div>
          );
        }

        // Standard paragraph line
        return (
          <p key={idx} className="text-slate-200">
            {renderFormattedText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function AiCopilotDrawer({ city, selectedZoneId, simulationData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am your ThermaGrid AI Copilot powered by OpenAI. Ask me anything about mitigating urban heat in ${city} or targeting zone ${selectedZoneId || 'hotspots'}!`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Listen for Copy Section Code & Ask AI event from map popups & tooltips
  useEffect(() => {
    const handleAskAiContext = (e) => {
      const contextCode = e.detail;
      setIsOpen(true);
      setInputQuery(`Analyze this urban cooling intervention section code:\n\n${contextCode}\n\nWhat are the primary implementation risks, thermal benefits, and municipal ROI?`);
    };

    window.addEventListener('ask-ai-context', handleAskAiContext);
    return () => {
      window.removeEventListener('ask-ai-context', handleAskAiContext);
    };
  }, []);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  const quickPrompts = [
    `How to lower heat in ${selectedZoneId || 'Zone 313'}?`,
    `What is the ROI in Rupees (₹) for greening?`,
    `Which intervention gives highest °C drop?`
  ];

  const handleSend = async (textToSend) => {
    const userText = textToSend || inputQuery.trim();
    if (!userText || loading) return;

    setInputQuery('');

    // Append user message
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_query: userText,
          city: city,
          selected_zone_id: selectedZoneId,
          simulation_context: simulationData
        })
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response || 'Sorry, I could not process that request.' }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Error connecting to AI backend. Please check server status.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button aligned with ThermaGrid Theme */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-[#b5f639] hover:bg-[#c6ff4d] text-[#07080b] font-extrabold text-xs rounded-full shadow-[0_10px_30px_rgba(181,246,57,0.35)] border border-[#b5f639] transition-all transform hover:scale-105 cursor-pointer"
      >
        <div className="w-2 h-2 rounded-full bg-[#07080b] animate-ping" />
        <Bot className="w-4 h-4 text-[#07080b]" />
        <span>Ask AI Copilot</span>
      </button>

      {/* Backdrop & Slide-in Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full sm:w-[480px] h-full bg-[#07080b] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col justify-between animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-4 bg-[#0e1117] border-b border-white/10 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#b5f639]/10 border border-[#b5f639]/20 text-[#b5f639]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white tracking-tight">ThermaGrid Copilot</h3>
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-[#b5f639] text-[#07080b]">
                      GPT-4o
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">Climate Decision Support Engine</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-[#141822] text-slate-400 hover:text-white border border-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Container */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-[#131c10] border border-[#b5f639]/30 text-[#b5f639] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#b5f639] text-[#07080b] font-bold rounded-tr-xs shadow-md'
                        : 'bg-[#0e1117] border border-white/10 text-slate-200 rounded-tl-xs shadow-sm'
                    }`}
                  >
                    <FormattedMessage content={msg.content} isUser={msg.role === 'user'} />
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-[#1e2430] border border-white/10 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic bg-[#0e1117] p-3 rounded-2xl border border-white/10 w-max">
                  <Loader2 className="w-4 h-4 animate-spin text-[#b5f639]" />
                  <span>ThermaGrid AI is analyzing microclimate vector...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Prompts */}
            <div className="px-4 py-2 bg-[#07080b] border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap text-[10px] font-semibold text-slate-300 bg-[#0e1117] hover:bg-[#131c10] hover:text-[#b5f639] px-2.5 py-1.5 rounded-full border border-white/10 hover:border-[#b5f639]/40 transition shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5 text-[#b5f639]" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>

            {/* Chat Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-[#0e1117] border-t border-white/10 flex gap-2 shrink-0 items-center"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={`Ask Copilot about ${selectedZoneId || 'cooling strategies'}...`}
                className="flex-1 bg-[#07080b] border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 focus:border-[#b5f639] focus:ring-1 focus:ring-[#b5f639] focus:outline-none transition placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={loading || !inputQuery.trim()}
                className="px-3.5 py-2.5 bg-[#b5f639] hover:bg-[#c6ff4d] disabled:opacity-40 disabled:cursor-not-allowed text-[#07080b] rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(181,246,57,0.2)]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


