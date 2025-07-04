import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    writeBatch,
    serverTimestamp,
    query,
    orderBy,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
import { app } from '../../config/db.js';

document.addEventListener('DOMContentLoaded', function () {
    displayDataInTable()
});


const selectedIds = [];

const firestore = getFirestore(app);
const timestamp = serverTimestamp()
// const auth = getAuth(app);


const saveBtn = document.getElementById('saveChanges');

// Attach event listener to the button with ID saveChangesBtn
document.addEventListener("DOMContentLoaded", function () {
    const saveChangesBtn = document.getElementById('saveChangesBtn');

    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', function () {
            saveChanges();
        });
    }
});

// Event listener for save button click
saveBtn.addEventListener('click', () => {
    updateTable(selectedIds); // Update the table with selected IDs
});

async function saveChanges() {

    // Get the edited values
    const firstName = document.getElementById('inputFirstName').value;
    const phoneNumber = document.getElementById('inputPhoneNumber').value;
    const email = document.getElementById('inputEmail').value;
    const place = document.getElementById('inputPlace').value;

    // Get the UID of the authenticated user
    const uid = sessionStorage.getItem('uid');

    console.log('UID:', uid); // Log the UID for debugging

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

    if (!uid) {
        console.error('User not authenticated');
        return;
    }

    const userDocRef = collection(firestore, `users/${uid}/table`);

    console.log('Querying path:', `users/${uid}/table`);

    try {
        const querySnapshot = await getDocs(query(userDocRef, orderBy('timestamp', 'asc')));
        const tableBody = document.getElementById("dataTBody");
        const tableHeader = document.getElementById("dataTHead");
        tableBody.innerHTML = ""; // Clear existing rows
        tableHeader.innerHTML = ""; // Clear existing header

        // Define the custom order of field names
        const fixedFields = ['firstName', 'email', 'phoneNumber', 'winID', 'prizeName', 'status'];
        const remainingFields = [];
        let count = 0;

        let headerRow = document.createElement("tr");
        headerRow.innerHTML = `<th>#</th><th>SL No</th>`;
        fixedFields.forEach(fieldName => {
            headerRow.innerHTML += `<th>${fieldName}</th>`;
        });

        // Extract remaining field names and add them to the header row
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            Object.keys(data).forEach(fieldName => {
                if (!fixedFields.includes(fieldName) && !remainingFields.includes(fieldName) && fieldName !== 'timestamp' && fieldName !== 'date' && fieldName !== 'time') {
                    remainingFields.push(fieldName);
                    headerRow.innerHTML += `<th>${fieldName}</th>`;
                }
            });
            return;
        });

        headerRow.innerHTML += `<th>Date</th><th>Time</th>`;
        tableHeader.appendChild(headerRow);

        // Iterate through each document in the query snapshot
        querySnapshot.forEach((doc, index) => {
            const data = doc.data();
            const date = data.date || "";
            const time = data.time || "";

            const newRow = document.createElement("tr");

            // Checkbox
            const checkboxCell = document.createElement("td");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "selectRow";
            checkbox.id = doc.id;
            checkboxCell.appendChild(checkbox);
            newRow.appendChild(checkboxCell);

            // Serial number
            count++;
            const serialNumberCell = document.createElement("td");
            serialNumberCell.textContent = count;
            newRow.appendChild(serialNumberCell);

            // Fixed fields except 'action'
            fixedFields.forEach(fieldName => {
                if (fieldName !== 'action') {
                    const cell = document.createElement("td");
                    cell.textContent = data[fieldName] || "";
                    newRow.appendChild(cell);
                }
            });

            // Remaining fields
            remainingFields.forEach(fieldName => {
                const cell = document.createElement("td");
                cell.textContent = data[fieldName] || "";
                newRow.appendChild(cell);
            });

            // Date and Time
            const dateCell = document.createElement("td");
            dateCell.textContent = date;
            newRow.appendChild(dateCell);

            const timeCell = document.createElement("td");
            timeCell.textContent = time;
            newRow.appendChild(timeCell);

            // Action cell (Delete button)
            const actionCell = document.createElement("td");
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "delete-btn";
            deleteBtn.addEventListener("click", async () => {
                if (confirm("Are you sure you want to delete this entry?")) {
                    try {
                        await deleteDoc(doc.ref);
                        newRow.remove();
                        console.log("Document deleted:", doc.id);
                    } catch (err) {
                        console.error("Error deleting document:", err);
                    }
                }
            });
            actionCell.appendChild(deleteBtn);
            newRow.appendChild(actionCell);

            tableBody.appendChild(newRow);

            // Checkbox event listener (add only once per row)
            checkbox.addEventListener('change', () => {
                const isChecked = checkbox.checked;
                const id = checkbox.id;

                if (isChecked) {
                    saveBtn.style.display = 'block';
                    if (!selectedIds.includes(id)) {
                        selectedIds.push(id);
                        console.log('Row selected:', id);
                    }
                } else {
                    const index = selectedIds.indexOf(id);
                    if (index !== -1) {
                        selectedIds.splice(index, 1);
                        console.log('Row deselected:', id);
                    }
                }
                if (selectedIds.length === 0) {
                    saveBtn.style.display = 'none';
                }
            });

            // Log the final row HTML for debugging
            console.log('Appended row:', newRow.outerHTML);
        });

        // Log if no data found
        if (querySnapshot.size === 0) {
            console.log('No data found for this user.');
        }
    } catch (error) {
        console.error('Error displaying data in table:', error);
    }
}

