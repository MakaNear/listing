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
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
