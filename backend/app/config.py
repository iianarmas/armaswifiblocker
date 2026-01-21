import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    API_KEY = os.getenv('API_KEY', 'change-this-to-a-secure-random-key')
    NETWORK_RANGE = os.getenv('NETWORK_RANGE', '192.168.100.0/24')
    NETWORK_INTERFACE = os.getenv('NETWORK_INTERFACE', 'eth0')
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')
