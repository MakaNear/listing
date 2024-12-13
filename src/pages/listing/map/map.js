import Map from "https://cdn.skypack.dev/ol/Map.js";
import View from "https://cdn.skypack.dev/ol/View.js";
import TileLayer from "https://cdn.skypack.dev/ol/layer/Tile.js";
import VectorLayer from "https://cdn.skypack.dev/ol/layer/Vector.js";
import VectorSource from "https://cdn.skypack.dev/ol/source/Vector.js";
import OSM from "https://cdn.skypack.dev/ol/source/OSM.js";
import { fromLonLat, toLonLat } from "https://cdn.skypack.dev/ol/proj.js";
import { Style, Stroke, Icon, Fill } from "https://cdn.skypack.dev/ol/style.js";
import Point from "https://cdn.skypack.dev/ol/geom/Point.js";
import Feature from "https://cdn.skypack.dev/ol/Feature.js";
import GeoJSON from "https://cdn.skypack.dev/ol/format/GeoJSON.js";

const attributions =
  '<a href="https://petapedia.github.io/" target="_blank">&copy; PetaPedia Indonesia</a>';
const place = [107.57634352477324, -6.87436891415509];

const basemap = new TileLayer({
  source: new OSM({ attributions: attributions }),
});

const defaultstartmap = new View({
  center: fromLonLat(place),
  zoom: 16,
});

const roadsSource = new VectorSource();
const roadsLayer = new VectorLayer({
  source: roadsSource,
  style: new Style({
    stroke: new Stroke({
      color: "blue",
      width: 2,
    }),
  }),
});

const markerSource = new VectorSource();
const markerLayer = new VectorLayer({
  source: markerSource,
  style: new Style({
    image: new Icon({
      src:
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path fill="red" d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 10.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>`),
      scale: 1,
      anchor: [0.5, 1],
    }),
  }),
});

const polygonSource = new VectorSource();
const polygonLayer = new VectorLayer({
  source: polygonSource,
  style: new Style({
    fill: new Fill({
      color: "rgba(165, 163, 164, 0.59)",
    }),
    stroke: new Stroke({
      color: "gray",
      width: 2,
    }),
  }),
});

let clickedCoordinates = null;

export async function displayMap() {
  const map = new Map({
    target: "listing-map",
    layers: [basemap, roadsLayer, markerLayer, polygonLayer],
    view: defaultstartmap,
  });

  map.on("singleclick", function (event) {
    if (clickedCoordinates) {
      Swal.fire({
        title: "Location Selected",
        text: "You have already selected a location. Please reset to select a new location.",
        icon: "info",
      });
      return;
    }

    clickedCoordinates = toLonLat(event.coordinate);
    console.log(
      `Clicked on: ${clickedCoordinates[0]}, ${clickedCoordinates[1]}`
    );
    addMarker(event.coordinate);
  });

  document
    .getElementById("searchRegion")
    .addEventListener("click", async function () {
      if (clickedCoordinates) {
        const [longitude, latitude] = clickedCoordinates;

        const geoJSON = await fetchRegionGeoJSON(longitude, latitude);
        if (geoJSON) {
          displayRegionResults(geoJSON);
        }
      } else {
        Swal.fire({
          title: "No Location Selected",
          text: "Please click on the map to select a location.",
          icon: "warning",
        });
      }
    });

  document
    .getElementById("searchRoad")
    .addEventListener("click", async function () {
      if (clickedCoordinates) {
        const maxDistance = document.getElementById("maxDistance").value;
        if (!maxDistance || isNaN(maxDistance)) {
          Swal.fire({
            title: "Invalid Input",
            text: "Please enter a valid max distance!",
            icon: "error",
          });
          return;
        }

        const response = await fetchRoads(
          clickedCoordinates[0],
          clickedCoordinates[1],
          Number(maxDistance)
        );
        if (response) {
          displayRoadResults(response);
        }
      } else {
        Swal.fire({
          title: "No Location Selected",
          text: "Please click on the map first!",
          icon: "warning",
        });
      }
    });

  document.getElementById("resetSelection").addEventListener("click", () => {
    clickedCoordinates = null;
    markerSource.clear();
    roadsSource.clear();
    polygonSource.clear();
    document.querySelector(".listing-overview-layout").innerHTML = "";
    Swal.fire({
      title: "Reset Complete",
      text: "You can now select a new location.",
      icon: "success",
    });
  });
}

async function fetchRegionGeoJSON(longitude, latitude) {
  // Simpan fungsi asli Anda di sini
}

async function fetchRoads(longitude, latitude, maxDistance) {
  // Simpan fungsi asli Anda di sini
}

function displayRegionResults(geoJSON) {
  const layout = document.querySelector(".listing-overview-layout");
  layout.innerHTML = `
    <div class="result-item">
      <h4>Region Info:</h4>
      <p><strong>District:</strong> ${
        geoJSON.features[0]?.properties?.district || "Unknown"
      }</p>
      <p><strong>Province:</strong> ${
        geoJSON.features[0]?.properties?.province || "Unknown"
      }</p>
      <p><strong>Sub-district:</strong> ${
        geoJSON.features[0]?.properties?.sub_district || "Unknown"
      }</p>
      <p><strong>Village:</strong> ${
        geoJSON.features[0]?.properties?.village || "Unknown"
      }</p>
    </div>
  `;
}

function displayRoadResults(data) {
  const layout = document.querySelector(".listing-overview-layout");
  layout.innerHTML = `
    <h4>Roads Info:</h4>
    <ul>
      ${data
        .map(
          (road) => `
        <li>
          <strong>Name:</strong> ${road.properties.name || "Unknown"}<br>
          <strong>Type:</strong> ${road.properties.highway || "Unknown"}
        </li>
      `
        )
        .join("")}
    </ul>
  `;
}

function addMarker(coordinate) {
  const marker = new Feature({
    geometry: new Point(coordinate),
  });

  markerSource.clear();
  markerSource.addFeature(marker);
}
