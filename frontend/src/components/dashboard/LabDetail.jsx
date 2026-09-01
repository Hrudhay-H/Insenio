import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { ApplyAssist } from './ApplyAssist';

export function LabDetail({ lab, onBack }) {
  const [showApply, setShowApply] = useState(false);

  const renderIcon = (status) => {
    if (status.includes("Strong match") || status.includes("Exact match") || status.includes("Good match") || status.includes("Fits")) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status.includes("Gap") || status.includes("Low")) return <XCircle className="w-5 h-5 text-db-red" />;
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-db-navy w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back to matches
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-3 inline-block ${
              lab.match_status === 'Ready now' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {lab.match_status}
            </span>
            <h1 className="text-3xl font-bold text-db-navy">{lab.pi}</h1>
            <p className="text-gray-600 mt-2">{lab.research_focus}</p>
          </div>
          <button 
            onClick={() => setShowApply(true)}
            className="px-6 py-2.5 bg-db-red text-white font-semibold rounded-md shadow-sm hover:bg-[#D82D1B] transition-colors flex items-center gap-2"
          >
            Apply Assist <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-gray-100 mb-8">
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Required</div>
            <div className="font-medium mt-1">{lab.time_commitment} hrs/wk</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Capacity</div>
            <div className="font-medium mt-1">{lab.capacity} open slots</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Team Size</div>
            <div className="font-medium mt-1">{lab.current_team_size} members</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Last Updated</div>
            <div className="font-medium mt-1">{lab.last_updated}</div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-db-navy mb-4">Gap Reasoning</h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="mt-0.5">{renderIcon(lab.match_reasoning.skill_overlap)}</div>
            <div>
              <h4 className="font-bold text-sm text-db-navy">Skill Overlap</h4>
              <p className="text-sm text-gray-600 mt-1">{lab.match_reasoning.skill_overlap}</p>
              {lab.missing_skills && (
                <p className="text-xs text-db-red mt-2 font-medium">Missing: {lab.missing_skills.join(', ')}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="mt-0.5">{renderIcon(lab.match_reasoning.interest_alignment)}</div>
            <div>
              <h4 className="font-bold text-sm text-db-navy">Interest Alignment</h4>
              <p className="text-sm text-gray-600 mt-1">{lab.match_reasoning.interest_alignment}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="mt-0.5">{renderIcon(lab.match_reasoning.availability_overlap)}</div>
            <div>
              <h4 className="font-bold text-sm text-db-navy">Availability Overlap</h4>
              <p className="text-sm text-gray-600 mt-1">{lab.match_reasoning.availability_overlap}</p>
            </div>
          </div>
        </div>
      </div>

      {showApply && <ApplyAssist lab={lab} onClose={() => setShowApply(false)} />}
    </div>
  );
}
