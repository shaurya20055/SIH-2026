from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """Extended user profile with role information."""
    ROLE_CHOICES = [
        ('patient', 'Patient'),
        ('caregiver', 'Caregiver'),
        ('doctor', 'Doctor'),
        ('admin', 'Admin'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    phone = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class Patient(models.Model):
    """Patient model for elderly dementia patients."""
    LANGUAGE_CHOICES = [
        ('english', 'English'),
        ('assamese', 'Assamese'),
        ('bengali', 'Bengali'),
        ('hindi', 'Hindi'),
        ('meitei', 'Meitei'),
    ]
    COGNITIVE_LEVELS = [
        (1, 'Mild'),
        (2, 'Moderate'),
        (3, 'Hard'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile', null=True, blank=True)
    name = models.CharField(max_length=100)
    age = models.IntegerField(default=65)
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, default='english')
    cognitive_level = models.IntegerField(choices=COGNITIVE_LEVELS, default=1)
    caregiver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='patients_as_caregiver')
    doctor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='patients_as_doctor')
    photo_url = models.URLField(blank=True)
    total_xp = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    last_played = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (Age: {self.age})"

    @property
    def level(self):
        """Memory Champion level based on XP."""
        if self.total_xp >= 5000:
            return 5
        elif self.total_xp >= 2000:
            return 4
        elif self.total_xp >= 800:
            return 3
        elif self.total_xp >= 300:
            return 2
        return 1

    @property
    def level_title(self):
        titles = {1: 'Beginner', 2: 'Explorer', 3: 'Champion', 4: 'Master', 5: 'Legend'}
        return titles.get(self.level, 'Beginner')


class MemoryItem(models.Model):
    """Memory bank item — personal photos, voices, stories."""
    ITEM_TYPES = [
        ('person', 'Person'),
        ('place', 'Place'),
        ('event', 'Event'),
        ('object', 'Object'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='memory_items')
    photo_url = models.URLField(blank=True)
    photo = models.ImageField(upload_to='memory_photos/', blank=True, null=True)
    label = models.CharField(max_length=100)
    label_regional = models.CharField(max_length=100, blank=True)
    audio_url = models.URLField(blank=True)
    story_text = models.TextField(blank=True)
    item_type = models.CharField(max_length=20, choices=ITEM_TYPES, default='person')
    is_cultural = models.BooleanField(default=False)  # True for Cultural Garden items
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.label} ({self.item_type}) - {self.patient.name}"


class MoodLog(models.Model):
    """Daily mood tracking for emotional engagement."""
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='mood_logs')
    mood_score = models.IntegerField()  # 1(sad) to 5(happy)
    notes = models.TextField(blank=True)
    logged_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.name} - Mood: {self.mood_score}"


class SocialGreeting(models.Model):
    """Social greetings between patients."""
    CARD_TYPES = [
        ('good_morning', '🌅 Good Morning'),
        ('namaste', '🙏 Namaste'),
        ('thinking_of_you', '💭 Thinking of You'),
        ('get_well', '💐 Get Well Soon'),
        ('congratulations', '🎉 Congratulations'),
        ('happy_bihu', '🎊 Happy Bihu'),
    ]

    sender = models.ForeignKey(Patient, related_name='sent_greetings', on_delete=models.CASCADE)
    receiver = models.ForeignKey(Patient, related_name='received_greetings', on_delete=models.CASCADE)
    card_type = models.CharField(max_length=50, choices=CARD_TYPES)
    message = models.TextField(blank=True)
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.name} → {self.receiver.name}: {self.card_type}"


class Prescription(models.Model):
    """Doctor prescriptions for patients."""
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='written_prescriptions')
    notes = models.TextField()
    diagnosis = models.TextField(blank=True)
    medications = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rx for {self.patient.name} by Dr. {self.doctor.username}"
