export async function navbar() {
  const list = document.querySelectorAll(".navbar .nav .nav-main .links a");

  const getUrl = list.forEach((link) => {
    link.getAttribute("href") === "/listing";
  });

  if (window.location.pathname === "https://makanear.github.io/listing/") {
    getUrl.classList.add("active");
  }

  // ----- Display Logout Button ----- //
  const loginCookie = window.Cookies.get("login"); // Access Cookies from window object
  const logoutButton = document.querySelector(".nav-others .logout");
  const loginButton = document.querySelector(".nav-others .to-login");

  if (logoutButton) {
    if (loginCookie) {
      logoutButton.style.display = "inline-block";
      loginButton.style.display = "none";
    } else {
      logoutButton.style.display = "none";
      loginButton.style.display = "inline-block";
    }

    // ----- Logout ----- //
    logoutButton.addEventListener("click", () => {
      window.Cookies.remove("login"); // Use window.Cookies to remove cookie
      window.location.href = "/login";
    });
  }
}
