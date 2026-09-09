"""
Adaptive Difficulty Engine and Game Generation Logic.
Implements rule-based adaptive difficulty and cognitive decline detection.
"""
import random
from patients.models import Patient, MemoryItem
from .models import GameSession


# ─── Cultural Garden Fallback Data ───────────────────────────────────
CULTURAL_GARDEN = {
    'persons': [
        {'label': 'Bhupen Hazarika', 'label_regional': 'ভূপেন হাজৰিকা', 'photo_url': 'https://picsum.photos/seed/bhupen/400/400', 'item_type': 'person'},
        {'label': 'Irom Sharmila', 'label_regional': 'ইৰোম শৰ্মিলা', 'photo_url': 'https://picsum.photos/seed/irom/400/400', 'item_type': 'person'},
        {'label': 'Mary Kom', 'label_regional': 'মেৰী কম', 'photo_url': 'https://picsum.photos/seed/marykom/400/400', 'item_type': 'person'},
    ],
    'places': [
        {'label': 'Kaziranga National Park', 'label_regional': 'কাজিৰঙা ৰাষ্ট্ৰীয় উদ্যান', 'photo_url': 'https://picsum.photos/seed/kaziranga/400/400', 'item_type': 'place'},
        {'label': 'Loktak Lake', 'label_regional': 'লোকটক লেক', 'photo_url': 'https://picsum.photos/seed/loktak/400/400', 'item_type': 'place'},
        {'label': 'Tawang Monastery', 'label_regional': 'তাৱাং মঠ', 'photo_url': 'https://picsum.photos/seed/tawang/400/400', 'item_type': 'place'},
        {'label': 'Shillong Peak', 'label_regional': 'শ্বিলং পিক', 'photo_url': 'https://picsum.photos/seed/shillong/400/400', 'item_type': 'place'},
        {'label': 'Majuli Island', 'label_regional': 'মাজুলী দ্বীপ', 'photo_url': 'https://picsum.photos/seed/majuli/400/400', 'item_type': 'place'},
    ],
    'events': [
        {'label': 'Bihu Festival', 'label_regional': 'বিহু উৎসৱ', 'photo_url': 'https://picsum.photos/seed/bihu/400/400', 'item_type': 'event'},
        {'label': 'Hornbill Festival', 'label_regional': 'হৰ্ণবিল উৎসৱ', 'photo_url': 'https://picsum.photos/seed/hornbill/400/400', 'item_type': 'event'},
        {'label': 'Cherry Blossom Festival', 'label_regional': 'চেৰী ব্লচম', 'photo_url': 'https://picsum.photos/seed/cherryblossom/400/400', 'item_type': 'event'},
        {'label': 'Wangala Festival', 'label_regional': 'ৱাংগালা', 'photo_url': 'https://picsum.photos/seed/wangala/400/400', 'item_type': 'event'},
    ],
    'objects': [
        {'label': 'Mekhela Chador', 'label_regional': 'মেখেলা চাদৰ', 'photo_url': 'https://picsum.photos/seed/mekhela/400/400', 'item_type': 'object'},
        {'label': 'Gamocha', 'label_regional': 'গামোচা', 'photo_url': 'https://picsum.photos/seed/gamocha/400/400', 'item_type': 'object'},
        {'label': 'Bamboo Craft', 'label_regional': 'বাঁহৰ শিল্প', 'photo_url': 'https://picsum.photos/seed/bamboo/400/400', 'item_type': 'object'},
        {'label': 'Dhol Drum', 'label_regional': 'ঢোল', 'photo_url': 'https://picsum.photos/seed/dhol/400/400', 'item_type': 'object'},
        {'label': 'Pepa (Flute)', 'label_regional': 'পেপা', 'photo_url': 'https://picsum.photos/seed/pepa/400/400', 'item_type': 'object'},
        {'label': 'Jaapi Hat', 'label_regional': 'জাপি', 'photo_url': 'https://picsum.photos/seed/jaapi/400/400', 'item_type': 'object'},
        {'label': 'One-horned Rhino', 'label_regional': 'এশিঙীয়া গঁড়', 'photo_url': 'https://picsum.photos/seed/rhino/400/400', 'item_type': 'object'},
        {'label': 'Tea Garden', 'label_regional': 'চাহ বাগিচা', 'photo_url': 'https://picsum.photos/seed/teagarden/400/400', 'item_type': 'object'},
    ],
    'foods': [
        {'label': 'Rice & Fish Curry', 'label_regional': 'ভাত আৰু মাছৰ জোল', 'photo_url': 'https://picsum.photos/seed/fishcurry/400/400', 'item_type': 'object'},
        {'label': 'Bamboo Shoot Pickle', 'label_regional': 'কলডিল আচাৰ', 'photo_url': 'https://picsum.photos/seed/bambooshoot/400/400', 'item_type': 'object'},
        {'label': 'Pitha (Rice Cake)', 'label_regional': 'পিঠা', 'photo_url': 'https://picsum.photos/seed/pitha/400/400', 'item_type': 'object'},
        {'label': 'Assam Tea', 'label_regional': 'অসম চাহ', 'photo_url': 'https://picsum.photos/seed/assam_tea/400/400', 'item_type': 'object'},
    ],
}

