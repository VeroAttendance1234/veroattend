import { useState } from 'react';
import { Wifi, Zap, Loader } from 'lucide-react';

export default function RFIDSimulator({ students, onTap }) {
  const [scanning, setScanning] = useState(false);
  const [lastUID, setLastUID] = useState(null);

  function simulate() {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      const pool = students.filter(s => !s.present);
      const student = pool.length > 0
        ? pool[Math.floor(Math.random() * pool.length)]
        : students[Math.floor(Math.random() * students.length)];
      setLastUID(student.uid || 'SIM-' + Math.random().toString(16).slice(2,8).toUpperCase());
      onTap(student);
      setScanning(false);
    }, 900);
  }

  return (
    <div style={{
      background: 'var(--teal-glow)',
      border: '1.5px dashed var(--teal-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Animated reader icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: scanning ? 'var(--teal)' : 'var(--surface-card)',
          border: `2px solid ${scanning ? 'var(--teal)' : 'var(--teal-border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: scanning ? '#fff' : 'var(--teal)',
          transition: 'all 0.3s',
          flexShrink: 0,
          boxShadow: scanning ? '0 0 16px rgba(20,184,184,0.4)' : 'none',
        }}>
          {scanning
            ? <Loader size={20} strokeWidth={2.5} style={{ animation: 'spin 1s linear infinite' }} />
            : <Wifi size={20} strokeWidth={2} />
          }
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 2 }}>
            {scanning ? 'Reading card...' : 'ACR122U Simulator'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {lastUID
              ? `Last UID: ${lastUID}`
              : 'Pi connected → real taps update automatically'
            }
          </div>
        </div>
      </div>

      <button
        onClick={simulate}
        disabled={scanning}
        className="btn-primary"
        style={{
          opacity: scanning ? 0.7 : 1,
          background: scanning ? 'var(--teal-dark)' : 'var(--teal)',
        }}
      >
        <Zap size={15} strokeWidth={2.5} />
        {scanning ? 'Scanning...' : 'Simulate tap'}
      </button>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
