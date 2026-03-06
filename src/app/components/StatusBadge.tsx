import { SessionStatus, VehicleStatus, IncidentSeverity, IncidentStatus } from '../data/mockData';

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const map = {
    normal: { label: 'Норма', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    suspicious: { label: 'Подозрение', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    critical: { label: 'Критично', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'normal' ? 'bg-emerald-400' : status === 'suspicious' ? 'bg-amber-400' : 'bg-red-400'}`} />
      {label}
    </span>
  );
}

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const map = {
    ok: { label: 'Норма', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    warning: { label: 'Внимание', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    critical: { label: 'Критично', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'ok' ? 'bg-emerald-400' : status === 'warning' ? 'bg-amber-400' : 'bg-red-400'}`} />
      {label}
    </span>
  );
}

export function IncidentSeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const map = {
    medium: { label: 'Средний', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    high: { label: 'Высокий', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    critical: { label: 'Критичный', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  };
  const { label, cls } = map[severity];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${cls}`}>
      {label}
    </span>
  );
}

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const map = {
    new: { label: 'Новый', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
    in_progress: { label: 'В работе', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    resolved: { label: 'Закрыт', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${cls}`}>
      {label}
    </span>
  );
}

export function KnockProbabilityBar({ probability }: { probability: number }) {
  const pct = Math.round(probability * 100);
  const color = pct >= 75 ? 'bg-red-500' : pct >= 45 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-medium w-8 text-right ${pct >= 75 ? 'text-red-400' : pct >= 45 ? 'text-amber-400' : 'text-emerald-400'}`}>
        {pct}%
      </span>
    </div>
  );
}
