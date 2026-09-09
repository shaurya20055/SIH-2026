from rest_framework import viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.utils import timezone
from .models import Reminder
from .serializers import ReminderSerializer


class ReminderViewSet(viewsets.ModelViewSet):
    queryset = Reminder.objects.all()
    serializer_class = ReminderSerializer

    def get_queryset(self):
        qs = Reminder.objects.all()
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs

    @action(detail=True, methods=['patch'])
    def done(self, request, pk=None):
        """Mark reminder as done."""
        reminder = self.get_object()
        reminder.is_done = True
        reminder.save()
        return Response({'status': 'done', 'id': reminder.id})

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's reminders for a patient."""
        patient_id = request.query_params.get('patient_id')
        if not patient_id:
            return Response({'error': 'patient_id required'}, status=400)

        today = timezone.now().strftime('%a').lower()[:3]
        reminders = Reminder.objects.filter(
            patient_id=patient_id,
            days_of_week__icontains=today,
        ).order_by('scheduled_time')

        serializer = self.get_serializer(reminders, many=True)
        return Response(serializer.data)
