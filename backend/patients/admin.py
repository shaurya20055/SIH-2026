from django.contrib import admin
from .models import UserProfile, Patient, MemoryItem, MoodLog, SocialGreeting, Prescription

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'created_at']

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['name', 'age', 'language', 'cognitive_level', 'total_xp', 'current_streak']

@admin.register(MemoryItem)
class MemoryItemAdmin(admin.ModelAdmin):
    list_display = ['label', 'patient', 'item_type', 'is_cultural']

@admin.register(MoodLog)
class MoodLogAdmin(admin.ModelAdmin):
    list_display = ['patient', 'mood_score', 'logged_at']

@admin.register(SocialGreeting)
class SocialGreetingAdmin(admin.ModelAdmin):
    list_display = ['sender', 'receiver', 'card_type', 'sent_at']

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'created_at']
