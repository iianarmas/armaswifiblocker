import subprocess
import re


class WifiController:
    def __init__(self):
        self.mac_pattern = re.compile(r'^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$')

    def validate_mac(self, mac):
        """Validate and normalize MAC address format."""
        mac = mac.upper().replace('-', ':')
        if not self.mac_pattern.match(mac):
            raise ValueError(f'Invalid MAC address: {mac}')
        return mac

    def block_mac(self, mac):
        """Block a MAC address using iptables."""
        mac = self.validate_mac(mac)

        # Check if already blocked
        if self.is_blocked(mac):
            return True

        cmd = [
            'sudo', 'iptables', '-I', 'FORWARD',
            '-m', 'mac', '--mac-source', mac,
            '-j', 'DROP'
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.returncode == 0

    def unblock_mac(self, mac):
        """Remove iptables block for a MAC address."""
        mac = self.validate_mac(mac)

        # Remove all matching rules (in case of duplicates)
        while self.is_blocked(mac):
            cmd = [
                'sudo', 'iptables', '-D', 'FORWARD',
                '-m', 'mac', '--mac-source', mac,
                '-j', 'DROP'
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                break

        return not self.is_blocked(mac)

    def is_blocked(self, mac):
        """Check if a MAC address is currently blocked."""
        mac = self.validate_mac(mac)
        cmd = ['sudo', 'iptables', '-L', 'FORWARD', '-n']
        result = subprocess.run(cmd, capture_output=True, text=True)
        return mac.upper() in result.stdout.upper()

    def get_blocked_macs(self):
        """Get list of all blocked MAC addresses."""
        cmd = ['sudo', 'iptables', '-L', 'FORWARD', '-n']
        result = subprocess.run(cmd, capture_output=True, text=True)

        blocked = []
        for line in result.stdout.split('\n'):
            # Look for MAC addresses in DROP rules
            if 'DROP' in line and 'MAC' in line:
                match = re.search(r'([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}', line)
                if match:
                    blocked.append(match.group(0).upper())

        return list(set(blocked))  # Remove duplicates
