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
import { app } from '../../config/db.js';

document.addEventListener('DOMContentLoaded', function () {
    displayDataInTable()
});

const firestore = getFirestore(app);

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


// signOut