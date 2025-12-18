import { initAuth } from "./auth.mjs";
import { initAuthUI, updateAuthUI } from "./authUI.mjs";
import { initTodayPage, initHistoryPage, initEntryPage, initProfilePage } from "./ui.mjs";

async function main() {
  // Wait for Firebase Auth to finish figuring out the user
  await initAuth((user) => {
    updateAuthUI(user);
  });

  initAuthUI();

  const page = document.body.dataset.page;
  if (page === "today") initTodayPage();
  if (page === "history") initHistoryPage();
  if (page === "entry") initEntryPage();
  if (page === "profile") initProfilePage();
}

main();
