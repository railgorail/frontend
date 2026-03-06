export type VehicleStatus = 'ok' | 'warning' | 'critical';
export type SessionStatus = 'normal' | 'suspicious' | 'critical';
export type IncidentSeverity = 'medium' | 'high' | 'critical';
export type IncidentStatus = 'new' | 'in_progress' | 'resolved';
export type FuelType = 'Бензин' | 'Дизель' | 'Газ';
export type EngineMode = 'Холостой ход' | 'Средние обороты' | 'Высокие обороты' | 'Под нагрузкой';
export type UserRole = 'admin' | 'operator' | 'mechanic';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  vin: string;
  plate: string;
  year: number;
  mileage: number;
  fuel: FuelType;
  status: VehicleStatus;
}

export interface DiagnosticSession {
  id: string;
  vehicleId: string;
  engineMode: EngineMode;
  audioFileName: string;
  comment: string;
  createdAt: string;
  status: SessionStatus;
  knockProbability: number;
  analyzedAt: string;
  operatorName: string;
}

export interface Incident {
  id: string;
  vehicleId: string;
  sessionId: string;
  severity: IncidentSeverity;
  description: string;
  assignedMechanic: string;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  conclusion?: string;
}

export const MECHANICS = ['Иван Петров', 'Алексей Сидоров', 'Дмитрий Козлов'];
export const ENGINE_MODES: EngineMode[] = ['Холостой ход', 'Средние обороты', 'Высокие обороты', 'Под нагрузкой'];
export const FUEL_TYPES: FuelType[] = ['Бензин', 'Дизель', 'Газ'];

export const initialVehicles: Vehicle[] = [
  { id: 'v1', make: 'Toyota', model: 'Camry', vin: 'JT2BF19K1X0271765', plate: 'А123ВС77', year: 2020, mileage: 85000, fuel: 'Бензин', status: 'ok' },
  { id: 'v2', make: 'Volkswagen', model: 'Transporter', vin: 'WV1ZZZ7HZ6H034589', plate: 'В456КМ99', year: 2019, mileage: 143000, fuel: 'Дизель', status: 'warning' },
  { id: 'v3', make: 'Ford', model: 'Transit', vin: 'WF0XXXTTGXBA24891', plate: 'Е789ОР50', year: 2018, mileage: 196000, fuel: 'Дизель', status: 'critical' },
  { id: 'v4', make: 'Hyundai', model: 'Solaris', vin: 'Z94CB41BBER024731', plate: 'К012НТ77', year: 2021, mileage: 38000, fuel: 'Бензин', status: 'ok' },
  { id: 'v5', make: 'Mercedes-Benz', model: 'Sprinter', vin: 'WDB9066351S275301', plate: 'М345РУ77', year: 2017, mileage: 238000, fuel: 'Дизель', status: 'warning' },
  { id: 'v6', make: 'Nissan', model: 'Qashqai', vin: 'SJNFDAJ11U1234561', plate: 'Н678СА97', year: 2020, mileage: 62000, fuel: 'Бензин', status: 'ok' },
  { id: 'v7', make: 'Kia', model: 'Rio', vin: 'XWEJC411BC0000237', plate: 'О901ТВ77', year: 2019, mileage: 115000, fuel: 'Бензин', status: 'warning' },
  { id: 'v8', make: 'Lada', model: 'Granta', vin: 'XTA219400E0589213', plate: 'Р234УХ50', year: 2022, mileage: 21000, fuel: 'Бензин', status: 'ok' },
];

