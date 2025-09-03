// Redirect if not logged in
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");
if (!user || !token) {
	window.location.href = "signin.html";
}

// Check if user is regular user, redirect if admin
if (user.role === "admin") {
	window.location.href = "user.html";
}
document.getElementById(
	"userInfo"
).textContent = `Logged in as: ${user.name} (${user.email})`;

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
		`<tr><th>Name</th><th>Description</th><th>Price</th><th>Category</th><th>Stock</th><th>Image</th><th>Actions</th></tr>` +
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
document
	.getElementById("addProductForm")
	.addEventListener("submit", async function (e) {
		e.preventDefault();
		const formData = new FormData(e.target);

		let imageUrl = null;
		const imageFile = formData.get("image");

		// Upload image if selected
		if (imageFile && imageFile.size > 0) {
			const uploadFormData = new FormData();
			uploadFormData.append("image", imageFile);

			const uploadRes = await fetch("/api/upload/upload", {
				method: "POST",
				headers: { Authorization: "Bearer " + token },
				body: uploadFormData,
			});

			if (uploadRes.ok) {
				const uploadResult = await uploadRes.json();
				imageUrl = uploadResult.imageUrl;
			} else {
				showMessage("Failed to upload image.", "error");
				return;
			}
		}

		const productData = {
			name: formData.get("name"),
			description: formData.get("description"),
			price: parseFloat(formData.get("price")),
			category: formData.get("category"),
			stock: parseInt(formData.get("stock")),
		};

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

	const updateData = { name, description, price, category, stock };

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
