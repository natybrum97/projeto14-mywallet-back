import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import Joi from "joi";
import { stripHtml } from "string-strip-html";
import { v4 as uuid } from 'uuid';
import dayjs from "dayjs";
import { postCadastro, postLogin } from "./controllers/usuarios.controller.js";

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

export const db = mongoClient.db();

app.post("/cadastro", postCadastro );

app.post("/", postLogin);

app.post("/nova-transacao/:tipo", async (req, res) => {

    const { tipo } = req.params;

    const { authorization } = req.headers;
    console.log(authorization)

    const token = authorization?.replace("Bearer ", "");
    

    if (!token) return res.sendStatus(401);

    const { valor, description } = req.body;

    const schemaUsuario = Joi.object({
        valor: Joi.number().positive().required(),
        description: Joi.string().required()
    })

    const validation = schemaUsuario.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    const sanitizedValor = stripHtml(valor).result.trim();
    const sanitizedDescription = stripHtml(description).result.trim();


    try {
        const sessao = await db.collection("login").findOne({ token });
        if (!sessao) return res.sendStatus(401);

        const hoje = dayjs();
        const dataFormatada = hoje.format('DD/MM');

        await db.collection("transacoes").insertOne({ valor: sanitizedValor, description: sanitizedDescription, data: dataFormatada, tipo: tipo, idUsuario: sessao.idUsuario });

        res.sendStatus(201);

    } catch (err) {
        res.status(500).send(err.message);
    }
})

app.get("/home", async (req, res) => {

    const { authorization } = req.headers;

    console.log(authorization)

    const token = authorization?.replace("Bearer ", "");
    

    if (!token) return res.sendStatus(401);


    try {

        const sessao = await db.collection("login").findOne({ token });
        console.log(sessao.idUsuario);
        const listaTransacoes = await db.collection("transacoes").find({idUsuario: sessao.idUsuario}).toArray();
        console.log(listaTransacoes)
        
        res.send(listaTransacoes);
    } catch (err) {
        res.status(500).send(err.message);
    }
})


const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`O servidor está rodando na porta ${port}!`));

