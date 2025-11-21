// ===== ADMIN ACCESS CHECK =====
if(localStorage.getItem("isAdmin") !== "true"){
  window.location.href = "admin-login.html";
}

// LOGOUT
function logout(){
  localStorage.removeItem("isAdmin");
  window.location.href = "admin-login.html";
}

// TOAST NOTIFICATION
function showToast(msg){
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(()=>{ toast.style.display = "none"; }, 3000);
}

// SIDEBAR NAVIGATION
function showSection(sectionId){
  document.querySelectorAll(".admin-section").forEach(s=>s.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");
  document.querySelectorAll(".sidebar a").forEach(a=>a.classList.remove("active"));
  event.target.classList.add("active");
}

// USERS MANAGEMENT
function addUser(){
  const name = document.getElementById("newUserName").value;
  const pass = document.getElementById("newUserPass").value;
  const role = document.getElementById("newUserRole").value;

  if(!name || !pass){ showToast("Enter username & password."); return; }

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  users.push({ name, pass, role });
  localStorage.setItem("users", JSON.stringify(users));
  showToast(`User "${name}" added.`);
  document.getElementById("newUserName").value = "";
  document.getElementById("newUserPass").value = "";

  displayUsers();
}

function displayUsers(){
  const tbody = document.querySelector("#usersTable tbody");
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  tbody.innerHTML = "";
  users.forEach((u,i)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.name}</td>
      <td>${u.role}</td>
      <td>
        <button onclick="deleteUser(${i})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteUser(index){
  let users = JSON.parse(localStorage.getItem("users") || "[]");
  showToast(`User "${users[index].name}" deleted.`);
  users.splice(index,1);
  localStorage.setItem("users", JSON.stringify(users));
  displayUsers();
}

// PROJECTS MANAGEMENT
function uploadProject(){
  const title = document.getElementById("projectTitle").value;
  const file = document.getElementById("projectFile").files[0];
  if(!title || !file){ showToast("Enter title & file."); return; }

  const reader = new FileReader();
  reader.onload = function(e){
    let projects = JSON.parse(localStorage.getItem("projects") || "[]");
    projects.push({ title, fileName: file.name, data: e.target.result });
    localStorage.setItem("projects", JSON.stringify(projects));
    showToast(`Project "${title}" uploaded.`);
    displayProjects();
  }
  reader.readAsDataURL(file);
  document.getElementById("projectTitle").value = "";
  document.getElementById("projectFile").value = "";
}

function displayProjects(){
  const tbody = document.querySelector("#projectsTable tbody");
  const projects = JSON.parse(localStorage.getItem("projects") || "[]");
  tbody.innerHTML = "";
  projects.forEach((p,i)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.title}</td>
      <td>${p.fileName}</td>
      <td><button onclick="deleteProject(${i})">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteProject(index){
  let projects = JSON.parse(localStorage.getItem("projects") || "[]");
  showToast(`Project "${projects[index].title}" deleted.`);
  projects.splice(index,1);
  localStorage.setItem("projects", JSON.stringify(projects));
  displayProjects();
}

// APPOINTMENTS MANAGEMENT
function displayAppointments(){
  const tbody = document.querySelector("#appointmentsTable tbody");
  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  tbody.innerHTML = "";
  appointments.forEach((a,i)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.name}</td>
      <td>${a.email}</td>
      <td>${a.service}</td>
      <td>${a.date} ${a.time}</td>
      <td>${a.notes || ""}</td>
      <td>Pending</td>
    `;
    tbody.appendChild(tr);
  });
}

// SETTINGS
function changeAdminPassword(){
  const oldPass = document.getElementById("oldPassword").value;
  const newPass = document.getElementById("newPassword").value;
  if(oldPass !== "studio123"){ showToast("Current password incorrect."); return; }
  if(!newPass){ showToast("Enter new password."); return; }
  localStorage.setItem("adminPass", newPass);
  showToast("Password changed.");
  document.getElementById("oldPassword").value = "";
  document.getElementById("newPassword").value = "";
}

function clearAllData(){
  if(confirm("Clear all users, projects, and appointments?")){
    localStorage.removeItem("users");
    localStorage.removeItem("projects");
    localStorage.removeItem("appointments");
    showToast("All data cleared.");
    displayUsers();
    displayProjects();
    displayAppointments();
  }
}

// INITIAL LOAD
displayUsers();
displayProjects();
displayAppointments();
