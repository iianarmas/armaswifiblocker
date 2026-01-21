from flask import Blueprint, request, jsonify
from ..utils.auth import require_api_key
from ..services import wifi_controller, timer_manager

bp = Blueprint('control', __name__, url_prefix='/api/control')


@bp.route('/block', methods=['POST'])
@require_api_key
def block_device():
    """Block a device's internet access."""
    try:
        data = request.get_json()
        mac = data.get('mac')

        if not mac:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_MAC',
                    'message': 'MAC address is required'
                }
            }), 400

        # Cancel any active timer for this device
        timer_manager.cancel_timer(mac)

        result = wifi_controller.block_mac(mac)

        return jsonify({
            'success': True,
            'data': {
                'mac': mac.upper(),
                'blocked': True
            }
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
                'code': 'BLOCK_FAILED',
                'message': str(e)
            }
        }), 500


@bp.route('/unblock', methods=['POST'])
@require_api_key
def unblock_device():
    """Unblock a device's internet access."""
    try:
        data = request.get_json()
        mac = data.get('mac')

        if not mac:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_MAC',
                    'message': 'MAC address is required'
                }
            }), 400

        # Cancel any active timer for this device
        timer_manager.cancel_timer(mac)

        result = wifi_controller.unblock_mac(mac)

        return jsonify({
            'success': True,
            'data': {
                'mac': mac.upper(),
                'blocked': False
            }
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
                'code': 'UNBLOCK_FAILED',
                'message': str(e)
            }
        }), 500


@bp.route('/status/<mac>', methods=['GET'])
@require_api_key
def get_status(mac):
    """Check if a device is blocked."""
    try:
        blocked = wifi_controller.is_blocked(mac)

        return jsonify({
            'success': True,
            'data': {
                'mac': mac.upper(),
                'blocked': blocked
            }
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


@bp.route('/blocked', methods=['GET'])
@require_api_key
def list_blocked():
    """List all blocked MAC addresses."""
    try:
        blocked = wifi_controller.get_blocked_macs()

        return jsonify({
            'success': True,
            'data': {
                'blocked': blocked,
                'count': len(blocked)
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
