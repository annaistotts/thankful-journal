const QUOTE_API_URL = "https://api.quotable.io/random?tags=gratitude";

const FALLBACK_QUOTES = [
  {
    content: "Gratitude turns what we have into enough.",
    author: "Anonymous"
  },
  {
    content: "Gratitude is not only the greatest of virtues, but the parent of all others.",
    author: "Cicero"
  },
  {
    content: "The roots of all goodness lie in the soil of appreciation for goodness.",
    author: "Dalai Lama"
  },
  {
    content: "Acknowledging the good that you already have in your life is the foundation for all abundance.",
    author: "Eckhart Tolle"
  },
  {
    content: "When you are grateful, fear disappears and abundance appears.",
    author: "Tony Robbins"
  },
  {
    content: "Gratitude makes sense of our past, brings peace for today, and creates a vision for tomorrow.",
    author: "Melody Beattie"
  },
  {
    content: "Enjoy the little things, for one day you may look back and realize they were the big things.",
    author: "Robert Brault"
  },
  {
    content: "Gratitude is the healthiest of all human emotions.",
    author: "Zig Ziglar"
  }
];

export async function fetchDailyQuote() {
  // Try API first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const res = await fetch(QUOTE_API_URL, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const data = await res.json();
    
    if (data && data.content) {
      return {
        content: data.content,
        author: data.author || "Unknown"
      };
    }
  } catch (err) {
    console.log("Quote API unavailable, using fallback quotes");
  }

  // Return random fallback quote
  const randomQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  return randomQuote;
}
