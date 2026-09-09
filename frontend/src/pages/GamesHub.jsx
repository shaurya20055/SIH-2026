import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GAMES = [
  { id: 'face-recall', icon: '🧓', gradient: 'linear-gradient(135deg, #e8f5e1, #c8e6c9)', desc: 'Recognize faces and objects from your memories' },
  { id: 'flip-card', icon: '🃏', gradient: 'linear-gradient(135deg, #e3f2fd, #bbdefb)', desc: 'Match pairs of cards by flipping them' },
  { id: 'sound-match', icon: '🔊', gradient: 'linear-gradient(135deg, #fff3e0, #ffe0b2)', desc: 'Listen to sounds and identify them' },
  { id: 'daily-routine', icon: '📋', gradient: 'linear-gradient(135deg, #fce4ec, #f8bbd0)', desc: 'Arrange daily activities in order' },
];

export default function GamesHub({ patientId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🎮 {t('games')}</h1>
        <p className="text-gray">{t('recommended')}</p>
      </div>

      <div className="grid-2">
        {GAMES.map((game, i) => (
          <div
            key={game.id}
            className="card card-game animate-fadeInUp"
            style={{ background: game.gradient, animationDelay: `${i * 0.1}s`, minHeight: '200px' }}
            onClick={() => navigate(`/game/${game.id}`)}
          >
            <span className="game-icon">{game.icon}</span>
            <span className="game-title">{t(game.id.replace('-', '_'))}</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginTop: '0.25rem' }}>{game.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
