from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'sessions', views.GameSessionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('games/generate/', views.generate_game, name='generate-game'),
    path('games/decline-check/', views.decline_check, name='decline-check'),
]
