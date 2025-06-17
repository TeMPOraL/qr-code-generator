document.addEventListener('DOMContentLoaded', function() {
    const contentInput = document.getElementById('content');
    const errorCorrectionSelect = document.getElementById('errorCorrection');
    const qrcodeCanvas = document.getElementById('qrcode');
    const downloadLink = document.getElementById('download');
    const foregroundColorInput = document.getElementById('foregroundColor');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const moduleStyleSelect = document.getElementById('moduleStyle');
    const logoUploadInput = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');
    const removeLogoBtn = document.getElementById('removeLogo');

    let qr = null;
    let debounceTimer;
    let logoDataUrl = null;

    // Helper: generate a filename based on today's date and the QR code content.
    function generateFilename(content) {
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month 01..12
        const dd = String(date.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        // Remove "http://" or "https://", then trim and slice up to 64 characters.
        let stub = content.trim().replace(/^https?:\/\//i, '').slice(0, 64);
        // Replace any character that is not alphanumeric, dot, or hyphen with a hyphen.
        stub = stub.replace(/[^a-zA-Z0-9\-\.]/g, '-');

        if (!stub) {
            stub = 'qr-code';
        }
        return `${dateStr}-${stub}.png`;
    }
    function debounce(func, delay) {
        return function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(func, delay);
        };
    }

    // Initialize QR code instance
    function initQRCode() {
        qr = new QRious({
            element: qrcodeCanvas,
            size: 512,
            value: 'N/A',
            level: 'M', // default error correction level
            background: 'white',
            foreground: 'grey',
            padding: 16 // safety margin
        });
    }

    // Apply module style (dots, rounded corners)
    function applyModuleStyle(style) {
        if (style === 'square' || !qr.modules) return;

        const ctx = qrcodeCanvas.getContext('2d');
        const moduleCount = qr.modules.length;
        const moduleSize = (qrcodeCanvas.width - qr.padding * 2) / moduleCount;
        const padding = qr.padding;

        // Clear canvas and redraw with new style
        ctx.clearRect(0, 0, qrcodeCanvas.width, qrcodeCanvas.height);
        
        // Draw background
        ctx.fillStyle = qr.background;
        ctx.fillRect(0, 0, qrcodeCanvas.width, qrcodeCanvas.height);
        
        // Set foreground color
        ctx.fillStyle = qr.foreground;

        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.modules[row][col]) {
                    const x = padding + col * moduleSize;
                    const y = padding + row * moduleSize;

                    if (style === 'dots') {
                        // Draw circles
                        ctx.beginPath();
                        ctx.arc(
                            x + moduleSize / 2,
                            y + moduleSize / 2,
                            moduleSize * 0.4,
                            0,
                            2 * Math.PI
                        );
                        ctx.fill();
                    } else if (style === 'rounded') {
                        // Draw rounded rectangles
                        const radius = moduleSize * 0.2;
                        ctx.beginPath();
                        ctx.moveTo(x + radius, y);
                        ctx.lineTo(x + moduleSize - radius, y);
                        ctx.quadraticCurveTo(x + moduleSize, y, x + moduleSize, y + radius);
                        ctx.lineTo(x + moduleSize, y + moduleSize - radius);
                        ctx.quadraticCurveTo(x + moduleSize, y + moduleSize, x + moduleSize - radius, y + moduleSize);
                        ctx.lineTo(x + radius, y + moduleSize);
                        ctx.quadraticCurveTo(x, y + moduleSize, x, y + moduleSize - radius);
                        ctx.lineTo(x, y + radius);
                        ctx.quadraticCurveTo(x, y, x + radius, y);
                        ctx.closePath();
                        ctx.fill();
                    }
                }
            }
        }
    }

    // Embed logo in QR code
    function embedLogo() {
        if (!logoDataUrl) return;

        const ctx = qrcodeCanvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            const logoSize = qrcodeCanvas.width * 0.2; // 20% of QR code size
            const x = (qrcodeCanvas.width - logoSize) / 2;
            const y = (qrcodeCanvas.height - logoSize) / 2;
            
            // White background for logo
            ctx.fillStyle = 'white';
            ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
            
            // Draw logo
            ctx.drawImage(img, x, y, logoSize, logoSize);
            
            // Update download link after logo is embedded
            updateDownloadLink();
        };
        
        img.src = logoDataUrl;
    }

    // Generate QR code
    function generateQRCode() {
        const content = contentInput.value.trim();

        if (!content) {
            // Hide download link if no content
            downloadLink.style.display = 'none';
            // Clear the QR code (optional)
            qr.value = 'N/A';
            qr.foreground = 'grey';
            return;
        }

        const errorCorrection = errorCorrectionSelect.value;
        const foregroundColor = foregroundColorInput.value;
        const backgroundColor = backgroundColorInput.value;
        const moduleStyle = moduleStyleSelect.value;

        // If logo is present, force high error correction
        if (logoDataUrl) {
            qr.level = 'H';
            errorCorrectionSelect.value = 'H';
        } else {
            qr.level = errorCorrection;
        }

        qr.value = content;
        qr.foreground = foregroundColor;
        qr.background = backgroundColor;

        // Apply module style if not square
        setTimeout(() => {
            applyModuleStyle(moduleStyle);
            // Embed logo after style is applied
            if (logoDataUrl) {
                embedLogo();
            } else {
                updateDownloadLink();
            }
        }, 50);

        // Show download link
        downloadLink.style.display = 'inline-block';
    }

    // Update download link with current canvas data and dynamic filename
    function updateDownloadLink() {
        const dataURL = qrcodeCanvas.toDataURL('image/png');
        downloadLink.href = dataURL;
        downloadLink.download = generateFilename(qr.value);
    }

    // Create debounced version of generate function
    const debouncedGenerate = debounce(generateQRCode, 200);

    // Event listeners
    contentInput.addEventListener('input', debouncedGenerate);
    errorCorrectionSelect.addEventListener('change', debouncedGenerate);
    foregroundColorInput.addEventListener('change', debouncedGenerate);
    backgroundColorInput.addEventListener('change', debouncedGenerate);
    moduleStyleSelect.addEventListener('change', debouncedGenerate);

    // Logo upload handling
    logoUploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                logoDataUrl = event.target.result;
                logoPreview.innerHTML = `<img src="${logoDataUrl}" alt="Logo preview">`;
                removeLogoBtn.style.display = 'inline-block';
                debouncedGenerate();
            };
            reader.readAsDataURL(file);
        }
    });

    // Remove logo
    removeLogoBtn.addEventListener('click', function() {
        logoDataUrl = null;
        logoPreview.innerHTML = '';
        logoUploadInput.value = '';
        removeLogoBtn.style.display = 'none';
        debouncedGenerate();
    });

    // Initialize
    initQRCode();
    // Generate empty QR code on initial load (optional)
    generateQRCode();
});
