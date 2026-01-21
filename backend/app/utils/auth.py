from functools import wraps
from flask import request, jsonify
from ..config import Config


def require_api_key(f):
    """Decorator to require API key authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')

        if not api_key:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_API_KEY',
                    'message': 'API key required. Include X-API-Key header.'
                }
            }), 401

        if api_key != Config.API_KEY:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_API_KEY',
                    'message': 'Invalid API key.'
                }
            }), 403

        return f(*args, **kwargs)
    return decorated
