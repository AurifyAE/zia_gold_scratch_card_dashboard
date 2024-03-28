import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
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

let oldImage, prize, documentId;

// Attach event listener to the button
document.addEventListener("DOMContentLoaded", function () {
    const saveBtn = document.getElementById('saveBtn');
    const updateBtn = document.getElementById('updateBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            saveTable();
        });
    }

    if (updateBtn) {
        updateBtn.addEventListener('click', function () {
            updateTable();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            resetTable();
        });
    }

    document.getElementById('closeModal').addEventListener('click', function () {
        modal.style.display = "none";
    })

    // // Get the modal
    // var modal = document.getElementById("myModal");

    // // Get the <span> element that closes the modal
    // var span = document.getElementsByClassName("close")[0];

    // // When the user clicks on the button, open the modal
    // btn.onclick = function () {
    //     modal.style.display = "block";
    // }

    // // When the user clicks on <span> (x), close the modal
    // span.onclick = function () {
    //     modal.style.display = "none";
    // }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

document.body.addEventListener('click', function (event) {
    if (event.target.classList.contains('editBtn')) {
        editTable(event.target);
    }

    if (event.target.classList.contains('deleteBtn')) {
        deleteDocument(event.target);
    }
});


async function saveTable() {
    // Get form values
    var prizeName = document.getElementById("prizeName").value;
    var campaignName = document.getElementById("campaignName").value;
    var count = document.getElementById("count").value;
    var photo = document.getElementById("photo").files[0];

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
                    <button><i class="fa-solid fa-pen editBtn" data-document-id="${doc.id}" data='${JSON.stringify(data)}'></i></button>
                    <button><i class="fa-solid fa-trash deleteBtn" data-document-id="${doc.id}"></i></button>
                </td>
            `;
            tableBody.appendChild(newRow);
        });
    } catch (error) {
        console.error('Error displaying data in table:', error);
    }
}

// 
function editTable(iconElement) {
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.style.display = 'none';

    const updateBtn = document.getElementById('updateBtn');
    updateBtn.style.display = 'inline-block';

    const documentID = iconElement.getAttribute('data-document-id');
    const dataString = iconElement.getAttribute('data');
    const data = JSON.parse(dataString);
    // console.log(data);

    document.getElementById("prizeName").value = data.prizeName;
    document.getElementById("campaignName").value = data.campaignName;
    document.getElementById("count").value = data.count;

    oldImage = data.photoUrl
    prize = data.prizeID
    documentId = documentID
}

async function updateTable() {
    var prizeName = document.getElementById("prizeName").value;
    var campaignName = document.getElementById("campaignName").value;
    var count = document.getElementById("count").value;
    var photo = document.getElementById("photo").files[0];

    // Get the UID of the authenticated user
    const uid = sessionStorage.getItem('uid');

    const dataToSave = {
        prizeName: prizeName,
        campaignName: campaignName,
        count: count,
        prizeID: prize,
        timestamp: timestamp
    };

    if (photo) {
        const storageRef = ref(storage, `users/${uid}/photos/${photo.name}`);
        const userDocRef = doc(firestore, `users/${uid}/prizeList`, documentId);

        try {
            // Upload the image to Firebase Storage
            const snapshot = await uploadBytes(storageRef, photo);
            console.log('Uploaded a blob or file!', snapshot);

            // Get the download URL of the uploaded image
            const imageUrl = await getDownloadURL(snapshot.ref);

            // Add the image URL along with other data to Firestore
            await updateDoc(userDocRef, { ...dataToSave, photoUrl: imageUrl });
            console.log('Data successfully added to Firestore');

            displayDataInTable()
            resetTable()

            // Reset form fields
            document.getElementById("updateForm").reset();
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        const userDocRef = doc(firestore, `users/${uid}/prizeList`, documentId);
        console.log(oldImage);
        try {
            // Add the image URL along with other data to Firestore
            await updateDoc(userDocRef, { ...dataToSave, photoUrl: oldImage });
            console.log('Data successfully added to Firestore');

            displayDataInTable()
            resetTable()

            // Reset form fields
            document.getElementById("updateForm").reset();
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

function resetTable() {
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.style.display = 'inline-block';

    const updateBtn = document.getElementById('updateBtn');
    updateBtn.style.display = 'none';

    document.getElementById("prizeName").value = '';
    document.getElementById("campaignName").value = '';
    document.getElementById("count").value = '';
    // document.getElementById("photo").files[0] = '';
}

function deleteDocument(iconElement) {
    const documentID = iconElement.getAttribute('data-document-id');

    // Get the modal
    var modal = document.getElementById("myModal");
    modal.style.display = "block";

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    document.getElementById("confirmDelete").addEventListener('click', () => confirmDelete(documentID));
}

async function confirmDelete(documentID) {
    // Get the UID of the authenticated user
    const uid = sessionStorage.getItem('uid');

    try {
        // Create a reference to the document
        const userDocRef = doc(firestore, `users/${uid}/prizeList`, documentID);

        // Delete the document
        await deleteDoc(userDocRef);
        console.log('Document successfully deleted');
        displayDataInTable()
    } catch (error) {
        console.error('Error deleting document:', error);
    }

    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}

