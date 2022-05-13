import Joi from 'joi';

const register = Joi.object({
    firstName: Joi.string().min(3).max(15).required(),

    lastName: Joi.string().min(3).max(15).required(),

    email: Joi.string().email().required(),

    password: Joi.string().min(8).max(20).required(),
});

const login = Joi.object({
    email: Joi.string().required(),

    password: Joi.string().required(),
});

export default { register, login };

