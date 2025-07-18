from django.apps import AppConfig
from .stream_handler import stream_output



class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
