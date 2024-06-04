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
    orderBy
} from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
import { app } from '../../config/db.js';

const firestore = getFirestore(app);
let data = []; // Array to store data

const fileInputButton = document.getElementById('handleImportData');
const fileInput = document.getElementById('fileInput');
document.getElementById('tableHead').style.display = 'none';

document.getElementById('handleRetrieveData').addEventListener('click', () => {
    getTableData();
    document.getElementById('tableHead').style.display = 'contents';
    document.getElementById('handleExportData').style.display = 'block';
    fileInputButton.style.display = 'block';
});

async function getTableData() {
    const uid = sessionStorage.getItem('uid');

    if (!uid) {
        console.error('User not authenticated');
        return;
    }

    const userDocRef = collection(firestore, `users/${uid}/table`);
    try {
        const querySnapshot = await getDocs(query(userDocRef, orderBy('timestamp', 'asc')));
        data = []; // Clear existing data array
        querySnapshot.forEach((doc) => {
            const rowData = doc.data();
            data.push(rowData); // Push data to array
        });

        $(document).ready(function () {
            $('#myTable').DataTable({
                data: data,
                columns: [
                    { data: "firstName" }, // Set column titles
                    { data: "email" },
                    { data: "phoneNumber" },
                    // Add more column definitions
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fileInputButton.addEventListener('click', async () => {
    fileInput.click();  // Triggers click event on the hidden file input

    const selectedFile = fileInput.files[0];  // Get the selected file

    if (!selectedFile) {
        console.error('No file selected');
        return;
    }

    // Use SheetJS to parse the Excel data (assuming parseExcelFile is defined)
    try {
        const data = await parseExcelFile(selectedFile);
        // Update DataTable data source
        $('#myTable').DataTable().clear().rows.add(data).draw();
    } catch (error) {
        console.error('Error parsing Excel file:', error);
    }
});

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
