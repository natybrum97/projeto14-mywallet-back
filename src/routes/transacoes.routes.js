import { Router } from "express";
import { deletaTransacao, editaTransacao, novaTransacao, pegarTransacoes, pegarTransacoesPorId } from "../controllers/transacoes.controller.js";

const transacoesRouter = Router();

transacoesRouter.post("/nova-transacao/:tipo", novaTransacao);

transacoesRouter.get("/home", pegarTransacoes);

transacoesRouter.get("/transacao/:id", pegarTransacoesPorId);

transacoesRouter.delete("/home/:id", deletaTransacao);

transacoesRouter.put("/editar-registro/:tipo/:id", editaTransacao);

export default transacoesRouter;

