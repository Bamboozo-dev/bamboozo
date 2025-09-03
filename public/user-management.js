// Redirect if not logged in
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");
if (!user || !token) {
	window.location.href = "signin.html";
}

// Check if user is admin, redirect if not
if (user.role !== "admin") {
	window.location.href = "products.html";
}

document.getElementById("welcomeTitle").textContent = `Welcome, ${user.name}!`;
document.getElementById("userInfo").textContent = `Email: ${user.email}`;

document.getElementById("logoutBtn").onclick = function () {
	localStorage.removeItem("user");
	localStorage.removeItem("token");
	window.location.href = "signin.html";
};

// Show message function
function showMessage(text, type = "success") {
	// Remove existing message if any
	const existingMsg = document.getElementById("messageDiv");
	if (existingMsg) existingMsg.remove();

	// Create message div
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

	// Insert after user info
	const userInfo = document.getElementById("userInfo");
	userInfo.parentNode.insertBefore(msgDiv, userInfo.nextSibling);

	// Auto-remove after 3 seconds
	setTimeout(() => {
		if (msgDiv.parentNode) msgDiv.remove();
	}, 3000);
}

// User management functions
async function fetchUsers() {
	const res = await fetch("/api/users", {
		headers: { Authorization: "Bearer " + token },
	});
	return res.ok ? await res.json() : [];
}

async function deleteUser(id) {
	const res = await fetch(`/api/users/${id}`, {
		method: "DELETE",
		headers: { Authorization: "Bearer " + token },
	});
	return res.ok;
}

async function updateUser(id, data) {
	const res = await fetch(`/api/users/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + token,
		},
		body: JSON.stringify(data),
	});
	return res.ok ? await res.json() : null;
}

// Render users table
async function renderUsers() {
	const users = await fetchUsers();
	const table = document.getElementById("usersTable");
	table.innerHTML =
		`<tr><th>Name</th><th>Email</th><th>Role</th><th>Password</th><th>Actions</th></tr>` +
		users
			.map(
				(u) => `<tr>
			<td><input value="${u.name}" id="name-${u._id}" /></td>
			<td><input value="${u.email}" id="email-${u._id}" /></td>
			<td>
				<select id="role-${u._id}">
					<option value="user" ${u.role === "user" ? "selected" : ""}>User</option>
					<option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
				</select>
			</td>
			<td><input type="password" placeholder="New password" id="password-${
				u._id
			}" /></td>
			<td>
				<button onclick="updateUserHandler('${u._id}')">Update</button>
				<button onclick="deleteUserHandler('${u._id}')">Delete</button>
			</td>
		</tr>`
			)
			.join("");
}

window.updateUserHandler = async function (id) {
	const name = document.getElementById(`name-${id}`).value;
	const email = document.getElementById(`email-${id}`).value;
	const role = document.getElementById(`role-${id}`).value;
	const password = document.getElementById(`password-${id}`).value;
	const updateData = password
		? { name, email, role, password }
		: { name, email, role };
	const result = await updateUser(id, updateData);
	if (result) {
		showMessage("User updated successfully!", "success");
	} else {
		showMessage("Failed to update user.", "error");
	}
	renderUsers();
};

window.deleteUserHandler = async function (id) {
	const success = await deleteUser(id);
	if (success) {
		showMessage("User deleted successfully!", "success");
	} else {
		showMessage("Failed to delete user.", "error");
	}
	renderUsers();
};

// Add table to page
const container = document.querySelector(".container");
const table = document.createElement("table");
table.id = "usersTable";
table.style.width = "100%";
table.style.marginTop = "24px";
container.appendChild(table);
renderUsers();
