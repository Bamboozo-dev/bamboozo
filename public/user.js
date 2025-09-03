// Check for user info in localStorage
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user || !token) {
	window.location.href = "signin.html";
} else {
	document.getElementById(
		"welcomeTitle"
	).textContent = `Welcome, ${user.name}!`;
	document.getElementById("userInfo").textContent = `Email: ${user.email}`;
}

document.getElementById("logoutBtn").onclick = function () {
	localStorage.removeItem("user");
	localStorage.removeItem("token");
	window.location.href = "signin.html";
};
