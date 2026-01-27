(() => {
    const video = document.querySelector('.showcase-video');
    
    if (!video) return;

    // Ensure video plays on load (some browsers need this)
    video.addEventListener('loadeddata', () => {
        video.play().catch(err => {
            console.log('Video autoplay prevented:', err);
        });
    });

    // Pause video when tab is hidden to save resources
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            video.pause();
        } else {
            video.play().catch(err => {
                console.log('Video play prevented:', err);
            });
        }
    });
})();
