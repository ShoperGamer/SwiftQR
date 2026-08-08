document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const form = document.getElementById("qrForm");
  const urlInput = document.getElementById("urlInput");
  const sizeInput = document.getElementById("sizeInput");
  const colorInput = document.getElementById("colorInput");
  const bgColorInput = document.getElementById("bgColorInput");
  
  const frameColorInput = document.getElementById("frameColorInput");
  const frameThicknessInput = document.getElementById("frameThicknessInput");
  const thicknessValue = document.getElementById("thicknessValue");

  // Canvas Containers
  const previewCanvas = document.getElementById("previewCanvas");
  const qrCanvas = document.getElementById("qrCanvas");
  const qrResultContainer = document.getElementById("qrResultContainer");
  const clearBtn = document.getElementById("clearBtn");
  const downloadBtn = document.getElementById("downloadBtn");

  // Center Logo Options
  const centerImageCheck = document.getElementById("centerImageCheck");
  const centerImageInput = document.getElementById("centerImageInput");
  const centerImageContainer = document.getElementById("centerImageContainer");
  const logoSizeInput = document.getElementById("logoSizeInput");
  const logoMarginInput = document.getElementById("logoMarginInput");
  const hideBgDotsCheck = document.getElementById("hideBgDotsCheck");

  // Mode Toggle
  const darkModeToggle = document.getElementById("darkModeToggle");

  // Modal Elements
  const filenameModal = document.getElementById("filenameModal");
  const filenameInput = document.getElementById("filenameInput");
  const confirmModalBtn = document.getElementById("confirmModalBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  const closeModalBtn = document.querySelector(".close-modal-btn");

  // State variables
  let centerImageDataUrl = null;
  let finalDownloadName = "qrcode"; 
  let qrCodeInstance = null;

  // Initialize App
  initializeApp();

  function initializeApp() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', darkMode);
    if (darkModeToggle) darkModeToggle.checked = darkMode;

    qrCodeInstance = new QRCodeStyling(getQROptions("https://example.com", 300));
    
    if (previewCanvas) {
      previewCanvas.innerHTML = "";
      qrCodeInstance.append(previewCanvas);
    }

    if (qrCanvas) {
      qrCanvas.innerHTML = "";
      qrCodeInstance.append(qrCanvas);
    }

    setupEventListeners();
    updatePreview();
  }

  // Utility Debounce เพื่อประสิทธิภาพบนมือถือ
  function debounce(func, delay = 150) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  function getSelectedRadioValue(name, defaultValue) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : defaultValue;
  }

  function getQROptions(text, size) {
    const dotsColor = colorInput ? colorInput.value : "#0f172a";
    const bgColor = bgColorInput ? bgColorInput.value : "#FFFFFF";
    const frameColor = frameColorInput ? frameColorInput.value : "#2563eb";

    const dotsType = getSelectedRadioValue("dotsShape", "square");
    const cornerSquareType = getSelectedRadioValue("cornerSquareShape", "square");
    const cornerDotType = getSelectedRadioValue("cornerDotShape", "square");
    const marginSize = frameThicknessInput ? parseInt(frameThicknessInput.value) : 5;

    const hasImage = centerImageCheck && centerImageCheck.checked && centerImageDataUrl;
    const logoSize = logoSizeInput ? parseFloat(logoSizeInput.value) : 0.3;
    const logoMargin = logoMarginInput ? parseInt(logoMarginInput.value) : 2;
    const hideBgDots = hideBgDotsCheck ? hideBgDotsCheck.checked : true;

    return {
      width: size,
      height: size,
      type: "canvas",
      data: text || "https://example.com",
      margin: marginSize,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: hasImage ? "H" : "Q"
      },
      image: hasImage ? centerImageDataUrl : undefined,
      imageOptions: {
        hideBackgroundDots: hideBgDots,
        imageSize: logoSize,
        margin: logoMargin,
        crossOrigin: "anonymous"
      },
      dotsOptions: {
        type: dotsType,
        color: dotsColor
      },
      cornersSquareOptions: {
        type: cornerSquareType,
        color: frameColor
      },
      cornersDotOptions: {
        type: cornerDotType,
        color: frameColor
      },
      backgroundOptions: {
        color: bgColor
      }
    };
  }

  function setupEventListeners() {
    const debouncedUpdate = debounce(updatePreview, 150);

    const textInputs = [urlInput, sizeInput];
    textInputs.forEach(el => {
      if (el) {
        ["input", "keyup", "paste"].forEach(evt => {
          el.addEventListener(evt, debouncedUpdate);
        });
      }
    });

    const instantInputs = [
      colorInput, bgColorInput, frameColorInput,
      frameThicknessInput, logoSizeInput, logoMarginInput, hideBgDotsCheck
    ];
    instantInputs.forEach(el => {
      if (el) el.addEventListener("change", updatePreview);
    });

    const radioInputs = document.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(radio => {
      radio.addEventListener('change', updatePreview);
    });

    if (frameThicknessInput && thicknessValue) {
      frameThicknessInput.addEventListener("input", () => {
        thicknessValue.textContent = frameThicknessInput.value + "px";
      });
    }

    if (centerImageCheck) {
      centerImageCheck.addEventListener("change", () => {
        if (centerImageContainer) {
          centerImageContainer.style.display = centerImageCheck.checked ? "block" : "none";
        }
        if (!centerImageCheck.checked) {
          centerImageDataUrl = null;
          if (centerImageInput) centerImageInput.value = '';
        }
        updatePreview();
      });
    }

    if (centerImageInput) {
      centerImageInput.addEventListener("change", handleCenterImageUpload);
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const url = urlInput.value.trim();
        
        if (!url) {
          alert('กรุณาใส่ URL');
          return;
        }
        
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          alert('กรุณาใส่ URL ที่ถูกต้อง (ต้องเริ่มต้นด้วย http:// หรือ https://)');
          return;
        }

        if (filenameInput) filenameInput.value = "";
        showModal();
      });
    }

    if (confirmModalBtn) confirmModalBtn.addEventListener("click", handleModalConfirm);
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", hideModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", hideModal);
    if (filenameModal) {
      filenameModal.addEventListener("click", (e) => {
        if (e.target === filenameModal) hideModal();
      });
    }
    
    if (filenameInput) {
      filenameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleModalConfirm();
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        const url = urlInput.value.trim();
        if (!url) {
          alert('กรุณาใส่ URL ก่อนดาวน์โหลด');
          return;
        }
        if (filenameInput) filenameInput.value = "";
        showModal();
      });
    }

    if (clearBtn) clearBtn.addEventListener("click", resetForm);
    if (darkModeToggle) darkModeToggle.addEventListener("change", toggleDarkMode);
  }

  function updatePreview() {
    const text = urlInput ? urlInput.value.trim() : "";
    const size = sizeInput ? (parseInt(sizeInput.value) || 300) : 300;

    // แสดงการ์ดผลลัพธ์พร้อมดาวน์โหลดเฉพาะเมื่อมีการพิมพ์/วางลิงก์แล้วเท่านั้น
    if (qrResultContainer) {
      if (text.length > 0) {
        qrResultContainer.style.display = "block";
      } else {
        qrResultContainer.style.display = "none";
      }
    }

    if (clearBtn) {
      clearBtn.disabled = !text && !centerImageDataUrl;
    }

    const options = getQROptions(text || "https://example.com", size);
    if (qrCodeInstance) {
      qrCodeInstance.update(options);
    }
  }

  function showModal() {
    if (filenameModal) {
      filenameModal.classList.add("show");
      setTimeout(() => filenameInput && filenameInput.focus(), 100);
    }
  }

  function hideModal() {
    if (filenameModal) filenameModal.classList.remove("show");
  }

  function handleModalConfirm() {
    const userInput = filenameInput ? filenameInput.value.trim() : "";
    const url = urlInput ? urlInput.value.trim() : "";

    if (userInput) {
      finalDownloadName = userInput.replace(/\.png$/i, '');
    } else {
      const cleanUrl = url
        .replace(/(^\w+:|^)\/\//, '') 
        .replace(/[^a-zA-Z0-9]/g, '_') 
        .substring(0, 50); 
      
      finalDownloadName = `${cleanUrl || 'qrcode'}_swiftqr`;
    }

    hideModal();
    downloadQRCode(); 
  }

  function handleCenterImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert('ไฟล์ภาพใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดน้อยกว่า 2MB');
      if (centerImageInput) centerImageInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      centerImageDataUrl = ev.target.result;
      updatePreview();
    };
    reader.readAsDataURL(file);
  }

  function downloadQRCode() {
    if (!qrCodeInstance) {
      alert('ไม่พบ QR Code ที่จะดาวน์โหลด');
      return;
    }

    qrCodeInstance.download({
      name: finalDownloadName,
      extension: "png"
    });
  }

  function resetForm() {
    if (form) form.reset();
    centerImageDataUrl = null;
    if (centerImageContainer) centerImageContainer.style.display = "none";
    if (thicknessValue) thicknessValue.textContent = "5px";
    
    if (colorInput) colorInput.value = "#0f172a";
    if (bgColorInput) bgColorInput.value = "#ffffff";
    if (frameColorInput) frameColorInput.value = "#2563eb";
    
    if (clearBtn) clearBtn.disabled = true;
    updatePreview();
  }

  function toggleDarkMode() {
    const isDarkMode = darkModeToggle.checked;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
  }
});

// ลงทะเบียน Service Worker เพื่อรองรับการใช้งานแบบ ออฟไลน์ (Offline Mode)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Swift QR: Offline Service Worker Registered!'))
      .catch((err) => console.error('Service Worker Registration Failed:', err));
  });
}