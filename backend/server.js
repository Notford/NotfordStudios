require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Airtable = require('airtable');
const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// Airtable setup
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);
const TABLE = process.env.AIRTABLE_TABLE;

// SendGrid setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// --- Admin password hash ---
const adminHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);

// --- Middleware: Auth ---
const authenticate = (req,res,next)=>{
  const auth = req.headers['authorization'];
  if(!auth) return res.status(401).json({error:'Unauthorized'});
  const token = auth.split(' ')[1];
  try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  }catch(err){
    return res.status(401).json({error:'Invalid token'});
  }
}

// --- Routes ---

// POST /api/admin/login
app.post('/api/admin/login',(req,res)=>{
  const {password} = req.body;
  if(!password) return res.status(400).json({error:'Password required'});
  if(!bcrypt.compareSync(password,adminHash)) return res.status(401).json({error:'Incorrect password'});
  const token = jwt.sign({role:'admin'},process.env.JWT_SECRET,{expiresIn:'8h'});
  res.json({token});
});

// POST /api/bookings
app.post('/api/bookings', async (req,res)=>{
  try{
    const {clientName, clientEmail, service, date, time, notes} = req.body;
    if(!clientName||!clientEmail||!service||!date||!time)
      return res.status(400).json({error:'Missing fields'});

    // Save to Airtable
    const record = await base(TABLE).create({
      'Name': clientName,
      'Email': clientEmail,
      'Service': service,
      'Date': date,
      'Time': time,
      'Notes': notes || '',
      'Done': false
    });

    // Send confirmation email via SendGrid
    const msg = {
      to: clientEmail,
      from: process.env.FROM_EMAIL,
      subject: `Notford Studios Appointment Confirmation`,
      text: `Hello ${clientName},\n\nYour appointment for ${service} on ${date} at ${time} has been received. We will confirm availability shortly.\n\n- Notford Studios`
    };

    await sgMail.send(msg);

    res.json({success:true, recordId:record.id});
  }catch(err){
    console.error(err);
    res.status(500).json({error:'Server error'});
  }
});

// GET /api/bookings (Admin)
app.get('/api/bookings', authenticate, async (req,res)=>{
  try{
    const records = await base(TABLE).select({sort:[{field:'Date',direction:'desc'}]}).firstPage();
    const data = records.map(r=>({
      id: r.id,
      clientName: r.get('Name'),
      clientEmail: r.get('Email'),
      service: r.get('Service'),
      date: r.get('Date'),
      time: r.get('Time'),
      notes: r.get('Notes'),
      done: r.get('Done')
    }));
    res.json(data);
  }catch(err){console.error(err);res.status(500).json({error:'Server error'})}
});

// PATCH /api/bookings/:id (Admin - toggle done / delete)
app.patch('/api/bookings/:id', authenticate, async (req,res)=>{
  try{
    const {id} = req.params;
    const {action} = req.body;
    if(action==='toggle'){
      const rec = await base(TABLE).find(id);
      const currentDone = rec.get('Done') || false;
      await base(TABLE).update(id, {'Done': !currentDone});
    }else if(action==='delete'){
      await base(TABLE).destroy(id);
    }else{
      return res.status(400).json({error:'Invalid action'});
    }
    // Return updated list
    const records = await base(TABLE).select({sort:[{field:'Date',direction:'desc'}]}).firstPage();
    const data = records.map(r=>({
      id: r.id,
      clientName: r.get('Name'),
      clientEmail: r.get('Email'),
      service: r.get('Service'),
      date: r.get('Date'),
      time: r.get('Time'),
      notes: r.get('Notes'),
      done: r.get('Done')
    }));
    res.json(data);
  }catch(err){console.error(err);res.status(500).json({error:'Server error'})}
});

// --- Start server ---
app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));

