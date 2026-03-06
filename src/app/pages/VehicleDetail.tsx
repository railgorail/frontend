import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Car, Fuel, Calendar, Gauge, Activity, AlertTriangle, Plus, FileAudio } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SessionStatusBadge, IncidentStatusBadge, IncidentSeverityBadge, VehicleStatusBadge, KnockProbabilityBar } from '../components/StatusBadge';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getVehicle, getVehicleSessions, getVehicleIncidents } = useApp();

  const vehicle = getVehicle(id!);

  if (!vehicle) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-400">Автомобиль не найден</p>
        <Link to="/fleet" className="text-blue-400 text-sm mt-2 inline-block">← Назад к автопарку</Link>
      </div>
    );
  }

  const sessions = getVehicleSessions(id!).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const incidents = getVehicleIncidents(id!).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const infoItems = [
    { label: 'Марка', value: vehicle.make },
    { label: 'Модель', value: vehicle.model },
    { label: 'VIN', value: vehicle.vin, mono: true },
    { label: 'Гос. номер', value: vehicle.plate },
    { label: 'Год выпуска', value: String(vehicle.year) },
    { label: 'Пробег', value: `${vehicle.mileage.toLocaleString('ru-RU')} км` },
    { label: 'Тип топлива', value: vehicle.fuel },
    { label: 'Статус', value: <VehicleStatusBadge status={vehicle.status} /> },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          Назад к автопарку
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Car size={22} className="text-slate-300" />
            </div>
            <div>
              <h1 className="text-white">{vehicle.make} {vehicle.model}</h1>
              <p className="text-slate-400 text-sm">{vehicle.plate} · {vehicle.year}</p>
            </div>
          </div>
          <Link
            to={`/diagnostics/new?vehicleId=${id}`}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition-colors"
          >
            <Plus size={15} />
            Новая диагностика
          </Link>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-4">Информация об автомобиле</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {infoItems.map(({ label, value, mono }) => (
            <div key={label}>
              <div className="text-slate-500 text-xs mb-1">{label}</div>
              {typeof value === 'string' ? (
                <div className={`text-white text-sm ${mono ? 'font-mono text-xs' : ''}`}>{value}</div>
              ) : value}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 text-center">
          <div className="text-blue-400 text-2xl font-semibold">{sessions.length}</div>
          <div className="text-slate-500 text-xs mt-0.5">Диагностик</div>
        </div>
        <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 text-center">
          <div className="text-amber-400 text-2xl font-semibold">{sessions.filter(s => s.status === 'suspicious').length}</div>
          <div className="text-slate-500 text-xs mt-0.5">Подозрений</div>
        </div>
        <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 text-center">
          <div className="text-red-400 text-2xl font-semibold">{incidents.filter(i => i.status !== 'resolved').length}</div>
          <div className="text-slate-500 text-xs mt-0.5">Активных инцидентов</div>
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-700/50">
          <Activity size={15} className="text-slate-400" />
          <h3 className="text-white text-sm font-medium">История диагностики</h3>
          <span className="ml-auto text-slate-500 text-xs">{sessions.length} записей</span>
        </div>
        {sessions.length === 0 ? (
          <div className="p-8 text-center">
            <FileAudio size={32} className="text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Диагностических записей нет</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {sessions.map(session => (
              <div key={session.id} className="px-5 py-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <SessionStatusBadge status={session.status} />
                      <span className="text-slate-400 text-xs">{session.engineMode}</span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-slate-500 text-xs">{formatDate(session.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                      <FileAudio size={11} />
                      <span className="font-mono truncate">{session.audioFileName}</span>
                    </div>
                    {session.comment && (
                      <p className="text-slate-400 text-sm">{session.comment}</p>
                    )}
                    <p className="text-slate-600 text-xs mt-1">Оператор: {session.operatorName}</p>
                  </div>
                  <div className="sm:w-40">
                    <div className="text-slate-500 text-xs mb-1.5">Вероятность детонации</div>
                    <KnockProbabilityBar probability={session.knockProbability} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incidents */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-700/50">
          <AlertTriangle size={15} className="text-slate-400" />
          <h3 className="text-white text-sm font-medium">Инциденты</h3>
          <span className="ml-auto text-slate-500 text-xs">{incidents.length} записей</span>
        </div>
        {incidents.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-sm">Инцидентов не зафиксировано</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {incidents.map(incident => (
              <div key={incident.id} className="px-5 py-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <IncidentSeverityBadge severity={incident.severity} />
                      <IncidentStatusBadge status={incident.status} />
                      <span className="text-slate-500 text-xs">{formatDate(incident.createdAt)}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{incident.description}</p>
                    <p className="text-slate-500 text-xs mt-1.5">Механик: {incident.assignedMechanic}</p>
                    {incident.conclusion && (
                      <div className="mt-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                        <p className="text-emerald-400 text-xs font-medium mb-1">Заключение механика</p>
                        <p className="text-slate-300 text-sm">{incident.conclusion}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
