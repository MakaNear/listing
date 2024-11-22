import loadComponent from "../../helpers/loadComponent.js";
import { smoothScroll } from "../../helpers/smoothScroll.js";
import { navbar } from "../../components/navbar/navbar.js";
import { url } from "../../helpers/urlConfig.js";
import { displayMap } from "./map/map.js";
import { toogleLayout, overviewLayout } from "./overview/overview.js";
import { fetchOverview } from "./overview/fetchOverview.js";

export async function main() {
  const promises = [
    loadComponent("header.navbar", url.components.navbar + "navbar.html"),
    loadComponent(".listing .listing-map", url.pages.listing + "map/map.html"),
    loadComponent(
      ".listing .listing-filter",
      url.pages.listing + "filter/filter.html"
    ),
    loadComponent(
      ".listing .listing-overview",
      url.pages.listing + "overview/overview.html"
    ),
    loadComponent("footer.footer", url.components.footer + "footer.html"),
  ];

  Promise.all(promises)
    .then(() => {
      smoothScroll();
      navbar();
      displayMap();
      toogleLayout();
      overviewLayout();
      fetchOverview();
    })
    .catch((error) => {
      console.error("Error loading components:", error);
    });
}
