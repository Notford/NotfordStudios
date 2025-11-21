// ===== CONTACT FORM (Formspree) =====
const form = document.getElementById('contactForm');
const message = document.getElementById('formMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', { // Replace with your Formspree ID
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if(res.ok){
      message.textContent = 'Booking request sent! We will contact you soon.';
      form.reset();
    } else {
      message.textContent = 'Failed to send. Try again later.';
    }
  } catch(err){
    message.textContent = 'Error sending request.';
    console.error(err);
  }
});

// ===== FOOTER DOUBLE-TAP ADMIN LOGIN =====
let lastTap = 0;
const footerLogo = document.getElementById("footerLogo");

footerLogo.addEventListener("click", () => {
  const currentTime = new Date().getTime();

  if (currentTime - lastTap < 500) { // double-tap detected
    const password = prompt("Enter admin password:");

    // Default admin password
    if (password === "studio123") {
      localStorage.setItem("isAdmin", "true"); // set session
      window.location.href = "admin-dashboard.html";
    } else if (password !== null) {
      alert("Incorrect password.");
    }
  }

  lastTap = currentTime;
});
