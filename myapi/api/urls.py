from django.urls import path
from . import views

urlpatterns = [
    path('download-cf-template/', views.download_cf_template, name='download_cf_template'),
    path('start-scan/', views.start_scan, name='start_scan'),
    path('scan_history/', views.scan_history, name='scan_history'),
    path('scan_detail/<str:scan_id>/', views.scan_detail, name='scan_detail')
]
