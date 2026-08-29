document.addEventListener("DOMContentLoaded", () => {
    // ===================== DOM Elements =====================
    const form = document.getElementById("qrForm");
    
    // แท็บสลับโหมดและกลุ่มอินพุต
    const tabButtons = document.querySelectorAll(".qr-tab-btn");
    const groupUrl = document.getElementById("groupUrl");
    const groupText = document.getElementById("groupText");
    const groupPromptpay = document.getElementById("groupPromptpay");
    const groupWifi = document.getElementById("groupWifi");
    
    // ข้อมูลอินพุตแต่ละโหมด
    const urlInput = document.getElementById("urlInput");
    const textInput = document.getElementById("textInput");
    const ppTargetInput = document.getElementById("ppTargetInput");
    const ppAmountInput = document.getElementById("ppAmountInput");
    const wifiSsidInput = document.getElementById("wifiSsidInput");
    const wifiPassInput = document.getElementById("wifiPassInput");
    const wifiTypeInput = document.getElementById("wifiTypeInput");
    const wifiHiddenCheck = document.getElementById("wifiHiddenCheck");

    // การปรับแต่งดีไซน์
    const sizeInput = document.getElementById("sizeInput");
    const colorInput = document.getElementById("colorInput");
    const bgColorInput = document.getElementById("bgColorInput");
    const frameColorInput = document.getElementById("frameColorInput");
    const frameThicknessInput = document.getElementById("frameThicknessInput");
    const thicknessValue = document.getElementById("thicknessValue");

    // กล่องแสดงผลและปุ่ม
    const previewCanvas = document.getElementById("previewCanvas");
    const qrResultContainer = document.getElementById("qrResultContainer");
    const clearBtn = document.getElementById("clearBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    // ออปชันโลโก้ตรงกลาง
    const centerImageCheck = document.getElementById("centerImageCheck");
    const centerImageInput = document.getElementById("centerImageInput");
    const centerImageContainer = document.getElementById("centerImageContainer");
    const logoSizeInput = document.getElementById("logoSizeInput");
    const logoMarginInput = document.getElementById("logoMarginInput");
    const hideBgDotsCheck = document.getElementById("hideBgDotsCheck");

    // โหมดกลางคืน
    const darkModeToggle = document.getElementById("darkModeToggle");

    // กล่องโมดอลดาวน์โหลด
    const filenameModal = document.getElementById("filenameModal");
    const filenameInput = document.getElementById("filenameInput");
    const fileFormatSelect = document.getElementById("fileFormat");
    const confirmModalBtn = document.getElementById("confirmModalBtn");
    const cancelModalBtn = document.getElementById("cancelModalBtn");
    const closeModalBtn = document.querySelector(".close-modal-btn");

    // ===================== State Variables =====================
    let currentMode = "url";
    let centerImageDataUrl = null;
    let finalDownloadName = "qrcode";
    let qrCodeInstance = null;

    // ===================== Initialize App =====================
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

        setupEventListeners();
        updatePreview();
    }

    function debounce(func, delay = 150) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // แปลงข้อความเป็น UTF-8 เพื่อให้สแกนภาษาไทยได้สมบูรณ์
    function toUtf8Data(str) {
        if (!str) return "";
        try {
            return unescape(encodeURIComponent(str));
        } catch (e) {
            return str;
        }
    }

    // ===================== Data Payloads =====================
    function getQRCodeData() {
        if (currentMode === "url") {
            return urlInput ? urlInput.value.trim() : "";
        }
        if (currentMode === "text") {
            return textInput ? textInput.value.trim() : "";
        }
        if (currentMode === "promptpay") {
            const target = ppTargetInput ? ppTargetInput.value.trim().replace(/[^0-9]/g, '') : "";
            const amount = ppAmountInput && ppAmountInput.value ? parseFloat(ppAmountInput.value) : null;
            if (!target) return "";
            return generatePromptPayPayload(target, amount);
        }
        if (currentMode === "wifi") {
            const ssid = wifiSsidInput ? wifiSsidInput.value.trim() : "";
            const pass = wifiPassInput ? wifiPassInput.value : "";
            const type = wifiTypeInput ? wifiTypeInput.value : "WPA";
            const isHidden = wifiHiddenCheck ? wifiHiddenCheck.checked : false;
            if (!ssid) return "";
            return `WIFI:T:${type};S:${ssid};P:${pass};H:${isHidden ? "true" : "false"};;`;
        }
        return "";
    }

    // คำนวณ CRC16-CCITT สำหรับ PromptPay EMVCo
    function crc16(data) {
        let crc = 0xFFFF;
        for (let i = 0; i < data.length; i++) {
            let c = data.charCodeAt(i);
            crc ^= c << 8;
            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
                } else {
                    crc = (crc << 1) & 0xFFFF;
                }
            }
        }
        return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
    }

    function formatTag(id, val) {
        const len = ("00" + val.length).slice(-2);
        return id + len + val;
    }

    function generatePromptPayPayload(target, amount) {
        let formattedTarget = "";
        const aid = "A000000677010111";

        if (target.length === 10 && target.startsWith("0")) {
            formattedTarget = formatTag("01", "0066" + target.substring(1));
        } else if (target.length === 13) {
            formattedTarget = formatTag("02", target);
        } else {
            formattedTarget = formatTag("01", target);
        }

        const merchantInfo = formatTag("29", formatTag("00", aid) + formattedTarget);

        let payload = 
            formatTag("00", "01") +
            formatTag("01", amount ? "12" : "11") +
            merchantInfo +
            formatTag("53", "764") +
            formatTag("58", "TH");

        if (amount && !isNaN(amount) && amount > 0) {
            payload += formatTag("54", amount.toFixed(2));
        }

        payload += "6304";
        payload += crc16(payload);
        return payload;
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
            data: toUtf8Data(text) || "https://example.com",
            margin: marginSize,
            qrOptions: {
                typeNumber: 0,
                errorCorrectionLevel: hasImage ? "H" : "Q"
            },
            image: hasImage ? centerImageDataUrl : undefined,
            imageOptions: {
                hideBackgroundDots: hideBgDots,
                imageSize: logoSize,
                margin: logoMargin,
                crossOrigin: "anonymous"
            },
            dotsOptions: { type: dotsType, color: dotsColor },
            cornersSquareOptions: { type: cornerSquareType, color: frameColor },
            cornersDotOptions: { type: cornerDotType, color: frameColor },
            backgroundOptions: { color: bgColor }
        };
    }

    function switchMode(mode) {
        currentMode = mode;
        tabButtons.forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-type") === mode);
        });

        if (groupUrl) groupUrl.style.display = mode === "url" ? "block" : "none";
        if (groupText) groupText.style.display = mode === "text" ? "block" : "none";
        if (groupPromptpay) groupPromptpay.style.display = mode === "promptpay" ? "block" : "none";
        if (groupWifi) groupWifi.style.display = mode === "wifi" ? "block" : "none";

        updatePreview();
    }

    // ===================== Event Listeners =====================
    function setupEventListeners() {
        const debouncedUpdate = debounce(updatePreview, 150);

        // แท็บเปลี่ยนโหมด
        tabButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                switchMode(btn.getAttribute("data-type"));
            });
        });

        // ดักจับช่องกรอกข้อมูลทั้งหมด
        const allInputs = [
            urlInput, textInput, ppTargetInput, ppAmountInput,
            wifiSsidInput, wifiPassInput, sizeInput
        ];
        allInputs.forEach(el => {
            if (el) {
                ["input", "keyup", "paste"].forEach(evt => {
                    el.addEventListener(evt, debouncedUpdate);
                });
            }
        });

        [wifiTypeInput, wifiHiddenCheck].forEach(el => {
            if (el) el.addEventListener("change", updatePreview);
        });

        // ดักจับชุดเลือกสี
        [colorInput, bgColorInput, frameColorInput].forEach(el => {
            if (el) {
                el.addEventListener("input", updatePreview);
                el.addEventListener("change", updatePreview);
            }
        });

        // ดักจับระยะขอบ
        if (frameThicknessInput) {
            frameThicknessInput.addEventListener("input", () => {
                if (thicknessValue) thicknessValue.textContent = frameThicknessInput.value + "px";
                updatePreview();
            });
        }

        // ดักจับรูปทรง Radio
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener("change", updatePreview);
        });

        // ขนาดและระยะห่างโลโก้
        [logoSizeInput, logoMarginInput].forEach(el => {
            if (el) el.addEventListener("change", updatePreview);
        });

        if (hideBgDotsCheck) hideBgDotsCheck.addEventListener("change", updatePreview);

        // สลับเปิด/ปิด โลโก้
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

        // Form Submit & Download Trigger
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                validateAndOpenModal();
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener("click", validateAndOpenModal);
        }

        // ปุ่มยืนยัน/ยกเลิกใน Modal
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

        if (clearBtn) clearBtn.addEventListener("click", resetForm);
        if (darkModeToggle) darkModeToggle.addEventListener("change", toggleDarkMode);
    }

    function validateAndOpenModal() {
        const payload = getQRCodeData();
        if (!payload) {
            if (currentMode === "url") alert('กรุณากรอกลิงก์ (URL)');
            else if (currentMode === "text") alert('กรุณากรอกข้อความ');
            else if (currentMode === "promptpay") alert('กรุณากรอกเบอร์มือถือ หรือเลขบัตรประชาชน');
            else if (currentMode === "wifi") alert('กรุณากรอกชื่อ WiFi (SSID)');
            return;
        }

        if (currentMode === "url" && !payload.startsWith("http://") && !payload.startsWith("https://")) {
            alert('กรุณากรอกลิงก์ที่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)');
            return;
        }

        if (filenameInput) filenameInput.value = "";
        if (fileFormatSelect) fileFormatSelect.value = "png";
        showModal();
    }

    function updatePreview() {
        const payload = getQRCodeData();
        const size = sizeInput ? (parseInt(sizeInput.value) || 300) : 300;

        if (qrResultContainer) {
            qrResultContainer.style.display = payload.length > 0 ? "block" : "none";
        }
        if (clearBtn) {
            clearBtn.disabled = !payload && !centerImageDataUrl;
        }

        const options = getQROptions(payload || "https://example.com", size);
        if (qrCodeInstance) {
            qrCodeInstance.update(options);
        }
    }

    // ===================== Modal Functions =====================
    function showModal() {
        if (filenameModal) {
            filenameModal.style.display = "flex";
            filenameModal.classList.add("show");
            document.body.style.overflow = "hidden";
            setTimeout(() => filenameInput && filenameInput.focus(), 100);
        }
    }

    function hideModal() {
        if (filenameModal) {
            filenameModal.classList.remove("show");
            filenameModal.style.display = "none";
            document.body.style.overflow = "";
        }
    }

    function handleModalConfirm() {
        const userInput = filenameInput ? filenameInput.value.trim() : "";
        const format = fileFormatSelect ? fileFormatSelect.value : "png";

        if (userInput) {
            finalDownloadName = userInput.replace(/\.png$/i, '').replace(/\.svg$/i, '');
        } else {
            finalDownloadName = `${currentMode}_swiftqr_${Date.now()}`;
        }

        hideModal();
        downloadQRCode(format);
    }

    function handleCenterImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('ขนาดไฟล์ภาพใหญ่เกินไป กรุณาใช้รูปภาพขนาดไม่เกิน 2MB');
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

    function downloadQRCode(format = "png") {
        const payload = getQRCodeData();
        if (!payload) {
            alert('ไม่พบข้อมูลสำหรับสร้าง QR Code');
            return;
        }

        const highResSize = 1000;
        const downloadOptions = getQROptions(payload, highResSize);
        downloadOptions.type = format === "svg" ? "svg" : "canvas";

        const tempQrCode = new QRCodeStyling(downloadOptions);

        setTimeout(() => {
            tempQrCode.download({
                name: finalDownloadName,
                extension: format
            });
        }, 300);
    }

    function resetForm() {
        if (form) form.reset();
        centerImageDataUrl = null;
        if (centerImageContainer) centerImageContainer.style.display = "none";
        if (thicknessValue) thicknessValue.textContent = "5px";
        if (colorInput) colorInput.value = "#0f172a";
        if (bgColorInput) bgColorInput.value = "#ffffff";
        if (frameColorInput) frameColorInput.value = "#2563eb";

        const defaultShape = document.querySelector('input[name="dotsShape"][value="square"]');
        const defaultCorner = document.querySelector('input[name="cornerSquareShape"][value="square"]');
        const defaultDot = document.querySelector('input[name="cornerDotShape"][value="square"]');
        
        if (defaultShape) defaultShape.checked = true;
        if (defaultCorner) defaultCorner.checked = true;
        if (defaultDot) defaultDot.checked = true;

        if (clearBtn) clearBtn.disabled = true;
        switchMode("url");
    }

    function toggleDarkMode() {
        const isDarkMode = darkModeToggle.checked;
        document.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('darkMode', isDarkMode);
    }
});

// Service Worker (Offline Mode)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Swift QR: Offline Service Worker Registered!'))
            .catch((err) => console.error('Service Worker Registration Failed:', err));
    });
}