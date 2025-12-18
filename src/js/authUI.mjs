import { login, register, logout } from "./auth.mjs";

let isRegisterMode = false;

export function initAuthUI() {
  const modal = document.querySelector("#auth-modal");
  const signInBtn = document.querySelector("#sign-in-btn");
  const logoutBtn = document.querySelector("#logout-btn");
  const modalClose = document.querySelector(".modal-close");
  const authForm = document.querySelector("#auth-form");
  const toggleModeBtn = document.querySelector("#toggle-mode-btn");
  const modalTitle = document.querySelector("#modal-title");
  const submitBtn = document.querySelector("#modal-submit-btn");
  const toggleText = document.querySelector("#toggle-text");
  const authError = document.querySelector("#auth-error");

  if (!modal || !signInBtn) return;

  // Open modal
  signInBtn.addEventListener("click", () => {
    openModal();
  });

  // Close modal
  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Toggle between login/register
  toggleModeBtn.addEventListener("click", () => {
    isRegisterMode = !isRegisterMode;
    updateModalMode();
  });

  // Handle form submission
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    authError.textContent = "";

    const email = document.querySelector("#auth-email").value;
    const password = document.querySelector("#auth-password").value;

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = isRegisterMode ? "Creating account..." : "Signing in...";

      if (isRegisterMode) {
        await register(email, password);
      } else {
        await login(email, password);
      }

      closeModal();
      authForm.reset();
    } catch (err) {
      authError.textContent = err.message;
    } finally {
      submitBtn.disabled = false;
      updateModalMode();
    }
  });

  // Logout
  logoutBtn.addEventListener("click", async () => {
    await logout();
  });

  function openModal() {
    modal.classList.add("show");
    authError.textContent = "";
    authForm.reset();
  }

  function closeModal() {
    modal.classList.remove("show");
    isRegisterMode = false;
    updateModalMode();
  }

  function updateModalMode() {
    if (isRegisterMode) {
      modalTitle.textContent = "Register";
      submitBtn.textContent = "Create Account";
      toggleText.textContent = "Already have an account?";
      toggleModeBtn.textContent = "Sign In";
    } else {
      modalTitle.textContent = "Sign In";
      submitBtn.textContent = "Sign In";
      toggleText.textContent = "Don't have an account?";
      toggleModeBtn.textContent = "Register";
    }
  }
}

export function updateAuthUI(user) {
  const signInBtn = document.querySelector("#sign-in-btn");
  const logoutBtn = document.querySelector("#logout-btn");
  const userEmail = document.querySelector("#user-email");

  if (!signInBtn) return;

  if (user) {
    signInBtn.style.display = "none";
    logoutBtn.style.display = "block";
    userEmail.textContent = user.email;
  } else {
    signInBtn.style.display = "block";
    logoutBtn.style.display = "none";
    userEmail.textContent = "";
  }
}