DAILY_ACTIVITIES = [
    {'label': 'Wake Up', 'icon': '🌅', 'correct_order': 1},
    {'label': 'Morning Prayer', 'icon': '🙏', 'correct_order': 2},
    {'label': 'Brush Teeth', 'icon': '🪥', 'correct_order': 3},
    {'label': 'Drink Tea', 'icon': '☕', 'correct_order': 4},
    {'label': 'Take Medicine', 'icon': '💊', 'correct_order': 5},
    {'label': 'Eat Breakfast', 'icon': '🍚', 'correct_order': 6},
    {'label': 'Morning Walk', 'icon': '🚶', 'correct_order': 7},
    {'label': 'Read/Listen Radio', 'icon': '📻', 'correct_order': 8},
    {'label': 'Eat Lunch', 'icon': '🍛', 'correct_order': 9},
    {'label': 'Afternoon Rest', 'icon': '😴', 'correct_order': 10},
    {'label': 'Evening Tea', 'icon': '🍵', 'correct_order': 11},
    {'label': 'Eat Dinner', 'icon': '🍽️', 'correct_order': 12},
    {'label': 'Take Night Medicine', 'icon': '💊', 'correct_order': 13},
    {'label': 'Go to Sleep', 'icon': '🌙', 'correct_order': 14},
]

