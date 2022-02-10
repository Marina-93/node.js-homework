const { Schema, model } = require('mongoose');
const Joi = require('joi');

const userSchema = Schema(
  {
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ['starter', 'pro', 'business'],
      default: 'starter',
    },
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false }
);

const usersRegisterValidation = Joi.object({
  password: Joi.string().min(6).max(10).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'ca', 'uk', 'ru', 'org', 'net'] },
    })
    .required(),
  subscription: Joi.string(),
});

const User = model('user', userSchema);

module.exports = {
  User,
  schems: {
    registet: usersRegisterValidation,
  },
};