export const initialSessions: DiagnosticSession[] = [
  { id: 's1', vehicleId: 'v3', engineMode: 'Высокие обороты', audioFileName: 'ford_transit_2024-02-20.wav', comment: 'Посторонний стук при разгоне', createdAt: '2026-03-06T08:14:00', status: 'critical', knockProbability: 0.91, analyzedAt: '2026-03-06T08:14:47', operatorName: 'Сергей Иванов' },
  { id: 's2', vehicleId: 'v2', engineMode: 'Средние обороты', audioFileName: 'vw_transporter_2024-02-19.wav', comment: 'Небольшой шум на прогреве', createdAt: '2026-03-05T14:30:00', status: 'suspicious', knockProbability: 0.63, analyzedAt: '2026-03-05T14:30:52', operatorName: 'Олег Смирнов' },
  { id: 's3', vehicleId: 'v7', engineMode: 'Холостой ход', audioFileName: 'kia_rio_2024-02-18.wav', comment: 'Плановая проверка', createdAt: '2026-03-05T10:00:00', status: 'suspicious', knockProbability: 0.54, analyzedAt: '2026-03-05T10:01:03', operatorName: 'Сергей Иванов' },
  { id: 's4', vehicleId: 'v5', engineMode: 'Под нагрузкой', audioFileName: 'mercedes_sprinter_2024-02-17.wav', comment: 'Вибрация при нагрузке', createdAt: '2026-03-04T16:45:00', status: 'suspicious', knockProbability: 0.58, analyzedAt: '2026-03-04T16:45:40', operatorName: 'Михаил Дроздов' },
  { id: 's5', vehicleId: 'v1', engineMode: 'Холостой ход', audioFileName: 'toyota_camry_2024-02-16.wav', comment: 'Плановая проверка', createdAt: '2026-03-04T09:00:00', status: 'normal', knockProbability: 0.04, analyzedAt: '2026-03-04T09:00:38', operatorName: 'Олег Смирнов' },
  { id: 's6', vehicleId: 'v4', engineMode: 'Средние обороты', audioFileName: 'hyundai_solaris_2024-02-15.wav', comment: 'Плановая проверка', createdAt: '2026-03-03T11:20:00', status: 'normal', knockProbability: 0.07, analyzedAt: '2026-03-03T11:20:45', operatorName: 'Михаил Дроздов' },
  { id: 's7', vehicleId: 'v6', engineMode: 'Холостой ход', audioFileName: 'nissan_qashqai_2024-02-14.wav', comment: 'Плановая диагностика', createdAt: '2026-03-03T14:00:00', status: 'normal', knockProbability: 0.11, analyzedAt: '2026-03-03T14:00:55', operatorName: 'Сергей Иванов' },
  { id: 's8', vehicleId: 'v8', engineMode: 'Средние обороты', audioFileName: 'lada_granta_2024-02-13.wav', comment: 'Плановая проверка', createdAt: '2026-03-02T09:30:00', status: 'normal', knockProbability: 0.09, analyzedAt: '2026-03-02T09:30:42', operatorName: 'Олег Смирнов' },
  { id: 's9', vehicleId: 'v3', engineMode: 'Средние обороты', audioFileName: 'ford_transit_old_2024-02-10.wav', comment: 'Жалоба водителя на стук', createdAt: '2026-02-28T13:00:00', status: 'critical', knockProbability: 0.87, analyzedAt: '2026-02-28T13:01:10', operatorName: 'Михаил Дроздов' },
  { id: 's10', vehicleId: 'v2', engineMode: 'Высокие обороты', audioFileName: 'vw_transporter_old.wav', comment: 'Проверка после ТО', createdAt: '2026-02-25T10:00:00', status: 'normal', knockProbability: 0.18, analyzedAt: '2026-02-25T10:01:00', operatorName: 'Сергей Иванов' },
];

export const initialIncidents: Incident[] = [
  {
    id: 'i1', vehicleId: 'v3', sessionId: 's1', severity: 'critical',
    description: 'Высокая вероятность детонации (91%). Обнаружены ударные нагрузки при высоких оборотах. Требуется немедленная диагностика двигателя.',
    assignedMechanic: 'Иван Петров', status: 'new',
    createdAt: '2026-03-06T08:15:00', updatedAt: '2026-03-06T08:15:00',
  },
  {
    id: 'i2', vehicleId: 'v2', sessionId: 's2', severity: 'high',
    description: 'Подозрение на детонацию (63%). Нестабильная работа двигателя на средних оборотах при прогреве.',
    assignedMechanic: 'Алексей Сидоров', status: 'in_progress',
    createdAt: '2026-03-05T14:31:00', updatedAt: '2026-03-05T16:00:00',
  },
  {
    id: 'i3', vehicleId: 'v7', sessionId: 's3', severity: 'medium',
    description: 'Подозрение на начальные признаки детонации (54%). Рекомендуется проверка качества топлива и состояния свечей.',
    assignedMechanic: 'Дмитрий Козлов', status: 'in_progress',
    createdAt: '2026-03-05T10:02:00', updatedAt: '2026-03-05T12:30:00',
  },
  {
    id: 'i4', vehicleId: 'v5', sessionId: 's4', severity: 'high',
    description: 'Подозрение на детонацию (58%) под нагрузкой. Возможно требуется проверка системы питания и зажигания.',
    assignedMechanic: 'Иван Петров', status: 'in_progress',
    createdAt: '2026-03-04T16:46:00', updatedAt: '2026-03-05T09:00:00',
  },
  {
    id: 'i5', vehicleId: 'v3', sessionId: 's9', severity: 'critical',
    description: 'Критическая вероятность детонации (87%). Двигатель требовал немедленного осмотра.',
    assignedMechanic: 'Иван Петров', status: 'resolved',
    createdAt: '2026-02-28T13:02:00', updatedAt: '2026-03-02T11:00:00',
    conclusion: 'Проведена чистка форсунок, замена свечей зажигания и датчика детонации. Двигатель работает в штатном режиме.',
  },
];

export const weeklyChartData = [
  { day: 'Пн', normal: 2, suspicious: 0, critical: 0 },
  { day: 'Вт', normal: 1, suspicious: 1, critical: 0 },
  { day: 'Ср', normal: 3, suspicious: 1, critical: 1 },
  { day: 'Чт', normal: 1, suspicious: 1, critical: 0 },
  { day: 'Пт', normal: 2, suspicious: 0, critical: 0 },
  { day: 'Сб', normal: 0, suspicious: 1, critical: 1 },
  { day: 'Вс', normal: 1, suspicious: 1, critical: 0 },
];
