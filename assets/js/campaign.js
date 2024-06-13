// import {
//     getFirestore,
//     collection,
//     addDoc,
//     doc,
//     getDocs,
//     setDoc,
//     updateDoc,
//     writeBatch,
//     serverTimestamp,
//     query,
//     orderBy
// } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
// // import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
// import { app } from '../../config/db.js';
import { BACKEND_URL, USER_ID } from '../../globals/global.js'


// const firestore = getFirestore(app);
var data = []; // Array to store data
const phoneNumbers = [];

const fileInputButton = document.getElementById('handleImportData');
const fileInput = document.getElementById('fileInput');
document.getElementById('tableHead').style.display = 'none';

// handleSendMessage
// handleStartCampaign
// handleAddFile
// handleModalClose
// messageBox
// handleConnectServer
// handleDisconnectServer


// Handler for Send Message Button, Open Modal
// Handler for Send Message Button, Open Modal
document.getElementById('handleSendMessage').addEventListener('click', () => {
    const tableBody = document.getElementById('tableBody');
    let count = 1;

    for (const row of data) {
        // Extract phone number from column position 2 (0-indexed)
        const phoneNumber = row[2];
        phoneNumbers.push(phoneNumber); // Add phone number to array

        // Create new row for the table
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${count}</td>
            <td>${row[0]}</td>
            <td>${phoneNumber}</td>
        `;

        count++;
        // Append the new row to the table body
        tableBody.appendChild(newRow);
    }

    // Now, phoneNumbers array contains all phone numbers from column position 2
    // console.log(phoneNumbers);

    // Show the modal
    $('#myModal').modal('show');
});


// Handle Modal Close
document.getElementById('handleModalClose').addEventListener('click', () => {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Clearing the table content
    $('#myModal').modal('hide');
});

// Handle Submit Button to Send Whatsapp Message
document.getElementById('handleSubmitButton').addEventListener('click', () => {
    sendMessage()
})

// Handle Connect Server Button
document.getElementById('handleConnectServer').addEventListener('click', () => {
    requestQR()
})

// Handle Discoonnect Server
document.getElementById('handleDisconnectServer').addEventListener('click', () => {
    disconnectClient()
})

// Handle File Input Button Click
fileInputButton.addEventListener('click', async () => {
    fileInput.click();  // Triggers click event on the hidden file input
});

// File Import Button Event Handler
fileInput.addEventListener('change', async (event) => {
    document.getElementById('handleSendMessage').style.display = 'block';
    document.getElementById('tableHead').style.display = 'contents';
    const selectedFile = event.target.files[0];  // Get the selected file

    if (!selectedFile) {
        console.error('No file selected');
        return;
    }

    try {
        const parsedData = await parseExcelFile(selectedFile);
        if (parsedData.length > 0) {
            const headers = parsedData.shift(); // Remove and store the headers from the first row
            const columnIndex = {
                firstName: -1,
                email: -1,
                phoneNumber: -1
            };

            // Loop through headers to find column indices
            headers.forEach((header, index) => {
                if (header.toLowerCase().includes('firstname')) {
                    columnIndex.firstName = index;
                } else if (header.toLowerCase().includes('email')) {
                    columnIndex.email = index;
                } else if (header.toLowerCase().includes('phone') || header.toLowerCase().includes('number')) {
                    columnIndex.phoneNumber = index;
                }
            });

            // Check if all required columns are found
            if (columnIndex.firstName === -1 || columnIndex.email === -1 || columnIndex.phoneNumber === -1) {
                console.error('Required columns not found in the file');
                return;
            }
            data = parsedData;

            // Initialize DataTable with parsed data and dynamic column indices
            initializeDataTable(data, columnIndex);

        } else {
            console.error('Empty file');
        }
    } catch (error) {
        console.error('Error parsing Excel file:', error);
    }
});


// Initialize the Data to Data Table
function initializeDataTable(data, columnIndex) {
    // Clear existing DataTable, if any
    $('#myTable').DataTable().destroy();

    // Initialize new DataTable with updated data and dynamic column indices
    $('#myTable').DataTable({
        data: data,
        columns: [
            // First Name column
            {
                title: "First Name", data: function (row) {
                    return row[columnIndex.firstName]; // Accessing data using dynamic index
                }
            },
            // Email column
            {
                title: "Email", data: function (row) {
                    return row[columnIndex.email]; // Accessing data using dynamic index
                }
            },
            // Phone Number column
            {
                title: "Phone Number", data: function (row) {
                    return row[columnIndex.phoneNumber]; // Accessing data using dynamic index
                }
            },
            // Add more column definitions as needed
        ]
    });
}

// Function Parse Excel File
async function parseExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            resolve(parsedData);
        };

        reader.onerror = function (error) {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
}

// Request QR Function to get Connected to Server and sends QR as Response
function requestQR() {
    const userid = USER_ID;
    fetch(`${BACKEND_URL}/userid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid })
    })
        .then(response => response.json())
        .then(data => {
            if (data.qr) {
                console.log(data.qr);
                const img = document.getElementById('qr-img');
                img.src = data.qr;
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error:', error));
}

// Disconnect from Server
function disconnectClient() {
    const userid = USER_ID;
    fetch(`${BACKEND_URL}/disconnect`, {
        mode: 'no-cors',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid })
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => console.error('Error:', error));
}

// Send Message 
function sendMessage() {
    console.log(phoneNumbers);
    const userid = USER_ID;
    const message = document.getElementById('message').value;
    const file = document.getElementById('file-input').files[0]; // Get the selected file

    const formData = new FormData();

    // Append fields in the desired order
    if (message) formData.append('message', message);
    if (file) formData.append('file', file);

    formData.append('userid', userid);
    formData.append('phoneNumbers', phoneNumbers);

    // Send formData
    fetch(`${BACKEND_URL}/send-file`, {
        mode: 'no-cors',
        method: 'POST',
        body: formData
    }).then(response => response.json()).then(data => {
        document.getElementById('status').innerText = data.status.join('\n');
    }).catch(error => {
        console.error('Error:', error);
    });
}