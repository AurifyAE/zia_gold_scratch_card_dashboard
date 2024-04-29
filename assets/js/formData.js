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
    let count = 0;

    if (!uid) {
        console.error('User not authenticated');
        return;
    }

    const userDocRef = collection(firestore, `users/${uid}/table`);

    try {
        const querySnapshot = await getDocs(query(userDocRef, orderBy('date', 'asc')));
        const tableBody = document.getElementById("dataTBody");
        const tableHeader = document.getElementById("dataTHead");
        tableBody.innerHTML = ""; // Clear existing rows
        tableHeader.innerHTML = ""; // Clear existing header

        // Define the custom order of field names
        const fixedFields = ['firstName', 'email', 'phoneNumber', 'place'];
        const remainingFields = [];

        let headerRow = document.createElement("tr");
        headerRow.innerHTML = `<th>#</th>`; // Add a column for counting

        // Add the fixed fields to the header row
        fixedFields.forEach(fieldName => {
            headerRow.innerHTML += `<th>${fieldName}</th>`; // Add field name as header
        });

        // Extract remaining field names and add them to the header row
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            Object.keys(data).forEach(fieldName => {
                if (!fixedFields.includes(fieldName) && !remainingFields.includes(fieldName)) {
                    remainingFields.push(fieldName);
                    headerRow.innerHTML += `<th>${fieldName}</th>`; // Add field name as header
                }
            });
            // Stop iterating after processing the first document
            return;
        });

        tableHeader.appendChild(headerRow);

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.date;
            const time = data.time;

            const newRow = document.createElement("tr");
            count++;
            newRow.innerHTML = `
                <td>${count}</td>
                ${fixedFields.map(fieldName => `<td>${data[fieldName]}</td>`).join('')}
                ${remainingFields.map(fieldName => `<td>${data[fieldName]}</td>`).join('')}
            `;
            tableBody.appendChild(newRow);
        });
    } catch (error) {
        console.error('Error displaying data in table:', error);
    }
}




