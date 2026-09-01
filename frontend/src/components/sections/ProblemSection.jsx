import React from 'react';
import { Reveal } from '../ui/Reveal';
import { Users, FileSearch, ArrowRight } from 'lucide-react';

export function ProblemSection() {
  return (
    <section className="py-24 px-5 sm:px-8 bg-white border-t border-black/5">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        <Reveal className="mb-20 text-center max-w-4xl">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-black leading-[1.1]">
            Stop relying on <span className="text-blue">broken</span> discovery channels.
          </h2>
          <p className="text-lg text-black/50 mt-6 font-medium">
            Good student-lab matches go unmade simply because the mechanism is broken, not because the skill gap is real.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 w-full border border-black/10 rounded-2xl overflow-hidden shadow-sm">
          
          {/* Left Panel - Blue */}
          <div className="bg-blue p-12 flex flex-col text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:16px_16px]" />
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="inline-flex items-center gap-2 mb-8">
                <span className="p-1 rounded bg-white/20"><Users className="w-4 h-4" /></span>
                <span className="text-xs font-bold tracking-widest uppercase text-white/80">The Old Way</span>
              </div>
              
              <h3 className="text-4xl font-bold tracking-tight mb-6">Advisor Referrals & Cold Emails</h3>
              <p className="text-white/80 font-medium leading-relaxed max-w-md mb-12">
                Referrals are slow and biased toward whoever the advisor knows. Cold emails have a massive rejection rate.
              </p>
              
              <div className="flex flex-col gap-6 mb-16 pb-8 border-b border-white/20">
                <div className="flex flex-col gap-1">
                  <div className="text-xl font-bold">Biased Fit</div>
                  <div className="text-sm text-white/70">Connections dictate opportunities, not actual skill overlap.</div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-xl font-bold">Generic Outreach</div>
                  <div className="text-sm text-white/70">Professors can't assess fit from boilerplate emails.</div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Right Panel - White */}
          <div className="bg-white p-12 flex flex-col text-black">
            <div className="flex-1 flex flex-col">
              <div className="inline-flex items-center gap-2 mb-8">
                <span className="p-1 rounded bg-blue text-white"><FileSearch className="w-4 h-4" /></span>
                <span className="text-xs font-bold tracking-widest uppercase text-black/40">The Databricks Way</span>
              </div>
              
              <h3 className="text-4xl font-bold tracking-tight mb-6">Insenio Campus Lab Match</h3>
              <p className="text-black/60 font-medium leading-relaxed max-w-md mb-12">
                A marketplace-style interface with transparent fit and gap reasoning, powered by Delta tables and Insenio.
              </p>
              
              <div className="flex flex-col gap-4 mb-16">
                <div className="flex items-center justify-between py-4 border-b border-black/5">
                  <div className="flex items-center gap-3 font-semibold">
                    <span className="w-6 h-6 rounded-full bg-blue text-white flex items-center justify-center text-xs">1</span>
                    Insenio Onboarding
                  </div>
                  <span className="text-sm text-black/40">Conversational</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-black/5">
                  <div className="flex items-center gap-3 font-semibold">
                    <span className="w-6 h-6 rounded-full bg-blue text-white flex items-center justify-center text-xs">2</span>
                    Transparent Gap Reasoning
                  </div>
                  <span className="text-sm text-black/40">Clear match scoring</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-black/5">
                  <div className="flex items-center gap-3 font-semibold">
                    <span className="w-6 h-6 rounded-full bg-blue text-white flex items-center justify-center text-xs">3</span>
                    Apply Assist
                  </div>
                  <span className="text-sm text-black/40">Grounded drafting</span>
                </div>
              </div>
              
              <div className="mt-auto">
                <button className="w-full py-4 bg-blue text-white font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-blue/90 transition-colors">
                  See how it works <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
