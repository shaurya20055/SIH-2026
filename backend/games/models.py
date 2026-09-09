from django.db import models
from patients.models import Patient


class GameSession(models.Model):
    """Records a single game play session."""
    GAME_TYPES = [
        ('face_recall', 'Face Recall'),
        ('flip_card', 'Flip Card'),
        ('sound_match', 'Sound Match'),
        ('daily_routine', 'Daily Routine'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='game_sessions')
    game_type = models.CharField(max_length=30, choices=GAME_TYPES)
    score = models.IntegerField(default=0)
    accuracy = models.FloatField(default=0)  # 0-100
    duration_seconds = models.IntegerField(default=0)
    difficulty_level = models.IntegerField(default=1)
    stars = models.IntegerField(default=0)  # 1-3 stars rating
    xp_earned = models.IntegerField(default=0)
    played_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-played_at']

    def __str__(self):
        return f"{self.patient.name} - {self.game_type} - Score: {self.score}"

    def calculate_stars(self):
        """Calculate star rating based on accuracy."""
        if self.accuracy >= 90:
            return 3
        elif self.accuracy >= 60:
            return 2
        elif self.accuracy >= 30:
            return 1
        return 0

    def calculate_xp(self):
        """Calculate XP earned from this session."""
        base_xp = 10
        accuracy_bonus = int(self.accuracy / 10)
        difficulty_bonus = self.difficulty_level * 5
        return base_xp + accuracy_bonus + difficulty_bonus
