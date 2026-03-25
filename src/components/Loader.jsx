export default function Loader({ size = 32, text = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 }}>
      <div style={{
        width: size, height: size,
        border: `3px solid var(--border)`,
        borderTop: `3px solid var(--accent)`,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      {text && <p style={{ color: 'var(--text3)', fontSize: 14 }}>{text}</p>}
    </div>
  );
}
