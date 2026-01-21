import subprocess
import re
import json
import os
from ..config import Config


class DeviceScanner:
    def __init__(self):
        self.network_range = Config.NETWORK_RANGE
        self.interface = Config.NETWORK_INTERFACE
        self.data_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
        self.devices_file = os.path.join(self.data_dir, 'devices.json')
        self._ensure_data_dir()

    def _ensure_data_dir(self):
        """Ensure data directory exists."""
        os.makedirs(self.data_dir, exist_ok=True)
        if not os.path.exists(self.devices_file):
            self._save_known_devices({})

    def _load_known_devices(self):
        """Load known devices with custom names."""
        try:
            with open(self.devices_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}

    def _save_known_devices(self, devices):
        """Save known devices to file."""
        with open(self.devices_file, 'w') as f:
            json.dump(devices, f, indent=2)

    def scan_network(self):
        """Scan network for connected devices using arp-scan."""
        devices = []

        # Try arp-scan first (faster and more reliable)
        try:
            cmd = ['sudo', 'arp-scan', '--interface', self.interface, self.network_range]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

            if result.returncode == 0:
                devices = self._parse_arp_scan(result.stdout)
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass

        # Fallback to arp table if arp-scan fails
        if not devices:
            devices = self._get_arp_table()

        # Deduplicate by MAC address (keep first occurrence)
        seen_macs = set()
        unique_devices = []
        for device in devices:
            mac = device['mac'].upper()
            if mac not in seen_macs:
                seen_macs.add(mac)
                unique_devices.append(device)

        # Merge with known device names (custom names take priority)
        known = self._load_known_devices()
        for device in unique_devices:
            mac = device['mac'].upper()
            if mac in known and known[mac].get('name'):
                device['name'] = known[mac]['name']

        return unique_devices

    def _parse_arp_scan(self, output):
        """Parse arp-scan output."""
        devices = []
        seen_macs = set()
        mac_pattern = re.compile(r'([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}')
        ip_pattern = re.compile(r'\d+\.\d+\.\d+\.\d+')

        for line in output.split('\n'):
            # Skip duplicate lines marked by arp-scan
            if 'DUP:' in line:
                continue

            mac_match = mac_pattern.search(line)
            ip_match = ip_pattern.search(line)

            if mac_match and ip_match:
                mac = mac_match.group(0).upper()

                # Skip if we've already seen this MAC
                if mac in seen_macs:
                    continue
                seen_macs.add(mac)

                # Extract vendor info if present
                parts = line.split('\t')
                vendor = parts[2].strip() if len(parts) > 2 else 'Unknown'

                devices.append({
                    'mac': mac,
                    'ip': ip_match.group(0),
                    'name': vendor if vendor != '(Unknown)' else 'Unknown',
                    'vendor': vendor
                })

        return devices

    def _get_arp_table(self):
        """Get devices from ARP table as fallback."""
        devices = []
        cmd = ['arp', '-a']
        result = subprocess.run(cmd, capture_output=True, text=True)

        mac_pattern = re.compile(r'([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}')
        ip_pattern = re.compile(r'\d+\.\d+\.\d+\.\d+')

        for line in result.stdout.split('\n'):
            mac_match = mac_pattern.search(line)
            ip_match = ip_pattern.search(line)

            if mac_match and ip_match:
                devices.append({
                    'mac': mac_match.group(0).upper(),
                    'ip': ip_match.group(0),
                    'name': 'Unknown',
                    'vendor': 'Unknown'
                })

        return devices

    def get_device(self, mac):
        """Get info for a specific device."""
        mac = mac.upper().replace('-', ':')
        devices = self.scan_network()

        for device in devices:
            if device['mac'] == mac:
                return device

        # Device not found in scan, check known devices
        known = self._load_known_devices()
        if mac in known:
            return {
                'mac': mac,
                'ip': 'Unknown',
                'name': known[mac].get('name', 'Unknown'),
                'vendor': 'Unknown',
                'online': False
            }

        return None

    def set_device_name(self, mac, name):
        """Set a custom name for a device."""
        mac = mac.upper().replace('-', ':')
        known = self._load_known_devices()
        known[mac] = {'name': name}
        self._save_known_devices(known)
        return True
