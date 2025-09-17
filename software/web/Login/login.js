document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
        // Si el endpoint devuelve un objeto con la propiedad "users"
        // buscamos en el arreglo el usuario que coincida (haciendo la comparación en minúsculas)
        const loggedUserData = data.users 
            ? data.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password)
            : data;
        
        if (!loggedUserData) {
            document.getElementById("mensaje").textContent = "Usuario o contraseña incorrectos";
            return;
        }
        
        // Guardamos únicamente el objeto del usuario autenticado
        localStorage.setItem("loggedUser", JSON.stringify(loggedUserData));
        // Redirigir al usuario a la página de inicio
        window.location.href = "/actividades";
    } else {
        // Mostrar mensaje de error si el login falla
        document.getElementById("mensaje").textContent = data.detail || "Error en el login";
    }
});
