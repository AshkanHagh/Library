import Joi from 'joi';

const validator = (schema : Joi.Schema) => (payload : object) => schema.validate(payload, {abortEarly : false});

const register = Joi.object({
    fullName : Joi.string().required(),
    phone : Joi.number().required(),
    email : Joi.string().email().required(),
    password : Joi.string().min(6).required()
});

export const validateRegister = validator(register);

const verifyAccount = Joi.object({
    activationCode : Joi.string().required(),
    activationToken : Joi.string().required()
});

export const validateVerifyAccount = validator(verifyAccount);

const login = Joi.object({
    email : Joi.string().email().required(),
    password : Joi.string().min(6).required(),
});

export const validateLogin = validator(login);

const createProduct = Joi.object({
    name : Joi.string().required(),
    description : Joi.string().required(),
    price : Joi.number().required(),
    availableQuantity : Joi.number().required(),
    categories: Joi.array().items(Joi.string().required()).optional()
});

export const validateNewProduct = validator(createProduct);

const editProduct = Joi.object({
    name : Joi.string(),
    description : Joi.string(),
    price : Joi.number(),
    availableQuantity : Joi.number(),
    categories: Joi.array().items(Joi.string()).optional()
});

export const validateUpdateProduct = validator(editProduct);