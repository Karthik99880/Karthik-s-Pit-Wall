import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

/** Catches render-time crashes so one bad section can't blank the whole app. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[PitWall] render error:', error, info);
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh', background: 'var(--carbon)', color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 18, padding: 40, textAlign: 'center',
      }}>
        <div style={{ fontSize: 44 }}>🏳️</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 700 }}>
          Red Flag · Something broke
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', maxWidth: 520 }}>
          {this.state.error.message}
        </div>
        <button
          onClick={this.reset}
          style={{
            marginTop: 8, padding: '10px 22px', cursor: 'pointer',
            background: 'var(--mercedes)', color: 'var(--carbon)', border: 'none',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800,
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}
        >
          Restart Session
        </button>
      </div>
    );
  }
}
