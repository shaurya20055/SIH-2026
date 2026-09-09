from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Avg, Count, Sum
from datetime import timedelta

from patients.models import Patient, MoodLog
from games.models import GameSession
from games.engine import check_cognitive_decline
from reminders.models import Reminder


@api_view(['GET'])
def patient_dashboard(request, patient_id):
    """
    Full dashboard stats for caregiver/doctor view.
    Returns accuracy trends, mood trends, game stats, streak, decline status.
    """
    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=404)

    now = timezone.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    # Accuracy trend (last 30 sessions)
    sessions = GameSession.objects.filter(
        patient_id=patient_id
    ).order_by('played_at')[:30]

    accuracy_trend = [{
        'date': s.played_at.strftime('%Y-%m-%d'),
        'accuracy': s.accuracy,
        'game_type': s.game_type,
        'score': s.score,
    } for s in sessions]

    # Mood trend (last 14 entries)
    moods = MoodLog.objects.filter(
        patient_id=patient_id
    ).order_by('-logged_at')[:14]

    mood_trend = [{
        'date': m.logged_at.strftime('%Y-%m-%d'),
        'score': m.mood_score,
    } for m in reversed(list(moods))]

    # Games played this week
    week_sessions = GameSession.objects.filter(
        patient_id=patient_id,
        played_at__gte=week_ago,
    )
    games_this_week = week_sessions.count()
    avg_accuracy_week = week_sessions.aggregate(avg=Avg('accuracy'))['avg'] or 0

    # Games by type
    games_by_type = GameSession.objects.filter(
        patient_id=patient_id
    ).values('game_type').annotate(
        count=Count('id'),
        avg_accuracy=Avg('accuracy'),
    )

    # Decline check
    decline_status = check_cognitive_decline(patient_id)

    # Today's reminders
    today = now.strftime('%a').lower()[:3]
    reminders_today = Reminder.objects.filter(
        patient_id=patient_id,
        days_of_week__icontains=today,
    ).values('id', 'label', 'reminder_type', 'scheduled_time', 'is_done')

    # Weekly grade
    if avg_accuracy_week >= 90:
        grade = 'A'
    elif avg_accuracy_week >= 75:
        grade = 'B'
    elif avg_accuracy_week >= 55:
        grade = 'C'
    else:
        grade = 'D'

    return Response({
        'patient': {
            'id': patient.id,
            'name': patient.name,
            'age': patient.age,
            'language': patient.language,
            'cognitive_level': patient.cognitive_level,
            'total_xp': patient.total_xp,
            'level': patient.level,
            'level_title': patient.level_title,
            'streak': patient.current_streak,
            'last_played': patient.last_played,
        },
        'accuracy_trend': accuracy_trend,
        'mood_trend': mood_trend,
        'games_this_week': games_this_week,
        'avg_accuracy_week': round(avg_accuracy_week, 1),
        'games_by_type': list(games_by_type),
        'decline_status': decline_status,
        'reminders_today': list(reminders_today),
        'weekly_grade': grade,
    })


@api_view(['GET'])
def doctor_patients_summary(request):
    """Summary of all patients for doctor view."""
    doctor_id = request.query_params.get('doctor_id')
    patients = Patient.objects.all()
    if doctor_id:
        patients = patients.filter(doctor_id=doctor_id)

    summaries = []
    for patient in patients:
        recent = GameSession.objects.filter(patient=patient).order_by('-played_at')[:5]
        avg_acc = sum(s.accuracy for s in recent) / len(recent) if recent else 0
        decline = check_cognitive_decline(patient.id)

        summaries.append({
            'id': patient.id,
            'name': patient.name,
            'age': patient.age,
            'cognitive_level': patient.cognitive_level,
            'total_xp': patient.total_xp,
            'streak': patient.current_streak,
            'last_played': patient.last_played,
            'recent_accuracy': round(avg_acc, 1),
            'decline_status': decline['status'],
            'decline_message': decline['message'],
        })

    return Response(summaries)
