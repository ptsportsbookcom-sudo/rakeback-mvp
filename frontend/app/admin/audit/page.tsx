'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface AuditLog {
  id: string;
  action: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  actor: {
    email: string;
    role: string;
  };
  promotion: {
    name: string;
  } | null;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await api.get('/admin/audit');
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Audit Logs</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {logs.map((log) => (
            <li key={log.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{log.action}</p>
                  <p className="text-sm text-gray-500">
                    Field: {log.field} | Actor: {log.actor.email}
                  </p>
                  {log.promotion && (
                    <p className="text-sm text-gray-500">Promotion: {log.promotion.name}</p>
                  )}
                  {log.oldValue && (
                    <p className="text-xs text-gray-400 mt-1">
                      Old: {log.oldValue.length > 50 ? log.oldValue.substring(0, 50) + '...' : log.oldValue}
                    </p>
                  )}
                  {log.newValue && (
                    <p className="text-xs text-gray-400">
                      New: {log.newValue.length > 50 ? log.newValue.substring(0, 50) + '...' : log.newValue}
                    </p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

