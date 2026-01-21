import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useDevices(autoRefresh = true, refreshInterval = 30000) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDevices = useCallback(async () => {
    try {
      setError(null);
      const result = await api.getDevices();
      setDevices(result.data.devices || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchDevices();
  }, [fetchDevices]);

  const scanNetwork = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.scanNetwork();
      setDevices(result.data.devices || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchDevices, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchDevices, autoRefresh, refreshInterval]);

  return {
    devices,
    loading,
    error,
    refresh,
    scanNetwork,
  };
}
