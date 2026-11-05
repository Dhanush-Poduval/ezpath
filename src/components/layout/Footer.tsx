import React from 'react';
import { Compass, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-subtle-border bg-white py-8 text-xs text-ink-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-accent" />
          <span className="font-semibold text-ink">AccessPath</span>
          <span>&mdash; &ldquo;The shortest route isn&apos;t always the right route.&rdquo;</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-accessible" />
            WCAG 2.2 AA Verified Design
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            Built for Accessible Multimodal Transit
          </span>
        </div>
      </div>
    </footer>
  );
};

