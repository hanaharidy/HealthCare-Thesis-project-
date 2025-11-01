const express = require('express');
const History = require('../Models/History');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/User'); // Unified User model


// Environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || '1234@1234zxc';


const router = express.Router();


// Get all patients
router.get('/all-patients', async (req, res) => {
    try {
        const patients = await User.find({ role: 'Patient' });
        res.status(200).json(patients);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch patients", error: err.message });
    }
});

// Get all practitioners
router.get('/all-practitioners', async (req, res) => {
    try {
        const practitioners = await User.find({ role: 'Practitioner' });
        res.status(200).json(practitioners);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch practitioners", error: err.message });
    }
});


// Sign-Up Route
router.post('/signup', async (req, res) => {
    console.log('Signup request received:', req.body); // Log incoming request
    
    try {
      const { email, password, role, name, contact, ...rest } = req.body;
      
      // Validate required fields
      if (!email || !password || !role || !name || !contact) {
        console.log('Missing required fields');
        return res.status(400).json({ 
          success: false,
          message: 'Missing required fields' 
        });
      }
  
      // Role-specific validation
      if (role === 'Patient') {
        console.log('Validating patient fields');
        if (!rest.age || !rest.gender || !rest.birth) {
          return res.status(400).json({
            success: false,
            message: 'Patient missing required fields'
          });
        }
      } 
      else if (role === 'Practitioner') {
        console.log('Validating practitioner fields');
        if (!rest.profession || !rest.yearsExperience || !rest.location) {
          return res.status(400).json({
            success: false,
            message: 'Practitioner missing required fields'
          });
        }
      }
  
      console.log('Checking for existing user');
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ 
          success: false,
          message: 'Email already in use' 
        });
      }
  
      console.log('Hashing password');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      console.log('Creating user object');
      const userData = {
        email,
        password: hashedPassword,
        role,
        name,
        contact,
        ...rest,
        birth: rest.birth ? new Date(rest.birth) : null
      };
  
      console.log('Saving user:', userData);
      const newUser = new User(userData);
      const savedUser = await newUser.save();
  
      console.log('Generating token');
      const token = jwt.sign(
        { id: savedUser._id, role: savedUser.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
  
      console.log('Signup successful');
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: savedUser._id,
          email: savedUser.email,
          role: savedUser.role,
          name: savedUser.name
        }
      });
  
    } catch (err) {
      console.error('SIGNUP ERROR DETAILS:', {
        message: err.message,
        stack: err.stack,
        fullError: err
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to sign up',
        error: err.message
      });
    }
  });

// Sign-In Route
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Sign-in successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to sign in', error: err.message });
    }
});


// Validate token
router.get('/validate-token', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user: {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
        } });
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});


// Get user by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === 'Patient') {
            const histories = await Promise.all(
                user.history.map(async (historyId) => {
                    return await History.findById(historyId);
                })
            );

            return res.status(200).json({

                name: user.name,
                age: user.age,
                gender: user.gender,
                history: histories,
                birth: user.birth,
                contact: user.contact,
                image:user.image,
                role: user.role,
            });
        } else if (user.role === 'Practitioner') {
            const ratings = user.ratings.map((r) => r.value);
            const averageRating = ratings.length > 0 
                ? (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(2)
                : 0;

            return res.status(200).json({
                name: user.name,
                profession: user.profession,
                yearsExperience: user.yearsExperience,
                gender: user.gender,
                location: user.location,
                averageRating: averageRating,
                availableDays: user.availableDays,
                image: user.image,
                role: user.role
            });
        }

        res.status(400).json({ message: "Invalid user role" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch user", error: err.message });
    }
});

// Add a new user (Patient or Practitioner) - for admin purposes
router.post('/add-user', async (req, res) => {
    const { role, ...data } = req.body;

    try {
        const newUser = new User({ role, ...data });
        const savedUser = await newUser.save();

        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ message: "Failed to add user", error: err.message });
    }
});

// Update user by ID
router.put('/edit-user/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Failed to update user", error: err.message });
    }
});

// Delete user by ID
router.delete('/delete-user/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully", user: deletedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete user", error: err.message });
    }
});

// Add available dates for a practitioner
router.put('/add-available-dates/:id', async (req, res) => {
    const { id } = req.params;
    const { dates } = req.body;

    try {
        const dateObjects = dates.map((date) => new Date(date));
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $push: { availableDays: { $each: dateObjects } } },
            { new: true }
        );

        if (!updatedUser || updatedUser.role !== 'Practitioner') {
            return res.status(404).json({ message: "Practitioner not found" });
        }

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Failed to add dates", error: err.message });
    }
});

// Reserve a date for a practitioner
router.put('/reserve-date/:id', async (req, res) => {
    const { id } = req.params;
    const { date } = req.body;

    try {
        console.log("Hello 1")
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $pull: { availableDays: new Date(date) } },
            { new: true }
        );
        console.log("Hello 2")

        if (!updatedUser || updatedUser.role !== 'Practitioner') {
            return res.status(404).json({ message: "Practitioner not found" });
        }
        console.log("Hello 3")

        res.status(200).json(updatedUser);
        console.log("Hello 4")

    } catch (err) {
        console.log("Hello 5")

        console.error(err);
        res.status(400).json({ message: "Failed to reserve date", error: err.message });
    }
});

// Rate a practitioner
router.put('/rate-practitioner/:id', async (req, res) => {
    const { id } = req.params;
    const { patientId, value } = req.body;

    try {
        const practitioner = await User.findById(id);
        practitioner.ratings = practitioner.ratings || [];

        if (!practitioner || practitioner.role !== 'Practitioner') {
            return res.status(404).json({ message: "Practitioner not found" });
        }

        const existingRating = practitioner.ratings?.find((r) => r.patientId?.toString() === patientId);
        if (!existingRating) {
          practitioner.ratings.push({ patientId, value });
        } else {
          existingRating.value = value;
        }
        

        await practitioner.save();
        res.status(200).json(practitioner);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Failed to rate practitioner", error: err.message });
    }
});

router.delete('/delete-user/:id', async(req,res)=>{
    const id = req.params.id;

    try{
        const user = await User.findByIdAndDelete(id)
        res.status(200).json("user deleted successfully", user)
    }catch(err){

    }
})

// Delete a specific medical history record
router.delete('/delete-history/:userId/:historyId', async (req, res) => {
    const { userId, historyId } = req.params;

    try {
        // Step 1: Remove the history from the History collection
        const deletedHistory = await History.findByIdAndDelete(historyId);
        if (!deletedHistory) {
            return res.status(404).json({ message: "History record not found" });
        }

        // Step 2: Remove the history reference from the User's history array
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { history: historyId } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "History record deleted successfully", user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete history", error: err.message });
    }
});

module.exports = router;
