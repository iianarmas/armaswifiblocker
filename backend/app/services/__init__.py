from .wifi_control import WifiController
from .device_scanner import DeviceScanner
from .timer_manager import TimerManager

# Shared service instances
wifi_controller = WifiController()
device_scanner = DeviceScanner()
timer_manager = TimerManager(wifi_controller)
