const { Schema, model } = require('mongoose');
const Joi = require('joi');

const contactSchema = Schema({
  name: {
    type: String,
    required: [true, 'Set name for contact'],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
}, { versionKey: false });

const contactsValidation = Joi.object({
  name: Joi.string().min(4).max(30).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'ca', 'uk', 'ru', 'org', 'net'] },
    })
    .required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean()
});

const joiUpdateFavoriteSchema = Joi.object({
    favorite: Joi.boolean().required()
})

const Contact = model('contact', contactSchema);

module.exports = {
    Contact,
    schema: {
        add: contactsValidation,
        favorite: joiUpdateFavoriteSchema
    }
};
