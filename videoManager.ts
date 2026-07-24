import * as THREE from 'three';

interface CachedVideoEntry {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  refCount: number;
  lastTime: number;
}

class VideoTextureManager {
  private cache = new Map<string, CachedVideoEntry>();

  getVideoTexture(url: string): { texture: THREE.CanvasTexture; video: HTMLVideoElement } {
    if (this.cache.has(url)) {
      const entry = this.cache.get(url)!;
      entry.refCount++;
      if (entry.video.paused) {
        entry.video.play().catch(() => {});
      }
      return { texture: entry.texture, video: entry.video };
    }

    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'auto';

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, 600, 800);
    }

    const playVideo = () => {
      video.play().catch((err) => {
        console.warn("Video playback deferred:", err);
      });
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo, { once: true });
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;

    const entry: CachedVideoEntry = {
      video,
      canvas,
      texture,
      refCount: 1,
      lastTime: -1,
    };

    this.cache.set(url, entry);
    return { texture, video };
  }

  releaseVideoTexture(url: string): void {
    const entry = this.cache.get(url);
    if (!entry) return;

    entry.refCount--;
    if (entry.refCount <= 0) {
      entry.video.pause();
      entry.video.removeAttribute('src');
      entry.video.load();
      entry.texture.dispose();
      this.cache.delete(url);
    }
  }

  updateTextures(): void {
    if (this.cache.size === 0) return;
    this.cache.forEach((entry) => {
      if (entry.video && !entry.video.paused && entry.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        if (entry.video.currentTime !== entry.lastTime) {
          const ctx = entry.canvas.getContext('2d');
          if (ctx) {
            const vW = entry.video.videoWidth || 600;
            const vH = entry.video.videoHeight || 800;
            const vAspect = vW / vH;
            const cAspect = 600 / 800; // 0.75

            ctx.fillStyle = '#0d0d10';
            ctx.fillRect(0, 0, 600, 800);

            let dW = 600;
            let dH = 800;
            let oX = 0;
            let oY = 0;

            if (vAspect > cAspect) {
              dH = 600 / vAspect;
              oY = (800 - dH) / 2;
            } else {
              dW = 800 * vAspect;
              oX = (600 - dW) / 2;
            }

            ctx.drawImage(entry.video, oX, oY, dW, dH);

            ctx.strokeStyle = '#27272a';
            ctx.lineWidth = 3;
            ctx.strokeRect(1, 1, 598, 798);

            entry.texture.needsUpdate = true;
            entry.lastTime = entry.video.currentTime;
          }
        }
      }
    });
  }
}

export const videoTextureManager = new VideoTextureManager();
