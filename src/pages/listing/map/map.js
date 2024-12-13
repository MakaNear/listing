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
        encodeURIComponent(
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          >
            <path
              fill="red"
              d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 10.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            />
          </svg>
        ),
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
let isResultDisplayed = false;

export async function displayMap() {
  const map = new Map({
    target: "listing-map",
    layers: [basemap, roadsLayer, markerLayer, polygonLayer],
    view: defaultstartmap,
  });

  map.on("singleclick", function (event) {
    // Periksa apakah klik dilakukan pada fitur di layer
    let featureClicked = false;

    map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
      if (layer === roadsLayer || layer === polygonLayer) {
        // Jika fitur di roadsLayer atau polygonLayer diklik, set flag
        featureClicked = true;

        // Tampilkan info tentang fitur yang diklik
        if (layer === roadsLayer) {
          console.log("Road GeoJSON:", feature.getProperties());
          Swal.fire({
            title: "Road Info",
            text: `Name: ${feature.get("name") || "Unknown"}\nType: ${
              feature.get("highway") || "Unknown"
            }`,
            icon: "info",
          });
        } else if (layer === polygonLayer) {
          console.log("Polygon GeoJSON:", feature.getProperties());
          Swal.fire({
            title: "Polygon Info",
            html: `<p><strong>District:</strong> ${
              feature.get("district") || "Unknown"
            }</p>
                   <p><strong>Province:</strong> ${
                     feature.get("province") || "Unknown"
                   }</p>
                   <p><strong>Sub-district:</strong> ${
                     feature.get("sub_district") || "Unknown"
                   }</p>
                   <p><strong>Village:</strong> ${
                     feature.get("village") || "Unknown"
                   }</p>`,
            icon: "info",
          });
        }
      }
    });

    if (featureClicked) {
      // Jika klik dilakukan pada fitur, jangan tambahkan koordinat baru
      return;
    }

    // Jika klik bukan pada fitur, lanjutkan untuk menambahkan koordinat
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
        roadsSource.clear();

        const geoJSON = await fetchRegionGeoJSON(longitude, latitude);
        if (geoJSON) {
          displayPolygonOnMap(geoJSON);
          isResultDisplayed = true; // Set hasil sudah ditampilkan
        }
      } else {
        Swal.fire({
          title: "No Location Selected",
          text: "Please click on the map to select a region.",
          icon: "info",
          confirmButtonText: "OK",
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
            confirmButtonText: "OK",
          });
          return;
        }

        polygonSource.clear();
        const response = await fetchRoads(
          clickedCoordinates[0],
          clickedCoordinates[1],
          Number(maxDistance)
        );
        if (response) {
          const geoJSON = convertToGeoJSON(response);
          displayRoads(geoJSON);
          isResultDisplayed = true; // Set hasil sudah ditampilkan
        }
      } else {
        Swal.fire({
          title: "No Location Selected",
          text: "Please click on the map first!",
          icon: "info",
          confirmButtonText: "OK",
        });
      }
    });

  // Tombol Reset untuk memungkinkan klik ulang
  document.getElementById("reset").addEventListener("click", () => {
    clickedCoordinates = null;
    isResultDisplayed = false; // Reset status hasil
    markerSource.clear(); // Hapus marker
    roadsSource.clear(); // Hapus jalan
    polygonSource.clear(); // Hapus polygon
    document.getElementById("regionResult").innerHTML = ""; // Kosongkan hasil region
    document.getElementById("roadsResult").innerHTML = ""; // Kosongkan hasil roads
    Swal.fire({
      title: "Reset Complete",
      text: "You can now select a new location on the map.",
      icon: "success",
      confirmButtonText: "OK",
    });
  });
}

async function fetchRegionGeoJSON(longitude, latitude) {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("login="))
      ?.split("=")[1];

    if (!token) {
      Swal.fire({
        title: "Authentication Error",
        text: "You must be logged in to perform this action!",
        icon: "error",
        confirmButtonText: "Go to Login",
      }).then(() => {
        window.location.href = "/login";
      });
      throw new Error("Token is missing in cookies!");
    }

    const response = await fetch(
      "https://asia-southeast2-awangga.cloudfunctions.net/jualin/data/get/region",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Login: token,
        },
        body: JSON.stringify({
          long: longitude,
          lat: latitude,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching GeoJSON region:", error);
    return null;
  }
}

async function fetchRoads(longitude, latitude, maxDistance) {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("login="))
      ?.split("=")[1];

    if (!token) {
      Swal.fire({
        title: "Authentication Error",
        text: "You must be logged in to perform this action!",
        icon: "error",
        confirmButtonText: "Go to Login",
      }).then(() => {
        window.location.href = "/login";
      });
      throw new Error("Token is missing in cookies!");
    }

    const response = await fetch(
      "https://asia-southeast2-awangga.cloudfunctions.net/jualin/data/get/roads",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Login: token,
        },
        body: JSON.stringify({
          long: longitude,
          lat: latitude,
          max_distance: maxDistance,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching roads:", error);
    return null;
  }
}

function convertToGeoJSON(response) {
  return {
    type: "FeatureCollection",
    features: response.map((feature) => ({
      type: "Feature",
      geometry: feature.geometry,
      properties: feature.properties,
    })),
  };
}

function displayPolygonOnMap(geoJSON) {
  const features = new GeoJSON().readFeatures(geoJSON, {
    dataProjection: "EPSG:4326",
    featureProjection: "EPSG:3857",
  });

  polygonSource.clear();
  polygonSource.addFeatures(features);
}

function displayRoads(geoJSON) {
  const format = new GeoJSON();
  const features = format.readFeatures(geoJSON, {
    dataProjection: "EPSG:4326",
    featureProjection: "EPSG:3857",
  });

  roadsSource.clear();
  roadsSource.addFeatures(features);
}

function addMarker(coordinate) {
  const marker = new Feature({
    geometry: new Point(coordinate),
  });

  markerSource.clear();
  markerSource.addFeature(marker);
}
