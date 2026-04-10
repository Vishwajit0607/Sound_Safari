# Sound Safari 🎧

> A smart music discovery web application that lets users explore, filter, and experience music interactively using real-time API data. Upgraded to a production-ready standard, strictly demonstrating higher order functional programming patterns.

---

## 🚀 Project Overview (Milestone 4 Ready)

Sound Safari is a comprehensive frontend web application engineered with vanilla Javascript. It fetches live data from the iTunes Music API, allowing users to search, filter, sort, and preview audio seamlessly on the frontend. The project adheres to strict functional programming guidelines wherein all array manipulations and dataset derivations utilize Higher-Order Functions (HOFs) rather than traditional explicit loops (`for`, `while`).

The overarching goals met by this project include:
- Robust API integration using asynchronous `fetch()`.
- Complex data manipulation utilizing exclusively Array HOFs (`.filter()`, `.map()`, `.reduce()`, `.slice()`, etc.).
- Complete state history management (using a manual stack and UI hydration).
- Real-world performance implementation via custom input Debouncing and Pagination.

---

## ✨ Features Supported

### 🔍 Search & Filtering
- **Real-Time Contextual Search:** Find any song by title or artist via a debounced input that maintains optimal performance.
- **Dynamic Category Filtering:** Auto-generated filters derived efficiently from API responses.

### 🔀 Sorting & Organization
- **Multi-Sort Modes:** Sort arrays alphabetically ascending/descending conditionally via string comparisons (`localeCompare`).
- **Pagination Module:** Built cleanly utilizing array slicing (`.slice(start, end)`), efficiently rendering chunks of datasets natively without subsequent network requests.

### 💿 Audio & Interaction 
- **In-Browser Audio Player:** Direct and responsive audio playback tied intelligently with visual updates (album artwork switching dynamically).
- **Persistent LocalStorage State:** Mark songs as favorites, which remain preserved in the browser's `localStorage` to persist between sessions.
- **Back/Forward Simulation:** Uses a custom internal history array to travel backward and restore complex UI application states flawlessly.

### 🎨 Visual & UI Design
- **Responsive Architecture:** Fully scalable mobile, tablet, and desktop views. Seamless layout modifications leveraging modern CSS Grid & Flexbox strategies.
- **Premium User Context:** Detailed loaders, bespoke empty search states, and error handling elements are natively handled.
- **Light / Dark Mode Engine:** Complete theme token inversion manually toggleable and persisted to User Preferences (`localStorage`).

---

## 🛠️ Technical Implementation & HOF Patterns

### Strict HOF Constraint

The requirement restricted any usage of legacy loop syntaxes (`for()`, `while()`). To construct the logic, we heavily relied on JavaScript Array primitives:

#### 1. Search, Filter, and Sort Sequence
```js
let filtered = allSongs.filter(song => 
  song.trackName.toLowerCase().includes(searchTerm) || 
  song.artistName.toLowerCase().includes(searchTerm)
);

if (selectedGenre !== 'all') {
  filtered = filtered.filter(song => song.primaryGenreName === selectedGenre);
}

filtered.sort((a, b) => {
  if (sortValue === 'title-asc') return a.trackName.localeCompare(b.trackName);
  if (sortValue === 'title-desc') return b.trackName.localeCompare(a.trackName);
  return 0; //... Fallback logic 
});
```

#### 2. Unique Genre Derivation (Map and Set)
```js
// Map extracts all genres, Set filters out duplicates uniquely, and Array rest param reconstructs it prior to sorting.
const genres = [...new Set(allSongs.map(s => s.primaryGenreName).filter(Boolean))].sort();
```

#### 3. Client-Side Pagination (Slice)
```js
const startIndex = (currentPage - 1) * itemsPerPage;
const paginatedSongs = filtered.slice(startIndex, startIndex + itemsPerPage);
renderSongs(paginatedSongs);
```

#### 4. Custom App Debouncer
```js
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => { func.apply(null, args); }, delay);
  };
};
```

---

## 📂 Architecture

```
Sound_Safari/
│── index.html          # Core layout, semantic structure, links, templates.
│── css/
│   ╰── style.css       # Robust modern stylesheet (CSS Variables, Flexbox, Grids)
│── js/
│   ╰── app.js          # Core monolithic script containing the initialized engine state, HOF logics, and UI interactions
│── README.md
```

---

## 📸 Screenshots

*(Replace these placeholders with proper screenshot images before final presentation.)*

| Dashboard Layout (Dark Mode) | Mobile Adaptation (Light Mode) |
| --- | --- |
| ![Dark Mode Dashboard](https://via.placeholder.com/600x350?text=Dark+Mode+Dashboard+View) | ![Mobile Dashboard](https://via.placeholder.com/250x350?text=Mobile+Light+View) |

---

## 🌐 How to Deploy (Netlify/Vercel Guide)

This application contains zero backend build dependencies and can be instantly deployed as a static site.

### Deploying via Netlify
1. Register/Login on [Netlify](https://www.netlify.com).
2. Click **"Add new site"** > **"Import an existing project"**.
3. Connect your **GitHub** account and select the `Sound_Safari` repository.
4. Leave the "Build command" and "Publish directory" strictly empty (or default) as it operates entirely from the root directory.
5. Click **"Deploy site"**. Netlify will launch the project online within seconds.

---

## 🖥️ Local Installation
If you want to view it on your local server:
1. Clone the repository: `git clone https://github.com/Vishwajit0607/Sound_Safari.git`
2. Launch in your preferred code editor (VSCode).
3. Use an extension like **Live Server** to host the static HTML, or simply execute `npx serve .` in the project directory.

*(No Node modules or complex `.env` files required to operate)*

---

### Conclusion
By conforming entirely explicitly to specific structural restrictions, Milestone 4 showcases an application ready for production, complete with error fallbacks and modernized styling, satisfying all robust developer evaluation benchmarks beautifully.
