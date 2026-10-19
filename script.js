const STORAGE_KEY = "studentEligibilityRecords";

let studentRecords = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
);
const form = document.getElementById("eligibilityForm");
const result = document.getElementById("result");
const historyBody = document.getElementById("historyBody");

const searchStudent = document.getElementById("searchStudent");
const filterEligibility = document.getElementById("filterEligibility");

const totalCount = document.getElementById("totalCount");
const eligibleCount = document.getElementById("eligibleCount");
const ineligibleCount = document.getElementById("ineligibleCount");

let total = studentRecords.length;

let eligibleTotal = studentRecords.filter(
    student => student.eligible
).length;

let ineligibleTotal = studentRecords.filter(
    student => !student.eligible
).length;

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const cgpaText = document.getElementById("cgpa").value;
    const attendanceText = document.getElementById("attendance").value;

    const cgpa = Number(cgpaText);
    const attendance = Number(attendanceText);
    const arrears = document.getElementById("arrears").value;

    // Validate student details
    if (
        name === "" ||
        cgpaText.trim() === "" ||
        attendanceText.trim() === "" ||
        !Number.isFinite(cgpa) ||
        !Number.isFinite(attendance) ||
        cgpa < 0 || cgpa > 10 ||
        attendance < 0 || attendance > 100 ||
        !["yes", "no"].includes(arrears)
    ) {
        result.className = "error-result";
        result.textContent = "Please enter valid student details.";
        return;
    }

    // Predicate logic conditions
    const P = cgpa >= 8.0;
    const Q = attendance >= 80;
    const R = arrears === "no";

    const eligible = P && Q && R;
    const studentRecord = {
    name: name,
    cgpa: cgpa,
    attendance: attendance,
    eligible: eligible
};

studentRecords.unshift(studentRecord);

localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(studentRecords)
);

    // Update statistics
    total++;

    if (eligible) {
        eligibleTotal++;
    } else {
        ineligibleTotal++;
    }

    totalCount.textContent = total;
    eligibleCount.textContent = eligibleTotal;
    ineligibleCount.textContent = ineligibleTotal;

    // Display verification result
    result.className = eligible ? "success-result" : "failure-result";

    const heading = document.createElement("h3");
    heading.textContent = eligible
        ? "✓ Student is Eligible"
        : "✗ Student is Not Eligible";

    const student = document.createElement("p");
    student.textContent = "Student: " + name;

    const cgpaResult = document.createElement("p");
    cgpaResult.textContent =
        "P(x): CGPA requirement: " + (P ? "Passed" : "Failed");

    const attendanceResult = document.createElement("p");
    attendanceResult.textContent =
        "Q(x): Attendance requirement: " + (Q ? "Passed" : "Failed");

    const arrearsResult = document.createElement("p");
    arrearsResult.textContent =
        "R(x): No pending arrears: " + (R ? "Passed" : "Failed");

    const formula = document.createElement("p");
    formula.textContent =
        "E(x) = P(x) AND Q(x) AND R(x)";

    result.replaceChildren(
        heading,
        student,
        cgpaResult,
        attendanceResult,
        arrearsResult,
        formula
    );

    // Remove the placeholder history message on first entry
    if (total === 1) {
        historyBody.replaceChildren();
    }

    // Add student to verification history
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = name;

    const cgpaCell = document.createElement("td");
    cgpaCell.textContent = cgpa.toFixed(2);

    const attendanceCell = document.createElement("td");
    attendanceCell.textContent = attendance + "%";

    const statusCell = document.createElement("td");
    statusCell.textContent = eligible ? "Eligible" : "Not Eligible";
    statusCell.style.color = eligible ? "#34d399" : "#fb7185";

    row.append(nameCell, cgpaCell, attendanceCell, statusCell);

    // Show the newest record first
    historyBody.prepend(row);

    // Clear form for the next student
    form.reset();
});

