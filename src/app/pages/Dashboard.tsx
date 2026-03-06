import { Link } from 'react-router';
import {
  Car, AlertTriangle, Activity, ShieldAlert,
  TrendingUp, ArrowRight, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { weeklyChartData } from '../data/mockData';
import { SessionStatusBadge, IncidentStatusBadge, IncidentSeverityBadge } from '../components/StatusBadge';

function StatCard({
  label, value, sub, icon: Icon, color
}: {
  label: string; value: string | number; sub: string; icon: any; color: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="text-white text-2xl font-semibold">{value}</div>
      <div className="text-slate-400 text-sm mt-0.5">{label}</div>
      <div className="text-slate-500 text-xs mt-2">{sub}</div>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-xs">
        <p className="text-slate-300 mb-2 font-medium">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }} className="mb-0.5">
            {entry.name === 'normal' ? 'Норма' : entry.name === 'suspicious' ? 'Подозрение' : 'Критично'}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const { vehicles, sessions, incidents } = useApp();

  const criticalVehicles = vehicles.filter(v => v.status === 'critical').length;
  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;
  const weekSessions = sessions.filter(s => {
    const d = new Date(s.createdAt);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  const recentSessions = [...sessions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const recentIncidents = [...incidents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 4);

  const getVehicleName = (id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.make} ${v.model} (${v.plate})` : '—';
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Автомобилей в парке"
          value={vehicles.length}
          sub={`${vehicles.filter(v => v.status === 'ok').length} в норме`}
          icon={Car}
          color="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          label="Активных инцидентов"
          value={activeIncidents}
          sub={`${incidents.filter(i => i.status === 'new').length} новых`}
          icon={AlertTriangle}
          color="bg-red-500/15 text-red-400"
        />
        <StatCard
          label="Проверок за неделю"
          value={weekSessions}
          sub={`Всего: ${sessions.length}`}
          icon={Activity}
          color="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          label="Критических случаев"
          value={criticalVehicles}
          sub="Требуют внимания"
          icon={ShieldAlert}
          color="bg-amber-500/15 text-amber-400"
        />
      </div>

      {/* Chart + Recent Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white text-sm font-medium">Диагностические сессии</h3>
              <p className="text-slate-500 text-xs mt-0.5">За последние 7 дней</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-xs">
              <TrendingUp size={13} />
              <span>+12% к прошлой неделе</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyChartData} barSize={14} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={20} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="normal" name="normal" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="suspicious" name="suspicious" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              <Bar dataKey="critical" name="critical" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            {[
              { color: 'bg-emerald-500', label: 'Норма' },
              { color: 'bg-amber-500', label: 'Подозрение' },
              { color: 'bg-red-500', label: 'Критично' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm font-medium">Последние инциденты</h3>
            <Link to="/incidents" className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1">
              Все <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentIncidents.map(incident => (
              <div key={incident.id} className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between mb-1.5">
                  <IncidentSeverityBadge severity={incident.severity} />
                  <IncidentStatusBadge status={incident.status} />
                </div>
                <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">{incident.description}</p>
                <p className="text-slate-500 text-xs mt-1.5">{getVehicleName(incident.vehicleId)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <h3 className="text-white text-sm font-medium">Последние проверки</h3>
          <Link to="/diagnostics" className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1">
            Все проверки <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/30">
                <th className="text-left text-slate-500 text-xs px-5 py-3">Автомобиль</th>
                <th className="text-left text-slate-500 text-xs px-4 py-3 hidden sm:table-cell">Режим</th>
                <th className="text-left text-slate-500 text-xs px-4 py-3">Статус</th>
                <th className="text-left text-slate-500 text-xs px-4 py-3 hidden md:table-cell">Вероятность</th>
                <th className="text-left text-slate-500 text-xs px-4 py-3 hidden lg:table-cell">Оператор</th>
                <th className="text-left text-slate-500 text-xs px-4 py-3">Дата</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map(s => (
                <tr key={s.id} className="border-b border-slate-700/20 hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <Link to={`/fleet/${s.vehicleId}`} className="text-slate-300 text-sm hover:text-blue-400 transition-colors">
                      {getVehicleName(s.vehicleId)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-slate-400 text-sm">{s.engineMode}</span>
                  </td>
                  <td className="px-4 py-3">
                    <SessionStatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-sm font-medium ${
                      s.knockProbability >= 0.75 ? 'text-red-400' :
                      s.knockProbability >= 0.45 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {Math.round(s.knockProbability * 100)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-slate-400 text-sm">{s.operatorName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Clock size={11} />
                      {formatDate(s.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
