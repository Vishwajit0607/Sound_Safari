let allSongs = [];
let favorites = JSON.parse(localStorage.getItem('soundSafariFavs')) || [];
let showFavorites = false;

let currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'light') document.body.classList.add('light-mode');

const loader = document.getElementById('loader');
const app = document.getElementById('app');
const grid = document.getElementById('song-grid');
const songCountEl = document.getElementById('song-count');
const playerBar = document.getElementById('player-bar');
const audioPlayer = document.getElementById('audio-player');
const playerArt = document.getElementById('player-art');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const closePlayerBtn = document.getElementById('close-player');

const searchInput = document.getElementById('search-input');
const genreFilter = document.getElementById('genre-filter');
const sortSelect = document.getElementById('sort-select');
const favToggle = document.getElementById('fav-toggle');
const themeToggleBtn = document.getElementById('theme-toggle');
const backBtn = document.getElementById('back-btn');
const homeBtn = document.getElementById('home-btn');

let historyStack = [];
let isNavigatingBack = false;

function captureState() {
  return {
    searchTerm: searchInput.value,
    selectedGenre: genreFilter.value,
    sortValue: sortSelect.value,
    showFavorites: showFavorites,
    playerOpen: !playerBar.classList.contains('hidden'),
    playerArtSrc: playerArt.src,
    playerTitle: playerTitle.textContent,
    playerArtist: playerArtist.textContent,
    audioSrc: audioPlayer.src
  };
}

function updateBackButton() {
  if (historyStack.length > 1) {
    backBtn.classList.remove('disabled');
    backBtn.removeAttribute('disabled');
  } else {
    backBtn.classList.add('disabled');
    backBtn.setAttribute('disabled', 'true');
  }
}

function pushState() {
  if (isNavigatingBack) return;
  var state = captureState();
  if (historyStack.length > 0) {
    var last = historyStack[historyStack.length - 1];
    if (last.searchTerm === state.searchTerm &&
        last.selectedGenre === state.selectedGenre &&
        last.sortValue === state.sortValue &&
        last.showFavorites === state.showFavorites &&
        last.playerOpen === state.playerOpen &&
        last.audioSrc === state.audioSrc) {
       return; 
    }
  }
  historyStack.push(state);
  if (historyStack.length > 30) historyStack.shift();
  updateBackButton();
}

function popState() {
  if (historyStack.length <= 1) return;
  
  historyStack.pop(); 
  var prevState = historyStack[historyStack.length - 1]; 
  
  isNavigatingBack = true;
  
  searchInput.value = prevState.searchTerm;
  genreFilter.value = prevState.selectedGenre;
  sortSelect.value = prevState.sortValue;
  showFavorites = prevState.showFavorites;
  if(showFavorites) favToggle.classList.add('active');
  else favToggle.classList.remove('active');
  
  applyFiltersAndSort();
  
  if (prevState.playerOpen) {
    playerArt.src = prevState.playerArtSrc;
    playerTitle.textContent = prevState.playerTitle;
    playerArtist.textContent = prevState.playerArtist;
    if (audioPlayer.src !== prevState.audioSrc) {
       audioPlayer.src = prevState.audioSrc;
    }
    playerBar.classList.remove('hidden');
  } else {
    audioPlayer.pause();
    playerBar.classList.add('hidden');
  }
  
  isNavigatingBack = false;
  updateBackButton();
}

backBtn.addEventListener('click', popState);

homeBtn.addEventListener('click', function() {
  searchInput.value = '';
  genreFilter.value = 'all';
  sortSelect.value = 'default';
  showFavorites = false;
  favToggle.classList.remove('active');
  
  applyFiltersAndSort();
  pushState();
});

themeToggleBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
themeToggleBtn.addEventListener('click', function() {
  if (document.body.classList.contains('light-mode')) {
    document.body.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
    themeToggleBtn.textContent = '☀️';
  } else {
    document.body.classList.add('light-mode');
    localStorage.setItem('theme', 'light');
    themeToggleBtn.textContent = '🌙';
  }
});

function fetchSongs() {
  const url = 'https://itunes.apple.com/search?term=music&entity=song&limit=100';

  fetch(url)
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      allSongs = data.results.filter(function(item) {
        return item.trackName && item.artistName && item.artworkUrl100;
      });

      var genres = [...new Set(allSongs.map(function(s) { return s.primaryGenreName; }).filter(Boolean))].sort();
      genres.forEach(function(genre) {
        var option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
      });

      loader.classList.add('hidden');
      app.classList.remove('hidden');

      applyFiltersAndSort();
      pushState();
    })
    .catch(function(err) {
      loader.innerHTML = '<p style="color:#8a8a9a;font-size:0.9rem;">Failed to load tracks. Please try again.</p>';
      console.error('Fetch error:', err);
    });
}

