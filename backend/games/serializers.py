from rest_framework import serializers
from .models import GameSession


class GameSessionSerializer(serializers.ModelSerializer):
    stars = serializers.ReadOnlyField(source='calculate_stars')
    xp_earned = serializers.ReadOnlyField(source='calculate_xp')

    class Meta:
        model = GameSession
        fields = '__all__'
