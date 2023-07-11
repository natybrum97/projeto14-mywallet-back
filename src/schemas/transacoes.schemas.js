import Joi from "joi";

export const schemaUsuario = Joi.object({
    valor: Joi.number().positive().required(),
    description: Joi.string().required()
})