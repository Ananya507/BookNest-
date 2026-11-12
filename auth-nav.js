


const authNavLink = document.getElementById("auth-nav-link");

async function updateAuthNavigation() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        authNavLink.textContent = "Login / Register";
        authNavLink.href = "auth.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/me`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Session expired");
        }

        authNavLink.textContent = "Logout";
        authNavLink.href = "#";

        authNavLink.addEventListener("click", function(event) {
            event.preventDefault();

            localStorage.removeItem("access_token");
            localStorage.removeItem("user_id");

            window.location.href = "auth.html";
        });

    } catch (error) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_id");

        authNavLink.textContent = "Login / Register";
        authNavLink.href = "auth.html";
    }
}

updateAuthNavigation();
