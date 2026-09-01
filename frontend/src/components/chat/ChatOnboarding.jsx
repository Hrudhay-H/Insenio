import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';

export function ChatOnboarding({ onProfileComplete }) {
  const [messages, setMessages] = useState([
    { role: "agent", text: "Hi! I'm Insenio. I can help you find undergraduate research labs that fit your skills and interests. To get started, what year are you in and what's your major?" }
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulate Insenio's conversational extraction
    setTimeout(() => {
      let agentMsg = "";
      if (step === 0) {
        agentMsg = "Great. What programming languages or technical skills do you have, and how comfortable are you with them?";
        setStep(1);
      } else if (step === 1) {
        agentMsg = "Got it. What kind of research topics interest you? For example, are you into AI model-building, data pipelines, or something else?";
        setStep(2);
      } else if (step === 2) {
        agentMsg = "Sounds interesting! Finally, roughly how many hours per week can you commit to a lab?";
        setStep(3);
      } else {
        agentMsg = "Perfect. I've extracted your profile: Ananya, 3rd-year CS, intermediate Python/DSA, interested in AI/ML, available 12 hrs/week. Let's look at some labs!";
        setTimeout(() => {
          onProfileComplete();
        }, 3000);
      }
      setMessages(prev => [...prev, { role: "agent", text: agentMsg }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-db-navy text-white p-4 flex items-center gap-3">
        <Bot className="w-6 h-6 text-db-red" />
        <div>
          <h2 className="font-bold">Insenio Intake</h2>
          <p className="text-xs text-white/70">Building your profile conversationally</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-db-gray-100">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-db-navy' : 'bg-white border border-gray-300'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-db-red" />}
            </div>
            <div className={`p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-db-navy text-white rounded-tr-none' : 'bg-white text-db-navy border border-gray-200 rounded-tl-none shadow-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 px-4 py-2 bg-db-gray-100 border border-gray-300 rounded-md focus:outline-none focus:border-db-red focus:ring-1 focus:ring-db-red transition-all"
            disabled={step > 3}
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-db-red text-white rounded-md hover:bg-[#D82D1B] transition-colors disabled:opacity-50 flex items-center justify-center"
            disabled={!input.trim() || step > 3}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
