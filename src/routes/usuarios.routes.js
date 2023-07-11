import { Router } from "express";
import { postCadastro, postLogin } from "../controllers/usuarios.controller.js";

const usuariosRouter = Router();

usuariosRouter.post("/cadastro", postCadastro );

usuariosRouter.post("/", postLogin);

export default usuariosRouter;