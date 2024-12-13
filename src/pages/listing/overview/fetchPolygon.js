export async function fetchPolygonInfo(longitude, latitude) {
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
  