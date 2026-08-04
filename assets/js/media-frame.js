/**
 * Componente MediaFrame
 * Renderiza publicaciones de manera unificada basándose en el tipo de fuente.
 */

export function renderMediaFrame(pub, client = {}) {
    const fallbackColor = client.primaryColor || 'var(--brand-accent)';
    const objectFit = pub.objectFit || 'cover';
    const aspectRatio = pub.aspectRatio === 'auto' ? 'auto' : (pub.aspectRatio || '1:1');
    const focalPosition = pub.focalPosition || 'center';
    const altText = pub.altText || pub.title || 'Publicación del cliente';

    let contentHtml = '';

    // Lógica principal de renderizado según sourceType
    switch (pub.sourceType) {
        case 'direct_video_url':
        case 'local_video':
            const videoSrc = pub.videoUrl || '';
            const posterSrc = pub.posterUrl || '';
            const autoplayAttr = pub.autoplayAllowed ? 'autoplay loop muted playsinline' : 'playsinline';
            const preloadAttr = pub.autoplayAllowed ? 'preload="auto"' : 'preload="none"';
            
            contentHtml = `
                <div class="media-frame media-frame--video" style="aspect-ratio: ${aspectRatio}; --client-color: ${fallbackColor};">
                    <video ${autoplayAttr} ${preloadAttr} poster="${posterSrc}" style="object-fit: ${objectFit}; object-position: ${focalPosition};">
                        <source src="${videoSrc}" type="video/mp4">
                        Tu navegador no soporta el formato de video.
                    </video>
                    ${!pub.autoplayAllowed ? `<button class="media-frame__play-btn" aria-label="Reproducir video" style="background-color: ${fallbackColor}"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></button>` : ''}
                </div>
            `;
            break;

        case 'instagram_link':
            const igUrl = pub.instagramUrl || '#';
            const igPoster = pub.posterUrl || pub.imageUrl || '';
            
            contentHtml = `
                <a href="${igUrl}" target="_blank" rel="noopener noreferrer" class="media-frame media-frame--instagram" style="aspect-ratio: ${aspectRatio}; --client-color: ${fallbackColor};">
                    ${igPoster ? `<img src="${igPoster}" alt="${altText}" loading="lazy" style="object-fit: ${objectFit}; object-position: ${focalPosition};">` : `<div class="media-frame__fallback"><span>Ver en Instagram</span></div>`}
                    <div class="media-frame__overlay">
                        <span class="media-frame__badge">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            Instagram
                        </span>
                    </div>
                </a>
            `;
            break;

        case 'image':
        default:
            const imgSrc = pub.imageUrl || pub.posterUrl || '';
            contentHtml = `
                <div class="media-frame media-frame--image" style="aspect-ratio: ${aspectRatio}; --client-color: ${fallbackColor};">
                    <img src="${imgSrc}" alt="${altText}" loading="lazy" style="object-fit: ${objectFit}; object-position: ${focalPosition};">
                </div>
            `;
            break;
    }

    return contentHtml;
}

export function bindVideoControls() {
    // Controlador centralizado de reproducción (Solo un video a la vez)
    const videos = document.querySelectorAll('.media-frame video');
    
    videos.forEach(video => {
        // Pausar si sale del viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting && !video.paused && !video.hasAttribute('autoplay')) {
                    video.pause();
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(video);

        // Click handler para reproducir/pausar
        const container = video.closest('.media-frame');
        const playBtn = container?.querySelector('.media-frame__play-btn');
        
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (video.paused) {
                    // Pausar otros videos primero
                    videos.forEach(v => {
                        if (v !== video && !v.paused) v.pause();
                    });
                    video.play();
                    playBtn.style.opacity = '0';
                    video.setAttribute('controls', 'true');
                } else {
                    video.pause();
                }
            });

            video.addEventListener('pause', () => {
                playBtn.style.opacity = '1';
                video.removeAttribute('controls');
            });
        }
    });
}
