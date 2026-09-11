import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Brain, Eye, Zap, Heart, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import gsap from 'gsap';

const MEMORY_DATA = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  memory: 55 + Math.random() * 30 + i * 1.2,
  attention: 50 + Math.random() * 25 + i * 0.8,
  pattern: 45 + Math.random() * 35 + i * 1.0,
  engagement: 60 + Math.random() * 20 + i * 0.5,
}));

const METRICS = [
  { key: 'memory', label: 'Memory', icon: Brain, trend: 'up', change: '+12%', color: '#7C3AED', description: 'Improving' },
  { key: 'attention', label: 'Attention', icon: Eye, trend: 'stable', change: '→ Stable', color: '#22D3EE', description: 'Stable' },
  { key: 'pattern', label: 'Pattern Recognition', icon: Zap, trend: 'up', change: '+8%', color: '#8B5CF6', description: 'Improving' },
  { key: 'engagement', label: 'Engagement', icon: Heart, trend: 'stable', change: '→ Stable', color: '#F472B6', description: 'Stable' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'rgba(6,6,14,0.95)', border: '1px solid var(--glass-border)',
      borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.8rem',
      boxShadow: 'var(--shadow-md)'
    }}>
      <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {Math.round(p.value)}%</p>
      ))}
    </div>
  );
};

export default function Progress({ patientId }) {
  const [period, setPeriod] = useState('week');
  const [activeMetric, setActiveMetric] = useState('memory');
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.querySelectorAll('.gsap-fade'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
      );
    }
  }, [period]);

  const data = period === 'today' ? MEMORY_DATA.slice(-1) : period === 'week' ? MEMORY_DATA.slice(-7) : MEMORY_DATA;

  return (
    <div className="page-container" ref={containerRef}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1 className="page-title">
          <span className="title-icon"><BarChart3 size={22} /></span>
          Progress
        </h1>
        <p className="page-subtitle">Track your cognitive wellness journey</p>
      </motion.div>

      {/* Period Tabs */}
      <motion.div className="tab-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        {[['today', 'Today'], ['week', 'This Week'], ['month', 'This Month']].map(([key, label]) => (
          <button key={key} className={`tab-btn ${period === key ? 'active' : ''}`} onClick={() => setPeriod(key)}>
            {label}
          </button>
        ))}
      </motion.div>

      {/* Metric Cards */}
      <div className="grid-2 mb-3">
        {METRICS.map((m, i) => {
          const Icon = m.icon;
          const TrendIcon = m.trend === 'up' ? TrendingUp : m.trend === 'down' ? TrendingDown : Minus;
          return (
            <motion.div
              key={m.key}
              className={`glass-card gsap-fade ${activeMetric === m.key ? 'glow-indigo' : ''}`}
              onClick={() => setActiveMetric(m.key)}
              style={{ cursor: 'pointer', padding: '1.25rem' }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-md)',
                    background: `${m.color}20`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} color={m.color} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.label}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <TrendIcon size={16} color={m.trend === 'up' ? 'var(--success)' : m.trend === 'down' ? 'var(--danger)' : 'var(--text-muted)'} />
                <span style={{
                  fontSize: '0.85rem', fontWeight: 600,
                  color: m.trend === 'up' ? 'var(--success)' : m.trend === 'down' ? 'var(--danger)' : 'var(--text-muted)',
                }}>
                  {m.description}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="chart-container gsap-fade">
        <h3 className="mb-2">
          {METRICS.find(m => m.key === activeMetric)?.label} Trend
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={METRICS.find(m => m.key === activeMetric)?.color || '#7C3AED'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={METRICS.find(m => m.key === activeMetric)?.color || '#7C3AED'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={METRICS.find(m => m.key === activeMetric)?.color || '#7C3AED'}
              strokeWidth={3}
              fill="url(#chartGrad)"
              dot={{ r: 4, fill: METRICS.find(m => m.key === activeMetric)?.color || '#7C3AED' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* AI Summary */}
      <div className="glass-card glow-cyan gsap-fade">
        <div className="flex items-center gap-2 mb-2">
          <span style={{ color: 'var(--accent-cyan)' }}><Brain size={22} /></span>
          <h3>AI Insight</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
          This week you completed more memory activities and showed improved performance
          in pattern recognition. Your attention scores remain stable. Keep up the daily
          practice — consistency helps strengthen neural pathways.
        </p>
      </div>
    </div>
  );
}
