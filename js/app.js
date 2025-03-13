document.addEventListener('DOMContentLoaded', function() {
    const contentInput = document.getElementById('content');
    const errorCorrectionSelect = document.getElementById('errorCorrection');
    const qrcodeCanvas = document.getElementById('qrcode');
    const downloadLink = document.getElementById('download');

    let qr = null;
    let debounceTimer;

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

        qr.level = errorCorrection;
        qr.value = content;
        qr.foreground = 'black';

        // Show download link
        downloadLink.style.display = 'inline-block';
        updateDownloadLink();
    }

    // Update download link with current canvas data and dynamic filename
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
