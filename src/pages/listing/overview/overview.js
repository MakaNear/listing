export function toogleLayout() {
  const layoutItems = document.querySelectorAll(
    ".listing-overview-header .layout .material-symbols-rounded"
  );

  layoutItems.forEach((item) => {
    item.addEventListener("click", () => {
      layoutItems.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");

      overviewLayout();
    });
  });
}

export function overviewLayout() {
  const activeLayout = document.querySelector(
    ".listing-overview-header .layout .material-symbols-rounded.active"
  );
  const overviewWrapper = document.querySelector(".listing-overview-layout");
  const overviewWrapperActive = document.querySelector(
    ".listing-overview-layout-active"
  );

  if (activeLayout) {
    const textActiveItem = activeLayout.textContent.trim();

    if (textActiveItem === "format_list_bulleted") {
      overviewWrapperActive.style.display = "grid";
      overviewWrapper.style.display = "none";
    } else {
      overviewWrapperActive.style.display = "none";
      overviewWrapper.style.display = "grid";
    }
  }
}
