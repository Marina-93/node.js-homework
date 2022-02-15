const express = require('express');
const createError = require('http-errors');
const ObjectId = require('mongoose').Types.ObjectId;

const { Contact, schema } = require('../../models/contact');
const { authenticate } = require('../../middlewares');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    if (isNaN(page) || isNaN(limit)) {
      throw new createError(400, 'Not a number');
    }
    const { _id } = req.user;
    const skip = (page - 1) * limit;
    const result = await Contact.find({ owner: _id }, '', {
      skip,
      limit: +limit,
    }).populate('owner', 'email');
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:contactId', authenticate, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    if (!ObjectId.isValid(contactId)) {
      throw new createError(404, 'Id not valid');
    }
    const result = await Contact.findById({
      _id: ObjectId(contactId),
      owner: req.user._id,
    });
    if (!result) {
      throw new createError(404, 'Not found');
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { error } = schema.add.validate(req.body);
    if (error) {
      throw new createError(400, 'Missing required name field');
    }
    const data = { ...req.body, owner: req.user._id };
    const result = await Contact.create(data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/:contactId', authenticate, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    if (!ObjectId.isValid(contactId)) {
      throw new createError(404, 'Id not valid');
    }
    const result = await Contact.findByIdAndDelete(
      { _id: ObjectId(contactId), owner: req.user._id }
    );
    if (!result) {
      throw new createError(404, 'Not found');
    }
    res.json({ message: 'сontact deleted' });
  } catch (error) {
    next(error);
  }
});

router.put('/:contactId', authenticate, async (req, res, next) => {
  try {
    const { error } = schema.add.validate(req.body);
    if (error) {
      throw new createError(400, 'Missing fields');
    }
    const { contactId } = req.params;
    if (!ObjectId.isValid(contactId)) {
      throw new createError(404, 'Id not valid');
    }
    const result = await Contact.findByIdAndUpdate(
      { _id: ObjectId(contactId), owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!result) {
      throw new createError(404, 'Not found');
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/:contactId/favorite', async (req, res, next) => {
  try {
    const { error } = schema.favorite.validate(req.body);
    if (error) {
      throw new createError(400, 'Missing field favorite');
    }
    const { contactId } = req.params;
    if (!ObjectId.isValid(contactId)) {
      throw new createError(404, 'Id not valid');
    }
    const result = await Contact.findByIdAndUpdate(
      { _id: ObjectId(contactId), owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!result) {
      throw new createError(404, 'Not found');
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
