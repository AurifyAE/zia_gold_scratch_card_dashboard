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
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-storage.js';
import { app } from '../../config/db.js';

document.addEventListener('DOMContentLoaded', function () {
    displayDataInTable()
});

const firestore = getFirestore(app);
const storage = getStorage(app);
const timestamp = serverTimestamp();

// Attach event listener to the button
document.addEventListener("DOMContentLoaded", function () {
    const saveBtn = document.getElementById('saveProfile');

    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            saveProfile();
        });
    }
});


async function saveProfile() {
    // Get form values
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var phone = document.getElementById("phone").value;
    var city = document.getElementById("city").value;
    var photo = document.getElementById("image").files[0]; // Get the file object

    // Get the UID of the authenticated user
    const uid = sessionStorage.getItem('uid');

    if (!uid) {
        console.error('User not authenticated');
        return Promise.reject('User not authenticated');
    }

    // Check if a file is selected and it's an image
    if (!photo || !photo.type.startsWith('image/')) {
        console.error('Please select an image file');
        return;
    }

    // Create an object with the data to be saved
    const dataToSave = {
        name: name,
        email: email,
        phone: phone,
        city: city,
        timestamp: timestamp
    };

    // Reference to the user's storage and Firestore documents
    const storageRef = ref(storage, `users/${uid}/profile/${photo.name}`);
    const userDocRef = doc(firestore, `users/${uid}/profile`, 'profileData');

    try {
        // Upload the image to Firebase Storage
        const snapshot = await uploadBytes(storageRef, photo);
        console.log('Uploaded a blob or file!', snapshot);

        // Get the download URL of the uploaded image
        const imageUrl = await getDownloadURL(snapshot.ref);

        // Add the image URL along with other data to Firestore
        await setDoc(userDocRef, { ...dataToSave, photoUrl: imageUrl });
        console.log('Data successfully added to Firestore');
        displayDataInTable()
        reset()

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

    const userDocRef = collection(firestore, `users/${uid}/profile`);

    try {
        const querySnapshot = await getDocs(query(userDocRef, orderBy('timestamp', 'asc')));

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(data);

            document.getElementById('displayImage').src = data.photoUrl
            document.getElementById('displayName').textContent = data.name
            document.getElementById('displayEmail').textContent = data.email
            document.getElementById('displayPhone').textContent = data.phone
            document.getElementById('displayCity').textContent = data.city
        });
    } catch (error) {
        console.error('Error displaying data in table:', error);
    }
}


function reset() {
    document.getElementById("name").value = '';
    document.getElementById("email").value = '';
    document.getElementById("password").value = '';
    document.getElementById("city").value = '';
    document.getElementById("image").value = '';
}