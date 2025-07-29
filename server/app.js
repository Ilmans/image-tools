const express = require("express");
const cors = require("cors");
const convertRoute = require("./routes/convert");
const imageBgEditor = require("./routes/imageBgEditor");
const app = express();
app.use(cors());
app.use("/api/conver", convertRoute);
app.use("/api/image-bg", imageBgEditor);

app.listen(3100, () => console.log("Server running on http://localhost:3100"));
