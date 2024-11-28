// Fungsi untuk fetch data dari backend
async function fetchRoads(longitude, latitude, maxDistance) {
  try {
    const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/jualin/data/get/roads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Login:
          "v4.public.eyJhbGlhcyI6Ik0gRmFjaHJpemEgRmFyaGFuIiwiZXhwIjoiMjAyNC0xMS0yN1QyMTozNjozM1oiLCJpYXQiOiIyMDI0LTExLTI3VDAzOjM2OjMzWiIsImlkIjoiNjI4OTUzNzkxMTQ5OTgiLCJuYmYiOiIyMDI0LTExLTI3VDAzOjM2OjMzWiJ9iwyV90EmqLzhxrAMxMF-dBycm52fGlbd4XQUyki5IsvWYIIB3DOUIEE2msi2Hee-vp4lhCsPtJB1CNpwUwvkCQ", // Masukkan token Anda
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
