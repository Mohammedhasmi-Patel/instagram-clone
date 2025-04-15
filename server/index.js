import expres, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = expres();

// middleware
app.use(expres.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

app.use({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`server is listening at ${PORT}`);
});
