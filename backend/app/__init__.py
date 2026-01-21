from flask import Flask
from flask_cors import CORS
from .config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS
    CORS(app, origins=Config.CORS_ORIGINS.split(','))

    # Register blueprints
    from .routes import devices, control, timers
    app.register_blueprint(devices.bp)
    app.register_blueprint(control.bp)
    app.register_blueprint(timers.bp)

    # Health check endpoint
    @app.route('/api/health')
    def health():
        return {'success': True, 'data': {'status': 'ok'}}

    return app
