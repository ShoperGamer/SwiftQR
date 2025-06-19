document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const qrForm = document.getElementById('qrForm');
    const urlInput = document.getElementById('urlInput');
    const sizeInput = document.getElementById('sizeInput');
    const formatSelect = document.getElementById('formatSelect');
    const centerImageCheck = document.getElementById('centerImageCheck');
    const centerImageContainer = document.getElementById('centerImageContainer');
    const centerImageInput = document.getElementById('centerImageInput');
    const qrResultContainer = document.getElementById('qrResultContainer');
    const qrCanvas = document.getElementById('qrCanvas');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeStyle = document.getElementById('darkModeStyle');

    // Variables
    let centerImage = null;
    let currentQRCode = null;
    let isGenerating = false;

    // Event Listeners
    centerImageCheck.addEventListener('change', function() {
        centerImageContainer.style.display = this.checked ? 'block' : 'none';
        if (!this.checked) centerImage = null;
    });

    centerImageInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                centerImage = new Image();
                centerImage.src = event.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    qrForm.addEventListener('submit', function(e) {
        e.preventDefault();
        generateQRCode();
    });

    downloadBtn.addEventListener('click', downloadQRCode);
    clearBtn.addEventListener('click', clearQRCode);
    darkModeToggle.addEventListener('change', toggleDarkMode);

    // Functions
    function generateQRCode() {
        if (isGenerating) return;
        isGenerating = true;
        
        const url = urlInput.value.trim();
        const size = parseInt(sizeInput.value);
        
        if (!url) {
            alert('Please enter a valid URL');
            isGenerating = false;
            return;
        }

        // Validate URL format
        if (!isValidUrl(url)) {
            alert('Please enter a valid URL starting with http:// or https://');
            isGenerating = false;
            return;
        }

        // Create QR code with higher error correction
        const typeNumber = 0;
        const errorCorrectionLevel = 'H';
        const qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(url);
        qr.make();
        
        // Get QR code as canvas
        const qrSize = Math.min(Math.max(size, 150), 1000);
        const cellSize = Math.max(2, Math.floor(qrSize / qr.getModuleCount())); 
        const margin = Math.floor((qrSize - qr.getModuleCount() * cellSize) / 2);
        
        qrCanvas.width = qrSize;
        qrCanvas.height = qrSize;
        const ctx = qrCanvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
        
        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);
        
        // Draw QR code
        for (let row = 0; row < qr.getModuleCount(); row++) {
            for (let col = 0; col < qr.getModuleCount(); col++) {
                ctx.fillStyle = qr.isDark(row, col) ? '#000000' : '#ffffff';
                ctx.fillRect(
                    margin + col * cellSize,
                    margin + row * cellSize,
                    cellSize,
                    cellSize
                );
            }
        }
        
        // Function to finalize QR code with center image
        const finalizeQRCode = () => {
            // Convert canvas to data URL
            currentQRCode = qrCanvas.toDataURL(`image/${formatSelect.value}`, 1.0); 
            
            qrResultContainer.style.display = 'block';
            clearBtn.disabled = false;
            isGenerating = false;
        };
        
        // Draw center image if exists
        if (centerImageCheck.checked && centerImage) {
           
            if (centerImage.complete && centerImage.naturalWidth !== 0) {
                drawCenterImage();
                finalizeQRCode();
            } else {
                centerImage.onload = function() {
                    drawCenterImage();
                    finalizeQRCode();
                };
            }
        } else {
            finalizeQRCode();
        }
        
        function drawCenterImage() {
            const maxSize = qrSize * 0.25; 
            const imgSize = Math.min(maxSize, centerImage.width, centerImage.height);
            const centerX = qrSize / 2 - imgSize / 2;
            const centerY = qrSize / 2 - imgSize / 2;
            
            // Draw white background for center image (เพิ่มขนาดพื้นหลัง)
            const bgPadding = cellSize * 2;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(
                centerX - bgPadding, 
                centerY - bgPadding, 
                imgSize + bgPadding*2, 
                imgSize + bgPadding*2
            );
            
            // Draw the image
            ctx.drawImage(
                centerImage,
                centerX,
                centerY,
                imgSize,
                imgSize
            );
        }
    }

    function downloadQRCode() {
        if (!currentQRCode) return;
        
        const link = document.createElement('a');
        link.href = currentQRCode;
        link.download = `qr-code-${Date.now()}.${formatSelect.value}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function clearQRCode() {
        qrResultContainer.style.display = 'none';
        urlInput.value = '';
        sizeInput.value = '200';
        formatSelect.value = 'png';
        centerImageCheck.checked = false;
        centerImageContainer.style.display = 'none';
        centerImageInput.value = '';
        centerImage = null;
        currentQRCode = null;
        clearBtn.disabled = true;
        
        const ctx = qrCanvas.getContext('2d');
        ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
    }

    function toggleDarkMode() {
        if (darkModeToggle.checked) {
            document.body.classList.add('dark-mode');
            darkModeStyle.disabled = false;
        } else {
            document.body.classList.remove('dark-mode');
            darkModeStyle.disabled = true;
        }
    }

    // เพิ่มฟังก์ชันตรวจสอบ URL
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
});