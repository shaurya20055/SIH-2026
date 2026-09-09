"""
Seed script to populate the database with demo data.
Run: python manage.py shell < seed_data.py
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'memorymirror.settings')
django.setup()

from django.contrib.auth.models import User
from patients.models import UserProfile, Patient, MemoryItem, MoodLog
from games.models import GameSession
from reminders.models import Reminder
from datetime import time, timedelta
from django.utils import timezone
import random

print("🌱 Seeding Memory Mirror database...")

# ─── Create Users ────────────────────────────────────────────────
admin_user, _ = User.objects.get_or_create(username='admin', defaults={
    'email': 'admin@memorymirror.com', 'first_name': 'Admin', 'last_name': 'User', 'is_staff': True, 'is_superuser': True,
})
admin_user.set_password('admin123')
admin_user.save()
UserProfile.objects.get_or_create(user=admin_user, defaults={'role': 'admin'})

caregiver_user, _ = User.objects.get_or_create(username='priya', defaults={
    'email': 'priya@example.com', 'first_name': 'Priya', 'last_name': 'Sharma',
})
caregiver_user.set_password('care123')
caregiver_user.save()
UserProfile.objects.get_or_create(user=caregiver_user, defaults={'role': 'caregiver'})

doctor_user, _ = User.objects.get_or_create(username='dr_borah', defaults={
    'email': 'borah@hospital.com', 'first_name': 'Ananya', 'last_name': 'Borah',
})
doctor_user.set_password('doc123')
doctor_user.save()
UserProfile.objects.get_or_create(user=doctor_user, defaults={'role': 'doctor'})

patient_user, _ = User.objects.get_or_create(username='kamala_devi', defaults={
    'email': 'kamala@example.com', 'first_name': 'Kamala', 'last_name': 'Devi',
})
patient_user.set_password('patient123')
patient_user.save()
UserProfile.objects.get_or_create(user=patient_user, defaults={'role': 'patient'})

print("✅ Users created")

# ─── Create Patient ──────────────────────────────────────────────
patient, _ = Patient.objects.get_or_create(name='Kamala Devi', defaults={
    'user': patient_user,
    'age': 72,
    'language': 'assamese',
    'cognitive_level': 1,
    'caregiver': caregiver_user,
    'doctor': doctor_user,
    'total_xp': 450,
    'current_streak': 3,
    'photo_url': 'https://picsum.photos/seed/kamala/200/200',
})

patient2, _ = Patient.objects.get_or_create(name='Ratan Baruah', defaults={
    'age': 68,
    'language': 'assamese',
    'cognitive_level': 2,
    'caregiver': caregiver_user,
    'doctor': doctor_user,
    'total_xp': 220,
    'current_streak': 1,
    'photo_url': 'https://picsum.photos/seed/ratan/200/200',
})

print("✅ Patients created")

# ─── Personal Memory Items ───────────────────────────────────────
personal_items = [
    {'label': 'Granddaughter Priya', 'label_regional': 'নাতিনী প্ৰিয়া', 'item_type': 'person', 'photo_url': 'https://picsum.photos/seed/priya_photo/400/400', 'story_text': 'Priya visits every Sunday and brings fresh pitha.'},
    {'label': 'Son Rajesh', 'label_regional': 'পুত্ৰ ৰাজেশ', 'item_type': 'person', 'photo_url': 'https://picsum.photos/seed/rajesh_photo/400/400', 'story_text': 'Rajesh works in Guwahati and calls every evening.'},
    {'label': 'Husband Late Mohan', 'label_regional': 'স্বামী মোহন', 'item_type': 'person', 'photo_url': 'https://picsum.photos/seed/mohan_photo/400/400', 'story_text': 'Mohan loved gardening and Bihu songs.'},
    {'label': 'Village Home', 'label_regional': 'গাঁৱৰ ঘৰ', 'item_type': 'place', 'photo_url': 'https://picsum.photos/seed/village_home/400/400', 'story_text': 'Our home in Jorhat with the big mango tree.'},
    {'label': 'Temple', 'label_regional': 'মন্দিৰ', 'item_type': 'place', 'photo_url': 'https://picsum.photos/seed/temple/400/400', 'story_text': 'The Shiva temple near the river.'},
    {'label': 'Wedding Day', 'label_regional': 'বিয়াৰ দিন', 'item_type': 'event', 'photo_url': 'https://picsum.photos/seed/wedding_day/400/400', 'story_text': 'Our wedding was during Bihu season in 1978.'},
]

for item_data in personal_items:
    MemoryItem.objects.get_or_create(
        patient=patient, label=item_data['label'],
        defaults=item_data
    )

# ─── Cultural Garden Items ───────────────────────────────────────
cultural_items = [
    {'label': 'Bihu Festival', 'label_regional': 'বিহু উৎসৱ', 'item_type': 'event', 'photo_url': 'https://picsum.photos/seed/bihu/400/400', 'is_cultural': True},
    {'label': 'Kaziranga Rhino', 'label_regional': 'কাজিৰঙাৰ গঁড়', 'item_type': 'object', 'photo_url': 'https://picsum.photos/seed/kaziranga/400/400', 'is_cultural': True},
    {'label': 'Hornbill Festival', 'label_regional': 'হৰ্ণবিল উৎসৱ', 'item_type': 'event', 'photo_url': 'https://picsum.photos/seed/hornbill/400/400', 'is_cultural': True},
    {'label': 'Loktak Lake', 'label_regional': 'লোকটক লেক', 'item_type': 'place', 'photo_url': 'https://picsum.photos/seed/loktak/400/400', 'is_cultural': True},
    {'label': 'Mekhela Chador', 'label_regional': 'মেখেলা চাদৰ', 'item_type': 'object', 'photo_url': 'https://picsum.photos/seed/mekhela/400/400', 'is_cultural': True},
    {'label': 'Gamocha', 'label_regional': 'গামোচা', 'item_type': 'object', 'photo_url': 'https://picsum.photos/seed/gamocha/400/400', 'is_cultural': True},
    {'label': 'Dhol Drum', 'label_regional': 'ঢোল', 'item_type': 'object', 'photo_url': 'https://picsum.photos/seed/dhol/400/400', 'is_cultural': True},
    {'label': 'Jaapi Hat', 'label_regional': 'জাপি', 'item_type': 'object', 'photo_url': 'https://picsum.photos/seed/jaapi/400/400', 'is_cultural': True},
    {'label': 'Assam Tea Garden', 'label_regional': 'অসম চাহ বাগিচা', 'item_type': 'place', 'photo_url': 'https://picsum.photos/seed/teagarden/400/400', 'is_cultural': True},
    {'label': 'Bamboo Forest', 'label_regional': 'বাঁহনি', 'item_type': 'place', 'photo_url': 'https://picsum.photos/seed/bambooforest/400/400', 'is_cultural': True},
    {'label': 'Pitha Rice Cake', 'label_regional': 'পিঠা', 'item_type': 'object', 'photo_url': 'https://picsum.photos/seed/pitha/400/400', 'is_cultural': True},
    {'label': 'Fish Curry', 'label_regional': 'মাছৰ জোল', 'item_type': 'object', 'photo_url': 'https://picsum.photos/seed/fishcurry/400/400', 'is_cultural': True},
]

for item_data in cultural_items:
    MemoryItem.objects.get_or_create(
        patient=patient, label=item_data['label'],
        defaults=item_data
    )

print("✅ Memory items created")

# ─── Demo Game Sessions ──────────────────────────────────────────
game_types = ['face_recall', 'flip_card', 'sound_match', 'daily_routine']
now = timezone.now()

for i in range(20):
    gt = random.choice(game_types)
    acc = random.uniform(30, 95)
    session = GameSession.objects.create(
        patient=patient,
        game_type=gt,
        score=random.randint(10, 100),
        accuracy=round(acc, 1),
        duration_seconds=random.randint(30, 300),
        difficulty_level=patient.cognitive_level,
        stars=3 if acc >= 90 else (2 if acc >= 60 else 1),
        xp_earned=random.randint(15, 40),
    )
    # Backdate the played_at
    session.played_at = now - timedelta(days=20 - i, hours=random.randint(8, 18))
    session.save(update_fields=['played_at'])

print("✅ Game sessions created")

# ─── Mood Logs ───────────────────────────────────────────────────
for i in range(14):
    mood = MoodLog.objects.create(
        patient=patient,
        mood_score=random.randint(2, 5),
    )
    mood.logged_at = now - timedelta(days=14 - i)
    mood.save(update_fields=['logged_at'])

print("✅ Mood logs created")

# ─── Reminders ───────────────────────────────────────────────────
reminders_data = [
    {'reminder_type': 'medicine', 'label': 'Morning Medicine - Donepezil', 'scheduled_time': time(8, 0)},
    {'reminder_type': 'hydration', 'label': 'Drink Water 💧', 'scheduled_time': time(10, 0)},
    {'reminder_type': 'activity', 'label': 'Morning Walk 🚶', 'scheduled_time': time(7, 0)},
    {'reminder_type': 'medicine', 'label': 'Afternoon Medicine', 'scheduled_time': time(14, 0)},
    {'reminder_type': 'hydration', 'label': 'Drink Water 💧', 'scheduled_time': time(16, 0)},
    {'reminder_type': 'medicine', 'label': 'Night Medicine - Melatonin', 'scheduled_time': time(21, 0)},
    {'reminder_type': 'appointment', 'label': 'Dr. Borah - Monthly Checkup', 'scheduled_time': time(11, 0)},
    {'reminder_type': 'activity', 'label': 'Evening Prayer 🙏', 'scheduled_time': time(18, 0)},
]

for r in reminders_data:
    Reminder.objects.get_or_create(
        patient=patient, label=r['label'],
        defaults=r
    )

print("✅ Reminders created")
print("\n🎉 Seeding complete!")
print("─" * 40)
print("Login credentials:")
print("  Admin:     admin / admin123")
print("  Caregiver: priya / care123")
print("  Doctor:    dr_borah / doc123")
print("  Patient:   kamala_devi / patient123")
print("─" * 40)
