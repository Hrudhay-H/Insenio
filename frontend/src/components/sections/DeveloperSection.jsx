import React, { useState } from 'react';
import { Reveal } from '../ui/Reveal';
import { Copy, Check } from 'lucide-react';

export function DeveloperSection() {
  const [copied, setCopied] = useState(false);

  const codeString = `const context = await cloud.context({
  user,
  task,
  history
})

const response = await agent.run({
  context
})`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developers" className="py-32 px-5 sm:px-8 lg:px-12 xl:px-16 bg-[#F7F7F3] text-[#08090B]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <Reveal blur={false}>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter mb-8 leading-[1.1]">
            Give your agent context<br/>
            in a few lines.
          </h2>
          
          <button className="group flex items-center gap-2 text-lg font-semibold hover:text-blue transition-colors">
            Explore the API 
            <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
          </button>
        </Reveal>

        <Reveal blur={false} delay={0.2} className="relative group">
          <div className="absolute -inset-1 bg-brand-gradient opacity-10 rounded-2xl blur-lg group-hover:opacity-20 transition-opacity duration-500" />
          <div className="relative bg-[#08090B] rounded-xl border border-black/10 overflow-hidden shadow-2xl">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
              </div>
              <button 
                onClick={handleCopy}
                className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            
            <div className="p-8 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed">
                <code className="text-white/80">
                  <span className="text-[#569cd6]">const</span> context = <span className="text-[#c586c0]">await</span> cloud.<span className="text-[#dcdcaa]">context</span>{`({`}
                  <br/>
                  {`  `}user,<br/>
                  {`  `}task,<br/>
                  {`  `}history<br/>
                  {`})\n\n`}
                  <span className="text-[#569cd6]">const</span> response = <span className="text-[#c586c0]">await</span> agent.<span className="text-[#dcdcaa]">run</span>{`({`}
                  <br/>
                  {`  `}context<br/>
                  {`})`}
                </code>
              </pre>
            </div>
            
          </div>
        </Reveal>

      </div>
    </section>
  );
}
