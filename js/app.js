document.addEventListener('DOMContentLoaded', function() {
    const contentInput = document.getElementById('content');
    const errorCorrectionSelect = document.getElementById('errorCorrection');
    const generateButton = document.getElementById('generate');
    const qrcodeCanvas = document.getElementById('qrcode');
    const downloadLink = document.getElementById('download');
    
    let qr = null;
    
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
            alert('Please enter content for the QR code');
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
    
    // Event listeners
    generateButton.addEventListener('click', generateQRCode);
    
    // Initialize
    initQRCode();
});
