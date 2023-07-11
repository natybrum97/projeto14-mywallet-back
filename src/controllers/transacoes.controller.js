import { db } from "../database/database.connection.js"
import { stripHtml } from "string-strip-html";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import { schemaUsuario } from "../schemas/transacoes.schemas.js";

export async function novaTransacao (req, res) {

    const { tipo } = req.params;

    const { authorization } = req.headers;
    console.log(authorization)

    const token = authorization?.replace("Bearer ", "");
    

    if (!token) return res.sendStatus(401);

    const { valor, description } = req.body;

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
}

export async function pegarTransacoes (req, res) {

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
}

export async function pegarTransacoesPorId (req, res) {

    const { id } = req.params;

    const { authorization } = req.headers;

    console.log(authorization)

    const token = authorization?.replace("Bearer ", "");
    

    if (!token) return res.sendStatus(401);


    try {

        const atualizar = await db.collection("transacoes").findOne({ _id: new ObjectId(id) });
        if (!atualizar) return res.status(404).send("Essa transação não existe!");
        res.send(atualizar);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function deletaTransacao (req, res) {

	const { id } = req.params;

    const { authorization } = req.headers;

    console.log(authorization);

    const token = authorization?.replace("Bearer ", "");
    

    if (!token) return res.sendStatus(401);

	try {
		const result = await db.collection("transacoes").deleteOne({ _id: new ObjectId(id) })
		if (result.deletedCount === 0) return res.status(404).send("Essa transação não existe!");
		res.status(204).send("Receita deletada com sucesso!");
	} catch (err) {
		res.status(500).send(err.message);
	}
}

export async function editaTransacao (req, res) {

    const { tipo, id } = req.params;

    const { authorization } = req.headers;

    console.log(authorization);

    const token = authorization?.replace("Bearer ", "");
    
    if (!token) return res.sendStatus(401);

	const { valor, description } = req.body;

    const validation = schemaUsuario.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    const sanitizedValor = stripHtml(valor).result.trim();
    const sanitizedDescription = stripHtml(description).result.trim();

	try {
		const result = await db.collection('transacoes').updateOne(
			{ _id: new ObjectId(id) },
			{ $set: { valor: sanitizedValor, description: sanitizedDescription } }
		)
		if (result.matchedCount === 0) return res.status(404).send("Essa transação não existe!");

		res.send("Transação atualizada!");

	} catch (err) {
		res.status(500).send(err.message);
	}
}