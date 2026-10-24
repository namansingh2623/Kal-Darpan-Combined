import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export default function ResponsiveFraming({ top = 0, bottom = 0 }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const { width, height } = size;
    if (!width || !height) return undefined;
    const free = Math.max(height - top - bottom, height * 0.35);
    const byWidth = width / free / 1.7;
    const byHeight = free / height / 0.72;
    camera.zoom = Math.min(1, Math.max(0.3, Math.min(byWidth, byHeight)));
    camera.setViewOffset(width, height, 0, (bottom - top) / 2, width, height);
    camera.updateProjectionMatrix();
    invalidate();
    return () => {
      camera.clearViewOffset();
      camera.zoom = 1;
      camera.updateProjectionMatrix();
    };
  }, [camera, size, top, bottom, invalidate]);
  return null;
}