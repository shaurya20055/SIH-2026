from django.contrib import admin
from .models import GameSession

@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ['patient', 'game_type', 'score', 'accuracy', 'stars', 'xp_earned', 'played_at']
    list_filter = ['game_type', 'played_at']
