import { useState } from 'react';
import { Link } from 'react-router';
import { Search, AlertTriangle, Clock, CheckCircle2, Filter, ChevronDown, X, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Incident, IncidentStatus, IncidentSeverity, MECHANICS } from '../data/mockData';
import { IncidentSeverityBadge, IncidentStatusBadge, SessionStatusBadge } from '../components/StatusBadge';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function IncidentModal({
  incident,
  vehicleName,
  session,
  onClose,
  onUpdate,
}: {
  incident: Incident;
  vehicleName: string;
  session: any;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Incident>) => void;
}) {
  const [status, setStatus] = useState<IncidentStatus>(incident.status);
  const [mechanic, setMechanic] = useState(incident.assignedMechanic);
  const [conclusion, setConclusion] = useState(incident.conclusion || '');

  const handleSave = () => {
    onUpdate(incident.id, { status, assignedMechanic: mechanic, conclusion: conclusion || undefined });
    onClose();
  };

  const statusOptions: { value: IncidentStatus; label: string }[] = [
    { value: 'new', label: 'Новый' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'resolved', label: 'Закрыт' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <IncidentSeverityBadge severity={incident.severity} />
            <h2 className="text-white text-base">{vehicleName}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Description */}
          <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/30">
            <p className="text-slate-500 text-xs mb-2">Описание инцидента</p>
            <p className="text-slate-300 text-sm leading-relaxed">{incident.description}</p>
          </div>

          {/* Session info */}
          {session && (
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/30">
              <p className="text-slate-500 text-xs mb-2">Диагностическая сессия</p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-slate-300 text-sm">{session.engineMode}</p>
                  <p className="text-slate-500 text-xs font-mono mt-0.5">{session.audioFileName}</p>
                </div>
                <div className="text-right">
                  <SessionStatusBadge status={session.status} />
                  <p className="text-amber-400 text-sm font-medium mt-1">{Math.round(session.knockProbability * 100)}% детонации</p>
                </div>
              </div>
              {session.comment && (
                <p className="text-slate-400 text-sm mt-2 italic">«{session.comment}»</p>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 text-xs mb-1">Создан</p>
              <p className="text-slate-300">{formatDate(incident.createdAt)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Обновлён</p>
              <p className="text-slate-300">{formatDate(incident.updatedAt)}</p>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-slate-300 text-sm mb-2">Статус</label>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                    status === opt.value
                      ? opt.value === 'new' ? 'bg-red-600/20 border-red-500 text-red-300'
                        : opt.value === 'in_progress' ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mechanic */}
          <div>
            <label className="block text-slate-300 text-sm mb-2">Назначенный механик</label>
            <select
              value={mechanic}
              onChange={e => setMechanic(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors"
            >
              {MECHANICS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Conclusion */}
          <div>
            <label className="block text-slate-300 text-sm mb-2">Заключение механика</label>
            <textarea
              value={conclusion}
              onChange={e => setConclusion(e.target.value)}
              placeholder="Опишите результаты проверки и выполненные работы..."
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
              Отмена
            </button>
            <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 transition-colors">
              <Save size={14} />
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Incidents() {
  const { incidents, vehicles, sessions, updateIncident } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | IncidentStatus>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | IncidentSeverity>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const getVehicleName = (id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.make} ${v.model} (${v.plate})` : '—';
  };

  const getSession = (id: string) => sessions.find(s => s.id === id);

  const filtered = incidents
    .filter(i => {
      if (filterStatus !== 'all' && i.status !== filterStatus) return false;
      if (filterSeverity !== 'all' && i.severity !== filterSeverity) return false;
      if (search) {
        const vName = getVehicleName(i.vehicleId).toLowerCase();
        return vName.includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()) || i.assignedMechanic.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statusCounts = {
    all: incidents.length,
    new: incidents.filter(i => i.status === 'new').length,
    in_progress: incidents.filter(i => i.status === 'in_progress').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Всего', value: statusCounts.all, color: 'text-slate-300', bg: '' },
          { label: 'Новых', value: statusCounts.new, color: 'text-red-400', bg: 'border-red-500/20' },
          { label: 'В работе', value: statusCounts.in_progress, color: 'text-blue-400', bg: 'border-blue-500/20' },
          { label: 'Закрытых', value: statusCounts.resolved, color: 'text-emerald-400', bg: 'border-emerald-500/20' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`bg-slate-900 border border-slate-700/50 ${bg} rounded-xl p-4 text-center`}>
            <div className={`text-2xl font-semibold ${color}`}>{value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Поиск по автомобилю, механику..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'new', 'in_progress', 'resolved'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs border transition-colors ${
                filterStatus === s
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {s === 'all' ? 'Все' : s === 'new' ? `Новые (${statusCounts.new})` : s === 'in_progress' ? 'В работе' : 'Закрытые'}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents List */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-12 text-center">
          <CheckCircle2 size={40} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Инцидентов не найдено</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(incident => {
            const session = getSession(incident.sessionId);
            return (
              <div
                key={incident.id}
                onClick={() => setSelectedIncident(incident)}
                className={`bg-slate-900 border rounded-xl p-5 cursor-pointer hover:border-slate-600 transition-all duration-150 ${
                  incident.status === 'new' ? 'border-red-500/30' :
                  incident.status === 'in_progress' ? 'border-blue-500/20' :
                  'border-slate-700/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <IncidentSeverityBadge severity={incident.severity} />
                      <IncidentStatusBadge status={incident.status} />
                      {incident.status === 'new' && (
                        <span className="flex items-center gap-1 text-red-400 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                          Требует внимания
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/fleet/${incident.vehicleId}`}
                      onClick={e => e.stopPropagation()}
                      className="text-white text-sm font-medium hover:text-blue-400 transition-colors"
                    >
                      {getVehicleName(incident.vehicleId)}
                    </Link>
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed line-clamp-2">{incident.description}</p>

                    <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <span className="text-slate-600">Механик:</span>
                        <span className="text-slate-400">{incident.assignedMechanic}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Clock size={11} />
                        <span>{formatDate(incident.createdAt)}</span>
                      </div>
                    </div>

                    {incident.conclusion && (
                      <div className="mt-2.5 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                        <p className="text-emerald-400 text-xs font-medium mb-0.5">Заключение механика</p>
                        <p className="text-slate-300 text-sm line-clamp-2">{incident.conclusion}</p>
                      </div>
                    )}
                  </div>
                  {session && (
                    <div className="sm:w-36 bg-slate-800/60 border border-slate-700/30 rounded-lg p-3 shrink-0">
                      <p className="text-slate-500 text-xs mb-1.5">Диагностика</p>
                      <p className={`text-lg font-semibold ${
                        session.knockProbability >= 0.75 ? 'text-red-400' :
                        session.knockProbability >= 0.45 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>{Math.round(session.knockProbability * 100)}%</p>
                      <p className="text-slate-500 text-xs">вероятность</p>
                      <p className="text-slate-600 text-xs mt-1">{session.engineMode}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          vehicleName={getVehicleName(selectedIncident.vehicleId)}
          session={getSession(selectedIncident.sessionId)}
          onClose={() => setSelectedIncident(null)}
          onUpdate={(id, data) => {
            updateIncident(id, data);
            setSelectedIncident(null);
          }}
        />
      )}
    </div>
  );
}