function displaySavedRecords() {
    historyBody.innerHTML = "";

    if (studentRecords.length === 0) {
        historyBody.innerHTML =
            '<tr><td colspan="4">No students checked yet.</td></tr>';
        return;
    }

    studentRecords.forEach(function (student) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.cgpa}</td>
            <td>${student.attendance}%</td>
            <td>${student.eligible ? "Eligible" : "Not Eligible"}</td>
        `;

        historyBody.appendChild(row);
    });
}
displaySavedRecords();

function filterStudents() {
    const searchText = searchStudent.value.toLowerCase().trim();
    const filterValue = filterEligibility.value;

    const filteredStudents = studentRecords.filter(function (student) {
        const matchesName = student.name.toLowerCase().includes(searchText);

        const matchesEligibility =
            filterValue === "all" ||
            (filterValue === "eligible" && student.eligible) ||
            (filterValue === "ineligible" && !student.eligible);

        return matchesName && matchesEligibility;
    });

    historyBody.innerHTML = "";

    if (filteredStudents.length === 0) {
        historyBody.innerHTML =
            '<tr><td colspan="4">No matching students found.</td></tr>';
        return;
    }

    filteredStudents.forEach(function (student) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = student.name;

        const cgpaCell = document.createElement("td");
        cgpaCell.textContent = student.cgpa;

        const attendanceCell = document.createElement("td");
        attendanceCell.textContent = student.attendance + "%";

        const resultCell = document.createElement("td");
        resultCell.textContent = student.eligible ? "Eligible" : "Not Eligible";

        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑️ Delete";
        const editButton = document.createElement("button");
editButton.textContent = "✏️ Edit";

editButton.addEventListener("click", function () {
    const newName = prompt("Enter student name:", student.name);

    if (newName === null || newName.trim() === "") {
        return;
    }

    const newCgpa = prompt("Enter CGPA (0 to 10):", student.cgpa);

    if (newCgpa === null) {
        return;
    }

    const cgpaValue = Number(newCgpa);

    if (newCgpa.trim() === "" || !Number.isFinite(cgpaValue) ||
        cgpaValue < 0 || cgpaValue > 10) {
        alert("Please enter a valid CGPA between 0 and 10.");
        return;
    }

    const newAttendance = prompt(
        "Enter attendance percentage (0 to 100):",
        student.attendance
    );

    if (newAttendance === null) {
        return;
    }

    const attendanceValue = Number(newAttendance);

    if (newAttendance.trim() === "" ||
        !Number.isFinite(attendanceValue) ||
        attendanceValue < 0 || attendanceValue > 100) {
        alert("Please enter attendance between 0 and 100.");
        return;
    }

    const newArrears = prompt(
    "Does the student have pending arrears? Enter yes or no:",
    student.arrears
);

if (newArrears === null) {
    return;
}

const arrearsValue = newArrears.trim().toLowerCase();

if (arrearsValue !== "yes" && arrearsValue !== "no") {
    alert("Please enter yes or no.");
    return;
}
    student.name = newName.trim();
student.cgpa = cgpaValue;
student.attendance = attendanceValue;
student.arrears = arrearsValue;
    


    student.eligible =
        student.cgpa >= 7.5 &&
        student.attendance >= 75 &&
        student.arrears === "no";

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(studentRecords)
    );

    total = studentRecords.length;
    eligibleTotal = studentRecords.filter(s => s.eligible).length;
    ineligibleTotal = studentRecords.filter(s => !s.eligible).length;

    document.getElementById("totalCount").textContent = total;
    document.getElementById("eligibleCount").textContent = eligibleTotal;
    document.getElementById("ineligibleCount").textContent = ineligibleTotal;

    displaySavedRecords();
    filterStudents();

    alert("Student record updated successfully!");
});

actionCell.appendChild(editButton);

        deleteButton.addEventListener("click", function () {
    const confirmed = confirm(
        "Are you sure you want to delete this student record?"
    );

    if (confirmed) {
        const index = studentRecords.indexOf(student);
        studentRecords.splice(index, 1);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(studentRecords)
        );

        total = studentRecords.length;
        eligibleTotal = studentRecords.filter(
            student => student.eligible
        ).length;
        ineligibleTotal = studentRecords.filter(
            student => !student.eligible
        ).length;

        document.getElementById("totalCount").textContent = total;
        document.getElementById("eligibleCount").textContent = eligibleTotal;
        document.getElementById("ineligibleCount").textContent = ineligibleTotal;

        displaySavedRecords();
        filterStudents();
    }
});

actionCell.appendChild(deleteButton);

row.append(nameCell, cgpaCell, attendanceCell, resultCell, actionCell);
historyBody.appendChild(row);
    });
}

searchStudent.addEventListener("input", filterStudents);
filterEligibility.addEventListener("change", filterStudents);

const exportCSVButton = document.getElementById("exportCSV");
console.log("Export button found:", exportCSVButton);

exportCSVButton.addEventListener("click", function () {
    if (studentRecords.length === 0) {
        alert("No student records to export.");
        return;
    }

    const headers = [
        "Student Name",
        "CGPA",
        "Attendance (%)",
        "Eligibility"
    ];

    const rows = studentRecords.map(function (student) {
        return [
            student.name,
            student.cgpa,
            student.attendance,
            student.eligible ? "Eligible" : "Not Eligible"
        ];
    });

    const csvContent = [headers, ...rows]
        .map(row => row.map(value =>
            '"' + String(value).replace(/"/g, '""') + '"'
        ).join(","))
        .join("\r\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "student-eligibility-records.csv";
    link.click();

    URL.revokeObjectURL(url);
});