const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected successfully');
    
    // إنشاء حساب المدير الافتراضي إذا لم يكن موجوداً
    try {
      const adminExists = await Admin.findOne({ username: 'admin' });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        const newAdmin = new Admin({
          username: 'admin',
          password: hashedPassword,
          name: 'System Administrator'
        });
        
        await newAdmin.save();
        console.log('Default Admin created successfully! (admin / admin123)');
      }
    } catch (err) {
      console.log('Error creating default admin:', err);
    }
  })
  .catch(err => console.log('MongoDB connection error:', err));
// Route Imports
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/employee', require('./routes/employee'));

// Basic health check route
app.get('/', (req, res) => res.send('AMD Backend API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
