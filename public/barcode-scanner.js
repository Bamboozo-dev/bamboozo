// Barcode scanning functionality for product management
function showBarcodeScanner() {
	// Helper function for messages if not available globally
	function showScannerMessage(message, type = "success") {
		if (typeof showMessage === "function") {
			showMessage(message, type);
		} else {
			console.log(`Scanner ${type}: ${message}`);
			alert(message);
		}
	}

	// Check if Quagga2 is available
	if (typeof Quagga === "undefined") {
		// Try to load Quagga dynamically if it's not available
		showScannerMessage("Loading barcode scanner...", "success");
		const script = document.createElement("script");
		script.src =
			"https://unpkg.com/@ericblade/quagga2@1.2.6/dist/quagga.min.js";
		script.onload = function () {
			console.log("Quagga2 loaded dynamically");
			showBarcodeScanner(); // Restart the function now that Quagga is loaded
		};
		script.onerror = function () {
			showScannerMessage(
				"Failed to load barcode scanner library. Please refresh the page or try a different browser.",
				"error"
			);
		};
		document.head.appendChild(script);
		return;
	}

	console.log("Starting barcode scanner with Quagga2");

	// Create modal for barcode input/scanning
	const modal = document.createElement("div");
	modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

	const modalContent = document.createElement("div");
	modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

	modalContent.innerHTML = `
        <h3 style="margin-bottom: 20px; color: #333;">Barcode Scanner</h3>
        <div id="scannerStatus" style="color: #666; margin-bottom: 15px;">Initializing camera...</div>
        <div id="barcodeVideoContainer" style="width:100%;height:300px;border-radius:8px;background:#222;margin-bottom:20px;overflow:hidden;position:relative;display:flex;justify-content:center;align-items:center;">
            <div id="loadingSpinner" style="position:absolute;color:white;font-size:14px;">
                <div style="width:40px;height:40px;border:3px solid rgba(255,255,255,0.3);border-radius:50%;border-top-color:white;animation:spin 1s ease-in-out infinite;margin:0 auto 10px;"></div>
                Loading camera...
            </div>
        </div>
        <input type="text" id="modalBarcodeInput" placeholder="Enter barcode manually or wait for scan..." 
               style="width: 100%; padding: 12px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px;" />
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button id="confirmBarcodeBtn" style="background: #28a745; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">
                ✓ Use This Barcode
            </button>
            <button id="manualModeBtn" style="background: #17a2b8; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">
                ✎ Manual Mode
            </button>
            <button id="cancelBarcodeBtn" style="background: #6c757d; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">
                ✕ Cancel
            </button>
        </div>
        <style>
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    `;

	modal.appendChild(modalContent);
	document.body.appendChild(modal);

	const modalInput = document.getElementById("modalBarcodeInput");
	const scannerStatus = document.getElementById("scannerStatus");
	const videoContainer = document.getElementById("barcodeVideoContainer");
	const loadingSpinner = document.getElementById("loadingSpinner");
	const manualModeBtn = document.getElementById("manualModeBtn");
	let quaggaInitialized = false;
	let activeScan = true;
	let isManualMode = false;
	let cameraTimeout = null;

	// Toggle between camera and manual modes
	manualModeBtn.addEventListener("click", function () {
		isManualMode = !isManualMode;

		if (isManualMode) {
			// Switch to manual mode
			if (quaggaInitialized) {
				Quagga.stop();
				quaggaInitialized = false;
			}
			videoContainer.style.display = "none";
			scannerStatus.textContent = "Manual mode: Enter barcode below";
			scannerStatus.style.color = "#17a2b8";
			manualModeBtn.textContent = "📷 Camera Mode";
			manualModeBtn.style.background = "#6610f2";
			modalInput.focus();

			// Clear the timeout if it exists
			if (cameraTimeout) {
				clearTimeout(cameraTimeout);
				cameraTimeout = null;
			}
		} else {
			// Switch back to camera mode
			videoContainer.style.display = "flex";
			loadingSpinner.style.display = "block";
			scannerStatus.textContent = "Initializing camera...";
			scannerStatus.style.color = "#666";
			manualModeBtn.textContent = "✎ Manual Mode";
			manualModeBtn.style.background = "#17a2b8";
			initQuagga();
		}
	});

	// Initialize and start QuaggaJS with simplified settings
	function initQuagga() {
		console.log("Initializing Quagga with simplified settings...");

		// Set a timeout to prevent hanging on camera initialization
		cameraTimeout = setTimeout(() => {
			if (!quaggaInitialized) {
				console.log("Camera initialization timed out");
				scannerStatus.innerHTML = `
                    <span style="color: #dc3545;">Camera initialization timed out</span><br>
                    <span style="font-size: 14px;">Try using manual mode instead</span>
                `;
				loadingSpinner.style.display = "none";
				// Switch to manual mode
				manualModeBtn.click();
			}
		}, 8000); // 8 seconds timeout

		try {
			Quagga.init(
				{
					inputStream: {
						name: "Live",
						type: "LiveStream",
						target: videoContainer,
						constraints: {
							// Simple constraints that work on most devices
							width: 640,
							height: 480,
							facingMode: "environment",
						},
					},
					locator: {
						patchSize: "medium",
						halfSample: true,
					},
					numOfWorkers: 2, // Reduced workers
					frequency: 10,
					decoder: {
						readers: [
							"code_128_reader",
							"ean_reader",
							"ean_8_reader",
							"upc_reader",
							"upc_e_reader",
						],
					},
				},
				function (err) {
					// Clear the timeout since initialization completed (with or without error)
					if (cameraTimeout) {
						clearTimeout(cameraTimeout);
						cameraTimeout = null;
					}

					if (err) {
						console.error("Quagga initialization failed:", err);
						loadingSpinner.style.display = "none";

						// Handle specific error types
						let errorMsg = "";
						if (err.name === "NotAllowedError") {
							errorMsg =
								"Camera access denied. Please allow camera access in your browser settings and try again.";
						} else if (err.name === "NotFoundError") {
							errorMsg =
								"No camera found. Please make sure your device has a camera.";
						} else if (err.name === "NotReadableError") {
							errorMsg =
								"Camera is already in use by another application. Please close other apps using the camera.";
						} else if (err.name === "OverconstrainedError") {
							errorMsg =
								"Camera doesn't meet requirements. Try a different browser.";
						} else {
							errorMsg =
								"Error accessing camera: " +
								(err.message || err.name || "Unknown error");
						}

						scannerStatus.innerHTML = `<span style="color: #dc3545;">${errorMsg}</span><br>
                            <span style="font-size: 14px;">You can enter a barcode manually below.</span>`;

						// Switch to manual mode automatically on error
						setTimeout(() => manualModeBtn.click(), 500);
						return;
					}

					console.log("Quagga initialized successfully");
					quaggaInitialized = true;
					loadingSpinner.style.display = "none";
					scannerStatus.textContent = "Camera active - point at a barcode";
					scannerStatus.style.color = "#28a745";

					Quagga.start();
				}
			);
		} catch (err) {
			console.error("Exception during Quagga initialization:", err);
			loadingSpinner.style.display = "none";
			scannerStatus.innerHTML = `<span style="color: #dc3545;">Camera initialization failed</span><br>
                <span style="font-size: 14px;">Using manual mode instead</span>`;

			// Clear the timeout
			if (cameraTimeout) {
				clearTimeout(cameraTimeout);
				cameraTimeout = null;
			}

			// Switch to manual mode automatically on error
			setTimeout(() => manualModeBtn.click(), 500);
		}
	}

	// Handle successful barcode detection
	Quagga.onDetected(function (result) {
		if (!activeScan) return;

		const code = result.codeResult.code;
		if (!code) return;

		// Play a success sound if available
		const successSound = new Audio("/beep.mp3");
		successSound
			.play()
			.catch((e) => console.log("Could not play success sound"));

		console.log("Barcode detected:", code);
		modalInput.value = code;
		scannerStatus.textContent = `Barcode detected: ${code}`;
		scannerStatus.style.color = "#28a745";

		// Briefly pause scanning to prevent multiple detections
		activeScan = false;
		setTimeout(() => {
			activeScan = true;
		}, 2000);
	});

	// Confirm button sets barcode to main input and closes the modal
	document.getElementById("confirmBarcodeBtn").onclick = function () {
		const barcodeValue = modalInput.value.trim();
		if (barcodeValue) {
			document.getElementById("barcodeInput").value = barcodeValue;
			cleanupBarcodeModal();
			showScannerMessage("Barcode added: " + barcodeValue, "success");
		} else {
			scannerStatus.textContent = "Please scan a barcode or enter one manually";
			scannerStatus.style.color = "#dc3545";
		}
	};

	// Cancel button closes modal and stops camera
	document.getElementById("cancelBarcodeBtn").onclick = cleanupBarcodeModal;

	// Enter key confirms
	modalInput.addEventListener("keypress", function (e) {
		if (e.key === "Enter") {
			document.getElementById("confirmBarcodeBtn").click();
		}
	});

	// Click outside closes modal and stops camera
	modal.addEventListener("click", function (e) {
		if (e.target === modal) cleanupBarcodeModal();
	});

	// Cleanup function to ensure proper resource disposal
	function cleanupBarcodeModal() {
		activeScan = false;

		// Clear the timeout
		if (cameraTimeout) {
			clearTimeout(cameraTimeout);
			cameraTimeout = null;
		}

		if (quaggaInitialized) {
			try {
				Quagga.offDetected();
				Quagga.stop();
				console.log("Quagga stopped successfully");
			} catch (err) {
				console.error("Error stopping Quagga:", err);
			}
		}
		if (document.body.contains(modal)) {
			document.body.removeChild(modal);
		}
	}

	// Start in camera mode by default if browser supports it
	if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
		initQuagga();
	} else {
		console.log("This browser doesn't support camera access");
		scannerStatus.innerHTML = `
            <span style="color: #dc3545;">Camera not supported by this browser</span><br>
            <span style="font-size: 14px;">Using manual mode instead</span>
        `;
		loadingSpinner.style.display = "none";
		setTimeout(() => manualModeBtn.click(), 500);
	}
}

// Export the function for use in other files
if (typeof module !== "undefined" && module.exports) {
	module.exports = { showBarcodeScanner };
}
