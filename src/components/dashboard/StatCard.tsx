import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any;
  color: 'indigo' | 'amber' | 'rose' | 'emerald';
}

const colorMap = {
  indigo: 'bg-indigo-50/50 text-indigo-600 border-indigo-100',
  amber: 'bg-amber-50/50 text-amber-600 border-amber-100',
  rose: 'bg-rose-50/50 text-rose-600 border-rose-100',
  emerald: 'bg-emerald-50/50 text-emerald-600 border-emerald-100',
};

export const StatCard = ({ label, value, icon: Icon, color }: StatCardProps) => (
  <Card className="p-8 flex items-center gap-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group border-slate-100/50">
    <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 border shadow-sm", colorMap[color])}>
      <Icon size={32} strokeWidth={2} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-4xl font-bold text-brand-dark tracking-tight">{value}</p>
    </div>
  </Card>
);
