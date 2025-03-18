const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http"); // Required to create an HTTP server
const { Server } = require("socket.io"); // Socket.IO server
const api_routes = require("./src/routes/api");
const config = require("./config");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const { startDiscordClient } = require("./src/extensions/discordBot");
const PORT = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  express.static(
    path.join(__dirname, "src/public") , {
    setHeaders: (res, filePath) => {
      const fileExtension = path.extname(filePath);

      // Apply specific cache durations for different file types
      if (
        [
          ".js",
          ".css",
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".svg",
          ".ico",
        ].includes(fileExtension)
      ) {
        res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year for static assets
      } else {
        res.setHeader("Cache-Control", "public, max-age=3600"); // 1 hour for others
      }
    },
  })
  
);

app.use("/api", api_routes);

startDiscordClient(io);
io.on("connection", (socket) => {
  console.log(`New connection established: ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`Disconnected: ${reason}`);
  });
});
app.get("/docs/api", (req, res) => {
  res.render("apiDocs");
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/transaction/:txid", (req, res) => {
  res.render("transaction", { txid: req.params.txid });
});

app.get("/users/:username", (req, res) => {
  res.render("users", { username: req.params.username });
});

app.get("/eror", (req, res) => {
  res.render("eror");
});
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${config.expressPort}`);
});
