export default async function loadComponent(selector, url) {
  if (!url || !url.trim()) {
    console.error("Invalid URL:", url);
    return;
  }
  if (!selector || !document.querySelector(selector)) {
    console.error("Invalid selector:", selector);
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(
        `Failed to load file: ${response.status} - ${response.statusText}`
      );

    const html = await response.text();
    document.querySelector(selector).innerHTML = html;
  } catch (error) {
    console.error("Error loading component:", error);
  }
}
