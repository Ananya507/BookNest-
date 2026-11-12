
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

loginTab.addEventListener("click", function () {
    loginForm.hidden = false;
    registerForm.hidden = true;

    loginTab.classList.add("active");
    registerTab.classList.remove("active");
});

registerTab.addEventListener("click", function () {
    registerForm.hidden = false;
    loginForm.hidden = true;

    registerTab.classList.add("active");
    loginTab.classList.remove("active");
});

const API_URL = "https://booknest-backend-h49h.onrender.com";

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registration successful! You can now log in.");
            registerForm.reset();
            loginTab.click();
        } else {
            alert(data.detail || data.message || "Registration failed.");
        }

    } catch (error) {
        alert("Could not connect to the server. Is FastAPI running?");
    }
});

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: loginEmail.value,
                password: loginPassword.value
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("user_id", data.user_id);

            alert("Login successful! Welcome to BookNest.");

            window.location.href = "index.html";
        } else {
            alert(data.detail || "Invalid email or password.");
        }

    } catch (error) {
        alert("Could not connect to the server. Is FastAPI running?");
    }
});
