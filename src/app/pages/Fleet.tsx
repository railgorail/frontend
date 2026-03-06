import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Search, Car, Pencil, Trash2, ChevronRight, Fuel, Calendar, Gauge } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Vehicle, FuelType, FUEL_TYPES } from '../data/mockData';
import { VehicleStatusBadge } from '../components/StatusBadge';

interface VehicleFormData {
  make: string;
  model: string;
  vin: string;
  plate: string;
  year: string;
  mileage: string;
  fuel: FuelType;
}

const defaultForm: VehicleFormData = {
  make: '', model: '', vin: '', plate: '', year: '2022', mileage: '', fuel: 'Бензин',
};

function VehicleModal({
  vehicle,
  onClose,
  onSave,
}: {
  vehicle?: Vehicle;
  onClose: () => void;
  onSave: (data: VehicleFormData) => void;
}) {
  const [form, setForm] = useState<VehicleFormData>(
    vehicle
      ? { make: vehicle.make, model: vehicle.model, vin: vehicle.vin, plate: vehicle.plate, year: String(vehicle.year), mileage: String(vehicle.mileage), fuel: vehicle.fuel }
      : defaultForm
  );
  const [errors, setErrors] = useState<Partial<VehicleFormData>>({});

  const validate = () => {
    const e: Partial<VehicleFormData> = {};
    if (!form.make.trim()) e.make = 'Введите марку';
    if (!form.model.trim()) e.model = 'Введите модель';
    if (!form.vin.trim() || form.vin.length < 5) e.vin = 'Введите корректный VIN';
    if (!form.plate.trim()) e.plate = 'Введите номер';
    if (!form.mileage || isNaN(Number(form.mileage))) e.mileage = 'Введите пробег';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSave(form);
  };

  const Field = ({ label, name, placeholder, type = 'text' }: {
    label: string; name: keyof VehicleFormData; placeholder?: string; type?: string;
  }) => (
    <div>
      <label className="block text-slate-300 text-sm mb-1.5">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={e => setForm(prev => ({ ...prev, [name]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full bg-slate-800 border rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 outline-none focus:border-blue-500 transition-colors ${errors[name] ? 'border-red-500/60' : 'border-slate-700'}`}
      />
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-white text-base">{vehicle ? 'Редактировать автомобиль' : 'Добавить автомобиль'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Марка" name="make" placeholder="Toyota" />
            <Field label="Модель" name="model" placeholder="Camry" />
          </div>
          <Field label="VIN-номер" name="vin" placeholder="JT2BF19K1X0271765" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Гос. номер" name="plate" placeholder="А123ВС77" />
            <Field label="Год выпуска" name="year" type="number" placeholder="2022" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Пробег (км)" name="mileage" type="number" placeholder="50000" />
            <div>
              <label className="block text-slate-300 text-sm mb-1.5">Тип топлива</label>
              <select
                value={form.fuel}
                onChange={e => setForm(prev => ({ ...prev, fuel: e.target.value as FuelType }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors"
              >
                {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
              Отмена
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 transition-colors">
              {vehicle ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Fleet() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useApp();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = vehicles.filter(v =>
    `${v.make} ${v.model} ${v.plate} ${v.vin}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data: VehicleFormData) => {
    const payload = {
      make: data.make,
      model: data.model,
      vin: data.vin,
      plate: data.plate,
      year: Number(data.year),
      mileage: Number(data.mileage),
      fuel: data.fuel,
    };
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, payload);
    } else {
      addVehicle(payload);
    }
    setModalOpen(false);
    setEditingVehicle(undefined);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Поиск по марке, номеру, VIN..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <button
          onClick={() => { setEditingVehicle(undefined); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition-colors shrink-0"
        >
          <Plus size={15} />
          Добавить автомобиль
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Всего', value: vehicles.length, color: 'text-blue-400' },
          { label: 'Внимание', value: vehicles.filter(v => v.status === 'warning').length, color: 'text-amber-400' },
          { label: 'Критично', value: vehicles.filter(v => v.status === 'critical').length, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 text-center">
            <div className={`text-2xl font-semibold ${color}`}>{value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Vehicle list */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-12 text-center">
          <Car size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Автомобили не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(vehicle => (
            <div key={vehicle.id} className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <Car size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{vehicle.make} {vehicle.model}</div>
                    <div className="text-slate-400 text-xs">{vehicle.plate}</div>
                  </div>
                </div>
                <VehicleStatusBadge status={vehicle.status} />
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <span className="text-slate-600">VIN:</span>
                  <span className="text-slate-400 font-mono text-xs truncate">{vehicle.vin}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Calendar size={11} />
                    <span>{vehicle.year}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Gauge size={11} />
                    <span>{vehicle.mileage.toLocaleString('ru-RU')} км</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Fuel size={11} />
                    <span>{vehicle.fuel}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/fleet/${vehicle.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Открыть <ChevronRight size={12} />
                </Link>
                <button
                  onClick={() => { setEditingVehicle(vehicle); setModalOpen(true); }}
                  className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setConfirmDelete(vehicle.id)}
                  className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <VehicleModal
          vehicle={editingVehicle}
          onClose={() => { setModalOpen(false); setEditingVehicle(undefined); }}
          onSave={handleSave}
        />
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-white text-base mb-2">Удалить автомобиль?</h3>
            <p className="text-slate-400 text-sm mb-6">Это действие нельзя отменить. Все данные диагностики также будут удалены.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
                Отмена
              </button>
              <button
                onClick={() => { deleteVehicle(confirmDelete); setConfirmDelete(null); }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-500 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
