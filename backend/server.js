const express = require('express');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});cd