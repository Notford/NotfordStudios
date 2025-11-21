// Check admin access
if(localStorage.getItem("isAdmin") !== "true"){
  window.location.href = "admin-login.html";
}

// Logout function
function logout(){
  localStorage.removeItem("isAdmin");
  window.location.href = "admin-login.html";
}

// Users management
function addUser(){
  const name = document.getElementById("newUserName").value;
  const pass = document.getElementById("newUserPass").value;
  const role = document.getElementById("newUserRole").value;
  const msg = document.getElementById("addUserMsg");

  if(!name || !pass){
    msg.textContent = "Please fill username & password.";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  users.push({ name, pass, role });
  localStorage.setItem("users", JSON.stringify(users));
  msg.textContent = `User "${name}" added successfully.`;

  document.getElementById("newUserName").value = "";
  document.getElementById("newUserPass").value = "";
}

// Project upload (browser storage only)
function uploadProject(){
  const title = document.getElementById("projectTitle").value;
  const file = document.getElementById("projectFile").files[0];
  const msg = document.getElementById("projectMsg");

  if(!title || !file){
    msg.textContent = "Please provide title & file.";
    return;
  }

  let projects = JSON.parse(localStorage.getItem("projects") || "[]");
  const reader = new FileReader();

  reader.onload = function(e){
    projects.push({ title, fileName: file.name, data: e.target.result });
    localStorage.setItem("projects", JSON.stringify(projects));
    msg.textContent = `Project "${title}" uploaded successfully.`;
  }

  reader.readAsDataURL(file);
}

// Display appointments
function displayAppointments(){
  const list = document.getElementById("appointmentsList");
  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");

  if(appointments.length === 0){
    list.textContent = "No appointments yet.";
    return;
  }

  list.innerHTML = "";
  appointments.forEach((a, i) => {
    const div = document.createElement("div");
    div.classList.add("appointment-card");
    div.innerHTML = `
      <strong>${a.name}</strong> (${a.email})<br>
      Service: ${a.service} | ${a.date} at ${a.time}<br>
      Notes: ${a.notes || "None"}
    `;
    list.appendChild(div);
  });
}

// Initialize dashboard
displayAppointments();
