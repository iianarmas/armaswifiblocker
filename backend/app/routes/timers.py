from flask import Blueprint, request, jsonify
from ..utils.auth import require_api_key
from ..services import timer_manager

bp = Blueprint('timers', __name__, url_prefix='/api/timers')


@bp.route('', methods=['POST'])
@require_api_key
def set_timer():
    """Set a time limit for a device."""
    try:
        data = request.get_json()
        mac = data.get('mac')
        minutes = data.get('minutes')

        if not mac:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_MAC',
                    'message': 'MAC address is required'
                }
            }), 400

        if not minutes or not isinstance(minutes, (int, float)) or minutes <= 0:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_MINUTES',
                    'message': 'Minutes must be a positive number'
                }
            }), 400

        timer = timer_manager.set_timer(mac, int(minutes))

        return jsonify({
            'success': True,
            'data': {'timer': timer}
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
                'code': 'TIMER_FAILED',
                'message': str(e)
            }
        }), 500


@bp.route('/<mac>', methods=['GET'])
@require_api_key
def get_timer(mac):
    """Get active timer for a device."""
    try:
        timer = timer_manager.get_timer(mac)

        return jsonify({
            'success': True,
            'data': {'timer': timer}
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ERROR',
                'message': str(e)
            }
        }), 500


@bp.route('/<mac>', methods=['DELETE'])
@require_api_key
def cancel_timer(mac):
    """Cancel timer for a device."""
    try:
        result = timer_manager.cancel_timer(mac)

        return jsonify({
            'success': True,
            'data': {
                'mac': mac.upper(),
                'cancelled': result
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


@bp.route('', methods=['GET'])
@require_api_key
def list_timers():
    """List all active timers."""
    try:
        timers = timer_manager.get_all_timers()

        return jsonify({
            'success': True,
            'data': {
                'timers': timers,
                'count': len(timers)
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
