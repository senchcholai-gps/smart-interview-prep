import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => res.json({status: "CLEAN SERVER OK"}));
app.listen(5003, () => console.log("? Clean server on 5003"));
