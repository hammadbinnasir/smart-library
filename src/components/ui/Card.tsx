import { cn } from '../../lib/utils';

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

export const CardHeader = ({ title, subtitle, icon: Icon, action }: any) => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={20} className="text-indigo-600" />}
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 font-medium">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);
