/* ============================================================
   Swift QR — js/index.js (Offline Ready & Save Theme Feature)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. ระบบ Offline (Service Worker Registration) ───────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('SwiftQR: Service Worker Active', reg.scope))
        .catch(err => console.warn('SwiftQR: Service Worker Registration Failed', err));
    });
  }

  // ── Global Variables & State ──────────────────────────────
  let qrCodeInstance = null;
  let uploadedLogoBase64 = null;
  let debounceTimer = null;
  let currentDataType = 'url';
  let currentDirection = 'diagonal';
  let currentAngle = 45;

  // DOM Elements: โหมดสีและตัวแสดงผล
  const darkModeToggle = document.getElementById('darkModeToggle');
  const previewCanvas = document.getElementById('previewCanvas');
  const qrForm = document.getElementById('qrForm');
  const clearBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const qrResultContainer = document.getElementById('qrResultContainer');

  // แท็บประเภทข้อมูล
  const tabButtons = document.querySelectorAll('.qr-tab-btn');
  const groupUrl = document.getElementById('groupUrl');
  const groupText = document.getElementById('groupText');
  const groupPromptpay = document.getElementById('groupPromptpay');
  const groupWifi = document.getElementById('groupWifi');

  // ข้อมูล QR
  const urlInput = document.getElementById('urlInput');
  const textInput = document.getElementById('textInput');
  const ppTargetInput = document.getElementById('ppTargetInput');
  const ppAmountInput = document.getElementById('ppAmountInput');
  const wifiSsidInput = document.getElementById('wifiSsidInput');
  const wifiPassInput = document.getElementById('wifiPassInput');
  const wifiTypeInput = document.getElementById('wifiTypeInput');
  const wifiHiddenCheck = document.getElementById('wifiHiddenCheck');

  // ขนาดและสีทั่วไป
  const sizeInput = document.getElementById('sizeInput');
  const colorInput = document.getElementById('colorInput');
  const bgColorInput = document.getElementById('bgColorInput');
  const frameColorInput = document.getElementById('frameColorInput');
  const frameThicknessInput = document.getElementById('frameThicknessInput');
  const thicknessValue = document.getElementById('thicknessValue');

  // โลโก้
  const centerImageCheck = document.getElementById('centerImageCheck');
  const centerImageContainer = document.getElementById('centerImageContainer');
  const centerImageInput = document.getElementById('centerImageInput');
  const uploadText = document.getElementById('uploadText');
  const logoSizeInput = document.getElementById('logoSizeInput');
  const logoMarginInput = document.getElementById('logoMarginInput');
  const hideBgDotsCheck = document.getElementById('hideBgDotsCheck');

  // Gradient
  const enableGradientCheck = document.getElementById('enableGradientCheck');
  const gradientSettings = document.getElementById('gradientSettings');
  const presetChips = document.querySelectorAll('.preset-chip');
  const gradColor1 = document.getElementById('gradColor1');
  const gradColor2 = document.getElementById('gradColor2');
  const gradColor1Val = document.getElementById('gradColor1Val');
  const gradColor2Val = document.getElementById('gradColor2Val');
  const swapColorsBtn = document.getElementById('swapColorsBtn');
  const gradientLivePreview = document.getElementById('gradientLivePreview');
  const dirButtons = document.querySelectorAll('.dir-btn');
  const customAngleBox = document.getElementById('customAngleBox');
  const gradientRotation = document.getElementById('gradientRotation');
  const rotationValue = document.getElementById('rotationValue');
  const gradientTarget = document.getElementById('gradientTarget');

  // ระบบบันทึกธีม (Save Theme Elements)
  const saveThemeBtn = document.getElementById('saveThemeBtn');
  const userPresetsContainer = document.getElementById('userPresetsContainer');

  // Modal
  const filenameModal = document.getElementById('filenameModal');
  const filenameInput = document.getElementById('filenameInput');
  const fileFormat = document.getElementById('fileFormat');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const confirmModalBtn = document.getElementById('confirmModalBtn');
  const closeModalBtn = document.querySelector('.close-modal-btn');

  // ── 2. ระบบจดจำ Dark Mode (Theme Persistence) ────────────
  function initDarkMode() {
    const savedTheme = localStorage.getItem('swiftqr_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    document.body.classList.toggle('dark-mode', isDark);
    if (darkModeToggle) darkModeToggle.checked = isDark;

    if (darkModeToggle) {
      darkModeToggle.addEventListener('change', () => {
        const darkActive = darkModeToggle.checked;
        document.body.classList.toggle('dark-mode', darkActive);
        localStorage.setItem('swiftqr_theme', darkActive ? 'dark' : 'light');
      });
    }
  }

  // ── 3. ระบบบันทึกและโหลดธีมส่วนตัว (Save / Load Themes) ────
  function loadUserThemes() {
    if (!userPresetsContainer) return;
    try {
      const themes = JSON.parse(localStorage.getItem('swiftqr_saved_themes') || '[]');
      if (themes.length === 0) {
        userPresetsContainer.innerHTML = '<span class="text-muted small py-1">ยังไม่มีธีมที่บันทึกไว้ กดปุ่มบันทึกเพื่อเก็บคู่สีนี้</span>';
        return;
      }

      userPresetsContainer.innerHTML = '';
      themes.forEach((item, index) => {
        const chip = document.createElement('div');
        chip.className = 'user-theme-chip';
        chip.innerHTML = `
          <button type="button" class="user-theme-apply-btn" title="คลิกเพื่อใช้ธีมนี้" style="background: linear-gradient(135deg, ${item.c1}, ${item.c2});">
            <span>${item.name || `ธีม #${index + 1}`}</span>
          </button>
          <button type="button" class="user-theme-del-btn" data-index="${index}" title="ลบธีมนี้" aria-label="ลบธีม">
            <svg class="svg-icon" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
          </button>
        `;

        chip.querySelector('.user-theme-apply-btn').addEventListener('click', () => {
          applySavedTheme(item);
        });

        chip.querySelector('.user-theme-del-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          deleteUserTheme(index);
        });

        userPresetsContainer.appendChild(chip);
      });
    } catch (e) {
      console.error('Error loading themes:', e);
    }
  }

  function saveCurrentTheme() {
    try {
      const themes = JSON.parse(localStorage.getItem('swiftqr_saved_themes') || '[]');
      if (themes.length >= 10) {
        alert('บันทึกได้สูงสุด 10 ธีม กรุณาลบธีมเก่าที่ไม่ใช้งานออกก่อน');
        return;
      }

      const defaultName = `Theme ${themes.length + 1}`;
      const themeName = prompt('ตั้งชื่อธีมที่คุณต้องการบันทึก:', defaultName);
      if (themeName === null) return;

      const newTheme = {
        name: themeName.trim() || defaultName,
        c1: gradColor1 ? gradColor1.value : '#4f46e5',
        c2: gradColor2 ? gradColor2.value : '#06b6d4',
        direction: currentDirection,
        angle: currentAngle,
        target: gradientTarget ? gradientTarget.value : 'all',
        bgColor: bgColorInput ? bgColorInput.value : '#ffffff',
        frameColor: frameColorInput ? frameColorInput.value : '#0f172a'
      };

      themes.push(newTheme);
      localStorage.setItem('swiftqr_saved_themes', JSON.stringify(themes));
      loadUserThemes();
    } catch (e) {
      console.error('Error saving theme:', e);
      alert('เกิดข้อผิดพลาดในการบันทึกธีม');
    }
  }

  function deleteUserTheme(index) {
    try {
      const themes = JSON.parse(localStorage.getItem('swiftqr_saved_themes') || '[]');
      themes.splice(index, 1);
      localStorage.setItem('swiftqr_saved_themes', JSON.stringify(themes));
      loadUserThemes();
    } catch (e) {
      console.error('Error deleting theme:', e);
    }
  }

  function applySavedTheme(theme) {
    if (gradColor1) gradColor1.value = theme.c1;
    if (gradColor2) gradColor2.value = theme.c2;
    if (bgColorInput && theme.bgColor) bgColorInput.value = theme.bgColor;
    if (frameColorInput && theme.frameColor) frameColorInput.value = theme.frameColor;
    if (gradientTarget && theme.target) gradientTarget.value = theme.target;

    currentDirection = theme.direction || 'diagonal';
    currentAngle = theme.angle || 45;

    dirButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.dir === currentDirection);
    });

    if (currentDirection === 'custom') {
      if (customAngleBox) customAngleBox.style.display = 'block';
      if (gradientRotation) gradientRotation.value = currentAngle;
      if (rotationValue) rotationValue.textContent = `${currentAngle}°`;
    } else {
      if (customAngleBox) customAngleBox.style.display = 'none';
      if (gradientRotation) gradientRotation.value = currentAngle;
      if (rotationValue) rotationValue.textContent = `${currentAngle}°`;
    }

    if (enableGradientCheck && !enableGradientCheck.checked) {
      enableGradientCheck.checked = true;
      if (gradientSettings) gradientSettings.style.display = 'block';
    }

    presetChips.forEach(c => c.classList.remove('active'));
    updateQrCode();
  }

  // ── PromptPay Payload Generator (EMVCo Standard) ──────────
  function generatePromptPayPayload(target, amount) {
    if (!target) return '';
    target = target.replace(/[^0-9]/g, '');
    let targetType = '';
    let formattedTarget = '';

    if (target.length === 10) {
      targetType = '01';
      formattedTarget = '0066' + target.substring(1);
    } else if (target.length === 13) {
      targetType = '02';
      formattedTarget = target;
    } else {
      return target;
    }

    const tag29Sub00 = '0016A000000677010111';
    const tag29SubVal = targetType + String(formattedTarget.length).padStart(2, '0') + formattedTarget;
    const tag29 = '29' + String(tag29Sub00.length + tag29SubVal.length).padStart(2, '0') + tag29Sub00 + tag29SubVal;

    let payload = '000201010211' + tag29 + '53037645802TH';

    if (amount && parseFloat(amount) > 0) {
      const formattedAmount = parseFloat(amount).toFixed(2);
      payload += '54' + String(formattedAmount.length).padStart(2, '0') + formattedAmount;
    }

    payload += '6304';

    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
      let x = ((crc >> 8) ^ payload.charCodeAt(i)) & 0xFF;
      x ^= x >> 4;
      crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
    }
    return payload + crc.toString(16).toUpperCase().padStart(4, '0');
  }

  // ── ดึงข้อมูล QR ตามแท็บ ─────────────────────────────────
  function getCurrentQrData() {
    switch (currentDataType) {
      case 'url':
        const url = urlInput ? urlInput.value.trim() : '';
        if (!url) return 'https://google.com';
        return /^https?:\/\//i.test(url) ? url : 'https://' + url;
      case 'text':
        return (textInput && textInput.value.trim()) ? textInput.value.trim() : 'Swift QR';
      case 'promptpay':
        const ppTarget = ppTargetInput ? ppTargetInput.value.trim() : '';
        const ppAmt = ppAmountInput ? ppAmountInput.value.trim() : '';
        return ppTarget ? generatePromptPayPayload(ppTarget, ppAmt) : 'https://google.com';
      case 'wifi':
        const ssid = wifiSsidInput ? wifiSsidInput.value.trim() : '';
        const pass = wifiPassInput ? wifiPassInput.value : '';
        const type = wifiTypeInput ? wifiTypeInput.value : 'WPA';
        const hidden = wifiHiddenCheck && wifiHiddenCheck.checked ? 'true' : 'false';
        return ssid ? `WIFI:T:${type};S:${ssid};P:${pass};H:${hidden};;` : 'https://google.com';
      default:
        return 'https://google.com';
    }
  }

  function getGradientConfig() {
    if (!enableGradientCheck || !enableGradientCheck.checked) return null;

    const isRadial = currentDirection === 'radial';
    const radRotation = (currentAngle * Math.PI) / 180;

    return {
      type: isRadial ? 'radial' : 'linear',
      rotation: isRadial ? 0 : radRotation,
      colorStops: [
        { offset: 0, color: gradColor1.value },
        { offset: 1, color: gradColor2.value }
      ]
    };
  }

  function updateGradientLivePreview() {
    if (!gradColor1 || !gradColor2) return;
    if (gradColor1Val) gradColor1Val.textContent = gradColor1.value.toUpperCase();
    if (gradColor2Val) gradColor2Val.textContent = gradColor2.value.toUpperCase();
    if (!gradientLivePreview) return;

    if (currentDirection === 'radial') {
      gradientLivePreview.style.background = `radial-gradient(circle, ${gradColor1.value} 0%, ${gradColor2.value} 100%)`;
    } else {
      gradientLivePreview.style.background = `linear-gradient(${currentAngle}deg, ${gradColor1.value} 0%, ${gradColor2.value} 100%)`;
    }
  }

  function updateQrCode() {
    if (!qrCodeInstance) return;

    const rawData = getCurrentQrData();
    const size = sizeInput ? (parseInt(sizeInput.value, 10) || 300) : 300;
    const margin = frameThicknessInput ? (parseInt(frameThicknessInput.value, 10) || 5) : 5;

    const dotsShape = document.querySelector('input[name="dotsShape"]:checked')?.value || 'square';
    const cornerSquareShape = document.querySelector('input[name="cornerSquareShape"]:checked')?.value || 'square';
    const cornerDotShape = document.querySelector('input[name="cornerDotShape"]:checked')?.value || 'square';

    const grad = getGradientConfig();
    const target = gradientTarget ? gradientTarget.value : 'all';

    const dotsOptions = {
      type: dotsShape,
      color: colorInput ? colorInput.value : '#0f172a'
    };
    if (grad && (target === 'all' || target === 'dots')) {
      dotsOptions.gradient = grad;
    } else {
      dotsOptions.gradient = null;
    }

    const cornersSquareOptions = {
      type: cornerSquareShape,
      color: frameColorInput ? frameColorInput.value : '#0f172a'
    };
    if (grad && (target === 'all' || target === 'corners')) {
      cornersSquareOptions.gradient = grad;
    } else {
      cornersSquareOptions.gradient = null;
    }

    const cornersDotOptions = {
      type: cornerDotShape,
      color: frameColorInput ? frameColorInput.value : '#0f172a'
    };
    if (grad && (target === 'all' || target === 'corners')) {
      cornersDotOptions.gradient = grad;
    } else {
      cornersDotOptions.gradient = null;
    }

    const options = {
      width: size,
      height: size,
      data: rawData,
      margin: margin,
      dotsOptions: dotsOptions,
      backgroundOptions: {
        color: bgColorInput ? bgColorInput.value : '#ffffff'
      },
      cornersSquareOptions: cornersSquareOptions,
      cornersDotOptions: cornersDotOptions,
      image: (centerImageCheck && centerImageCheck.checked && uploadedLogoBase64) ? uploadedLogoBase64 : '',
      imageOptions: {
        hideBackgroundDots: hideBgDotsCheck ? hideBgDotsCheck.checked : true,
        imageSize: logoSizeInput ? (parseFloat(logoSizeInput.value) || 0.3) : 0.3,
        margin: logoMarginInput ? (parseInt(logoMarginInput.value, 10) || 2) : 2
      }
    };

    qrCodeInstance.update(options);
    updateGradientLivePreview();

    if (qrResultContainer) {
      qrResultContainer.style.display = 'block';
    }
  }

  function debouncedUpdate() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updateQrCode, 120);
  }

  // ── ผูก Event Listeners ───────────────────────────────────
  function setupListeners() {
    if (enableGradientCheck) {
      enableGradientCheck.addEventListener('change', () => {
        if (gradientSettings) {
          gradientSettings.style.display = enableGradientCheck.checked ? 'block' : 'none';
        }
        updateQrCode();
      });
    }

    presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        presetChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        if (gradColor1 && chip.dataset.c1) gradColor1.value = chip.dataset.c1;
        if (gradColor2 && chip.dataset.c2) gradColor2.value = chip.dataset.c2;

        if (enableGradientCheck && !enableGradientCheck.checked) {
          enableGradientCheck.checked = true;
          if (gradientSettings) gradientSettings.style.display = 'block';
        }
        updateQrCode();
      });
    });

    if (gradColor1) gradColor1.addEventListener('input', updateQrCode);
    if (gradColor2) gradColor2.addEventListener('input', updateQrCode);

    if (swapColorsBtn) {
      swapColorsBtn.addEventListener('click', () => {
        if (gradColor1 && gradColor2) {
          const temp = gradColor1.value;
          gradColor1.value = gradColor2.value;
          gradColor2.value = temp;
          updateQrCode();
        }
      });
    }

    dirButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        dirButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDirection = btn.dataset.dir;

        if (currentDirection === 'custom') {
          if (customAngleBox) customAngleBox.style.display = 'block';
          if (gradientRotation) currentAngle = parseInt(gradientRotation.value, 10);
        } else {
          if (customAngleBox) customAngleBox.style.display = 'none';
          currentAngle = parseInt(btn.dataset.angle, 10) || 0;
          if (gradientRotation) gradientRotation.value = currentAngle;
          if (rotationValue) rotationValue.textContent = `${currentAngle}°`;
        }
        updateQrCode();
      });
    });

    if (gradientRotation) {
      gradientRotation.addEventListener('input', () => {
        currentAngle = parseInt(gradientRotation.value, 10);
        if (rotationValue) rotationValue.textContent = `${currentAngle}°`;
        updateQrCode();
      });
    }

    if (gradientTarget) gradientTarget.addEventListener('change', updateQrCode);

    if (saveThemeBtn) saveThemeBtn.addEventListener('click', saveCurrentTheme);

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDataType = btn.dataset.type;

        if (groupUrl) groupUrl.style.display = currentDataType === 'url' ? 'block' : 'none';
        if (groupText) groupText.style.display = currentDataType === 'text' ? 'block' : 'none';
        if (groupPromptpay) groupPromptpay.style.display = currentDataType === 'promptpay' ? 'block' : 'none';
        if (groupWifi) groupWifi.style.display = currentDataType === 'wifi' ? 'block' : 'none';

        updateQrCode();
      });
    });

    [
      urlInput, textInput, ppTargetInput, ppAmountInput,
      wifiSsidInput, wifiPassInput, wifiTypeInput, wifiHiddenCheck,
      sizeInput, colorInput, bgColorInput, frameColorInput
    ].forEach(input => {
      if (input) {
        input.addEventListener('input', debouncedUpdate);
        input.addEventListener('change', updateQrCode);
      }
    });

    document.querySelectorAll('input[name="dotsShape"], input[name="cornerSquareShape"], input[name="cornerDotShape"]').forEach(radio => {
      radio.addEventListener('change', updateQrCode);
    });

    if (frameThicknessInput && thicknessValue) {
      frameThicknessInput.addEventListener('input', () => {
        thicknessValue.textContent = `${frameThicknessInput.value}px`;
        updateQrCode();
      });
    }

    if (centerImageCheck) {
      centerImageCheck.addEventListener('change', () => {
        if (centerImageContainer) {
          centerImageContainer.style.display = centerImageCheck.checked ? 'block' : 'none';
        }
        updateQrCode();
      });
    }

    if (centerImageInput) {
      centerImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 2 * 1024 * 1024) {
            alert('ขนาดไฟล์เกิน 2MB กรุณาเลือกไฟล์ภาพใหม่');
            return;
          }
          const reader = new FileReader();
          reader.onload = (evt) => {
            uploadedLogoBase64 = evt.target.result;
            if (uploadText) uploadText.textContent = `เลือกแล้ว: ${file.name}`;
            updateQrCode();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    [logoSizeInput, logoMarginInput, hideBgDotsCheck].forEach(el => {
      if (el) el.addEventListener('change', updateQrCode);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('ต้องการรีเซ็ตการตั้งค่าทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?')) {
          if (qrForm) qrForm.reset();
          uploadedLogoBase64 = null;
          if (uploadText) uploadText.textContent = 'คลิกเพื่อเลือกรูปภาพโลโก้';
          if (enableGradientCheck) enableGradientCheck.checked = false;
          if (gradientSettings) gradientSettings.style.display = 'none';
          if (centerImageContainer) centerImageContainer.style.display = 'none';
          if (thicknessValue) thicknessValue.textContent = '5px';
          if (rotationValue) rotationValue.textContent = '45°';
          currentAngle = 45;
          currentDirection = 'diagonal';
          if (urlInput) urlInput.value = 'https://google.com';
          updateQrCode();
        }
      });
    }

    function openModal() {
      if (!filenameModal) return;
      filenameModal.classList.add('show');
      filenameModal.style.display = 'flex';
      if (filenameInput) {
        filenameInput.value = `swift_qr_${Date.now()}`;
        filenameInput.focus();
      }
    }

    function closeModal() {
      if (!filenameModal) return;
      filenameModal.classList.remove('show');
      filenameModal.style.display = 'none';
    }

    if (qrForm) {
      qrForm.addEventListener('submit', (e) => {
        e.preventDefault();
        openModal();
      });
    }

    if (downloadBtn) downloadBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    if (confirmModalBtn) {
      confirmModalBtn.addEventListener('click', () => {
        const name = (filenameInput && filenameInput.value.trim()) ? filenameInput.value.trim() : `swift_qr_${Date.now()}`;
        const format = fileFormat ? fileFormat.value : 'png';
        qrCodeInstance.download({ name: name, extension: format });
        closeModal();
      });
    }

    window.addEventListener('click', (e) => {
      if (e.target === filenameModal) closeModal();
    });
  }

  // ── เริ่มต้นระบบ ──────────────────────────────────────────
  initDarkMode();

  qrCodeInstance = new QRCodeStyling({
    width: 300,
    height: 300,
    type: 'canvas',
    data: 'https://google.com',
    margin: 5,
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: 'Q'
    },
    dotsOptions: {
      color: '#0f172a',
      type: 'square'
    },
    backgroundOptions: {
      color: '#ffffff'
    },
    cornersSquareOptions: {
      color: '#0f172a',
      type: 'square'
    },
    cornersDotOptions: {
      color: '#0f172a',
      type: 'square'
    }
  });

  if (previewCanvas) {
    previewCanvas.innerHTML = '';
    qrCodeInstance.append(previewCanvas);
  }

  setupListeners();
  loadUserThemes();
  updateQrCode();
});