document
	.getElementById("signupForm")
	.addEventListener("submit", async function (e) {
		e.preventDefault();
		const form = e.target;
		const data = {
			name: form.name.value,
			email: form.email.value,
			password: form.password.value,
		};
		const res = await fetch("/api/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		const result = await res.json();
		document.getElementById("signupMsg").textContent = res.ok
			? "Sign up successful!"
			: result.error || "Sign up failed.";
		if (res.ok) form.reset();
	});
