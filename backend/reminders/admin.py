from django.contrib import admin
from .models import Reminder

@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ['patient', 'reminder_type', 'label', 'scheduled_time', 'is_done']
    list_filter = ['reminder_type', 'is_done']
