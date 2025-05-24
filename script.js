let currentTrackIndex = 0;
    let tracks = [];
    const audio = new Audio();
    let repeatMode = 0; // 0: off, 1: all, 2: one
    // DOM elements
    const welcomePage = document.getElementById('welcomePage');
    const playerPage = document.getElementById('playerPage');
    const fileInput = document.getElementById('fileInput');
    const folderInput = document.getElementById('folderInput');
    const playlist = document.getElementById('playlist');
    const songTitle = document.getElementById('songTitle');
    const songArtist = document.getElementById('songArtist');
    const progress = document.getElementById('progress');
    const seekBar = document.getElementById('seekBar');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseIcon = document.getElementById('playPauseIcon');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    const repeatBtn = document.getElementById('repeat');
    const repeatIcon = document.getElementById('repeatIcon');
    const shuffleBtn = document.getElementById('shuffle');
    const shuffleIcon = document.getElementById('shuffleIcon');
    const seekTooltip = document.getElementById('seekTooltip');
    // Helper to format seconds into mm:ss
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    let isSeeking = false;
    function getSeekTime(e) {
        const rect = seekBar.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        return percent * (audio.duration || 0);
    }
    // Handle file/folder uploads
    function handleUpload(files) {
        // Filter audio files and create track objects
        tracks = Array.from(files).filter(file => file.type.startsWith('audio/')).map(file => ({
            name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            url: URL.createObjectURL(file)
        }));
        if (tracks.length === 0) {
            alert("No audio files found.");
            return;
        }
        // Hide welcome page and show player page
        welcomePage.style.display = 'none';
        playerPage.style.display = 'grid';
        // Populate playlist
        playlist.innerHTML = tracks.map((track, index) => `
            <li class="playlist-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                ${track.name}
            </li>
        `).join('');
        // Playlist click events
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                currentTrackIndex = parseInt(item.dataset.index);
                playTrack(currentTrackIndex);
                updateActiveItem();
            });
        });
        // Play first track
        playTrack(0);
    }
    // Listeners for file and folder uploads
    fileInput.addEventListener('change', e => handleUpload(e.target.files));
    folderInput.addEventListener('change', e => handleUpload(e.target.files));

    // Play selected track
    function playTrack(index) {
        currentTrackIndex = index;
        audio.src = tracks[index].url;
        audio.play();
        playPauseIcon.src = 'icons/pause.png'; // Set to pause icon when playing
        playPauseIcon.alt = 'Pause';
        songTitle.textContent = tracks[index].name;
        songArtist.textContent = "Unknown Artist"; // Placeholder
        updateActiveItem();
    }

    // Highlight current playing track
    function updateActiveItem() {
        document.querySelectorAll('.playlist-item').forEach((item, i) => {
            item.classList.toggle('active', i === currentTrackIndex);
        });
    }

    // Play/pause toggle
    playPauseBtn.addEventListener('click', function () {
    if (audio.paused) {
        audio.play();
        playPauseIcon.src = 'icons/pause.png';
        playPauseIcon.alt = 'Pause';
    } else {
        audio.pause();
        playPauseIcon.src = 'icons/play.png';
        playPauseIcon.alt = 'Play';
    }
});

    // Previous track
    document.getElementById('prevBtn').addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        playTrack(currentTrackIndex);
    });

    // Next track
    document.getElementById('nextBtn').addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        playTrack(currentTrackIndex);
    });

    // Progress bar update
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = `${progressPercent}%`;

            currentTimeEl.textContent = formatTime(audio.currentTime);
            totalTimeEl.textContent = formatTime(audio.duration);
        }
    });


    // Seek on click
    // seekBar.addEventListener('click', (e) => {
    //     const rect = seekBar.getBoundingClientRect();
    //     const seekTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    //     audio.currentTime = seekTime;
    // });
    // Seek on click or drag
    function seekTo(e) {
        const time = getSeekTime(e);
        audio.currentTime = time;
    }

    seekBar.addEventListener('mousedown', (e) => {
        isSeeking = true;
        seekTo(e);
    });
    document.addEventListener('mousemove', (e) => {
        if (isSeeking) seekTo(e);
    });
    document.addEventListener('mouseup', () => {
        isSeeking = false;
    });

// Touch support
seekBar.addEventListener('touchstart', (e) => {
    isSeeking = true;
    seekTo(e);
});
document.addEventListener('touchmove', (e) => {
    if (isSeeking) seekTo(e);
});
document.addEventListener('touchend', () => {
    isSeeking = false;
});

