document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const form = document.getElementById("qrForm");
  const urlInput = document.getElementById("urlInput");
  const sizeInput = document.getElementById("sizeInput");
  const colorInput = document.getElementById("colorInput");
  const bgColorInput = document.getElementById("bgColorInput");
  const shapeSelect = document.getElementById("shapeSelect");
  const frameSelect = document.getElementById("frameSelect");
  const frameColorInput = document.getElementById("frameColorInput");
  const frameThicknessInput = document.getElementById("frameThicknessInput");
  const thicknessValue = document.getElementById("thicknessValue");
  const previewCanvas = document.getElementById("previewCanvas");
  const qrCanvas = document.getElementById("qrCanvas");
  const qrResultContainer = document.getElementById("qrResultContainer");
  const clearBtn = document.getElementById("clearBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const centerImageCheck = document.getElementById("centerImageCheck");
  const centerImageInput = document.getElementById("centerImageInput");
  const centerImageContainer = document.getElementById("centerImageContainer");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // State variables
  let centerImage = null;
  let centerImageLoaded = false;
  let currentQRCode = null;

  // Initialize
  initializeApp();

  function initializeApp() {
    // Load dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', darkMode);
    darkModeToggle.checked = darkMode;

    // Set up event listeners
    setupEventListeners();
    
    // Initial preview
    updatePreview();
  }

  function setupEventListeners() {
    // Input events for real-time preview
    [urlInput, sizeInput, colorInput, bgColorInput, shapeSelect, frameSelect, frameColorInput, frameThicknessInput]
      .forEach(el => el.addEventListener("input", updatePreview));

    // Frame thickness value display
    frameThicknessInput.addEventListener("input", () => {
      thicknessValue.textContent = frameThicknessInput.value;
      updatePreview();
    });

    // Center image controls
    centerImageCheck.addEventListener("change", () => {
      centerImageContainer.style.display = centerImageCheck.checked ? "block" : "none";
      if (!centerImageCheck.checked) {
        centerImage = null;
        centerImageLoaded = false;
        centerImageInput.value = '';
      }
      updatePreview();
    });

    centerImageInput.addEventListener("change", handleCenterImageUpload);

    // Form submission
    form.addEventListener("submit", handleFormSubmit);

    // Action buttons
    downloadBtn.addEventListener("click", downloadQRCode);
    clearBtn.addEventListener("click", resetForm);

    // Dark mode toggle
    darkModeToggle.addEventListener("change", toggleDarkMode);
  }

  function handleCenterImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('ไฟล์ภาพใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดน้อยกว่า 2MB');
      centerImageInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        centerImage = img;
        centerImageLoaded = true;
        updatePreview();
      };
      img.onerror = () => {
        alert('ไม่สามารถโหลดภาพได้ กรุณาลองอีกครั้ง');
        centerImageInput.value = '';
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function updatePreview() {
    const text = urlInput.value.trim() || "https://example.com";
    const size = parseInt(sizeInput.value) || 300;
    const color = colorInput.value;
    const bgColor = bgColorInput.value;
    const shape = shapeSelect.value;
    const frameShape = frameSelect.value;
    const frameColor = frameColorInput.value;
    const frameThickness = parseInt(frameThicknessInput.value);

    drawQR(previewCanvas, text, size, color, bgColor, shape, frameShape, frameColor, frameThickness, centerImage);
  }

  function drawQR(canvas, text, size, color, bgColor, shape, frameShape, frameColor, frameThickness, centerImg = null) {
    const qr = qrcode(0, "H");
    qr.addData(text);
    qr.make();

    const ctx = canvas.getContext("2d");
    const borderThickness = (size * frameThickness) / 100;
    const totalSize = size + borderThickness * 2;

    canvas.width = totalSize;
    canvas.height = totalSize;

    // Clear canvas
    ctx.clearRect(0, 0, totalSize, totalSize);

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, totalSize, totalSize);

    // Create clipping path for rounded corners if needed
    ctx.save();
    if (frameShape === "rounded") {
      const radius = 30;
      ctx.beginPath();
      roundedRect(ctx, borderThickness, borderThickness, size, size, radius);
      ctx.clip();
    } else if (frameShape === "square") {
      ctx.beginPath();
      ctx.rect(borderThickness, borderThickness, size, size);
      ctx.clip();
    }

    // Draw QR code inside the clipped area
    const cellSize = Math.floor(size / qr.getModuleCount());
    const qrSize = qr.getModuleCount() * cellSize;
    const offset = borderThickness + (size - qrSize) / 2;

    for (let row = 0; row < qr.getModuleCount(); row++) {
      for (let col = 0; col < qr.getModuleCount(); col++) {
        if (qr.isDark(row, col)) {
          ctx.fillStyle = color;
          const x = offset + col * cellSize;
          const y = offset + row * cellSize;

          if (shape === "circle") {
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2.3, 0, Math.PI * 2);
            ctx.fill();
          } else if (shape === "dot") {
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        }
      }
    }

    ctx.restore();

    // Draw frame
    if (frameShape !== "none") {
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = borderThickness;
      if (frameShape === "rounded") {
        const radius = 30;
        ctx.beginPath();
        roundedRect(ctx, borderThickness / 2, borderThickness / 2, size + borderThickness, size + borderThickness, radius);
        ctx.stroke();
      } else if (frameShape === "square") {
        ctx.strokeRect(borderThickness / 2, borderThickness / 2, size + borderThickness, size + borderThickness);
      }
    }

    // Draw center image
    if (centerImg && centerImageLoaded) {
      const imgSize = size * 0.25;
      const x = totalSize / 2 - imgSize / 2;
      const y = totalSize / 2 - imgSize / 2;
      
      // Draw a white background for the center image
      ctx.fillStyle = bgColor;
      ctx.fillRect(x - 5, y - 5, imgSize + 10, imgSize + 10);
      
      ctx.drawImage(centerImg, x, y, imgSize, imgSize);
    }
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const url = urlInput.value.trim();
    
    if (!url) {
      showAlert('กรุณาใส่ URL', 'warning');
      return;
    }
    
    if (!url.startsWith("http")) {
      showAlert('กรุณาใส่ URL ที่ถูกต้อง (ต้องเริ่มต้นด้วย http หรือ https)', 'warning');
      return;
    }

    const size = parseInt(sizeInput.value);
    const color = colorInput.value;
    const bgColor = bgColorInput.value;
    const shape = shapeSelect.value;
    const frameShape = frameSelect.value;
    const frameColor = frameColorInput.value;
    const frameThickness = parseInt(frameThicknessInput.value);

    drawQR(qrCanvas, url, size, color, bgColor, shape, frameShape, frameColor, frameThickness, centerImage);
    
    // Show result with animation
    qrResultContainer.style.display = "block";
    qrResultContainer.classList.add('fade-in');
    clearBtn.disabled = false;

    currentQRCode = qrCanvas.toDataURL("image/png");
    
    showAlert('สร้าง QR Code สำเร็จแล้ว!', 'success');
  }

  function downloadQRCode() {
    if (!currentQRCode) {
      showAlert('ไม่มี QR Code ที่จะดาวน์โหลด', 'warning');
      return;
    }
    
    const link = document.createElement("a");
    link.href = currentQRCode;
    link.download = `qr-code-${Date.now()}.png`;
    link.click();
    
    showAlert('กำลังดาวน์โหลด QR Code...', 'info');
  }

  function resetForm() {
    form.reset();
    centerImage = null;
    centerImageLoaded = false;
    centerImageContainer.style.display = "none";
    qrResultContainer.style.display = "none";
    qrResultContainer.classList.remove('fade-in');
    clearBtn.disabled = true;
    thicknessValue.textContent = "5";
    
    // Reset color inputs to default
    colorInput.value = "#000000";
    bgColorInput.value = "#FFFFFF";
    frameColorInput.value = "#007bff";
    
    updatePreview();
    
    showAlert('ล้างข้อมูลทั้งหมดแล้ว', 'info');
  }

  function toggleDarkMode() {
    const isDarkMode = darkModeToggle.checked;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
  }

  function showAlert(message, type) {
    // Remove any existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
      existingAlert.remove();
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show mt-3`;
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert after the form
    form.parentNode.insertBefore(alert, form.nextSibling);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 3000);
  }
});