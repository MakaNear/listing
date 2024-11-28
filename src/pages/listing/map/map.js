import Map from "https://cdn.skypack.dev/ol/Map.js";
import View from "https://cdn.skypack.dev/ol/View.js";
import TileLayer from "https://cdn.skypack.dev/ol/layer/Tile.js";
import VectorLayer from "https://cdn.skypack.dev/ol/layer/Vector.js";
import VectorSource from "https://cdn.skypack.dev/ol/source/Vector.js";
import OSM from "https://cdn.skypack.dev/ol/source/OSM.js";
import { fromLonLat, toLonLat } from "https://cdn.skypack.dev/ol/proj.js";
import { Style, Stroke, Icon } from "https://cdn.skypack.dev/ol/style.js";
import Point from "https://cdn.skypack.dev/ol/geom/Point.js";
import Feature from "https://cdn.skypack.dev/ol/Feature.js";
import GeoJSON from "https://cdn.skypack.dev/ol/format/GeoJSON.js";
import Cookies from "https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.mjs";

const attributions = '<a href="https://petapedia.github.io/" target="_blank">&copy; PetaPedia Indonesia</a> ';

const place = [107.57634352477324, -6.87436891415509];

const basemap = new TileLayer({
  source: new OSM({ attributions: attributions }),
});

const defaultstartmap = new View({
  center: fromLonLat(place),
  zoom: 16,
});

// Sumber dan layer untuk data jalan
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

// Sumber dan layer untuk marker
const markerSource = new VectorSource();
const markerIcon =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
      <path fill="red" d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 10.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `);
const markerLayer = new VectorLayer({
  source: markerSource,
  style: new Style({
    image: new Icon({
      src: markerIcon,
      scale: 1,
      anchor: [0.5, 1],
    }),
  }),
});

// Inisialisasi peta
export async function displayMap() {
  const map = new Map({
    target: "listing-map",
    layers: [basemap, roadsLayer, markerLayer],
    view: defaultstartmap,
  });

  // Tangani klik pada peta
  map.on("singleclick", async function (event) {
    const coordinates = toLonLat(event.coordinate); // Dapatkan koordinat dalam format lon/lat
    const longitude = coordinates[0];
    const latitude = coordinates[1];
    const maxDistance = 600; // Contoh jarak maksimum

    console.log(`Clicked on: ${longitude}, ${latitude}`);

    // Tambahkan marker di lokasi klik
    addMarker(event.coordinate);

    // Panggil backend untuk mendapatkan data jalan
    const response = await fetchRoads(longitude, latitude, maxDistance);

    if (response) {
      const geoJSON = convertToGeoJSON(response);
      displayRoads(geoJSON);
    }
  });
}

// Fungsi untuk fetch data dari backend
async function fetchRoads(longitude, latitude, maxDistance) {
  try {
    // Ambil token dari cookie
    const token = Cookies.get("login");

    if (!token) {
      throw new Error("Token is missing in cookies!");
    }

    const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/jualin/data/get/roads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Login: token, // Gunakan token dari cookie
      },
      body: JSON.stringify({
        long: longitude,
        lat: latitude,
        max_distance: maxDistance,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Roads fetched:", data);
    return data; // Data dari backend
  } catch (error) {
    console.error("Error fetching roads:", error);
    return null;
  }
}

// Fungsi untuk konversi ke GeoJSON
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

// Fungsi untuk menampilkan jalan pada peta
function displayRoads(geoJSON) {
  const format = new GeoJSON();
  const features = format.readFeatures(geoJSON, {
    dataProjection: "EPSG:4326", // Proyeksi data dari backend
    featureProjection: "EPSG:3857", // Proyeksi untuk peta OL
  });

  roadsSource.clear(); // Hapus jalan sebelumnya
  roadsSource.addFeatures(features); // Tambahkan jalan baru
}

// Fungsi untuk menambahkan marker
function addMarker(coordinate) {
  const marker = new Feature({
    geometry: new Point(coordinate),
  });

  // Hapus marker sebelumnya dan tambahkan marker baru
  markerSource.clear();
  markerSource.addFeature(marker);
}
