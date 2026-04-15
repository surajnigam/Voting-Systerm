import { apiRequest, clearToken, initApp, setToken, showResult } from "./common.js";

initApp();

document.getElementById("gotoSignupBtn").addEventListener("click", () => {
    window.location.href = "./signup.html";
});

document.getElementById("loginBtn").addEventListener("click", async () => {
    try {
        const aadharRaw = document.getElementById("adhar").value.trim();
        if (!/^\d{12}$/.test(aadharRaw)) {
            throw new Error("Aadhar number must be 12 digits.");
        }
        const body = {
            adhar_number: Number(aadharRaw),
            password: document.getElementById("password").value,
        };
        const data = await apiRequest("POST", "/users/login", body, false);
        if (data?.token) setToken(data.token);
        showResult("result", "Login Success", { message: "Authenticated successfully." });
        setTimeout(() => {
            window.location.href = "./index.html";
        }, 500);
    } catch (error) {
        showResult("result", "Login Error", error.message);
    }
});

// document.getElementById("clearTokenBtn").addEventListener("click", () => {
//     clearToken();
//     showResult("result", "Token", "Token cleared");
// });
