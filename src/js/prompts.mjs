let promptsCache = null;

export async function getPrompts() {
  if (promptsCache) {
    return promptsCache;
  }

  try {
    const res = await fetch("/data/prompts.json");

    if (!res.ok) {
      console.error("Failed to load prompts.json:", res.status);
      promptsCache = [];
      return promptsCache;
    }

    const data = await res.json();
    // Expect an array of { prompt: string }
    promptsCache = Array.isArray(data) ? data : [];
    return promptsCache;
  } catch (err) {
    console.error("Error fetching prompts.json:", err);
    promptsCache = [];
    return promptsCache;
  }
}

export async function getRandomPrompt() {
  const prompts = await getPrompts();

  if (!prompts.length) {
    return "Could not load a prompt. Try refreshing the page.";
  }

  const index = Math.floor(Math.random() * prompts.length);
  return prompts[index].prompt;
}
