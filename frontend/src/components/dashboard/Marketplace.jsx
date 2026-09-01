import React from 'react';
import { MOCK_LABS } from '../../data/mockData';
import { Clock, Users, ArrowRight } from 'lucide-react';

export function Marketplace({ onSelectLab }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-db-navy">Lab Matches</h2>
          <p className="text-sm text-gray-500 mt-1">Based on your extracted profile</p>
        </div>
        <div className="px-3 py-1.5 bg-db-gray-200 rounded-md text-xs font-semibold text-db-navy border border-gray-300">
          Ranked by Fit
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_LABS.map((lab) => (
          <div 
            key={lab.lab_id} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col group"
            onClick={() => onSelectLab(lab)}
          >
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                  lab.match_status === 'Ready now' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {lab.match_status}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">{lab.last_updated}</span>
              </div>
              
              <h3 className="font-bold text-lg text-db-navy leading-tight mb-1">{lab.pi}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{lab.research_focus}</p>
              
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" /> {lab.time_commitment}h/wk
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users className="w-3.5 h-3.5" /> {lab.capacity} open slots
                </div>
              </div>

              {lab.match_status === 'Stretch pick' && (
                <div className="mt-2 p-2 bg-red-50 rounded text-xs text-db-red font-medium border border-red-100">
                  Missing: {lab.missing_skills.join(', ')}
                </div>
              )}
            </div>
            
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between group-hover:bg-db-gray-200 transition-colors">
              <span className="text-xs font-semibold text-db-navy">View Gap Analysis</span>
              <ArrowRight className="w-4 h-4 text-db-navy group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
