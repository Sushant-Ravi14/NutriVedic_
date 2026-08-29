import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, name } = req.body;

  // Support both { firstName, lastName } from frontend and { name } as fallback
  const fullName = name || `${firstName || ''} ${lastName || ''}`.trim();

  if (!fullName) {
    res.status(400);
    throw new Error('Name is required');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name: fullName,
    email,
    passwordHash: password, // The pre-save hook will hash this
  });

  if (user) {
    const accessToken = generateToken(user._id);
    res.status(201).json({
      user: {
        _id: user._id,
        firstName: firstName || fullName.split(' ')[0],
        lastName: lastName || fullName.split(' ').slice(1).join(' '),
        name: user.name,
        email: user.email,
      },
      accessToken,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const nameParts = (user.name || '').split(' ');
    const accessToken = generateToken(user._id);
    res.json({
      user: {
        _id: user._id,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        name: user.name,
        email: user.email,
      },
      accessToken,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});
