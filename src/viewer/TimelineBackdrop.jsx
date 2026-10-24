import { JaaliTexture } from '../Ornaments.jsx';

/** Translucent heritage motifs that sit between the 3D scene and the timeline panels. Colours come from viewer.css. */
export default function TimelineBackdrop() {
  return (
    <div className="kd-backdrop" aria-hidden="true">
      <JaaliTexture className="kd-backdrop-jaali" />
    </div>
  );
}
