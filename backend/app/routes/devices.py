from flask import Blueprint, request, jsonify
from ..utils.auth import require_api_key
from ..services import device_scanner, wifi_controller

bp = Blueprint('devices', __name__, url_prefix='/api')


@bp.route('/devices', methods=['GET'])
@require_api_key
def list_devices():
    """List all devices on the network."""
    try:
        devices = device_scanner.scan_network()
        blocked_macs = wifi_controller.get_blocked_macs()

        # Add blocked status to each device
        for device in devices:
            device['blocked'] = device['mac'] in blocked_macs
            device['online'] = True

        return jsonify({
            'success': True,
            'data': {
                'devices': devices,
                'count': len(devices)
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'SCAN_FAILED',
                'message': str(e)
            }
        }), 500


@bp.route('/devices/<mac>', methods=['GET'])
@require_api_key
def get_device(mac):
    """Get info for a specific device."""
    try:
        device = device_scanner.get_device(mac)

        if not device:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'DEVICE_NOT_FOUND',
                    'message': f'Device with MAC {mac} not found'
                }
            }), 404

        device['blocked'] = wifi_controller.is_blocked(mac)

        return jsonify({
            'success': True,
            'data': {'device': device}
        })
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_MAC',
                'message': str(e)
            }
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ERROR',
                'message': str(e)
            }
        }), 500


@bp.route('/devices/<mac>/name', methods=['PUT'])
@require_api_key
def set_device_name(mac):
    """Set a custom name for a device."""
    try:
        data = request.get_json()
        name = data.get('name')

        if not name:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_NAME',
                    'message': 'Device name is required'
                }
            }), 400

        device_scanner.set_device_name(mac, name)

        return jsonify({
            'success': True,
            'data': {
                'mac': mac.upper(),
                'name': name
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ERROR',
                'message': str(e)
            }
        }), 500


@bp.route('/scan', methods=['GET'])
@require_api_key
def force_scan():
    """Force a network rescan."""
    try:
        devices = device_scanner.scan_network()
        blocked_macs = wifi_controller.get_blocked_macs()

        for device in devices:
            device['blocked'] = device['mac'] in blocked_macs
            device['online'] = True

        return jsonify({
            'success': True,
            'data': {
                'devices': devices,
                'count': len(devices)
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'SCAN_FAILED',
                'message': str(e)
            }
        }), 500
