import { fetchDailyQuote } from "./api.mjs";
import { getRandomPrompt } from "./prompts.mjs";
import { saveEntry, getEntries, getEntryById, updateEntry, getFavoriteEntries } from "./storage.mjs";

// Helpers
function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// ----- TODAY PAGE -----
export async function initTodayPage() {
  // Quote with fallback so the rest of the page still works
  let quote = {
    content: "Gratitude turns what we have into enough.",
    author: "Anonymous"
  };

  try {
    const fetched = await fetchDailyQuote();
    if (fetched && fetched.content) {
      quote = fetched;
    }
  } catch (err) {
    console.error("Quote failed, using fallback:", err);
  }

  qs("#quote-text").textContent = quote.content;
  qs("#quote-author").textContent = quote.author ? `— ${quote.author}` : "";

  // Prompt
  async function loadPrompt() {
    const prompt = await getRandomPrompt();
    qs("#prompt-text").textContent = prompt;
  }
  await loadPrompt();

  const newPromptBtn = qs("#new-prompt-btn");
  if (newPromptBtn) {
    newPromptBtn.addEventListener("click", loadPrompt);
  }

  // Form submit
  const form = qs("#entry-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = qs("#entry-text").value.trim();
    if (!text) return;

    const mood = qs("#entry-mood").value;
    const tagString = qs("#entry-tags").value;
    const tags = tagString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const entry = {
      // id will come from Firestore (storage.mjs), so no local id here
      date: new Date().toISOString(),
      text,
      mood,
      tags,
      quote: quote.content,
      quoteAuthor: quote.author || "",
      prompt: qs("#prompt-text").textContent
    };

    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving...";
      
      await saveEntry(entry);
      form.reset();
      
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Entry";
      
      alert("Entry saved! You can view it on the History Page.");
    } catch (err) {
      console.error("Error saving entry:", err);
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Entry";
      
      if (err.message.includes("logged in")) {
        alert("Please sign in to save your entry.");
      } else {
        alert("There was a problem saving your entry. Please try again.");
      }
    }
  });
}

async function toggleFavorite(entryId, favoriteState) {
  try {
    await updateEntry(entryId, { favorite: favoriteState });
  } catch (err) {
    console.error("Error updating favorite:", err);
    alert("Could not update favorite status.");
  }
}

// ----- HISTORY PAGE -----
export async function initHistoryPage() {
  const entries = await getEntries();
  renderEntriesList(entries);

  const searchInput = qs("#search-input");
  const filterMood = qs("#filter-mood");
  const filterDate = qs("#filter-date");

  function applyFilters() {
    const q = searchInput ? searchInput.value.toLowerCase() : "";
    const mood = filterMood ? filterMood.value : "";
    const date = filterDate ? filterDate.value : "";

    const filtered = entries.filter((e) => {
      const matchesMood = !mood || e.mood === mood;
      const matchesSearch =
        !q ||
        e.text.toLowerCase().includes(q) ||
        (e.tags || []).some((t) => t.toLowerCase().includes(q));

      const matchesDate =
        !date ||
        (e.date && e.date.startsWith(date)); // ISO date begins with YYYY-MM-DD

      return matchesMood && matchesSearch && matchesDate;
    });

    renderEntriesList(filtered);
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (filterMood) filterMood.addEventListener("change", applyFilters);
  if (filterDate) filterDate.addEventListener("change", applyFilters);
}

function renderEntriesList(entries) {
  const container = qs("#entries-list");
  if (!container) return;

  container.innerHTML = "";

  if (!entries.length) {
    container.textContent =
      "No entries yet. Write something on the Today Page!";
    return;
  }

  entries
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((entry) => {
      const card = document.createElement("article");
      card.className = "entry-card";

      const date = new Date(entry.date).toLocaleDateString();
      const tagsText = (entry.tags || []).join(", ");
      const isFavorite = entry.favorite || false;

      card.innerHTML = `
        <div class="entry-card-header">
          <h3>${date}</h3>
          <button class="heart-btn ${isFavorite ? 'favorited' : ''}" data-entry-id="${entry.id}">
            ${isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
        <p>${entry.text.slice(0, 120)}${
          entry.text.length > 120 ? "..." : ""
        }</p>
        <p><strong>Mood:</strong> ${entry.mood || "n/a"}</p>
        ${
          tagsText
            ? `<p><strong>Tags:</strong> ${tagsText}</p>`
            : ""
        }
      `;

      // Heart button handler
      const heartBtn = card.querySelector('.heart-btn');
      heartBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await toggleFavorite(entry.id, !isFavorite);
        // Refresh the list
        const updatedEntries = await getEntries();
        renderEntriesList(updatedEntries);
      });

      card.addEventListener("click", () => {
        // entry.id comes from Firestore (storage.mjs)
        window.location.href = `/entry/index.html?id=${encodeURIComponent(
          entry.id
        )}`;
      });

      container.appendChild(card);
    });
}

