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

  // Modal Elements
  const filenameModal = document.getElementById("filenameModal");
  const filenameInput = document.getElementById("filenameInput");
  const confirmModalBtn = document.getElementById("confirmModalBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  const closeModalBtn = document.querySelector(".close-modal-btn");

  // State variables
  let centerImage = null;
  let centerImageLoaded = false;
  let currentQRCode = null;
  let finalDownloadName = "qrcode.png"; 

  // Initialize
  initializeApp();

  function initializeApp() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', darkMode);
    darkModeToggle.checked = darkMode;

    setupEventListeners();
    updatePreview();
  }

  function setupEventListeners() {
    // Input events for real-time preview
    [urlInput, sizeInput, colorInput, bgColorInput, shapeSelect, frameSelect].forEach(el => {
      el.addEventListener("input", updatePreview);
    });

    // Smart UX: ถ้าผู้ใช้คลิกเลือกเปลี่ยนสีกรอบ แต่เปิด "ไม่มีกรอบ" อยู่ ให้สลับเปิดกรอบอัติโนมัติ
    frameColorInput.addEventListener("input", () => {
      if (frameSelect.value === "none") {
        frameSelect.value = "square"; 
      }
      updatePreview();
    });

    // Smart UX: เช่นเดียวกับการปรับความหนา ให้สลับเปิดกรอบอัติโนมัติทันที
    frameThicknessInput.addEventListener("input", () => {
      thicknessValue.textContent = frameThicknessInput.value + "%";
      if (frameSelect.value === "none") {
        frameSelect.value = "square";
      }
      updatePreview();
    });

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
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const url = urlInput.value.trim();
      
      if (!url) {
        alert('กรุณาใส่ URL');
        return;
      }
      
      if (!url.startsWith("http")) {
        alert('กรุณาใส่ URL ที่ถูกต้อง (ต้องเริ่มต้นด้วย http หรือ https)');
        return;
      }

      filenameInput.value = "";
      showModal();
    });

    // Modal Events
    confirmModalBtn.addEventListener("click", handleModalConfirm);
    cancelModalBtn.addEventListener("click", hideModal);
    closeModalBtn.addEventListener("click", hideModal);
    filenameModal.addEventListener("click", (e) => {
      if (e.target === filenameModal) hideModal();
    });
    
    filenameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleModalConfirm();
    });

    downloadBtn.addEventListener("click", downloadQRCode);
    clearBtn.addEventListener("click", resetForm);
    darkModeToggle.addEventListener("change", toggleDarkMode);
  }

  // --- Modal Logic ---
  function showModal() {
    filenameModal.classList.add("show");
    setTimeout(() => filenameInput.focus(), 100);
  }

  function hideModal() {
    filenameModal.classList.remove("show");
  }

  function handleModalConfirm() {
    const userInput = filenameInput.value.trim();
    const url = urlInput.value.trim();

    if (userInput) {
      finalDownloadName = userInput;
    } else {
      const cleanUrl = url
        .replace(/(^\w+:|^)\/\//, '') 
        .replace(/[^a-zA-Z0-9]/g, '_') 
        .substring(0, 50); 
      
      finalDownloadName = `${cleanUrl}_swiftqr`;
    }

    if (!finalDownloadName.toLowerCase().endsWith('.png')) {
      finalDownloadName += '.png';
    }

    hideModal();
    generateQRCode(); 
  }

  // --- Generation Logic ---
  function generateQRCode() {
    const url = urlInput.value.trim();
    const size = parseInt(sizeInput.value);
    const color = colorInput.value;
    const bgColor = bgColorInput.value;
    const shape = shapeSelect.value;
    const frameShape = frameSelect.value;
    const frameColor = frameColorInput.value;
    const frameThickness = parseInt(frameThicknessInput.value);

    drawQR(qrCanvas, url, size, color, bgColor, shape, frameShape, frameColor, frameThickness, centerImage);
    
    qrResultContainer.style.display = "block";
    qrResultContainer.classList.add('fade-in');
    clearBtn.disabled = false;

    currentQRCode = qrCanvas.toDataURL("image/png");
    
    if (window.innerWidth < 992) {
      qrResultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleCenterImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
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
    
    // [FIXED BUG] ปรับให้เป็น 0 ทันทีหากเลือก "none" เพื่อไม่ให้เหลือพื้นที่ว่างสีขาวรอบตัว QR ตอนไม่ต้องการกรอบ
    const borderThickness = (frameShape !== "none") ? (size * frameThickness) / 100 : 0;
    const totalSize = size + borderThickness * 2;

    canvas.width = totalSize;
    canvas.height = totalSize;

    ctx.clearRect(0, 0, totalSize, totalSize);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, totalSize, totalSize);

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

    // ส่วนการวาดสีกรอบลงพื้นผิว Canvas
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

    if (centerImg && centerImageLoaded) {
      const imgSize = size * 0.25;
      const x = totalSize / 2 - imgSize / 2;
      const y = totalSize / 2 - imgSize / 2;
      
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

  function downloadQRCode() {
    if (!currentQRCode) {
      alert('ไม่มี QR Code ที่จะดาวน์โหลด');
      return;
    }
    const link = document.createElement("a");
    link.href = currentQRCode;
    link.download = finalDownloadName; 
    link.click();
  }

  function resetForm() {
    form.reset();
    centerImage = null;
    centerImageLoaded = false;
    centerImageContainer.style.display = "none";
    qrResultContainer.style.display = "none";
    qrResultContainer.classList.remove('fade-in');
    clearBtn.disabled = true;
    thicknessValue.textContent = "5%";
    
    colorInput.value = "#0f172a";
    bgColorInput.value = "#FFFFFF";
    frameColorInput.value = "#2563eb";
    
    updatePreview();
  }

  function toggleDarkMode() {
    const isDarkMode = darkModeToggle.checked;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
  }
});