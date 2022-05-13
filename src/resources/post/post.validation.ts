import Joi from 'joi';

const create = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    author: Joi.string().required(),
    body: Joi.string().required(),
});

export default { create };
