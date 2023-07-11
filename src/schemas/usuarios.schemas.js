import Joi from "joi";

export const schemaCadastro = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(3).required()
})

export const schemaLogin = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(3).required()
})