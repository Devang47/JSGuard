import express from "express";
import { analyzeCode } from "./main.js";

const app = express();
app.use(express.json());

app.post("/analyze", (req, res) => {
  const { code } = req.body;
  if (typeof code !== "string") {
    return res
      .status(400)
      .json({ error: 'Request body must include a "code" string property' });
  }
  const issues = analyzeCode(code);
  return res.status(200).json({ issues });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`JSGuard API listening on port ${port}`);
});
