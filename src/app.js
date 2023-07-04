import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

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


const PORT = 5000;
app.listen(PORT, () => console.log(`O servidor está rodando na porta ${PORT}!`))

app.get("/oi", (req,res) => {
    res.send("Oi Nat");
});