async function updateTable(ids) {
    const uid = sessionStorage.getItem('uid');

    if (!uid) {
        console.error('User not authenticated');
        return;
    }

    const batch = writeBatch(firestore);
    const tableRef = collection(firestore, `users/${uid}/table`);

    ids.forEach(id => {
        const docRef = doc(tableRef, id);
        batch.update(docRef, { status: 'Claimed' });
    });

    try {
        await batch.commit();
        console.log('Documents updated successfully.');
        saveBtn.style.display = 'none';
        displayDataInTable()
    } catch (error) {
        console.error('Error updating documents:', error);
    }
}



// Search Function
// $(document).ready(function () {
//     $("#searchInput").on("keyup", function () {
//         var value = $(this).val().toLowerCase();
//         $("#formDataTable tr").filter(function () {
//             $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
//         });
//     });
// });


// Search Function
$(document).ready(function () {
    $('#searchInput').on('keyup', function () {
        var value = $(this).val().toLowerCase();
        $('#formDataTable tr:gt(0)').each(function () { // Start from index 1 to skip the header row
            var found = false;
            $(this).find('td').each(function () {
                if ($(this).text().toLowerCase().indexOf(value) > -1) {
                    found = true;
                    return false; // Break the loop if found
                }
            });
            if (found) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});

// 
// $(document).ready(function () {
//     $('#searchInput').on('keyup', function () {
//         filterTable();
//     });

//     $('#statusFilter').on('change', function () {
//         filterTable();
//     });
// });

// function filterTable() {
//     var statusFilter = $('#statusFilter').val();

//     $('#formDataTable tr:gt(0)').each(function () {
//         var row = $(this);
//         var status = row.find('td').text().trim();

//         // Show or hide the row based on whether the status matches the selected value
//         if (statusFilter === 'all' || status === statusFilter) {
//             row.show();
//         } else {
//             row.hide();
//         }
//     });
// }

document.getElementById("statusFilter").addEventListener("change", function () {
    var filter = this.value;
    var rows = document.getElementById("formDataTable").getElementsByTagName("tr");

    for (var i = 0; i < rows.length; i++) {
        var status = rows[i].getElementsByTagName("td")[7]; // Assuming status cell is at index 7
        console.log(status);
        if (status !== undefined) {
            if (filter === "all") {
                rows[i].style.display = "";
            } else if (filter === "Claimed") {
                if (status.textContent.trim() === "Claimed") {
                    rows[i].style.display = "";
                } else {
                    rows[i].style.display = "none";
                }
            } else if (filter === "Not Claimed") {
                if (status.textContent.trim() === "") {
                    rows[i].style.display = "";
                } else {
                    rows[i].style.display = "none";
                }
            }
        }
    }
});
