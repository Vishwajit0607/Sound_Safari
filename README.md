# Sound Safari

> A smart music discovery web application that lets users explore, filter, and experience music interactively using real-time API data.

---

## Project Overview

Sound Safari is a frontend web application built using JavaScript that allows users to browse and explore music in a dynamic and user-friendly way. The app fetches music data from a public API and provides powerful features like search, filtering, sorting, and audio preview — all handled efficiently on the frontend.

The goal of this project is to demonstrate strong understanding of:

* API integration using `fetch()`
* Array Higher-Order Functions (HOFs)
* UI/UX design and responsiveness

---

## Features

### Music Browsing

* Display a list of songs with:

  * Song name
  * Artist name
  * Album artwork

### Search Functionality

* Search songs by name using real-time filtering

### Filtering

* Filter songs based on:

  * Genre
  * Artist

### Sorting

* Sort songs:

  * Alphabetically (A–Z / Z–A)

### Audio Preview

* Play song previews directly in the browser
* Displays corresponding album artwork while playing

### Bonus Features

* Loading screen while fetching data
* Responsive design (mobile, tablet, desktop)
* Debounced search (optional)
* Favorites using localStorage (optional)

---

## API Used

iTunes Search API

* Endpoint:

```
https://itunes.apple.com/search?term=music&entity=song&limit=100
```

### Data Retrieved:

* `trackName` → Song title
* `artistName` → Artist
* `artworkUrl100` → Album image
* `previewUrl` → Audio preview
* `primaryGenreName` → Genre

### Authentication:

* No API key required
* No OAuth needed

---

## Technical Implementation

### API Integration

* Data is fetched once using `fetch()`
* Stored in a variable and reused to avoid multiple API calls

```js
let allSongs = [];
```

---

### Array Higher-Order Functions Used

#### Search

```js
songs.filter(song =>
  song.trackName.toLowerCase().includes(searchTerm)
)
```

#### Filter

```js
songs.filter(song =>
  song.primaryGenreName === selectedGenre
)
```

#### Sort

```js
songs.sort((a, b) =>
  a.trackName.localeCompare(b.trackName)
)
```

#### Combined Logic

```js
const result = songs
  .filter(...)
  .filter(...)
  .sort(...)
```

> No traditional loops (`for`, `while`) are used for these operations.

---

## Project Structure

```
Sound_Safari/
│── index.html
│── style.css
│── script.js
│── README.md
```

(Structure may vary if using frameworks like React/Vite)

---

## Execution Plan (Milestones)

### Milestone 1: Setup

* Project idea finalized
* API selected
* GitHub repo created
* README added

### Milestone 2: API Integration

* Fetch data using API
* Display songs dynamically
* Add loading state

### Milestone 3: Core Features

* Implement search, filter, sort
* Add interactivity (audio player, UI updates)

### Milestone 4: Finalization

* Clean code and refactor
* Update documentation
* Deploy project

---

## Error Handling

* Handles API failures gracefully
* Displays fallback UI when data is unavailable
* Skips songs without preview/audio

```js
if (!song.previewUrl) {
  // Hide or disable play button
}
```

---

## Responsiveness

* Fully responsive design
* Works across:

  * Mobile
  * Tablet
  * Desktop

---

## Future Enhancements

* Dark mode / Light mode toggle
* Pagination or infinite scroll
* Advanced filtering (multiple conditions)
* Improved UI animations
* Playlist or favorites system

---

## Conclusion

Sound Safari is designed to showcase strong JavaScript fundamentals, clean UI design, and efficient API usage. It focuses on performance, usability, and interactive user experience — aligning perfectly with project evaluation criteria.

---

## How to Run

1. Clone the repository:

```
git clone https://github.com/your-username/Sound_Safari.git
```

2. Open the project folder

3. Run `index.html` in your browser

---

## Acknowledgment

* iTunes API for providing music data
* Public APIs repository for API resources

---
