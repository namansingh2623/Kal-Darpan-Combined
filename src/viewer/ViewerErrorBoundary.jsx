import { Component } from 'react';

export default class ViewerErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid h-full place-items-center p-8 text-center kd-text-3">
        <div className="max-w-md">
          <div className="kd-display text-2xl kd-text">The 3D view could not start</div>
          <p className="mt-3 text-sm kd-text-4">Enable hardware acceleration in your browser, or check that the model file exists. ({String(this.state.error.message || this.state.error)})</p>
          <button type="button" onClick={this.props.onBack} className="mt-5 rounded-lg border kd-accent-line px-4 py-2 text-xs uppercase tracking-[0.18em] kd-gold kd-accent-hover">Back to museum</button>
        </div>
      </div>
    );
  }
}
