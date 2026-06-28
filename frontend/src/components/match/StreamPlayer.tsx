import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface Props {
  url: string;
  onClose: () => void;
}

export function StreamPlayer({ url, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = url;
      video.addEventListener('loadedmetadata', () => { video.play().catch(() => {}); });
    }
  }, [url]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: 960 }}>
        <button
          onClick={onClose}
          aria-label="Close player"
          style={{
            position: 'absolute', top: -36, right: 0,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text)', fontSize: 14, fontWeight: 600, padding: '4px 8px',
          }}
        >
          ✕ Close
        </button>
        <video
          ref={videoRef}
          controls
          style={{
            width: '100%',
            borderRadius: 'var(--r)',
            background: '#000',
            maxHeight: '80vh',
          }}
        />
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-mute)', marginTop: 8 }}>
          If the stream doesn't load, your network may block this source.
        </p>
      </div>
    </div>
  );
}