// Tooltip on hover/move
seekBar.addEventListener('mousemove', (e) => {
    const rect = seekBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const time = percent * (audio.duration || 0);
    seekTooltip.textContent = formatTime(time);
    seekTooltip.style.left = `${x}px`;
    seekBar.classList.add('show-tooltip');
});
seekBar.addEventListener('mouseleave', () => {
    seekBar.classList.remove('show-tooltip');
});
// Touch tooltip
seekBar.addEventListener('touchmove', (e) => {
    const rect = seekBar.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const time = percent * (audio.duration || 0);
    seekTooltip.textContent = formatTime(time);
    seekTooltip.style.left = `${x}px`;
    seekBar.classList.add('show-tooltip');
});
seekBar.addEventListener('touchend', () => {
    seekBar.classList.remove('show-tooltip');
});

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                playPauseBtn.click();
                break;
            case 'ArrowLeft':
                audio.currentTime -= 5;
                break;
            case 'ArrowRight':
                audio.currentTime += 5;
                break;
        }
    });

    repeatBtn.addEventListener('click', () => {
    repeatMode = (repeatMode + 1) % 3;
    switch (repeatMode) {
        case 0:
            repeatIcon.src = 'icons/repeatoff.png';
            repeatIcon.alt = 'Repeat Off';
            audio.loop = false;
            break;
        case 1:
            repeatIcon.src = 'icons/repeaton.png';
            repeatIcon.alt = 'Repeat All';
            audio.loop = false;
            break;
        case 2:
            repeatIcon.src = 'icons/repeat1.png';
            repeatIcon.alt = 'Repeat One';
            audio.loop = true;
            break;
    }
});

// Shuffle functionality
shuffleBtn.addEventListener('click', () => {
    // Fisher-Yates shuffle
    for (let i = tracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }

    // Re-render playlist
    playlist.innerHTML = tracks.map((track, index) => `
        <li class="playlist-item ${index === 0 ? 'active' : ''}" data-index="${index}">
            ${track.name}
        </li>
    `).join('');

    // Update playlist click events
    document.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
            currentTrackIndex = parseInt(item.dataset.index);
            playTrack(currentTrackIndex);
            updateActiveItem();
        });
    });

    // Play the first song in the shuffled list
    currentTrackIndex = 0;
    playTrack(currentTrackIndex);
});

// Handle what happens when a song ends
audio.addEventListener('ended', () => {
    if (repeatMode === 2) {
        // Repeat one: audio.loop handles this, but for safety:
        audio.currentTime = 0;
        audio.play();
    } else if (repeatMode === 1) {
        // Repeat all: go to next, loop to first if at end
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        playTrack(currentTrackIndex);
    } else {
        // Repeat off: play next if not last, else stop
        if (currentTrackIndex < tracks.length - 1) {
            currentTrackIndex++;
            playTrack(currentTrackIndex);
        }
        // else do nothing (stop)
    }
});

audio.addEventListener('play', () => {
    playPauseIcon.src = 'icons/pause.png';
    playPauseIcon.alt = 'Pause';
});

audio.addEventListener('pause', () => {
    playPauseIcon.src = 'icons/play.png';
    playPauseIcon.alt = 'Play';
});

window.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '#playerPage') {
        welcomePage.style.display = 'none';
        playerPage.style.display = 'grid';
    }
});

// Set theme color from localStorage on page load
(function() {
    const saved = localStorage.getItem('synth-theme-color') || '#4ecdc4';
    document.documentElement.style.setProperty('--theme-color', saved);
})();

// function savePlaylist() {
//     localStorage.setItem('synth-playlist', JSON.stringify(tracks));
//     localStorage.setItem('synth-current-index', currentTrackIndex);
// }

// // Restore playlist from localStorage if available
// (function restorePlaylist() {
//     const savedTracks = localStorage.getItem('synth-playlist');
//     const savedIndex = localStorage.getItem('synth-current-index');
//     if (savedTracks) {
//         tracks = JSON.parse(savedTracks);
//         currentTrackIndex = savedIndex ? parseInt(savedIndex) : 0;

//         // Populate playlist UI
//         playlist.innerHTML = tracks.map((track, index) => `
//             <li class="playlist-item ${index === currentTrackIndex ? 'active' : ''}" data-index="${index}">
//                 ${track.name}
//             </li>
//         `).join('');

//         // Add click events
//         document.querySelectorAll('.playlist-item').forEach(item => {
//             item.addEventListener('click', () => {
//                 currentTrackIndex = parseInt(item.dataset.index);
//                 playTrack(currentTrackIndex);
//                 updateActiveItem();
//                 savePlaylist();
//             });
//         });

//         // Show player page if coming from about/settings
//         welcomePage.style.display = 'none';
//         playerPage.style.display = 'grid';

//         // Play current track (or just set up UI)
//         playTrack(currentTrackIndex);
//     }
// })();