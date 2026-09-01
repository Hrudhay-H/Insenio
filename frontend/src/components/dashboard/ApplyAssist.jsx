import React, { useState, useEffect } from 'react';
import { X, Send, Bot, CheckCircle } from 'lucide-react';
import { STUDENT_PERSONA } from '../../data/mockData';

export function ApplyAssist({ lab, onClose }) {
  const [draft, setDraft] = useState("");
  const [isDrafting, setIsDrafting] = useState(true);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    // Simulate Insenio drafting the email
    const timer = setTimeout(() => {
      const generatedDraft = `Dear ${lab.pi},

I am writing to express my interest in joining your lab. I am a ${STUDENT_PERSONA.year} ${STUDENT_PERSONA.major} student. 

I noticed your research focuses on ${lab.research_focus.toLowerCase()} I have intermediate proficiency in Python and Data Structures, which aligns with your required skills. While I am still exploring my exact niche within AI and Machine Learning, your recent work on "${lab.recent_publications}" is highly relevant to my interests.

I have ${STUDENT_PERSONA.availability} hours per week available to commit to this role. 

Thank you for your time and consideration.

Best regards,
${STUDENT_PERSONA.name}`;
      
      setDraft(generatedDraft);
      setIsDrafting(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [lab]);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-db-navy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-db-gray-100 p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-db-red" />
            <h2 className="font-bold text-db-navy">Apply Assist Draft</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 bg-white">
          {sent ? (
             <div className="flex flex-col items-center justify-center py-12 text-green-600">
               <CheckCircle className="w-16 h-16 mb-4" />
               <h3 className="text-xl font-bold">Application Sent!</h3>
               <p className="text-gray-500 mt-2">The lab PI has been notified.</p>
             </div>
          ) : isDrafting ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-db-red rounded-full animate-spin mb-4" />
              <p className="text-gray-500 text-sm animate-pulse">Insenio is drafting your personalized outreach...</p>
              <p className="text-xs text-gray-400 mt-2">Grounding constraints active (No hallucinated skills)</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                <input 
                  type="text" 
                  defaultValue={`Application for Undergraduate Research - ${STUDENT_PERSONA.name}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Message Draft</label>
                  <span className="text-[10px] text-db-red font-medium bg-red-50 px-2 py-0.5 rounded border border-red-100">Requires Student Review</span>
                </div>
                <textarea 
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full flex-1 min-h-[250px] px-3 py-2 border border-gray-300 rounded-md text-sm font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-db-red focus:border-db-red resize-none"
                />
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md flex gap-3 text-xs text-blue-800">
                <span className="text-lg">ℹ️</span>
                <p>This message was grounded entirely in your extracted profile and the lab's exact requirements. You must review and approve it before sending.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!sent && !isDrafting && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button 
              onClick={handleSend}
              className="px-6 py-2 bg-db-red text-white text-sm font-bold rounded-md hover:bg-[#D82D1B] transition-colors flex items-center gap-2"
            >
              Approve & Send <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
