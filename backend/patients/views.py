from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Patient, MemoryItem, MoodLog, SocialGreeting, Prescription, UserProfile, Appointment, Medicine, DailyCareTask
from .serializers import (
    UserSerializer, RegisterSerializer, PatientSerializer,
    MemoryItemSerializer, MoodLogSerializer, SocialGreetingSerializer,
    PrescriptionSerializer, AppointmentSerializer, MedicineSerializer, DailyCareTaskSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = User.objects.all()
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(profile__role=role)
        return qs

@api_view(['POST'])
def register_user(request):
    """Register a new user with a role."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'id': user.id,
            'username': user.username,
            'role': user.profile.role,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def current_user(request):
    """Get current authenticated user info."""
    if request.user.is_anonymous:
        return Response({'error': 'Not authenticated'}, status=401)
    serializer = UserSerializer(request.user)
    data = serializer.data
    # Include patient_id if user is a patient
    try:
        patient = Patient.objects.get(user=request.user)
        data['patient_id'] = patient.id
    except Patient.DoesNotExist:
        data['patient_id'] = None
    return Response(data)


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Patient.objects.all()
        caregiver_id = self.request.query_params.get('caregiver_id')
        doctor_id = self.request.query_params.get('doctor_id')
        if caregiver_id:
            qs = qs.filter(caregiver_id=caregiver_id)
        if doctor_id:
            qs = qs.filter(doctor_id=doctor_id)
        return qs


class MemoryItemViewSet(viewsets.ModelViewSet):
    queryset = MemoryItem.objects.all()
    serializer_class = MemoryItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = MemoryItem.objects.all()
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        item_type = self.request.query_params.get('item_type')
        if item_type:
            qs = qs.filter(item_type=item_type)
        return qs


class MoodLogViewSet(viewsets.ModelViewSet):
    queryset = MoodLog.objects.all()
    serializer_class = MoodLogSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = MoodLog.objects.all().order_by('-logged_at')
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs


class SocialGreetingViewSet(viewsets.ModelViewSet):
    queryset = SocialGreeting.objects.all()
    serializer_class = SocialGreetingSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = SocialGreeting.objects.all().order_by('-sent_at')
        receiver_id = self.request.query_params.get('receiver_id')
        if receiver_id:
            qs = qs.filter(receiver_id=receiver_id)
        sender_id = self.request.query_params.get('sender_id')
        if sender_id:
            qs = qs.filter(sender_id=sender_id)
        return qs


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Prescription.objects.all().order_by('-created_at')
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Appointment.objects.all().order_by('-date_time')
        patient_id = self.request.query_params.get('patient_id')
        doctor_id = self.request.query_params.get('doctor_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        if doctor_id:
            qs = qs.filter(doctor_id=doctor_id)
        return qs


class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Medicine.objects.all()
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs


class DailyCareTaskViewSet(viewsets.ModelViewSet):
    queryset = DailyCareTask.objects.all()
    serializer_class = DailyCareTaskSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = DailyCareTask.objects.all()
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs
