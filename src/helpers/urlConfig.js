//lib call
import { folderPath } from "https://cdn.jsdelivr.net/gh/jscroot/url@0.0.9/croot.js";

export const croot = folderPath() + "src/";

export const folder = {
  components: croot + "components/",
  pages: croot + "pages/",
  helpers: croot + "helpers/",
};

export const url = {
  components: {
    navbar: folder.components + "navbar/",
    footer: folder.components + "footer/",
  },
  pages: {
    listing: folder.pages + "listing/",
  },
};
