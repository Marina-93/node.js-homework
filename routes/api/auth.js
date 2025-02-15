const express = require('express');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const path = require('path');
const fs = require('fs/promises');
const { v4 } = require('uuid');
const Joi = require('joi');

const { User, schems } = require('../../models/user');
const { authenticate, upload } = require('../../middlewares');

const avatarsDir = path.join(__dirname, "../../", "public", "avatars");

const router = express.Router();

const { sendMail } = require('../../helpers');

const { SECRET_KEY } = process.env;

router.post('/signup', async (req, res, next) => {
  try {
    const { error } = schems.registet.validate(req.body);
    if (error) {
      throw new createError(400, error.message);
    }
    const { email, password, subscription } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw new createError(409, 'Email in use');
    }
    const solt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, solt);
    const avatarURL = gravatar.url(email, { protocol: 'http' });
    const verificationToken = v4();
    const result = await User.create({
      email,
      avatarURL,
      verificationToken,
      password: hashPassword,
      subscription,
    });
    const mail = {
      to: email,
      subject: 'Подтверждение',
      html: `<a target='_blank' href="http://localhost:3000/api/users/${verificationToken}">Нажмите для подтверждения</a>`
    }
    await sendMail(mail);
    res.status(201).json({
      user: {
        email,
        subscription: result.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { error } = schems.registet.validate(req.body);
    if (error) {
      throw new createError(400, error.message);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new createError(401, 'Email or password is wrong');
    }
    if (!user.verify) {
      throw new createError(401, 'Not verify');
    }
    const compareResult = await bcrypt.compare(password, user.password);
    if (!compareResult) {
      throw new createError(401, 'Email or password is wrong');
    }
    const payload = { id: user._id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '5h' });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
      token,
      user: {
        email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/current', authenticate, async (req, res, next) => {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
});

router.get('/ logout', authenticate, async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: '' });
  res.status(204).send();
});

router.patch('/subscription', authenticate, async (req, res, next) => {
  try {
    const { error } = schems.update.validate(req.body);
    if (error) {
      throw new createError(400, 'Missing fields');
    }
    const { id, email, subscription } = req.body;
    await User.findByIdAndUpdate(id, email, subscription, { new: true });
    res.json({ email, subscription });
  } catch (error) {
    next(error);
  }
});

router.patch('/avatars', authenticate, upload.single('avatar'), async(req, res, next)=> {
    const {_id} = req.user;
    const {path: tempUpload, filename} = req.file;
    try {
        const [extention] = filename.split('.').reverse();
        const newFileName = `${_id}.${extention}`;
        const resultUpload = path.join(avatarsDir, newFileName);
        await fs.rename(tempUpload, resultUpload);
        const avatarURL = path.join('avatars', newFileName);
        await User.findByIdAndUpdate(_id, {avatarURL});
        res.json({
            avatarURL
        })
    } catch (error) {
        next(error);
    }
});

router.get('/verify/:verificationToken', authenticate, async (req, res, next) => {
  const { verificationToken } = req.params;
  try {
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw new createError(404);
    }
    await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: null });
    res.json({
      message: 'Verification successful'
    })
  } catch (error) {
    next(error);
  }
})

router.post('/verify', async (req, res, next) => {
  try {
    const { error } = schems.email.validate(req.body);
    if (error) {
      throw new createError(400, 'missing required field email');
    };
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new createError(404);
    }
    if (user.verify) {
      throw new createError(400, 'Verification hes already been passed');
    }
    const mail = {
      to: email,
      subject: 'Подтверждение',
      html: `<a target='_blank' href="http://localhost:3000/api/users/${user.verificationToken}">Нажмите для подтверждения</a>`
    }
    await sendMail(mail);
    res.json({
      message: 'Verification email sent'
    })
  } catch (error) {
    next(error);
  }
})

module.exports = router;
