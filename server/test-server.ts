import express from "express";
const app = express();
app.get("/", (req, res) => {
    console.log("? Someone accessed the server!");
    res.json({ 
        message: "TEST - Server IS working!",
        timestamp: new Date().toISOString()
    });
});
const PORT = 5001; // Using different port
app.listen(PORT, () => {
    console.log(`?? SERVER STARTED on http://localhost:${PORT}`);
    console.log(`? Time: ${new Date().toLocaleTimeString()}`);
});
