from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/patient/<int:patient_id>/', views.patient_dashboard, name='patient-dashboard'),
    path('dashboard/doctor/', views.doctor_patients_summary, name='doctor-dashboard'),
]
