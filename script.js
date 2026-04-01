let allSongs = [];

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

      loader.classList.add('hidden');
      app.classList.remove('hidden');

      songCountEl.textContent = allSongs.length + ' tracks loaded';
      renderSongs(allSongs);
    })
    .catch(function(err) {
      loader.innerHTML = '<p style="color:#8a8a9a;font-size:0.9rem;">Failed to load tracks. Please try again.</p>';
      console.error('Fetch error:', err);
    });
}

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
}

closePlayerBtn.addEventListener('click', function() {
  audioPlayer.pause();
  audioPlayer.src = '';
  playerBar.classList.add('hidden');
});

fetchSongs();