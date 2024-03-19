import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
import { app } from '../../config/db.js'

const auth = getAuth(app);

const submitButton = document.getElementById("submit")
const emailInput = document.getElementById("emailInput")
const passwordInput = document.getElementById("passwordInput")


submitButton.addEventListener("click", function (e) {
    e.preventDefault()
    const email = emailInput.value;
    const password = passwordInput.value;

    if (validate_email(email) == false || validate_password(password) == false) {
        alert('Email or Password is Invalid!!')
        return
        // Don't continue running the code
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log("Success! Welcome back!");
            console.log(user.uid);
            // Store the UID in sessionStorage
            sessionStorage.setItem('uid', user.uid);

            // window.alert("Success! Welcome back!");
            // ...

            // Redirect to the dashboard page (change 'dashboard.html' to your actual dashboard page)
            window.location.href = '../Dashboard.html';
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("Error occurred. Try again.");
            console.log(errorMessage);
            window.alert("Invalid Login Credentials");
        });
});

// Validate Functions
function validate_email(email) {
    const expression = /^[^@]+@\w+(\.\w+)+\w$/
    if (expression.test(email) == true) {
        // Email is good
        return true
    } else {
        // Email is not good
        return false
    }
}

function validate_password(password) {
    // Firebase only accepts lengths greater than 6
    return password.length >= 6;
}
