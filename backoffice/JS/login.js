const form = document.querySelector("#login-form");
const email = document.querySelector("#email-form");
const password = document.querySelector("#password-form")
const button = document.querySelector("#login-btn");
const message = document.querySelector("#message-password")


form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (password.value.length < 8) {
        message.textContent = "Your password is under 8 caracters.";
        message.classList.add("erreur");
        message.classList.remove("success");
    } else {
        try {
            const token = await loginAdmin(email.value, password.value);
            document.cookie = `jwttoken=${token}`
         
            console.log(document.cookie)
            document.location.assign("dashboard.html");
        } catch (error) {
           message.textContent = `Login failed : ${error.message}`
           message.classList.add("erreur");
        }
    }

});

async function loginAdmin(email, password) {
try {
    const response = await fetch("http://localhost:8081/users/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password })
    });

    if (!response.ok) {
        let data = await response.json()
        throw new Error(`${data.reason}`)
    }

    const data = await response.json();
    return data.token
} catch (e) {
    throw e
}
}