// ----- SINGLE ENTRY PAGE -----
export async function initEntryPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const container = qs("#entry-detail");
  if (!container) return;

  if (!id) {
    container.textContent = "No entry id provided.";
    return;
  }

  const entry = await getEntryById(id);
  if (!entry) {
    container.textContent = "Entry not found.";
    return;
  }

  const date = new Date(entry.date).toLocaleString();
  const tagsText = (entry.tags || []).join(", ");

  container.innerHTML = `
    <h2>${date}</h2>
    <p><strong>Mood:</strong> ${entry.mood || "n/a"}</p>
    ${
      tagsText
        ? `<p><strong>Tags:</strong> ${tagsText}</p>`
        : ""
    }
    <section>
      <h3>Entry</h3>
      <p>${entry.text}</p>
    </section>
    <section>
      <h3>Quote</h3>
      <blockquote>
        “${entry.quote}”
        <footer>${entry.quoteAuthor ? "— " + entry.quoteAuthor : ""}</footer>
      </blockquote>
    </section>
  `;
}
// ----- PROFILE PAGE -----
export async function initProfilePage() {
  const user = qs("#profile-user");
  const favoritesContainer = qs("#favorites-list");
  
  if (!user) return;

  // Get current user from auth
  const { getCurrentUser } = await import("./auth.mjs");
  const currentUser = getCurrentUser();
  
  if (currentUser) {
    user.innerHTML = `
      <h2>Profile</h2>
      <p class="profile-email">${currentUser.email}</p>
      <p class="profile-info">Member since ${new Date(currentUser.metadata.creationTime).toLocaleDateString()}</p>
    `;
  }

  // Load favorite entries
  const favorites = await getFavoriteEntries();
  
  if (!favorites.length) {
    favoritesContainer.innerHTML = '<p class="no-favorites">No favorite entries yet. Click the heart icon on any entry to add it to your favorites!</p>';
    return;
  }

  favoritesContainer.innerHTML = "";
  
  favorites.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "entry-card favorite-card";

    const date = new Date(entry.date).toLocaleDateString();
    const tagsText = (entry.tags || []).join(", ");

    card.innerHTML = `
      <div class="entry-card-header">
        <h3>${date}</h3>
        <button class="heart-btn favorited" data-entry-id="${entry.id}">❤️</button>
      </div>
      <p>${entry.text.slice(0, 120)}${
        entry.text.length > 120 ? "..." : ""
      }</p>
      <p><strong>Mood:</strong> ${entry.mood || "n/a"}</p>
      ${
        tagsText
          ? `<p><strong>Tags:</strong> ${tagsText}</p>`
          : ""
      }
    `;

    // Heart button handler
    const heartBtn = card.querySelector('.heart-btn');
    heartBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await toggleFavorite(entry.id, false);
      // Refresh the favorites list
      const updatedFavorites = await getFavoriteEntries();
      if (!updatedFavorites.length) {
        favoritesContainer.innerHTML = '<p class="no-favorites">No favorite entries yet. Click the heart icon on any entry to add it to your favorites!</p>';
      } else {
        initProfilePage();
      }
    });

    card.addEventListener("click", () => {
      location.href = `/entry/index.html?id=${entry.id}`;
    });

    favoritesContainer.appendChild(card);
  });
}