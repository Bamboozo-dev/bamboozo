// Redirect if not logged in
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");
if (!user || !token) {
	window.location.href = "signin.html";
}

document.getElementById("userInfo").textContent = `Logged in as: ${
	user.name
} (${user.email}) - ${user.role.toUpperCase()}`;

// Show admin navigation if user is admin
if (user.role === "admin") {
	document.getElementById("adminNav").style.display = "block";
}

document.getElementById("logoutBtn").onclick = function () {
	localStorage.removeItem("user");
	localStorage.removeItem("token");
	window.location.href = "signin.html";
};

// Show message function
function showMessage(text, type = "success") {
	const existingMsg = document.getElementById("messageDiv");
	if (existingMsg) existingMsg.remove();

	const msgDiv = document.createElement("div");
	msgDiv.id = "messageDiv";
	msgDiv.textContent = text;
	msgDiv.style.cssText = `
    padding: 12px 20px;
    margin: 16px 0;
    border-radius: 6px;
    text-align: center;
    font-weight: 500;
    background: ${type === "success" ? "#d4edda" : "#f8d7da"};
    color: ${type === "success" ? "#155724" : "#721c24"};
    border: 1px solid ${type === "success" ? "#c3e6cb" : "#f5c6cb"};
  `;

	const userInfo = document.getElementById("userInfo");
	userInfo.parentNode.insertBefore(msgDiv, userInfo.nextSibling);

	setTimeout(() => {
		if (msgDiv.parentNode) msgDiv.remove();
	}, 3000);
}

// Product management functions
async function fetchProducts() {
	const res = await fetch("/api/products", {
		headers: { Authorization: "Bearer " + token },
	});
	return res.ok ? await res.json() : [];
}

async function fetchCategories() {
	const res = await fetch("/api/categories", {
		headers: { Authorization: "Bearer " + token },
	});
	return res.ok ? await res.json() : [];
}

async function createProduct(data) {
	const res = await fetch("/api/products", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + token,
		},
		body: JSON.stringify(data),
	});
	return res.ok ? await res.json() : null;
}

