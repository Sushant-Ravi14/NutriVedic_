const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail } = require('../utils/notifications');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY });
  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, error: 'User already exists' });

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    user = await User.create({ email, passwordHash, firstName, lastName, emailVerified: true });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    const sameSiteMode = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: sameSiteMode, maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    res.status(201).json({ success: true, accessToken, user });
  } catch (error) {
    next(error);
  }
};


const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    if (user.accountStatus !== 'active') return res.status(403).json({ success: false, error: 'Account suspended/deleted' });
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    const sameSiteMode = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: sameSiteMode, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ success: true, accessToken, user });
  } catch (error) {
    next(error);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    let email, name, picture, googleId, given_name, family_name;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      ({ sub: googleId, email, name, picture, given_name, family_name } = payload);
    } catch (err) {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        return res.status(400).json({ error: 'Failed to fetch user info from Google' });
      }
      const userInfo = await response.json();
      ({ sub: googleId, email, name, picture, given_name, family_name } = userInfo);
    }
    
    if (!email || !googleId) {
      return res.status(400).json({ error: 'Google credential or access token is required' });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await User.create({
        email,
        googleId,
        firstName: given_name || name || 'Google',
        lastName: family_name || '',
        profilePictureUrl: picture,
        emailVerified: true
      });
    }

    if (user.accountStatus !== 'active') return res.status(403).json({ error: 'Account suspended/deleted' });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    const sameSiteMode = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: sameSiteMode, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ success: true, accessToken, user });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ success: false, error: 'No refresh token' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    const sameSiteMode = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: sameSiteMode, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ success: true, accessToken: tokens.accessToken });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user) {
      req.user.refreshToken = null;
      req.user.fcmToken = null;
      await req.user.save();
    }
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email address is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ success: false, error: 'No account found with this email address' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Determine client host dynamically from headers or env
    const clientOrigin = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientOrigin}/reset-password/${resetToken}`;

    const htmlEmail = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 26px; font-weight: 700; color: #0a0a0a; margin: 0; letter-spacing: -0.5px;">Nutri<span style="font-style: italic; color: #737373; font-weight: 400;">Vedic</span></h1>
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #737373; margin-top: 4px;">Password Reset Request</p>
        </div>
        <p style="font-size: 15px; color: #262626; line-height: 1.6; margin-bottom: 16px;">
          Hello ${user.firstName || 'NutriVedic User'},
        </p>
        <p style="font-size: 14px; color: #525252; line-height: 1.6; margin-bottom: 24px;">
          We received a request to reset the password for your account. Click the button below to set a new password. This link will expire in <strong>15 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #0a0a0a; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #737373; line-height: 1.5; margin-bottom: 8px;">
          Or copy and paste this link into your browser:
        </p>
        <p style="font-size: 12px; color: #0a0a0a; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 6px; font-family: monospace;">
          ${resetUrl}
        </p>
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 28px 0 16px 0;" />
        <p style="font-size: 11px; color: #a3a3a3; text-align: center; margin: 0;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `;

    await sendEmail(user.email, 'NutriVedic — Password Reset Request', htmlEmail);

    res.status(200).json({ 
      success: true, 
      message: 'Password reset link sent to your email!',
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
      resetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Password reset link is invalid or has expired' });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.refreshToken = null; // Invalidate existing sessions
    await user.save();

    res.status(200).json({ success: true, message: 'Password has been reset successfully. Please log in with your new password.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, googleAuth, refresh, logout, forgotPassword, resetPassword };
