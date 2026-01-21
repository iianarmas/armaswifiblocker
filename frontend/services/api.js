import { getApiUrl, getApiKey } from './storage';

class ApiService {
  async request(endpoint, options = {}) {
    const apiUrl = await getApiUrl();
    const apiKey = await getApiKey();
    const url = `${apiUrl}${endpoint}`;

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Check your connection and server URL.');
      }
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    return this.request('/api/health');
  }

  // Device endpoints
  async getDevices() {
    return this.request('/api/devices');
  }

  async getDevice(mac) {
    return this.request(`/api/devices/${encodeURIComponent(mac)}`);
  }

  async setDeviceName(mac, name) {
    return this.request(`/api/devices/${encodeURIComponent(mac)}/name`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async scanNetwork() {
    return this.request('/api/scan');
  }

  // Control endpoints
  async blockDevice(mac) {
    return this.request('/api/control/block', {
      method: 'POST',
      body: JSON.stringify({ mac }),
    });
  }

  async unblockDevice(mac) {
    return this.request('/api/control/unblock', {
      method: 'POST',
      body: JSON.stringify({ mac }),
    });
  }

  async getBlockStatus(mac) {
    return this.request(`/api/control/status/${encodeURIComponent(mac)}`);
  }

  async getBlockedDevices() {
    return this.request('/api/control/blocked');
  }

  // Timer endpoints
  async setTimer(mac, minutes) {
    return this.request('/api/timers', {
      method: 'POST',
      body: JSON.stringify({ mac, minutes }),
    });
  }

  async getTimer(mac) {
    return this.request(`/api/timers/${encodeURIComponent(mac)}`);
  }

  async cancelTimer(mac) {
    return this.request(`/api/timers/${encodeURIComponent(mac)}`, {
      method: 'DELETE',
    });
  }

  async getAllTimers() {
    return this.request('/api/timers');
  }
}

export default new ApiService();
