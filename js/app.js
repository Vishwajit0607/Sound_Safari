let allSongs = [];
let favorites = JSON.parse(localStorage.getItem('soundSafariFavs')) || [];
let showFavorites = false;

// Pagination configuration
let currentPage = 1;
const itemsPerPage = 20;

let currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'light') document.body.classList.add('light-mode');

// DOM Elements
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

// Pagination Elements
const paginationControls = document.getElementById('pagination-controls');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfoEl = document.getElementById('page-info');

// History state
let historyStack = [];
let isNavigatingBack = false;

// Helpers
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

const captureState = () => {
  return {
    searchTerm: searchInput.value,
    selectedGenre: genreFilter.value,
    sortValue: sortSelect.value,
    showFavorites: showFavorites,
    currentPage: currentPage,
    playerOpen: !playerBar.classList.contains('hidden'),
    playerArtSrc: playerArt.src,
    playerTitle: playerTitle.textContent,
    playerArtist: playerArtist.textContent,
    audioSrc: audioPlayer.src
  };
};

const updateBackButton = () => {
  if (historyStack.length > 1) {
    backBtn.classList.remove('disabled');
    backBtn.removeAttribute('disabled');
  } else {
    backBtn.classList.add('disabled');
    backBtn.setAttribute('disabled', 'true');
  }
};

const pushState = () => {
  if (isNavigatingBack) return;
  const state = captureState();
  
  if (historyStack.length > 0) {
    const last = historyStack[historyStack.length - 1];
    if (last.searchTerm === state.searchTerm &&
        last.selectedGenre === state.selectedGenre &&
        last.sortValue === state.sortValue &&
        last.showFavorites === state.showFavorites &&
        last.currentPage === state.currentPage &&
        last.playerOpen === state.playerOpen &&
        last.audioSrc === state.audioSrc) {
       return; 
    }
  }
  
  historyStack.push(state);
  if (historyStack.length > 30) historyStack.shift();
  updateBackButton();
};

const popState = () => {
  if (historyStack.length <= 1) return;
  
  historyStack.pop(); 
  const prevState = historyStack[historyStack.length - 1]; 
  
  isNavigatingBack = true;
  
  // Restore State
  searchInput.value = prevState.searchTerm;
  genreFilter.value = prevState.selectedGenre;
  sortSelect.value = prevState.sortValue;
  showFavorites = prevState.showFavorites;
  currentPage = prevState.currentPage || 1;
  
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
};

backBtn.addEventListener('click', popState);

homeBtn.addEventListener('click', () => {
  searchInput.value = '';
  genreFilter.value = 'all';
  sortSelect.value = 'default';
  showFavorites = false;
  currentPage = 1;
  favToggle.classList.remove('active');
  
  applyFiltersAndSort();
  pushState();
});

themeToggleBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
themeToggleBtn.addEventListener('click', () => {
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

const updatePaginationUi = (totalItems) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  if(totalItems > itemsPerPage) {
    paginationControls.classList.remove('hidden');
  } else {
    paginationControls.classList.add('hidden');
  }

  pageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`;
  
  prevPageBtn.disabled = currentPage === 1;
  prevPageBtn.classList.toggle('disabled', currentPage === 1);
  
  nextPageBtn.disabled = currentPage === totalPages;
  nextPageBtn.classList.toggle('disabled', currentPage === totalPages);
};

const applyFiltersAndSort = () => {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedGenre = genreFilter.value;
  const sortValue = sortSelect.value;

  let filtered = allSongs.filter(song => 
    song.trackName.toLowerCase().includes(searchTerm) || 
    song.artistName.toLowerCase().includes(searchTerm)
  );

  if (selectedGenre !== 'all') {
    filtered = filtered.filter(song => song.primaryGenreName === selectedGenre);
  }

  if (showFavorites) {
    filtered = filtered.filter(song => favorites.includes(song.trackId.toString()));
  }

  filtered.sort((a, b) => {
    if (sortValue === 'title-asc') return a.trackName.localeCompare(b.trackName);
    if (sortValue === 'title-desc') return b.trackName.localeCompare(a.trackName);
    if (sortValue === 'artist-asc') return a.artistName.localeCompare(b.artistName);
    return 0;
  });

  songCountEl.textContent = `${filtered.length} tracks`;
  
  // Update Pagination Controls
  updatePaginationUi(filtered.length);

  // Apply Array Slice for Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSongs = filtered.slice(startIndex, startIndex + itemsPerPage);

  renderSongs(paginatedSongs);
};

// Handlers
const debouncedSearch = debounce(() => {
  currentPage = 1;
  applyFiltersAndSort();
  pushState();
}, 400);

searchInput.addEventListener('input', debouncedSearch);

genreFilter.addEventListener('change', () => {
  currentPage = 1;
  applyFiltersAndSort();
  pushState();
});

sortSelect.addEventListener('change', () => {
  currentPage = 1;
  applyFiltersAndSort();
  pushState();
});

favToggle.addEventListener('click', () => {
  showFavorites = !showFavorites;
  currentPage = 1;
  favToggle.classList.toggle('active', showFavorites);
  applyFiltersAndSort();
  pushState();
});

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    applyFiltersAndSort();
    pushState();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

nextPageBtn.addEventListener('click', () => {
  currentPage++;
  applyFiltersAndSort();
  pushState();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const renderSongs = (songs) => {
  grid.innerHTML = '';

  if (songs.length === 0) {
    const msg = document.createElement('div');
    msg.className = 'empty-state';
    msg.innerHTML = `
      <div class="empty-icon">🎧</div>
      <h3>No tracks found</h3>
      <p>Try adjusting your search or filters.</p>
    `;
    grid.appendChild(msg);
    return;
  }

  const fragment = document.createDocumentFragment();
  songs.forEach(song => {
    const card = buildCard(song);
    fragment.appendChild(card);
  });
  grid.appendChild(fragment);
};

const buildCard = (song) => {
  const card = document.createElement('div');
  card.className = 'song-card';
  if (!song.previewUrl) card.classList.add('no-preview');

  const artWrap = document.createElement('div');
  artWrap.className = 'artwork-wrap';

  const img = document.createElement('img');
  const hiResArt = song.artworkUrl100.replace('100x100', '300x300');
  img.src = hiResArt;
  img.alt = song.trackName;
  img.loading = 'lazy';

  const overlay = document.createElement('div');
  overlay.className = 'play-overlay';

  const playCircle = document.createElement('div');
  playCircle.className = 'play-btn-circle';
  playCircle.innerHTML = '&#9654;';

  overlay.appendChild(playCircle);
  artWrap.appendChild(img);
  artWrap.appendChild(overlay);

  const meta = document.createElement('div');
  meta.className = 'song-meta';

  const name = document.createElement('div');
  name.className = 'song-name';
  name.textContent = song.trackName;

  const artist = document.createElement('div');
  artist.className = 'song-artist';
  artist.textContent = song.artistName;

  meta.appendChild(name);
  meta.appendChild(artist);

  if (song.primaryGenreName) {
    const genre = document.createElement('span');
    genre.className = 'song-genre';
    genre.textContent = song.primaryGenreName;
    meta.appendChild(genre);
  }

  card.appendChild(artWrap);
  card.appendChild(meta);

  if (song.previewUrl) {
    card.addEventListener('click', () => openPlayer(song));
  }

  const favBtn = document.createElement('button');
  favBtn.className = 'fav-btn';
  const trackIdStr = song.trackId.toString();
  
  if (favorites.includes(trackIdStr)) {
    favBtn.classList.add('liked');
    favBtn.textContent = '❤️';
  } else {
    favBtn.textContent = '🤍';
  }
  
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (favorites.includes(trackIdStr)) {
      favorites = favorites.filter(id => id !== trackIdStr);
      favBtn.classList.remove('liked');
      favBtn.textContent = '🤍';
    } else {
      favorites.push(trackIdStr);
      favBtn.classList.add('liked');
      favBtn.textContent = '❤️';
    }
    localStorage.setItem('soundSafariFavs', JSON.stringify(favorites));
    if (showFavorites) applyFiltersAndSort();
  });
  
  artWrap.appendChild(favBtn);

  return card;
};

const openPlayer = (song) => {
  const hiResArt = song.artworkUrl100.replace('100x100', '300x300');
  playerArt.src = hiResArt;
  playerTitle.textContent = song.trackName;
  playerArtist.textContent = song.artistName;
  audioPlayer.src = song.previewUrl;
  audioPlayer.play();

  playerBar.classList.remove('hidden');
  pushState();
};

closePlayerBtn.addEventListener('click', () => {
  audioPlayer.pause();
  audioPlayer.src = '';
  playerBar.classList.add('hidden');
  pushState();
});

const fetchSongs = async () => {
  const url = 'https://itunes.apple.com/search?term=music&entity=song&limit=100';

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);
    const data = await res.json();
    
    allSongs = data.results.filter(item => item.trackName && item.artistName && item.artworkUrl100);

    // Extract unique genres for filter using Map / Set
    const genres = [...new Set(allSongs.map(s => s.primaryGenreName).filter(Boolean))].sort();
    
    genres.forEach(genre => {
      const option = document.createElement('option');
      option.value = genre;
      option.textContent = genre;
      genreFilter.appendChild(option);
    });

    loader.classList.add('hidden');
    app.classList.remove('hidden');

    applyFiltersAndSort();
    pushState();
  } catch (err) {
    loader.innerHTML = `
      <div class="error-state">
        <div class="empty-icon">⚠️</div>
        <h3>Failed to load tracks</h3>
        <p>Please check your connection and try again.</p>
        <button class="back-btn" onclick="location.reload()">Retry</button>
      </div>`;
    console.error('Fetch error:', err);
  }
};

// Initialize Application
fetchSongs();