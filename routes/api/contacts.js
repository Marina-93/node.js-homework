const express = require('express');
const createError = require('http-errors');
const Joi = require('joi');

const Contact = require('../../models/contact');

const contactsValidation = Joi.object({
  name: Joi.string().min(4).max(30).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'ca', 'uk', 'ru', 'org', 'net'] },
    })
    .required(),
  phone: Joi.string().required(),
});

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await Contact.find();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// router.get('/:contactId', async (req, res, next) => {
//   try {
//     const { contactId } = req.params;
//     const result = await contacts.getContactById(contactId);
//     if (!result) {
//       throw new createError(404, 'Not found');
//     }
//     res.json(result);
//   } catch (error) {
//     next(error);
//   }
// });

// router.post('/', async (req, res, next) => {
//   try {
//     const { error } = contactsValidation.validate(req.body);
//     if (error) {
//       throw new createError(400, 'Missing required name field');
//     }
//     const result = await contacts.addContact(req.body);
//     res.status(201).json(result);
//   } catch (error) {
//     next(error);
//   }
// });

// router.delete('/:contactId', async (req, res, next) => {
//   try {
//     const { contactId } = req.params;
//     const result = await contacts.removeContact(contactId);
//     if (!result) {
//       throw new createError(404, 'Not found');
//     }
//     res.json({ message: 'Contact deleted' });
//   } catch (error) {
//     next(error);
//   }
// });

// router.put('/:contactId', async (req, res, next) => {
//   try {
//     const { error } = contactsValidation.validate(req.body);
//     if (error) {
//       throw new createError(400, 'Missing fields');
//     }
//     const { contactId } = req.params;
//     const result = await contacts.updateContact(contactId, req.body);
//     if (!result) {
//       throw new createError(404, 'Not found');
//     }
//     res.json(result);
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = router;