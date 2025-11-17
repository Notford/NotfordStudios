const bookingForm = document.getElementById('bookingForm');
const message = document.getElementById('message');
const manageBtn = document.getElementById('manageBtn');
const appointmentsList = document.getElementById('appointmentsList');
const emptyState = document.getElementById('emptyState');
const appointmentsPanel = document.getElementById('appointmentsPanel');

// Backend API URL
const API_BASE = 'http://localhost:5000/api'; // Change to your live backend URL

const escapeHtml = (s) => String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

// Booking Submission
bookingForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const data = {
    clientName: document.getElementById('clientName').value.trim(),
    clientEmail: document.getElementById('clientEmail').value.trim(),
    service: document.getElementById('serviceSelect').value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    notes: document.getElementById('notes').value.trim()
  };
  if (!data.clientName || !data.clientEmail || !data.service || !data.date || !data.time){
    showMessage('Please fill in all required fields.', 'error');
    return;
  }
  try {
    const resp = await fetch(`${API_BASE}/bookings`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(data)
    });
    const result = await resp.json();
    if(resp.ok){
      bookingForm.reset();
      showMessage('Appointment requested successfully.', 'success');
    } else {
      showMessage(result.error || 'Booking failed.', 'error');
    }
  } catch(err){
    console.error(err);
    showMessage('Network error.', 'error');
  }
});

// Admin Portal
manageBtn.addEventListener('click', async ()=>{
  const password = prompt('Enter admin password:');
  if(!password) return;
  try{
    const resp = await fetch(`${API_BASE}/admin/login`,{
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({password})
    });
    const result = await resp.json();
    if(!resp.ok){
      alert(result.error || 'Incorrect password.');
      return;
    }
    const token = result.token;
    const apptsResp = await fetch(`${API_BASE}/bookings`,{
      headers:{'Authorization':`Bearer ${token}`}
    });
    const apptsData = await apptsResp.json();
    renderAppointments(apptsData, token);
    appointmentsPanel.scrollIntoView({behavior:'smooth'});
  }catch(err){ console.error(err); alert('Server error.'); }
});

function renderAppointments(list, token){
  appointmentsList.innerHTML='';
  if(!list.length){
    appointmentsList.hidden=true;
    emptyState.hidden=false;
    return;
  }
  emptyState.hidden=true;
  appointmentsList.hidden=false;
  list.forEach(appt=>{
    const li = document.createElement('li');
    li.className='appointment';
    li.innerHTML = `
      <div class="appointment-main">
        <div class="appt-meta"><strong>${escapeHtml(appt.clientName)}</strong><div class="muted small">${escapeHtml(appt.clientEmail)}</div></div>
        <div class="appt-when"><div>${escapeHtml(appt.service)}</div><div class="muted small">${escapeHtml(appt.date)} @ ${escapeHtml(appt.time)}</div></div>
      </div>
      <div class="appointment-actions">
        <button class="btn small mark-done" data-id="${appt.id}">${appt.done ? 'Completed':'Mark Done'}</button>
        <button class="btn btn-ghost small delete" data-id="${appt.id}">Delete</button>
      </div>
    `;
    li.querySelector('.delete').addEventListener('click', ()=> updateAppointment(appt.id,'delete', token));
    li.querySelector('.mark-done').addEventListener('click', ()=> updateAppointment(appt.id,'toggle', token));
    appointmentsList.appendChild(li);
  });
}

async function updateAppointment(id, action, token){
  try{
    const resp = await fetch(`${API_BASE}/bookings/${id}`,{
      method:'PATCH',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
      body: JSON.stringify({action})
    });
    const result = await resp.json();
    if(resp.ok) renderAppointments(result, token);
    else alert(result.error||'Update failed');
  }catch(err){ console.error(err); }
}

function showMessage(text,type='success'){
  message.hidden=false;
  message.textContent=text;
  message.className='message '+type;
  setTimeout(()=>message.hidden=true,3500);
}

