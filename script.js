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
const playlistSearch = document.getElementById('playlistSearch');
const clearSearchBtn = document.getElementById('clearSearch');
const noSongsMsg = document.getElementById('noSongsMsg');
const addSongsBtn = document.getElementById('addSongsBtn');
const addSongsInput = document.getElementById('addSongsInput');
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
                <span class="drag-handle">≡</span>
                ${track.name}
            </li>
        `).join('');
    makePlaylistDraggable();
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
    playPauseIcon.src = 'icons/pause.png';
    playPauseIcon.alt = 'Pause';
    songTitle.textContent = tracks[index].name;
    songArtist.textContent = "Unknown Artist"; // Placeholder
    setDefaultAlbumArt(); // Always use default art
    updateActiveItem();
}

// Highlight current playing track
function updateActiveItem() {
    console.log('Current Track Index:', currentTrackIndex);
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

    // Set to first track after shuffle
    currentTrackIndex = 0;

    // Re-render playlist
    playlist.innerHTML = tracks.map((track, index) => `
        <li class="playlist-item${index === currentTrackIndex ? ' active' : ''}" data-index="${index}">
            <span class="drag-handle">≡</span>
            <span class="playlist-song-name">${track.name}</span>
        </li>
    `).join('');
    makePlaylistDraggable();

    // Re-attach click events
    document.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
            currentTrackIndex = parseInt(item.dataset.index);
            playTrack(currentTrackIndex);
            updateActiveItem();
        });
    });

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
(function () {
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

function makePlaylistDraggable() {
    let draggingEl = null;
    let placeholder = document.createElement('li');
    placeholder.className = 'playlist-placeholder';

    function onDragStart(e) {
        draggingEl = e.currentTarget;
        draggingEl.classList.add('dragging');
        setTimeout(() => {
            draggingEl.style.display = 'none';
        }, 0);
    }

    function onDragEnd(e) {
        draggingEl = null;
        e.currentTarget.classList.remove('dragging');
        e.currentTarget.style.display = '';
        if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
        updateTracksOrder();
    }

    function onDragOver(e) {
        e.preventDefault();
        if (!placeholder.parentNode) {
            e.currentTarget.parentNode.insertBefore(placeholder, e.currentTarget.nextSibling);
        }
        if (e.currentTarget !== draggingEl) {
            const rect = e.currentTarget.getBoundingClientRect();
            const offset = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
            if (offset < rect.height / 2) {
                e.currentTarget.parentNode.insertBefore(placeholder, e.currentTarget);
            } else {
                e.currentTarget.parentNode.insertBefore(placeholder, e.currentTarget.nextSibling);
            }
        }
    }

    function onDrop(e) {
        e.preventDefault();
        if (placeholder.parentNode) {
            playlist.insertBefore(draggingEl, placeholder);
            placeholder.parentNode.removeChild(placeholder);
        }
    }

    // --- Auto-scroll variables ---
    let autoScrollInterval = null;
    const SCROLL_EDGE_THRESHOLD = 60; // px from top/bottom to start scrolling
    const SCROLL_SPEED = 16; // px per frame

    function clearAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }

    function startAutoScroll(direction) {
        clearAutoScroll();
        autoScrollInterval = setInterval(() => {
            playlist.scrollTop += direction * SCROLL_SPEED;
        }, 16); // ~60fps
    }

    function handleAutoScroll(touchY) {
        const rect = playlist.getBoundingClientRect();
        if (touchY - rect.top < SCROLL_EDGE_THRESHOLD) {
            startAutoScroll(-1); // scroll up
        } else if (rect.bottom - touchY < SCROLL_EDGE_THRESHOLD) {
            startAutoScroll(1); // scroll down
        } else {
            clearAutoScroll();
        }
    }

    // --- Touch events ---
    let touchDragging = false;
    let touchTarget = null;

    function onTouchStart(e) {
        if (!e.target.classList.contains('drag-handle')) return;
        e.preventDefault();
        touchDragging = true;
        touchTarget = e.currentTarget;
        draggingEl = touchTarget;
        draggingEl.classList.add('dragging');
        draggingEl.style.opacity = '0.5';
        document.body.style.userSelect = 'none';
    }

    function onTouchMove(e) {
        if (!touchDragging || !touchTarget) return;
        e.preventDefault();
        const touch = e.touches[0];
        handleAutoScroll(touch.clientY); // <-- auto-scroll logic

        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!target) return;
        const item = target.closest('.playlist-item');
        if (item && item !== draggingEl) {
            const rect = item.getBoundingClientRect();
            const offset = touch.clientY - rect.top;
            if (offset < rect.height / 2 && placeholder !== item.previousSibling) {
                item.parentNode.insertBefore(placeholder, item);
            } else if (offset >= rect.height / 2 && placeholder !== item.nextSibling) {
                item.parentNode.insertBefore(placeholder, item.nextSibling);
            }
        } else if (target === playlist && placeholder !== playlist.lastChild) {
            playlist.appendChild(placeholder);
        }
    }

    function onTouchEnd(e) {
        clearAutoScroll();
        if (touchDragging && draggingEl && placeholder.parentNode) {
            playlist.insertBefore(draggingEl, placeholder);
            placeholder.parentNode.removeChild(placeholder);
            draggingEl.classList.remove('dragging');
            draggingEl.style.opacity = '';
            updateTracksOrder();
        }
        touchDragging = false;
        draggingEl = null;
        touchTarget = null;
        document.body.style.userSelect = '';
    }

    playlist.querySelectorAll('.playlist-item').forEach(item => {
        item.setAttribute('draggable', 'true');
        // Mouse events
        item.addEventListener('dragstart', onDragStart);
        item.addEventListener('dragend', onDragEnd);
        item.addEventListener('dragover', onDragOver);
        item.addEventListener('drop', onDrop);
        // Touch events
        item.addEventListener('touchstart', onTouchStart, {passive: false});
    });

    document.addEventListener('touchmove', onTouchMove, {passive: false});
    document.addEventListener('touchend', onTouchEnd, {passive: false});

    // Allow dropping at the end of the list (mouse)
    playlist.addEventListener('dragover', (e) => {
        e.preventDefault();
        const after = Array.from(playlist.children).find(
            child => child !== draggingEl && child !== placeholder && (e.touches ? e.touches[0].clientY : e.clientY) < child.getBoundingClientRect().top + child.offsetHeight / 2
        );
        if (!after) {
            playlist.appendChild(placeholder);
        }
    });

    playlist.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggingEl && placeholder.parentNode) {
            playlist.insertBefore(draggingEl, placeholder);
            placeholder.parentNode.removeChild(placeholder);
        }
    });
}

// Update the tracks array to match the new playlist order
function updateTracksOrder() {
    const items = playlist.querySelectorAll('.playlist-item');
    const newTracks = [];
    items.forEach(item => {
        const idx = parseInt(item.getAttribute('data-index'));
        newTracks.push(tracks[idx]);
    });
    tracks = newTracks;
    // Update data-index attributes to match new order
    playlist.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.setAttribute('data-index', i);
    });
}

// Search functionality
if (playlistSearch && clearSearchBtn) {
    playlistSearch.addEventListener('input', function () {
        clearSearchBtn.style.display = this.value ? 'block' : 'none';
        const query = this.value.toLowerCase();
        let found = false;
        document.querySelectorAll('.playlist-item').forEach(item => {
            const songName = item.textContent.toLowerCase();
            if (query && songName.includes(query)) {
                item.style.display = '';
                item.classList.add('highlighted');
                setTimeout(() => item.classList.remove('highlighted'), 700);
                found = true;
            } else if (query) {
                item.style.display = 'none';
            } else {
                item.style.display = '';
            }
        });
        // Show/hide "No songs found" message
        if (query && !found) {
            noSongsMsg.style.display = 'block';
        } else {
            noSongsMsg.style.display = 'none';
        }
    });

    clearSearchBtn.addEventListener('click', function () {
        playlistSearch.value = '';
        playlistSearch.dispatchEvent(new Event('input'));
        playlistSearch.focus();
        clearSearchBtn.style.display = 'none';
        noSongsMsg.style.display = 'none';
    });
}

if (addSongsBtn && addSongsInput) {
    addSongsBtn.addEventListener('click', () => addSongsInput.click());

    addSongsInput.addEventListener('change', function () {
        const newFiles = Array.from(this.files).filter(file => file.type.startsWith('audio/'));
        if (newFiles.length === 0) return;

        // Add new tracks to the existing playlist
        const newTracks = newFiles.map(file => ({
            name: file.name.replace(/\.[^/.]+$/, ""),
            url: URL.createObjectURL(file)
        }));
        tracks = tracks.concat(newTracks);

        // Re-render playlist
        playlist.innerHTML = tracks.map((track, index) => `
            <li class="playlist-item${index === currentTrackIndex ? ' active' : ''}" data-index="${index}">
                <span class="drag-handle">≡</span>
                <span class="playlist-song-name">${track.name}</span>
            </li>
        `).join('');
        makePlaylistDraggable();

        // Re-attach click events
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                currentTrackIndex = parseInt(item.dataset.index);
                playTrack(currentTrackIndex);
                updateActiveItem();
            });
        });

        // Clear the input so the same files can be added again if needed
        this.value = '';
    });
}

// Helper to set default or custom album art
function setDefaultAlbumArt() {
    document.getElementById('albumArt').src = 'assets/balthazar-disque.gif';
}

// Helper for base64 conversion (if not provided by music-metadata-browser)
if (!window.musicMetadata.arrayBufferToBase64) {
    window.musicMetadata.arrayBufferToBase64 = function(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };
}