SOUND_ITEMS = [
    {'label': 'Dhol (Drum)', 'image': 'https://picsum.photos/seed/dhol_sound/300/300', 'audio_url': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'},
    {'label': 'Pepa (Flute)', 'image': 'https://picsum.photos/seed/pepa_sound/300/300', 'audio_url': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'},
    {'label': 'Rain', 'image': 'https://picsum.photos/seed/rain_sound/300/300', 'audio_url': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'},
    {'label': 'Birds Singing', 'image': 'https://picsum.photos/seed/birds_sound/300/300', 'audio_url': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'},
    {'label': 'Temple Bells', 'image': 'https://picsum.photos/seed/bells_sound/300/300', 'audio_url': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'},
    {'label': 'River Flowing', 'image': 'https://picsum.photos/seed/river_sound/300/300', 'audio_url': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'},
    {'label': 'Bamboo Rustling', 'image': 'https://picsum.photos/seed/bamboo_sound/300/300', 'audio_url': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'},
    {'label': 'Tea Pouring', 'image': 'https://picsum.photos/seed/tea_sound/300/300', 'audio_url': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'},
]


def get_all_items(patient_id):
    """Get personal memory items + cultural garden fallback."""
    personal = list(MemoryItem.objects.filter(patient_id=patient_id).values(
        'id', 'label', 'label_regional', 'photo_url', 'audio_url', 'item_type', 'story_text'
    ))

    # Add cultural garden items as fallback
    cultural = []
    for category in CULTURAL_GARDEN.values():
        for item in category:
            cultural.append({
                'id': None,
                'label': item['label'],
                'label_regional': item.get('label_regional', ''),
                'photo_url': item['photo_url'],
                'audio_url': '',
                'item_type': item['item_type'],
                'story_text': '',
            })

    return personal + cultural


def generate_face_recall(patient_id, difficulty=1):
    """Generate a Face Recall game question."""
    items = get_all_items(patient_id)
    if len(items) < 3:
        # Not enough items, use cultural garden only
        all_cultural = []
        for cat in CULTURAL_GARDEN.values():
            all_cultural.extend(cat)
        items = [{'label': i['label'], 'photo_url': i['photo_url'], 'label_regional': i.get('label_regional', '')} for i in all_cultural]

    # Select correct answer
    correct = random.choice(items)

    # Generate wrong options
    others = [i for i in items if i['label'] != correct['label']]
    num_options = min(2 + difficulty, len(others))
    wrong = random.sample(others, min(num_options, len(others)))

    options = [correct['label']] + [w['label'] for w in wrong]
    random.shuffle(options)

    return {
        'question': 'Who/What is this?',
        'photo_url': correct.get('photo_url', 'https://picsum.photos/seed/default/400/400'),
        'correct_answer': correct['label'],
        'label_regional': correct.get('label_regional', ''),
        'options': options,
        'reward_audio': correct.get('audio_url', ''),
        'story_text': correct.get('story_text', ''),
        'difficulty': difficulty,
    }


def generate_flip_card(patient_id, difficulty=1):
    """Generate Flip Card game data."""
    items = get_all_items(patient_id)

    # Number of pairs based on difficulty
    num_pairs = {1: 4, 2: 6, 3: 8}.get(difficulty, 4)
    num_pairs = min(num_pairs, len(items))

    selected = random.sample(items, num_pairs)
    pairs = []
    for i, item in enumerate(selected):
        pairs.append({
            'id': i * 2,
            'pair_id': i,
            'type': 'image',
            'content': item.get('photo_url', f'https://picsum.photos/seed/card{i}/300/300'),
            'label': item['label'],
        })
        pairs.append({
            'id': i * 2 + 1,
            'pair_id': i,
            'type': 'text',
            'content': item['label'],
            'label': item['label'],
        })

    random.shuffle(pairs)
    return {
        'pairs': pairs,
        'difficulty': difficulty,
        'num_pairs': num_pairs,
        'time_limit': num_pairs * 15,  # 15 seconds per pair
    }


def generate_daily_routine(patient_id, difficulty=1):
    """Generate Daily Routine sequencing game."""
    # Select activities based on difficulty
    num_activities = {1: 4, 2: 6, 3: 8}.get(difficulty, 4)
    activities = DAILY_ACTIVITIES[:num_activities]

    # Shuffle for the game
    shuffled = activities.copy()
    random.shuffle(shuffled)

    return {
        'activities': shuffled,
        'difficulty': difficulty,
        'num_steps': num_activities,
    }


def generate_sound_match(patient_id, difficulty=1):
    """Generate Sound Match game question."""
    num_options = {1: 3, 2: 4, 3: 5}.get(difficulty, 3)
    num_options = min(num_options, len(SOUND_ITEMS))

    selected = random.sample(SOUND_ITEMS, num_options)
    correct = selected[0]

    options = [{
        'label': item['label'],
        'image': item['image'],
        'correct': item['label'] == correct['label'],
    } for item in selected]
    random.shuffle(options)

    return {
        'audio_url': correct['audio_url'],
        'question': 'What is this sound?',
        'correct_answer': correct['label'],
        'options': options,
        'difficulty': difficulty,
    }


def update_difficulty(patient):
    """
    Adaptive difficulty engine.
    Analyzes last 5 sessions and adjusts cognitive_level.
    """
    sessions = GameSession.objects.filter(patient=patient).order_by('-played_at')[:5]
    if len(sessions) < 3:
        return patient.cognitive_level

    avg_accuracy = sum(s.accuracy for s in sessions) / len(sessions)

    old_level = patient.cognitive_level
    if avg_accuracy > 85 and patient.cognitive_level < 3:
        patient.cognitive_level += 1
    elif avg_accuracy < 40 and patient.cognitive_level > 1:
        patient.cognitive_level -= 1

    if old_level != patient.cognitive_level:
        patient.save()

    return patient.cognitive_level


def check_cognitive_decline(patient_id):
    """
    Simple linear regression to detect cognitive decline.
    Returns alert status based on accuracy trend.
    """
    sessions = list(GameSession.objects.filter(
        patient_id=patient_id
    ).order_by('played_at').values_list('accuracy', flat=True)[:30])

    if len(sessions) < 7:
        return {'status': 'insufficient_data', 'message': 'Need more game sessions for analysis', 'slope': 0}

    try:
        import numpy as np
        from sklearn.linear_model import LinearRegression

        X = np.array(range(len(sessions))).reshape(-1, 1)
        y = np.array(sessions)
        model = LinearRegression().fit(X, y)
        slope = float(model.coef_[0])

        if slope < -2:
            return {'status': 'alert', 'message': 'ALERT: Rapid cognitive decline detected', 'slope': round(slope, 2)}
        elif slope < -0.5:
            return {'status': 'warning', 'message': 'Warning: Gradual decline noticed', 'slope': round(slope, 2)}
        elif slope > 1:
            return {'status': 'improving', 'message': 'Great news: Cognitive improvement detected!', 'slope': round(slope, 2)}
        return {'status': 'stable', 'message': 'Cognitive performance is stable', 'slope': round(slope, 2)}
    except Exception:
        return {'status': 'stable', 'message': 'Cognitive performance is stable', 'slope': 0}