async function updateProduct(id, data) {
	const res = await fetch(`/api/products/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + token,
		},
		body: JSON.stringify(data),
	});
	return res.ok ? await res.json() : null;
}

async function deleteProduct(id) {
	const res = await fetch(`/api/products/${id}`, {
		method: "DELETE",
		headers: { Authorization: "Bearer " + token },
	});
	return res.ok;
}

// Render products table
async function renderProducts() {
	const products = await fetchProducts();
	const categories = await fetchCategories();
	const table = document.getElementById("productsTable");

	const categoryOptions = categories
		.map((c) => `<option value="${c.name}">${c.name}</option>`)
		.join("");

	table.innerHTML =
		`<tr><th>Name</th><th>Description</th><th>Price</th><th>Category</th><th>Stock</th><th>Barcode</th><th>Image</th><th>Actions</th></tr>` +
		products
			.map(
				(p) => `<tr>
        <td><input value="${p.name}" id="name-${p._id}" /></td>
        <td><input value="${p.description}" id="description-${p._id}" /></td>
        <td><input type="number" value="${
					p.price
				}" step="0.01" min="0" id="price-${p._id}" /></td>
        <td>
          <select id="category-${p._id}">
            ${categories
							.map(
								(c) =>
									`<option value="${c.name}" ${
										c.name === p.category ? "selected" : ""
									}>${c.name}</option>`
							)
							.join("")}
          </select>
        </td>
        <td><input value="${p.stock}" min="0" id="stock-${p._id}" /></td>
        <td><input value="${p.barcode || ""}" id="barcode-${
					p._id
				}" placeholder="Barcode" /></td>
        <td>
          ${
						p.imageUrl
							? `<img src="${p.imageUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" alt="Product" />`
							: "No image"
					}
        </td>
        <td>
          <button onclick="updateProductHandler('${p._id}')">Update</button>
          <button onclick="deleteProductHandler('${p._id}')">Delete</button>
        </td>
      </tr>`
			)
			.join("");
}

// Add new product handler
const addProductForm = document.getElementById("addProductForm");
addProductForm.addEventListener("submit", async function (e) {
	e.preventDefault();
	const formData = new FormData(e.target);

	let imageUrl = null;
	const imageFile = formData.get("image");

	// Show loading indicator
	let loadingDiv = document.getElementById("imageUploadLoading");
	if (!loadingDiv) {
		loadingDiv = document.createElement("div");
		loadingDiv.id = "imageUploadLoading";
		loadingDiv.textContent = "Uploading image...";
		loadingDiv.style.cssText = `
			padding: 10px 18px;
			margin: 10px 0;
			border-radius: 6px;
			background: #e3f2fd;
			color: #007bff;
			font-weight: 500;
			text-align: center;
		`;
		addProductForm.parentNode.insertBefore(
			loadingDiv,
			addProductForm.nextSibling
		);
	}
	loadingDiv.style.display = "block";

	// Upload image if selected
	if (imageFile && imageFile.size > 0) {
		const uploadFormData = new FormData();
		uploadFormData.append("image", imageFile);

		// Create progress indicator
		const progressContainer = document.createElement("div");
		progressContainer.style.cssText = `
			width: 100%;
			background-color: #e0e0e0;
			border-radius: 4px;
			margin: 10px 0;
			height: 20px;
			overflow: hidden;
		`;

		const progressBar = document.createElement("div");
		progressBar.style.cssText = `
			width: 0%;
			height: 100%;
			background-color: #4CAF50;
			text-align: center;
			line-height: 20px;
			color: white;
			transition: width 0.3s ease;
		`;
		progressContainer.appendChild(progressBar);

		// Add progress indicator below loading text
		loadingDiv.innerHTML = "Uploading image...";
		loadingDiv.appendChild(progressContainer);

		// Use XMLHttpRequest for progress monitoring
		const xhr = new XMLHttpRequest();
		xhr.open("POST", "/api/upload/upload", true);
		xhr.setRequestHeader("Authorization", "Bearer " + token);

		// Update progress bar during upload
		xhr.upload.onprogress = function (e) {
			if (e.lengthComputable) {
				const percentComplete = Math.round((e.loaded / e.total) * 100);
				progressBar.style.width = percentComplete + "%";
				progressBar.textContent = percentComplete + "%";
			}
		};

		// Handle upload completion
		const uploadPromise = new Promise((resolve, reject) => {
			xhr.onload = function () {
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						const data = JSON.parse(xhr.responseText);
						resolve(data);
					} catch (e) {
						reject(new Error("Invalid response format"));
					}
				} else {
					reject(new Error("Upload failed with status: " + xhr.status));
				}
			};
			xhr.onerror = function () {
				reject(new Error("Network error during upload"));
			};
		});

		// Send the request
		xhr.send(uploadFormData);

		try {
			// Wait for upload to complete
			const uploadResult = await uploadPromise;
			imageUrl = uploadResult.imageUrl;
			loadingDiv.style.display = "none";
		} catch (error) {
			loadingDiv.style.display = "none";
			showMessage("Failed to upload image: " + error.message, "error");
			return;
		}
	} else {
		loadingDiv.style.display = "none";
	}

	const productData = {
		name: formData.get("name"),
		description: formData.get("description"),
		price: parseFloat(formData.get("price")),
		category: formData.get("category"),
		stock: parseInt(formData.get("stock")),
	};

	// Add barcode if provided
	const barcode = formData.get("barcode");
	if (barcode && barcode.trim()) {
		productData.barcode = barcode.trim();
	}

	if (imageUrl) productData.imageUrl = imageUrl;

	const result = await createProduct(productData);
	if (result) {
		showMessage("Product created successfully!", "success");
		e.target.reset();
		const status = document.getElementById("imageStatus");
		status.textContent = "No image selected";
		status.classList.remove("selected");

		// Hide image preview
		const previewContainer = document.getElementById("imagePreviewContainer");
		const preview = document.getElementById("imagePreview");
		previewContainer.style.display = "none";
		preview.src = "";

		renderProducts();
	} else {
		showMessage("Failed to create product.", "error");
	}
});

window.updateProductHandler = async function (id) {
	const name = document.getElementById(`name-${id}`).value;
	const description = document.getElementById(`description-${id}`).value;
	const price = parseFloat(document.getElementById(`price-${id}`).value);
	const category = document.getElementById(`category-${id}`).value;
	const stock = parseInt(document.getElementById(`stock-${id}`).value);
	const barcode = document.getElementById(`barcode-${id}`).value;

	const updateData = { name, description, price, category, stock };

	// Add barcode if provided
	if (barcode && barcode.trim()) {
		updateData.barcode = barcode.trim();
	}

	const result = await updateProduct(id, updateData);
	if (result) {
		showMessage("Product updated successfully!", "success");
	} else {
		showMessage("Failed to update product.", "error");
	}
	renderProducts();
};

// Load categories into the add product form
async function loadCategoriesIntoForm() {
	const categories = await fetchCategories();
	const categorySelect = document.getElementById("categorySelect");
	categorySelect.innerHTML =
		'<option value="">Select Category</option>' +
		categories
			.map((c) => `<option value="${c.name}">${c.name}</option>`)
			.join("");
}

window.deleteProductHandler = async function (id) {
	if (confirm("Are you sure you want to delete this product?")) {
		const success = await deleteProduct(id);
		if (success) {
			showMessage("Product deleted successfully!", "success");
		} else {
			showMessage("Failed to delete product.", "error");
		}
		renderProducts();
	}
};

// Add table to page
const container = document.querySelector(".container");
const table = document.createElement("table");
table.id = "productsTable";
table.style.width = "100%";
table.style.marginTop = "24px";
container.appendChild(table);

// Initialize page
loadCategoriesIntoForm();
renderProducts();

// Barcode scanning functionality
document
	.getElementById("scanBarcodeBtn")
	.addEventListener("click", function () {
		// Check if the separate barcode module exists
		if (typeof showBarcodeScanner === "function") {
			showBarcodeScanner();
		} else {
			// Fallback to simple manual input
			const barcode = prompt("Enter barcode manually:");
			if (barcode && barcode.trim()) {
				document.getElementById("barcodeInput").value = barcode.trim();
				showMessage("Barcode added: " + barcode.trim(), "success");
			}
		}
	});

// Add image file input change handler
document.getElementById("imageInput").addEventListener("change", function (e) {
	const file = e.target.files[0];
	const status = document.getElementById("imageStatus");
	const previewContainer = document.getElementById("imagePreviewContainer");
	const preview = document.getElementById("imagePreview");

	if (file) {
		status.textContent = `Selected: ${file.name}`;
		status.style.color = "#155724";
		status.classList.add("selected");

		// Show image preview
		const reader = new FileReader();
		reader.onload = function (e) {
			preview.src = e.target.result;
			previewContainer.style.display = "block";
		};
		reader.readAsDataURL(file);
	} else {
		status.textContent = "No image selected";
		status.style.color = "#666";
		status.classList.remove("selected");
		previewContainer.style.display = "none";
		preview.src = "";
	}
});
