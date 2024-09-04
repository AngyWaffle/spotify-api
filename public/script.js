let currentTrackId = null;
let progressUpdateInterval = null;

document.getElementById('themes').addEventListener('change', function() {
  document.body.className = 'theme-' + this.value;
  updateThemeStyles();
});

function updateThemeStyles() {
  const theme = document.body.className.split('-')[1];
  const themeSelector = document.getElementById('themes');
  
  switch (theme) {
    case 'dark':
      themeSelector.style.backgroundColor = '#121212';
      themeSelector.style.color = '#1DB954';
      break;
    case 'light':
      themeSelector.style.backgroundColor = '#ffffff';
      themeSelector.style.color = '#000000';
      break;
    case 'ocean':
      themeSelector.style.backgroundColor = '#2e8b57';
      themeSelector.style.color = '#ffffff';
      break;
    case 'forest':
      themeSelector.style.backgroundColor = '#228b22';
      themeSelector.style.color = '#ffffff';
      break;
    case 'sunset':
      themeSelector.style.backgroundColor = '#ff4500';
      themeSelector.style.color = '#ffffff';
      break;
    default:
      themeSelector.style.backgroundColor = 'inherit';
      themeSelector.style.color = 'inherit';
      break;
  }
}

document.addEventListener('DOMContentLoaded', function() {
    updateThemeStyles();
  });

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      location.reload();
    }
  }

  document.addEventListener('visibilitychange', function() {
    handleVisibilityChange();
  });

async function fetchUserProfile() {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('access_token');

  try {
    const response = await fetch(`/user-profile?access_token=${accessToken}`);
    const data = await response.json();
    
    if (data) {
      document.getElementById('username').textContent = data.display_name;
      document.getElementById('profile-picture').src = data.images[0]?.url || 'default-profile.png';
    }
  } catch (error) {
    document.getElementById('username').textContent = 'Error fetching profile';
  }
}

async function fetchCurrentlyPlaying() {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('access_token');

  try {
    const response = await fetch(`/currently-playing?access_token=${accessToken}`);
    const data = await response.json();
    
    if (data && data.item) {
      const track = data.item;
      const progress_ms = data.progress_ms;
      const duration_ms = track.duration_ms;

      if (currentTrackId !== track.id) {
        currentTrackId = track.id;
        updateTrackInfo(track, progress_ms, duration_ms);
        startProgressBar(progress_ms, duration_ms);
      } else {
        updateProgressBar(progress_ms, duration_ms);
      }
    } else {
      document.getElementById('track-info').innerHTML = '<p>No track currently playing</p>';
      resetProgressBar();
      currentTrackId = null;
    }
  } catch (error) {
    document.getElementById('track-info').innerHTML = '<p>Error fetching track</p>';
    resetProgressBar();
    currentTrackId = null;
  }
}

function updateTrackInfo(track, progress_ms, duration_ms) {
  const trackInfo = `
    <p><strong>${track.name}</strong> by ${track.artists.map(artist => artist.name).join(', ')}</p>
    <img src="${track.album.images[0].url}" alt="${track.name}" style="width: 100px;">
  `;
  document.getElementById('track-info').innerHTML = trackInfo;
  document.getElementById('total-time').textContent = formatTime(duration_ms);
  document.getElementById('current-time').textContent = formatTime(progress_ms);
}

function startProgressBar(progress_ms, duration_ms) {
  const progressBar = document.getElementById('progress-bar');
  progressBar.style.width = `${(progress_ms / duration_ms) * 100}%`;

  if (progressUpdateInterval) {
    clearInterval(progressUpdateInterval);
  }

  progressUpdateInterval = setInterval(() => {
    progress_ms += 1000;
    const progressPercentage = (progress_ms / duration_ms) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    document.getElementById('current-time').textContent = formatTime(progress_ms);

    if (progress_ms >= duration_ms) {
      clearInterval(progressUpdateInterval);
    }
  }, 1000);
}

function updateProgressBar(progress_ms, duration_ms) {
  const progressBar = document.getElementById('progress-bar');
  progressBar.style.width = `${(progress_ms / duration_ms) * 100}%`;
  document.getElementById('current-time').textContent = formatTime(progress_ms);
}

function resetProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  progressBar.style.width = '0%';
  document.getElementById('current-time').textContent = '0:00';
  document.getElementById('total-time').textContent = '0:00';
  if (progressUpdateInterval) {
    clearInterval(progressUpdateInterval);
  }
}

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

fetchUserProfile();
fetchCurrentlyPlaying();
setInterval(fetchCurrentlyPlaying, 5000);
