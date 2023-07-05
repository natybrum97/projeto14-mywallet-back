import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import Joi from "joi";
import { stripHtml } from "string-strip-html";
import { v4 as uuid } from 'uuid';

const app = express();


app.use(cors());
app.use(express.json());
dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
    await mongoClient.connect();
    console.log("MongoDB conectado!");
} catch (err) {
    (err) => console.log(err.message);
}

const db = mongoClient.db();

app.post("/cadastro", async (req, res) => {

    const { name, email, password } = req.body;



    const schemaUsuario = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(3).required()
    })

    const validation = schemaUsuario.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    const sanitizedName = stripHtml(name).result.trim();
    const sanitizedEmail = stripHtml(email).result.trim();
    const sanitizedPassword = stripHtml(password).result.trim();
    

    try {
        const usuario = await db.collection("usuariosCadastrados").findOne({ email: sanitizedEmail });
        if (usuario) return res.status(409).send("Esse usuário já existe!");

        const hash = bcrypt.hashSync(sanitizedPassword, 10);

        await db.collection("usuariosCadastrados").insertOne({ name: sanitizedName, email: sanitizedEmail, password: hash });

        res.sendStatus(201);

    } catch (err) {
        res.status(500).send(err.message);
    }

})

app.post("/", async (req, res) => {

	const { email, password } = req.body;

    const schemaUsuario = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(3).required()
    })

    const validation = schemaUsuario.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    const sanitizedEmail = stripHtml(email).result.trim();
    const sanitizedPassword = stripHtml(password).result.trim();
    

	try {
		const usuario = await db.collection("usuariosCadastrados").findOne({ email: sanitizedEmail });
		if (!usuario) return res.status(404).send("Usuário não cadastrado");

		const senhaEstaCorreta = bcrypt.compareSync(sanitizedPassword, usuario.password);
		if (!senhaEstaCorreta) return res.status(401).send("Senha incorreta");

		const token = uuid();
		await db.collection("login").insertOne({ token, idUsuario: usuario._id });

        return res.status(200).send(token);

	} catch (err) {
		res.status(500).send(err.message)
	}
})


const PORT = 5000;
app.listen(PORT, () => console.log(`O servidor está rodando na porta ${PORT}!`))

