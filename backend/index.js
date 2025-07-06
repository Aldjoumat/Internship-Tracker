require('dotenv').config();
const mongoose = require('mongoose'); 
const express = require('express');
const cors = require('cors'); 
const Internship = require('./internship');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./user'); // adjust path
//const internship = require('./internship');
const app = express();
app.use(cors());
app.use(express.json())
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB'))// connecting to MongoDB (DataBase)
.catch((err)=> console.error('Error connecting to MongoDB', err));
//first route
app.get('/' , (req,res) =>{
    res.send('Internship Tracker Backend is Working !');
});
//second route - Will direct users to all the internships
app.get('/internships', async (req, res) => {
    try {
        const userId = req.query.userId; // frontend will pass ?userId=...
        const internships = await Internship.find({ userId });
        res.json(internships);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/internships/:id', async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }
        res.json(internship);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/internships', async (req,res) =>{ 
    try{
        const newInternship = new Internship({
            title : req.body.title,
            company: req.body.company,
            location : req.body.location, 
            description: req.body.description,
            userId: req.body.userId  // you pass this from frontend
        });
        await newInternship.save();
        res.status(201).json(newInternship);
    } catch(err){
        res.status(500).json({message: err.message});
    }
 });

 //  Creating the Register route
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Creating the Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong password' });
    }

    res.json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 app.put('/internships/:id', async (req,res)=>{
    try{
        const internshipId = req.params.id;
        const updatedInternship =  await Internship.findByIdAndUpdate(
            internshipId,
            {
                title : req.body.title,
                company: req.body.company,
                 location : req.body.location, 
                 description: req.body.description
            },
            {new : true} // return new updated document
            
        );
        res.json(updatedInternship);
    }catch(err){
         res.status(500).json({message: err.message}); // Wil leave error if route has error
    }
 });
 app.delete('/internships/:id', async (req, res) => {
    try {
        const deletedInternship = await Internship.findByIdAndDelete(req.params.id);
        if (!deletedInternship) {
            return res.status(404).json({ message: 'Internship not found' });
        }
        res.json({ message: 'Internship deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

  // Help start the server      
 app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
 });