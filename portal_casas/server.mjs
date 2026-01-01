import express from 'express';
const app = express();

// --- CONFIGURAÇÃO (AJUSTE AQUI) ---
const HA_URL = "http://192.168.2.146:8123"; // O IP do seu Home Assistant

const inquilinos = {
  "casa1": { user: "vsitante1", pass: "12345", dash: "/casa-wem" },
  "casa2": { user: "vsitante2", pass: "12345", dash: "/outra-casa" },
  "casa3": { user: "inquilino3", pass: "senha3", dash: "/lovelace-casa3" },
  "casa4": { user: "inquilino4", pass: "senha4", dash: "/lovelace-casa4" },
  "casa5": { user: "inquilino5", pass: "senha5", dash: "/lovelace-casa5" },
  "casa6": { user: "inquilino6", pass: "senha6", dash: "/lovelace-casa6" }
};
// ---------------------------------

app.get('/login', (req, res) => {
  const id = req.query.id;
  const config = inquilinos[id];

  if (!config) return res.status(404).send("ID de casa inválido.");

  res.send(`
    <html>
      <body onload="document.forms[0].submit()">
        <form method="POST" action="${HA_URL}/auth/login">
          <input type="hidden" name="handler" value="homeassistant">
          <input type="hidden" name="username" value="${config.user}">
          <input type="hidden" name="password" value="${config.pass}">
          <input type="hidden" name="redirect_uri" value="${config.dash}?kiosk">
        </form>
        <p>Entrando na ${id}...</p>
      </body>
    </html>
  `);
});

app.listen(8099, '0.0.0.0', () => {
  console.log("Servidor de Inquilinos rodando na porta 8099");
});

