// =====================================================
//  ⚠️  TOKEN APIFY SUDAH DI-SET DAN SIAP DIGUNAKAN
// =====================================================
const APIFY_API_TOKEN = "apify_api_VHa8qltExBSbJO7pBlF0vDxRXGMOhh4EE97u";

const form = document.getElementById("form");
const urlInput = document.getElementById("url");
const submitBtn = document.getElementById("submitBtn");
const btnLabel = submitBtn.querySelector(".btn-label");
const errorBox = document.getElementById("error");
const resultBox = document.getElementById("result");
const videoEl = document.getElementById("video");
const captionEl = document.getElementById("caption");
const downloadBtn = document.getElementById("downloadBtn");

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
  resultBox.classList.add("hidden");
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  if (loading) {
    btnLabel.innerHTML = '<span class="spinner"></span> Mengambil...';
  } else {
    btnLabel.textContent = "Ambil Video";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.add("hidden");
  resultBox.classList.add("hidden");

  const url = urlInput.value.trim();
  if (!/instagram\.com/.test(url)) {
    showError("URL harus dari instagram.com");
    return;
  }
  if (!APIFY_API_TOKEN || APIFY_API_TOKEN.startsWith("PASTE_")) {
    showError("Token Apify belum di-set. Edit file app.js.");
    return;
  }

  setLoading(true);
  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(APIFY_API_TOKEN)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directUrls: [url],
          resultsType: "details",
          resultsLimit: 1,
          addParentData: false,
        }),
      }
    );
    if (!res.ok) {
      throw new Error(`Apify error ${res.status}`);
    }
    const items = await res.json();
    const item = items?.[0];
    if (!item?.videoUrl) {
      showError("Postingan ini tidak berisi video atau bukan postingan publik.");
      return;
    }
    videoEl.src = item.videoUrl;
    videoEl.poster = item.displayUrl || "";
    captionEl.textContent = item.caption || "";
    downloadBtn.href = item.videoUrl;
    resultBox.classList.remove("hidden");
  } catch (err) {
    showError(err.message || "Terjadi kesalahan jaringan.");
  } finally {
    setLoading(false);
  }
});