export async function fetchOverview() {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
    };

    const response = await fetch(
      "https://asia-southeast2-awangga.cloudfunctions.net/jualin/toko",
      requestOptions
    );

    // Cek status response
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return;
    }

    const result = await response.json();
    console.log(result);

    const activeLayout = document.querySelector(
      ".listing-overview-header .layout .material-symbols-rounded.active"
    );
    const overviewWrapper = document.querySelector(".listing-overview-layout");
    const overviewWrapperActive = document.querySelector(
      ".listing-overview-layout-active"
    );

    if (!activeLayout || !overviewWrapper || !overviewWrapperActive) {
      console.error("Element not found in the DOM");
      return;
    }

    // Bersihkan konten sebelumnya
    overviewWrapper.innerHTML = "";
    overviewWrapperActive.innerHTML = "";

    const layoutType = activeLayout.textContent.trim();
    console.log("Layout type:", layoutType);

    if (layoutType === "format_list_bulleted") {
      result.forEach((data) => {
        const itemHTML = `
            <div class="item">
              <div class="image">
                <img src="${data.gambar_toko}" alt="${data.nama_toko}" />
              </div>
              <div class="info">
                <div class="name">${data.nama_toko}</div>
                <div class="address">
                  ${data.alamat?.street ?? ""}, ${data.description ?? ""}, 
                  ${data.alamat?.city ?? ""}, ${data.alamat?.province ?? ""}, 
                  ${data.alamat?.postal_code ?? ""}
                </div>
                <div class="opening">
                  ${data.opening_hours?.opening ?? "N/A"} - ${
          data.opening_hours?.close ?? "N/A"
        }
                </div>
                <div class="container">
                  <div class="rating">⭐ <span class="number">${
                    data.rating ?? "N/A"
                  }</span></div>
                </div>
              </div>
            </div>`;
        overviewWrapper.insertAdjacentHTML("beforeend", itemHTML);
      });
    } else {
      result.forEach((data) => {
        const itemHTML = `
            <div class="item grid">
              <div class="image">
                <img src="${data.gambar_toko}" alt="${data.nama_toko}" />
              </div>
              <div class="info">
                <div class="name">${data.nama_toko}</div>
                <div class="address">
                  ${data.alamat?.street ?? ""}, ${data.description ?? ""}, 
                  ${data.alamat?.city ?? ""}, ${data.alamat?.province ?? ""}, 
                  ${data.alamat?.postal_code ?? ""}
                </div>
                <div class="opening">
                  ${data.opening_hours?.opening ?? "N/A"} - ${
          data.opening_hours?.close ?? "N/A"
        }
                </div>
                <div class="container">
                  <div class="rating">⭐ <span class="number">${
                    data.rating ?? "N/A"
                  }</span></div>
                </div>
              </div>
            </div>`;
        overviewWrapperActive.insertAdjacentHTML("beforeend", itemHTML);
      });
    }

    // Tambahkan Polygon Info di bawah daftar
    const longitude = 107.57634352477324; // Contoh koordinat
    const latitude = -6.87436891415509;
    fetchPolygonInfo(longitude, latitude);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Fungsi tambahan untuk fetch Polygon Info
async function fetchPolygonInfo(longitude, latitude) {
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
      return;
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

    const data = await response.json();

    const container = document.querySelector(".listing-overview-layout");
    const polygonHTML = `
      <div class="polygon-info">
        <div class="icon">
          <span class="material-symbols-rounded info-icon">info</span>
        </div>
        <div class="details">
          <h3>Polygon Info</h3>
          <p><strong>District:</strong> ${data.properties?.district || "Unknown"}</p>
          <p><strong>Province:</strong> ${data.properties?.province || "Unknown"}</p>
          <p><strong>Sub-district:</strong> ${
            data.properties?.sub_district || "Unknown"
          }</p>
          <p><strong>Village:</strong> ${data.properties?.village || "Unknown"}</p>
        </div>
        <button class="btn-ok" onclick="closePolygonInfo()">OK</button>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", polygonHTML);
  } catch (error) {
    console.error("Error fetching Polygon Info:", error);
  }
}

function closePolygonInfo() {
  const container = document.querySelector(".polygon-info");
  if (container) container.remove();
}
