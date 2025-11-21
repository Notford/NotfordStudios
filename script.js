// Pure static form using Formspree for GitHub Pages
const form = document.getElementById('contactForm');
const message = document.getElementById('formMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Example: Use Formspree endpoint
  try {
    const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', { // Replace YOUR_FORM_ID
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

// Footer double-tap admin login
let lastTap = 0;
const footerLogo = document.getElementById("footerLogo");

footerLogo.addEventListener("click", () => {
  const currentTime = new Date().getTime();
  
  if (currentTime - lastTap < 500) { // double-tap detected
    const password = prompt("Enter admin password:");
    if (password === "studio123") { // default admin password
      window.location.href = "admin-login.html";
    } else {
      alert("Incorrect password.");
    }
  }
  
  lastTap = currentTime;
});
