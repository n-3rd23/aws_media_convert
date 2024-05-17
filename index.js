require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
  })
);
app.options("*", cors());

app.use("/api", require("./routes"));

app.listen(PORT, () => {
  console.log(`server listening to port ${PORT} 🚀`);
});
