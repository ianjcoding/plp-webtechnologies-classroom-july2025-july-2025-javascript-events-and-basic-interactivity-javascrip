// ===== Setup =====
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const captionInput = document.getElementById("caption");
const captionError = document.getElementById("captionError");

const brightness = document.getElementById("brightness");
const contrast = document.getElementById("contrast");
const brightnessVal = document.getElementById("brightnessVal");
const contrastVal = document.getElementById("contrastVal");

const generateBtn = document.getElementById("generateBtn");
const randomizeBtn = document.getElementById("randomizeBtn");
const clearGalleryBtn = document.getElementById("clearGalleryBtn");
const downloadBtn = document.getElementById("downloadBtn");
const saveBtn = document.getElementById("saveBtn");

const galleryGrid = document.getElementById("galleryGrid");
const statusDiv = document.getElementById("status");

let currentImage = null;

// Local sample images (replace with your own)
const sampleImages = [
  "https://i.ibb.co/2sJmDqB/anime1.jpg",
  "https://i.ibb.co/x8W9Nyr/anime2.jpg",
  "https://i.ibb.co/N2sK9Vb/anime3.jpg"
];

// ===== Status Display =====
function setStatus(msg, isError = false) {
  statusDiv.textContent = msg;
  statusDiv.style.color = isError ? "red" : "#666";
}

// ===== Validation =====
function validateForm() {
  let valid = true;
  captionError.textContent = "";

  const text = captionInput.value.trim();
  if (!text) {
    captionError.textContent = "Caption cannot be empty.";
    valid = false;
  } else if (text.length > 80) {
    captionError.textContent = "Caption must be under 80 characters.";
    valid = false;
  }

  return valid;
}

// ===== Image Handling =====
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      currentImage = img;
      renderCanvas();
      resolve();
    };
    img.onerror = () => {
      setStatus("Failed to load image.", true);
      reject();
    };
    img.src = url;
  });
}

function renderCanvas() {
  if (!currentImage) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

  // Apply caption
  const caption = captionInput.value.trim();
  if (caption) {
    ctx.font = "20px Arial";
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(10, canvas.height - 40, ctx.measureText(caption).width + 20, 30);
    ctx.fillStyle = "white";
    ctx.fillText(caption, 20, canvas.height - 20);
  }

  // CSS filters
  canvas.style.filter = `brightness(${brightness.value}) contrast(${contrast.value})`;
}

// ===== Download =====
function downloadCanvas() {
  if (!currentImage) {
    setStatus("No image to download.", true);
    return;
  }
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `anime-${Date.now()}.png`;
  link.click();
}

// ===== Gallery =====
function saveToGallery() {
  if (!validateForm()) return;
  if (!currentImage) {
    setStatus("Generate an image first.", true);
    return;
  }

  const url = canvas.toDataURL("image/png");
  const gallery = JSON.parse(localStorage.getItem("animeGallery") || "[]");
  gallery.unshift({ id: Date.now(), url });
  localStorage.setItem("animeGallery", JSON.stringify(gallery));
  renderGallery();
  setStatus("Saved to gallery.");
}

function renderGallery() {
  const gallery = JSON.parse(localStorage.getItem("animeGallery") || "[]");
  galleryGrid.innerHTML = "";

  if (gallery.length === 0) {
    galleryGrid.textContent = "No saved images.";
    return;
  }

  gallery.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = item.url;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
      const newGallery = gallery.filter((x) => x.id !== item.id);
      localStorage.setItem("animeGallery", JSON.stringify(newGallery));
      renderGallery();
    };

    card.appendChild(img);
    card.appendChild(delBtn);
    galleryGrid.appendChild(card);
  });
}

// ===== Events =====
generateBtn.addEventListener("click", () => {
  const url = sampleImages[Math.floor(Math.random() * sampleImages.length)];
  loadImage(url);
  setStatus("Generated new anime image!");
});

randomizeBtn.addEventListener("click", () => {
  const samples = [
    "Dreamy sakura blossoms",
    "Cyberpunk city night",
    "Cute neko with scarf",
    "Samurai at sunset",
    "Magical girl power"
  ];
  captionInput.value = samples[Math.floor(Math.random() * samples.length)];
  renderCanvas();
});

brightness.addEventListener("input", () => {
  brightnessVal.textContent = parseFloat(brightness.value).toFixed(2);
  renderCanvas();
});
contrast.addEventListener("input", () => {
  contrastVal.textContent = parseFloat(contrast.value).toFixed(2);
  renderCanvas();
});

downloadBtn.addEventListener("click", downloadCanvas);
saveBtn.addEventListener("click", saveToGallery);
clearGalleryBtn.addEventListener("click", () => {
  localStorage.removeItem("animeGallery");
  renderGallery();
});

// ===== Init =====
renderGallery();
setStatus("Ready!");
