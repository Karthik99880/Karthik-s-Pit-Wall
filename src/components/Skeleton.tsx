export default function Skeleton() {
  return (
    <div style={{ padding: '24px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 46, background: 'var(--paper-2)', marginBottom: 8, animation: 'fadeSlow 1s ease infinite alternate' }} />
      ))}
    </div>
  );
}
