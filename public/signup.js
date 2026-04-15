import { apiRequest, initApp, setToken, showResult } from "./common.js";

initApp();

document.getElementById("gotoLoginBtn").addEventListener("click", () => {
    window.location.href = "./login.html";
});

document.getElementById("signupBtn").addEventListener("click", async () => {
    try {
        const aadharRaw = document.getElementById("adhar").value.trim();
        if (!/^\d{12}$/.test(aadharRaw)) {
            throw new Error("Aadhar number must be 12 digits.");
        }
        const body = {
            name: document.getElementById("name").value.trim(),
            age: Number(document.getElementById("age").value),
            email: document.getElementById("email").value.trim(),
            mobile: document.getElementById("mobile").value.trim(),
            address: document.getElementById("address").value.trim(),
            adhar_number: Number(aadharRaw),
            password: document.getElementById("password").value,
            role: document.getElementById("role").value,
            isVoted: document.getElementById("isVoted").value === "true",
        };

        const data = await apiRequest("POST", "/users/signup", body, false);
        if (data?.token) setToken(data.token);
        showResult("result", "Signup Success", { message: "Account created successfully." });
        setTimeout(() => {
            window.location.href = "./index.html";
        }, 700);
    } catch (error) {
        showResult("result", "Signup Error", error.message);
    }
});
