import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  Upload, FileAudio, CheckCircle2, AlertTriangle, XCircle,
  Search, Clock, ChevronDown, Plus, Loader2, X, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EngineMode, ENGINE_MODES, SessionStatus, MECHANICS } from '../data/mockData';
import { SessionStatusBadge, KnockProbabilityBar } from '../components/StatusBadge';

function mockAnalyze(fileName: string, mode: EngineMode): { status: SessionStatus; probability: number } {
  // Deterministic mock based on filename hash + mode
  const seed = fileName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const modeFactor = mode === 'Высокие обороты' ? 0.3 : mode === 'Под нагрузкой' ? 0.2 : mode === 'Средние обороты' ? 0.1 : 0;
  const base = (seed % 100) / 100;
  const prob = Math.min(0.98, Math.max(0.02, base * 0.7 + modeFactor + Math.random() * 0.15));
  const status: SessionStatus = prob >= 0.75 ? 'critical' : prob >= 0.45 ? 'suspicious' : 'normal';
  return { status, probability: Math.round(prob * 100) / 100 };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

type Step = 'form' | 'analyzing' | 'result';

interface AnalysisResult {
  status: SessionStatus;
  probability: number;
  sessionId: string;
  vehicleId: string;
}

function NewDiagnosticForm({ onSuccess }: { onSuccess: () => void }) {
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('vehicleId') || '';
  const { vehicles, addSession, addIncident } = useApp();

  const [step, setStep] = useState<Step>('form');
  const [vehicleId, setVehicleId] = useState(preselectedVehicleId);
  const [mode, setMode] = useState<EngineMode>('Холостой ход');
  const [comment, setComment] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [incidentMechanic, setIncidentMechanic] = useState(MECHANICS[0]);
  const [incidentCreated, setIncidentCreated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !fileName) return;

    setStep('analyzing');

    await new Promise(res => setTimeout(res, 2500));

    const { status, probability } = mockAnalyze(fileName, mode);
    const vehicle = vehicles.find(v => v.id === vehicleId)!;
    const now = new Date().toISOString();

    const session = addSession({
      vehicleId,
      engineMode: mode,
      audioFileName: fileName,
      comment,
      createdAt: now,
      status,
      knockProbability: probability,
      operatorName: 'Артём Денисов',
    });

    setResult({ status, probability, sessionId: session.id, vehicleId });
    setStep('result');
  };

  const handleCreateIncident = () => {
    if (!result) return;
    const vehicle = vehicles.find(v => v.id === result.vehicleId);
    const pct = Math.round(result.probability * 100);
    addIncident({
      vehicleId: result.vehicleId,
      sessionId: result.sessionId,
      severity: result.status === 'critical' ? 'critical' : 'high',
      description: `Вероятность детонации ${pct}% при режиме «${mode}». Требуется проверка двигателя ${vehicle?.make} ${vehicle?.model} (${vehicle?.plate}).`,
      assignedMechanic: incidentMechanic,
      status: 'new',
    });
    setIncidentCreated(true);
  };

  if (step === 'analyzing') {
    return (
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-12 text-center">
        <div className="flex items-center justify-center mb-4">
          <Loader2 size={40} className="text-blue-500 animate-spin" />
        </div>
        <h3 className="text-white text-base mb-2">Анализ аудиозаписи...</h3>
        <p className="text-slate-400 text-sm">ML-модель обрабатывает звук двигателя</p>
        <div className="mt-6 max-w-xs mx-auto">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-[grow_2.5s_ease-in-out_forwards]" style={{width: '100%', animation: 'none', background: 'linear-gradient(90deg, #3b82f6 var(--p, 0%), transparent var(--p, 0%))'}} />
          </div>
        </div>
        <p className="text-slate-600 text-xs mt-3">Обычно занимает несколько секунд</p>
      </div>
    );
  }

  if (step === 'result' && result) {
    const pct = Math.round(result.probability * 100);
    const isAlert = result.status !== 'normal';
    const vehicle = vehicles.find(v => v.id === result.vehicleId);

    return (
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
        {/* Result header */}
        <div className={`px-6 py-5 border-b border-slate-700/50 ${
          result.status === 'critical' ? 'bg-red-500/5' :
          result.status === 'suspicious' ? 'bg-amber-500/5' : 'bg-emerald-500/5'
        }`}>
          <div className="flex items-center gap-3">
            {result.status === 'normal' ? (
              <CheckCircle2 size={28} className="text-emerald-400 shrink-0" />
            ) : result.status === 'suspicious' ? (
              <AlertTriangle size={28} className="text-amber-400 shrink-0" />
            ) : (
              <XCircle size={28} className="text-red-400 shrink-0" />
            )}
            <div>
              <h3 className="text-white text-base">
                {result.status === 'normal' ? 'Детонация не обнаружена' :
                 result.status === 'suspicious' ? 'Подозрение на детонацию' :
                 'Критическая вероятность детонации'}
              </h3>
              <p className="text-slate-400 text-sm">{vehicle?.make} {vehicle?.model} · {vehicle?.plate}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Probability */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Вероятность детонации</span>
              <span className={`text-lg font-semibold ${
                pct >= 75 ? 'text-red-400' : pct >= 45 ? 'text-amber-400' : 'text-emerald-400'
              }`}>{pct}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  pct >= 75 ? 'bg-red-500' : pct >= 45 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-slate-600 text-xs mt-1">
              <span>0%</span>
              <span>45% — подозрение</span>
              <span>75% — критично</span>
              <span>100%</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/30">
            <p className="text-slate-300 text-sm leading-relaxed">
              {result.status === 'normal'
                ? 'Звуковой профиль двигателя соответствует норме. Признаков детонации не обнаружено. Плановая диагностика рекомендуется через 30 дней.'
                : result.status === 'suspicious'
                ? 'Обнаружены нехарактерные звуковые паттерны, которые могут свидетельствовать о начальных признаках детонации. Рекомендуется дополнительная проверка.'
                : 'Зафиксированы явные признаки детонации двигателя. Немедленно прекратите эксплуатацию автомобиля до проведения технического обслуживания.'
              }
            </p>
          </div>

          {/* Create Incident */}
          {isAlert && !incidentCreated && (
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/30">
              <h4 className="text-white text-sm mb-3">Создать инцидент</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-slate-400 text-xs mb-1.5 block">Назначить механика</label>
                  <select
                    value={incidentMechanic}
                    onChange={e => setIncidentMechanic(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                  >
                    {MECHANICS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <button
                  onClick={handleCreateIncident}
                  className={`mt-6 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    result.status === 'critical'
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  Создать инцидент
                </button>
              </div>
            </div>
          )}

          {incidentCreated && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <p className="text-emerald-400 text-sm">Инцидент создан и назначен механику {incidentMechanic}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setStep('form'); setFileName(''); setComment(''); setResult(null); setIncidentCreated(false); }}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
            >
              Новая диагностика
            </button>
            <Link
              to={`/fleet/${result.vehicleId}`}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 transition-colors"
            >
              Карточка авто <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700/50 rounded-xl p-6 space-y-5">
      {/* Vehicle */}
      <div>
        <label className="block text-slate-300 text-sm mb-1.5">Автомобиль *</label>
        <select
          value={vehicleId}
          onChange={e => setVehicleId(e.target.value)}
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">— Выберите автомобиль —</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.make} {v.model} ({v.plate})</option>
          ))}
        </select>
      </div>

      {/* Mode */}
      <div>
        <label className="block text-slate-300 text-sm mb-1.5">Режим работы двигателя *</label>
        <div className="grid grid-cols-2 gap-2">
          {ENGINE_MODES.map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-2.5 rounded-lg text-sm border transition-colors text-left ${
                mode === m
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Audio file */}
      <div>
        <label className="block text-slate-300 text-sm mb-1.5">Аудиозапись двигателя *</label>
        {fileName ? (
          <div className="flex items-center gap-3 p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <FileAudio size={20} className="text-blue-400 shrink-0" />
            <span className="text-slate-300 text-sm flex-1 truncate font-mono">{fileName}</span>
            <button type="button" onClick={() => setFileName('')} className="text-slate-500 hover:text-white">
              <X size={15} />
            </button>
          </div>
        ) : (
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragging
                ? 'border-blue-500 bg-blue-500/5'
                : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
            }`}
          >
            <Upload size={28} className="text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm mb-1">Перетащите файл или нажмите для выбора</p>
            <p className="text-slate-600 text-xs">WAV, MP3, FLAC до 100 МБ</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,.flac,.ogg,.m4a"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        )}
      </div>

      {/* Comment */}
      <div>
        <label className="block text-slate-300 text-sm mb-1.5">Комментарий оператора</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Опишите симптомы, условия записи..."
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 outline-none focus:border-blue-500 transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={!vehicleId || !fileName}
        className="w-full py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Запустить анализ
      </button>
    </form>
  );
}

function formatDate2(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function Diagnostics() {
  const [tab, setTab] = useState<'new' | 'history'>('new');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | SessionStatus>('all');
  const { sessions, vehicles } = useApp();

  const getVehicleName = (id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.make} ${v.model} (${v.plate})` : '—';
  };

  const filtered = sessions
    .filter(s => {
      if (filterStatus !== 'all' && s.status !== filterStatus) return false;
      if (search) {
        const vName = getVehicleName(s.vehicleId).toLowerCase();
        return vName.includes(search.toLowerCase()) || s.engineMode.toLowerCase().includes(search.toLowerCase()) || s.audioFileName.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-700/50 rounded-xl p-1 mb-6 w-fit">
        {[
          { key: 'new', label: 'Новая диагностика', icon: Plus },
          { key: 'history', label: 'История проверок', icon: Clock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              tab === key
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'new' ? (
        <div className="max-w-2xl">
          <div className="mb-4">
            <h2 className="text-white text-base">Создать диагностическую сессию</h2>
            <p className="text-slate-400 text-sm mt-0.5">Загрузите аудиозапись двигателя для автоматического анализа</p>
          </div>
          <NewDiagnosticForm onSuccess={() => setTab('history')} />
        </div>
      ) : (
        <div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Поиск по автомобилю, файлу..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'normal', 'suspicious', 'critical'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-2 rounded-lg text-xs border transition-colors ${
                    filterStatus === s
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {s === 'all' ? 'Все' : s === 'normal' ? 'Норма' : s === 'suspicious' ? 'Подозрение' : 'Критично'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left text-slate-500 text-xs px-5 py-3">Автомобиль</th>
                    <th className="text-left text-slate-500 text-xs px-4 py-3 hidden sm:table-cell">Режим</th>
                    <th className="text-left text-slate-500 text-xs px-4 py-3">Статус</th>
                    <th className="text-left text-slate-500 text-xs px-4 py-3 hidden md:table-cell">Вероятность</th>
                    <th className="text-left text-slate-500 text-xs px-4 py-3 hidden lg:table-cell">Оператор</th>
                    <th className="text-left text-slate-500 text-xs px-4 py-3">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-500 text-sm">
                        Записей не найдено
                      </td>
                    </tr>
                  ) : (
                    filtered.map(s => (
                      <tr key={s.id} className="border-b border-slate-700/20 hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3">
                          <div>
                            <Link to={`/fleet/${s.vehicleId}`} className="text-slate-300 text-sm hover:text-blue-400 transition-colors">
                              {getVehicleName(s.vehicleId)}
                            </Link>
                            <p className="text-slate-600 text-xs font-mono truncate max-w-[150px]">{s.audioFileName}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-slate-400 text-sm">{s.engineMode}</span>
                        </td>
                        <td className="px-4 py-3">
                          <SessionStatusBadge status={s.status} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="w-28">
                            <KnockProbabilityBar probability={s.knockProbability} />
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-slate-400 text-sm">{s.operatorName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-slate-500 text-xs">
                            <Clock size={11} />
                            {formatDate2(s.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
