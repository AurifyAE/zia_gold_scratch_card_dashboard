import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDocs,
    setDoc,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
import { app } from '../../config/db.js';

document.addEventListener('DOMContentLoaded', function () {
    displayDataInTable()
});

// signOut
// document.addEventListener("DOMContentLoaded", function () {
    const signOutBtn = document.getElementById('signOut');

    // Add a click event listener to the sign-out button
    signOutBtn.addEventListener('click', function () {
        console.log('cc');
        // Sign out the user
        signOut(auth)
            .then(() => {
                // Clear the UID from sessionStorage
                sessionStorage.removeItem('uid');

                // Redirect to the login page after sign out
                window.location.href = '../index.html';
            })
            .catch((error) => {
                console.error('Error signing out:', error.message);
            });
    });

    // Check if the user is authenticated when the page loads
    const uid = sessionStorage.getItem('uid');

    if (!uid) {
        // If not authenticated and not already on the login page, redirect to the login page
        if (window.location.pathname !== '/index.html') {
            window.location.href = '../index.html';
        }
    }
// });

const firestore = getFirestore(app);
const auth = getAuth(app);

async function displayDataInTable() {
    const uid = sessionStorage.getItem('uid');

    if (!uid) {
        console.error('User not authenticated');
        return;
    }

    const userDocRef = collection(firestore, `users/${uid}/profile`);

    try {
        const querySnapshot = await getDocs(query(userDocRef, orderBy('timestamp', 'asc')));

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // console.log(data);

            document.getElementById('profileImage').src = data.photoUrl
            document.getElementById('profileName').textContent = data.name
        });
    } catch (error) {
        console.error('Error displaying data in table:', error);
    }
}