function applyFiltersAndSort() {
  var searchTerm = searchInput.value.toLowerCase();
  var selectedGenre = genreFilter.value;
  var sortValue = sortSelect.value;

  var filtered = allSongs.filter(function(song) {
    return song.trackName.toLowerCase().includes(searchTerm) || 
           song.artistName.toLowerCase().includes(searchTerm);
  });

  if (selectedGenre !== 'all') {
    filtered = filtered.filter(function(song) {
      return song.primaryGenreName === selectedGenre;
    });
  }

  if (showFavorites) {
    filtered = filtered.filter(function(song) {
      return favorites.includes(song.trackId.toString());
    });
  }

  filtered.sort(function(a, b) {
    if (sortValue === 'title-asc') {
      return a.trackName.localeCompare(b.trackName);
    } else if (sortValue === 'title-desc') {
      return b.trackName.localeCompare(a.trackName);
    } else if (sortValue === 'artist-asc') {
      return a.artistName.localeCompare(b.artistName);
    }
    return 0;
  });

  songCountEl.textContent = filtered.length + ' tracks';
  renderSongs(filtered);
}

var searchTo;
searchInput.addEventListener('input', function() {
  applyFiltersAndSort();
  clearTimeout(searchTo);
  searchTo = setTimeout(pushState, 600);
});

genreFilter.addEventListener('change', function() {
  applyFiltersAndSort();
  pushState();
});

sortSelect.addEventListener('change', function() {
  applyFiltersAndSort();
  pushState();
});

favToggle.addEventListener('click', function() {
  showFavorites = !showFavorites;
  if (showFavorites) {
    favToggle.classList.add('active');
  } else {
    favToggle.classList.remove('active');
  }
  applyFiltersAndSort();
  pushState();
});

function renderSongs(songs) {
  grid.innerHTML = '';

  if (songs.length === 0) {
    var msg = document.createElement('p');
    msg.textContent = 'No tracks found.';
    msg.style.color = 'var(--text-secondary)';
    msg.style.padding = '40px 0';
    grid.appendChild(msg);
    return;
  }

  songs.forEach(function(song) {
    var card = buildCard(song);
    grid.appendChild(card);
  });
}

function buildCard(song) {
  var card = document.createElement('div');
  card.className = 'song-card';
  if (!song.previewUrl) {
    card.classList.add('no-preview');
  }

  var artWrap = document.createElement('div');
  artWrap.className = 'artwork-wrap';

  var img = document.createElement('img');
  var hiResArt = song.artworkUrl100.replace('100x100', '300x300');
  img.src = hiResArt;
  img.alt = song.trackName;
  img.loading = 'lazy';

  var overlay = document.createElement('div');
  overlay.className = 'play-overlay';

  var playCircle = document.createElement('div');
  playCircle.className = 'play-btn-circle';
  playCircle.innerHTML = '&#9654;';

  overlay.appendChild(playCircle);
  artWrap.appendChild(img);
  artWrap.appendChild(overlay);

  var meta = document.createElement('div');
  meta.className = 'song-meta';

  var name = document.createElement('div');
  name.className = 'song-name';
  name.textContent = song.trackName;

  var artist = document.createElement('div');
  artist.className = 'song-artist';
  artist.textContent = song.artistName;

  meta.appendChild(name);
  meta.appendChild(artist);

  if (song.primaryGenreName) {
    var genre = document.createElement('span');
    genre.className = 'song-genre';
    genre.textContent = song.primaryGenreName;
    meta.appendChild(genre);
  }

  card.appendChild(artWrap);
  card.appendChild(meta);

  if (song.previewUrl) {
    card.addEventListener('click', function() {
      openPlayer(song);
    });
  }

  var favBtn = document.createElement('button');
  favBtn.className = 'fav-btn';
  var trackIdStr = song.trackId.toString();
  
  if (favorites.includes(trackIdStr)) {
    favBtn.classList.add('liked');
    favBtn.textContent = '❤️';
  } else {
    favBtn.textContent = '🤍';
  }
  
  favBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (favorites.includes(trackIdStr)) {
      favorites = favorites.filter(function(id) { return id !== trackIdStr; });
      favBtn.classList.remove('liked');
      favBtn.textContent = '🤍';
    } else {
      favorites.push(trackIdStr);
      favBtn.classList.add('liked');
      favBtn.textContent = '❤️';
    }
    localStorage.setItem('soundSafariFavs', JSON.stringify(favorites));
    if (showFavorites) {
      applyFiltersAndSort();
    }
  });
  
  artWrap.appendChild(favBtn);

  return card;
}

function openPlayer(song) {
  var hiResArt = song.artworkUrl100.replace('100x100', '300x300');
  playerArt.src = hiResArt;
  playerTitle.textContent = song.trackName;
  playerArtist.textContent = song.artistName;
  audioPlayer.src = song.previewUrl;
  audioPlayer.play();

  playerBar.classList.remove('hidden');
  pushState();
}

closePlayerBtn.addEventListener('click', function() {
  audioPlayer.pause();
  audioPlayer.src = '';
  playerBar.classList.add('hidden');
  pushState();
});

fetchSongs();