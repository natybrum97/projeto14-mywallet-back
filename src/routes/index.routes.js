import { Router } from "express";
import transacoesRouter from "./transacoes.routes.js";
import usuariosRouter from "./usuarios.routes.js";

const router = Router();

router.use(transacoesRouter);
router.use(usuariosRouter);

export default router;