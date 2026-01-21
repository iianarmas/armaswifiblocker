from app import create_app
from app.config import Config

app = create_app()

if __name__ == '__main__':
    print(f"Starting Armas WiFi Control API on {Config.HOST}:{Config.PORT}")
    print(f"Network range: {Config.NETWORK_RANGE}")
    print(f"Interface: {Config.NETWORK_INTERFACE}")
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )
