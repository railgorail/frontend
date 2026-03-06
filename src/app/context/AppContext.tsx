import React, { createContext, useContext, useState } from 'react';
import {
  Vehicle, DiagnosticSession, Incident,
  initialVehicles, initialSessions, initialIncidents,
  IncidentStatus, VehicleStatus
} from '../data/mockData';

interface AppContextType {
  vehicles: Vehicle[];
  sessions: DiagnosticSession[];
  incidents: Incident[];
  addVehicle: (v: Omit<Vehicle, 'id' | 'status'>) => void;
  updateVehicle: (id: string, v: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addSession: (s: Omit<DiagnosticSession, 'id' | 'analyzedAt'>) => DiagnosticSession;
  addIncident: (i: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIncident: (id: string, data: Partial<Incident>) => void;
  getVehicle: (id: string) => Vehicle | undefined;
  getVehicleSessions: (vehicleId: string) => DiagnosticSession[];
  getVehicleIncidents: (vehicleId: string) => Incident[];
  getSession: (id: string) => DiagnosticSession | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

let nextVehicleId = 9;
let nextSessionId = 11;
let nextIncidentId = 6;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [sessions, setSessions] = useState<DiagnosticSession[]>(initialSessions);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);

  const addVehicle = (v: Omit<Vehicle, 'id' | 'status'>) => {
    const newVehicle: Vehicle = { ...v, id: `v${nextVehicleId++}`, status: 'ok' };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const updateVehicle = (id: string, data: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const addSession = (s: Omit<DiagnosticSession, 'id' | 'analyzedAt'>): DiagnosticSession => {
    const newSession: DiagnosticSession = {
      ...s,
      id: `s${nextSessionId++}`,
      analyzedAt: new Date().toISOString(),
    };
    setSessions(prev => [newSession, ...prev]);

    // Update vehicle status if needed
    if (newSession.status === 'critical') {
      setVehicles(prev => prev.map(v => v.id === newSession.vehicleId ? { ...v, status: 'critical' } : v));
    } else if (newSession.status === 'suspicious') {
      setVehicles(prev => prev.map(v => {
        if (v.id !== newSession.vehicleId) return v;
        if (v.status === 'critical') return v;
        return { ...v, status: 'warning' };
      }));
    }

    return newSession;
  };

  const addIncident = (i: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newIncident: Incident = { ...i, id: `i${nextIncidentId++}`, createdAt: now, updatedAt: now };
    setIncidents(prev => [newIncident, ...prev]);
  };

  const updateIncident = (id: string, data: Partial<Incident>) => {
    setIncidents(prev => prev.map(i => {
      if (i.id !== id) return i;
      const updated = { ...i, ...data, updatedAt: new Date().toISOString() };
      return updated;
    }));

    // If resolved, recalculate vehicle status
    if (data.status === 'resolved') {
      const incident = incidents.find(i => i.id === id);
      if (incident) {
        const vehicleIncidents = incidents.filter(i => i.vehicleId === incident.vehicleId && i.id !== id);
        const remaining = vehicleIncidents.filter(i => i.status !== 'resolved');
        let newStatus: VehicleStatus = 'ok';
        if (remaining.some(i => i.severity === 'critical')) newStatus = 'critical';
        else if (remaining.length > 0) newStatus = 'warning';
        setVehicles(prev => prev.map(v => v.id === incident.vehicleId ? { ...v, status: newStatus } : v));
      }
    }
  };

  const getVehicle = (id: string) => vehicles.find(v => v.id === id);
  const getVehicleSessions = (vehicleId: string) => sessions.filter(s => s.vehicleId === vehicleId);
  const getVehicleIncidents = (vehicleId: string) => incidents.filter(i => i.vehicleId === vehicleId);
  const getSession = (id: string) => sessions.find(s => s.id === id);

  return (
    <AppContext.Provider value={{
      vehicles, sessions, incidents,
      addVehicle, updateVehicle, deleteVehicle,
      addSession, addIncident, updateIncident,
      getVehicle, getVehicleSessions, getVehicleIncidents, getSession,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
