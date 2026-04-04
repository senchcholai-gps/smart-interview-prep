import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.json({ 
        message: "? WORKING! No MongoDB dependency",
        status: "online"
    });
});
const PORT = 5002;
app.listen(PORT, () => {
    console.log(`?? Server 100% WORKING on http://localhost:${PORT}`);
});
