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
// import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
import { app } from '../../config/db.js';

document.addEventListener('DOMContentLoaded', function () {
    displayDataInTable()
});

const firestore = getFirestore(app);
const timestamp = serverTimestamp()
// const auth = getAuth(app);

// Attach event listener to the button with ID saveChangesBtn
document.addEventListener("DOMContentLoaded", function () {
    const saveChangesBtn = document.getElementById('saveChangesBtn');

    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', function () {
            saveChanges();
        });
    }
});


async function saveChanges() {

    // Get the edited values
    const firstName = document.getElementById('inputFirstName').value;
    const phoneNumber = document.getElementById('inputPhoneNumber').value;
    const email = document.getElementById('inputEmail').value;
    const place = document.getElementById('inputPlace').value;

    // Get the UID of the authenticated user
    const uid = sessionStorage.getItem('uid');

    if (!uid) {
        console.error('User not authenticated');
        return Promise.reject('User not authenticated');
    }

    // Create an object with the data to be saved
    const dataToSave = {
        firstName: firstName,
        phoneNumber: phoneNumber,
        email: email,
        place: place,
        timestamp: timestamp
    };


    // Reference to the user's profile document
    const userDocRef = collection(firestore, `users/${uid}/table`);

    try {
        await addDoc(userDocRef, dataToSave);
        console.log('Data successfully added to Firestore');
        displayDataInTable()

        document.getElementById('inputFirstName').value = '';
        document.getElementById('inputPhoneNumber').value = '';
        document.getElementById('inputEmail').value = '';
        document.getElementById('inputPlace').value = '';
    } catch (error) {
        console.error('Error adding data to Firestore: ', error);
    }
}


async function displayDataInTable() {
    const uid = sessionStorage.getItem('uid');
    let count = 0

    if (!uid) {
        console.error('User not authenticated');
        return;
    }

    const userDocRef = collection(firestore, `users/${uid}/table`);

    try {
        const querySnapshot = await getDocs(query(userDocRef, orderBy('timestamp', 'asc')));
        const tableBody = document.getElementById("dataTBody");
        tableBody.innerHTML = ""; // Clear existing rows

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Assuming timestampObj is your Firebase Timestamp object
            var timestampObj = data.timestamp;

            // Convert timestamp to milliseconds
            var milliseconds = (timestampObj.seconds * 1000) + (timestampObj.nanoseconds / 1000000);

            // Create a new Date object
            var dateObj = new Date(milliseconds);

            // Extract date and time components
            var date = dateObj.toLocaleDateString();
            var time = dateObj.toLocaleTimeString();

            const newRow = document.createElement("tr");
            count = count + 1
            newRow.innerHTML = `
                <td>${count}</td>
                <td>${data.firstName}</td>
                <td>${data.phoneNumber}</td>
                <td>${data.email}</td>
                <td>${data.place}</td>
                <td>${date}</td>
                <td>${time}</td>
            `;
            tableBody.appendChild(newRow);
        });
    } catch (error) {
        console.error('Error displaying data in table:', error);
    }
}