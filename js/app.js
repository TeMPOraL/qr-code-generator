document.addEventListener('DOMContentLoaded', function() {
    const contentInput = document.getElementById('content');
    const errorCorrectionSelect = document.getElementById('errorCorrection');
    const qrcodeCanvas = document.getElementById('qrcode');
    const downloadLink = document.getElementById('download');
    
    let qr = null;
    let debounceTimer;
    
    // Debounce function to delay execution
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
            size: 300,
            value: '',
            level: 'M', // default error correction level
            background: 'white',
            foreground: 'black',
            padding: 20 // safety margin
        });
    }
    
    // Generate QR code
    function generateQRCode() {
        const content = contentInput.value.trim();
        
        if (!content) {
            // Hide download link if no content
            downloadLink.style.display = 'none';
            // Clear the QR code (optional)
            qr.value = '';
            return;
        }
        
        const errorCorrection = errorCorrectionSelect.value;
        
        qr.level = errorCorrection;
        qr.value = content;
        
        // Show download link
        downloadLink.style.display = 'inline-block';
        updateDownloadLink();
    }
    
    // Update download link with current canvas data
    function updateDownloadLink() {
        const dataURL = qrcodeCanvas.toDataURL('image/png');
        downloadLink.href = dataURL;
    }
    
    // Create debounced version of generate function
    const debouncedGenerate = debounce(generateQRCode, 200);
    
    // Event listeners
    contentInput.addEventListener('input', debouncedGenerate);
    errorCorrectionSelect.addEventListener('change', debouncedGenerate);
    
    // Initialize
    initQRCode();
    // Generate empty QR code on initial load (optional)
    generateQRCode();
});
