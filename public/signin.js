document
	.getElementById("signinForm")
	.addEventListener("submit", async function (e) {
		e.preventDefault();
		const form = e.target;
		const data = {
			email: form.email.value,
			password: form.password.value,
		};
		const res = await fetch("/api/users/signin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		const result = await res.json();
		document.getElementById("signinMsg").textContent = res.ok
			? "Sign in successful!"
			: result.error || "Sign in failed.";
		if (res.ok) {
			// Save user and token, redirect based on role
			localStorage.setItem("user", JSON.stringify(result.user));
			localStorage.setItem("token", result.token);

			// Redirect based on user role
			if (result.user.role === "admin") {
				window.location.href = "user.html";
			} else {
				window.location.href = "products.html";
			}
			form.reset();
		}
	});
