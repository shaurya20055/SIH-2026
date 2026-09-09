from django.db import models
from patients.models import Patient


class Reminder(models.Model):
    """Reminders for medicine, hydration, activities, appointments."""
    TYPES = [
        ('medicine', 'Medicine'),
        ('hydration', 'Hydration'),
        ('appointment', 'Appointment'),
        ('activity', 'Activity'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='reminders')
    reminder_type = models.CharField(max_length=20, choices=TYPES)
    label = models.CharField(max_length=200)
    scheduled_time = models.TimeField()
    voice_clip_url = models.URLField(blank=True)
    is_done = models.BooleanField(default=False)
    is_recurring = models.BooleanField(default=True)
    days_of_week = models.CharField(max_length=50, default='mon,tue,wed,thu,fri,sat,sun')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['scheduled_time']

    def __str__(self):
        return f"{self.patient.name} - {self.label} at {self.scheduled_time}"
