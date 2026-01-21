from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.triggers.date import DateTrigger
from datetime import datetime, timedelta
import logging

logging.basicConfig()
logging.getLogger('apscheduler').setLevel(logging.WARNING)


class TimerManager:
    def __init__(self, wifi_controller):
        self.wifi_controller = wifi_controller
        self.scheduler = BackgroundScheduler(
            jobstores={'default': MemoryJobStore()}
        )
        self.scheduler.start()

    def _mac_to_job_id(self, mac):
        """Convert MAC address to valid job ID."""
        return f"timer_{mac.replace(':', '_').upper()}"

    def _job_id_to_mac(self, job_id):
        """Convert job ID back to MAC address."""
        return job_id.replace('timer_', '').replace('_', ':')

    def set_timer(self, mac, minutes):
        """Set a timer to block a device after specified minutes."""
        mac = mac.upper().replace('-', ':')

        # Cancel existing timer if any
        self.cancel_timer(mac)

        expires_at = datetime.now() + timedelta(minutes=minutes)
        job_id = self._mac_to_job_id(mac)

        self.scheduler.add_job(
            func=self._on_timer_expire,
            trigger=DateTrigger(run_date=expires_at),
            args=[mac],
            id=job_id,
            replace_existing=True
        )

        return {
            'mac': mac,
            'minutes': minutes,
            'expires_at': expires_at.isoformat(),
            'remaining_seconds': minutes * 60
        }

    def cancel_timer(self, mac):
        """Cancel a timer for a device."""
        mac = mac.upper().replace('-', ':')
        job_id = self._mac_to_job_id(mac)

        try:
            self.scheduler.remove_job(job_id)
            return True
        except Exception:
            return False

    def get_timer(self, mac):
        """Get active timer info for a device."""
        mac = mac.upper().replace('-', ':')
        job_id = self._mac_to_job_id(mac)

        job = self.scheduler.get_job(job_id)
        if job and job.next_run_time:
            remaining = (job.next_run_time.replace(tzinfo=None) - datetime.now()).total_seconds()
            return {
                'mac': mac,
                'expires_at': job.next_run_time.isoformat(),
                'remaining_seconds': max(0, int(remaining))
            }
        return None

    def get_all_timers(self):
        """Get all active timers."""
        timers = []
        for job in self.scheduler.get_jobs():
            if job.id.startswith('timer_') and job.next_run_time:
                mac = self._job_id_to_mac(job.id)
                remaining = (job.next_run_time.replace(tzinfo=None) - datetime.now()).total_seconds()
                timers.append({
                    'mac': mac,
                    'expires_at': job.next_run_time.isoformat(),
                    'remaining_seconds': max(0, int(remaining))
                })
        return timers

    def _on_timer_expire(self, mac):
        """Called when a timer expires - blocks the device."""
        print(f"Timer expired for {mac}, blocking device...")
        self.wifi_controller.block_mac(mac)
