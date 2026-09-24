from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'patients', views.PatientViewSet)
router.register(r'memory', views.MemoryItemViewSet)
router.register(r'mood', views.MoodLogViewSet)
router.register(r'greetings', views.SocialGreetingViewSet)
router.register(r'prescriptions', views.PrescriptionViewSet)
router.register(r'appointments', views.AppointmentViewSet)
router.register(r'medicines', views.MedicineViewSet)
router.register(r'daily-tasks', views.DailyCareTaskViewSet)
router.register(r'users', views.UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', views.register_user, name='register'),
    path('auth/me/', views.current_user, name='current-user'),
]
