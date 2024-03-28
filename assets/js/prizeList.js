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
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-storage.js';
import { app } from '../../config/db.js';

document.addEventListener('DOMContentLoaded', function () {
    displayDataInTable()
});

const firestore = getFirestore(app);
const storage = getStorage(app);
const timestamp = serverTimestamp()

// Attach event listener to the button
document.addEventListener("DOMContentLoaded", function () {
    const saveBtn = document.getElementById('updateBtn');
    const editBtn = document.getElementById('editBtn');

    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            saveTable();
        });
    }

    if (editBtn) {
        editBtn.addEventListener('click', function () {
            editTable();
        });
    }
});


async function saveTable() {
    // Get form values
    var prizeName = document.getElementById("prizeName").value;
    var campaignName = document.getElementById("campaignName").value;
    var count = document.getElementById("count").value;
    var photo = document.getElementById("photo").files[0]; // Get the file object

    // Get the UID of the authenticated user
    const uid = sessionStorage.getItem('uid');

    if (!uid) {
        console.error('User not authenticated');
        return Promise.reject('User not authenticated');
    }

    // Generate Prize ID (combination of recurring number and first 4 letters of prize name)
    var recurringNumber = document.querySelectorAll('#prizeTableBody tr').length + 1;
    var prizeID = recurringNumber.toString().padStart(3, '0') + prizeName.substring(0, 4).toUpperCase();

    // Create an object with the data to be saved
    const dataToSave = {
        prizeName: prizeName,
        campaignName: campaignName,
        count: count,
        prizeID: prizeID,
        timestamp: timestamp
    };

    // Reference to the user's storage and Firestore documents
    const storageRef = ref(storage, `users/${uid}/photos/${photo.name}`);
    const userDocRef = collection(firestore, `users/${uid}/prizeList`);

    try {
        // Upload the image to Firebase Storage
        const snapshot = await uploadBytes(storageRef, photo);
        console.log('Uploaded a blob or file!', snapshot);

        // Get the download URL of the uploaded image
        const imageUrl = await getDownloadURL(snapshot.ref);

        // Add the image URL along with other data to Firestore
        await addDoc(userDocRef, { ...dataToSave, photoUrl: imageUrl });
        console.log('Data successfully added to Firestore');

        displayDataInTable()

        // Reset form fields
        document.getElementById("updateForm").reset();
    } catch (error) {
        console.error('Error:', error);
    }
}


async function displayDataInTable() {
    const uid = sessionStorage.getItem('uid');

    if (!uid) {
        console.error('User not authenticated');
        return;
    }

    const userDocRef = collection(firestore, `users/${uid}/prizeList`);
    
    try {
        const querySnapshot = await getDocs(query(userDocRef, orderBy('timestamp', 'asc')));
        const tableBody = document.getElementById("prizeTableBody");
        tableBody.innerHTML = ""; // Clear existing rows
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>${data.prizeID}</td>
                <td class="py-1"><img src="${data.photoUrl}" alt="image" style="max-width: 50px; max-height: 50px;"></td>
                <td>${data.prizeName}</td>
                <td>${data.campaignName}</td>
                <td>${data.count}</td>
                <td>
                    <button id="editBtn"><i class="fa-solid fa-pen" id="editBtn"></i></button>
                    <button id="deleteBtn"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(newRow);
        });
    } catch (error) {
        console.error('Error displaying data in table:', error);
    }
}

function editTable(){
    console.log('555');
}