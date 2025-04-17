import expres, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
dotenv.config();
const app = expres();
const PORT = process.env.PORT || 3000;

// middleware
app.use(expres.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.listen(PORT, () => {
  connectDB();
  console.log(`server is listening at ${PORT}`);
});
