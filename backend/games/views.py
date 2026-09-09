from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from patients.models import Patient
from .models import GameSession
from .serializers import GameSessionSerializer
from .engine import (
    generate_face_recall, generate_flip_card,
    generate_daily_routine, generate_sound_match,
    update_difficulty, check_cognitive_decline,
)


class GameSessionViewSet(viewsets.ModelViewSet):
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer

    def get_queryset(self):
        qs = GameSession.objects.all()
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        game_type = self.request.query_params.get('game_type')
        if game_type:
            qs = qs.filter(game_type=game_type)
        return qs

    def create(self, request, *args, **kwargs):
        """Save game session and trigger adaptive difficulty + XP update."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = serializer.save()

        # Calculate and save stars and XP
        session.stars = session.calculate_stars()
        session.xp_earned = session.calculate_xp()
        session.save()

        # Update patient XP and streak
        patient = session.patient
        patient.total_xp += session.xp_earned

        today = timezone.now().date()
        if patient.last_played:
            delta = (today - patient.last_played).days
            if delta == 1:
                patient.current_streak += 1
            elif delta > 1:
                patient.current_streak = 1
        else:
            patient.current_streak = 1
        patient.last_played = today
        patient.save()

        # Trigger adaptive difficulty
        new_level = update_difficulty(patient)

        response_data = serializer.data
        response_data['stars'] = session.stars
        response_data['xp_earned'] = session.xp_earned
        response_data['new_cognitive_level'] = new_level
        response_data['total_xp'] = patient.total_xp
        response_data['streak'] = patient.current_streak
        response_data['level'] = patient.level
        response_data['level_title'] = patient.level_title

        return Response(response_data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def generate_game(request):
    """Generate game data based on type and patient."""
    patient_id = request.query_params.get('patient_id')
    game_type = request.query_params.get('game_type')

    if not patient_id or not game_type:
        return Response(
            {'error': 'patient_id and game_type are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=404)

    difficulty = patient.cognitive_level

    generators = {
        'face_recall': generate_face_recall,
        'flip_card': generate_flip_card,
        'daily_routine': generate_daily_routine,
        'sound_match': generate_sound_match,
    }

    generator = generators.get(game_type)
    if not generator:
        return Response({'error': f'Unknown game type: {game_type}'}, status=400)

    game_data = generator(patient_id, difficulty)
    return Response(game_data)


@api_view(['GET'])
def decline_check(request):
    """Check for cognitive decline in a patient."""
    patient_id = request.query_params.get('patient_id')
    if not patient_id:
        return Response({'error': 'patient_id required'}, status=400)

    result = check_cognitive_decline(patient_id)
    return Response(result)
