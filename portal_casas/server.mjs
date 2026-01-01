import express from 'express';
const app = express();

const HA_URL = "http://192.168.2.146:8123";

const inquilinos = {
  "casa1": { user: "visitante1", pass: "12345", dash: "/casa-wem" },
  "casa2": { user: "visitante2", pass: "12345", dash: "/outra-casa" }
};

app.get('/login', async (req, res) => {
  const id = req.query.id;
  const config = inquilinos[id];

  if (!config) return res.status(404).send("ID nao encontrado");

  try {
    // PASSO 1: Pedir o Flow ID (Corrigido com client_id no corpo)
    const flowRes = await fetch(`${HA_URL}/auth/login_flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handler: ["homeassistant", "homeassistant"],
        client_id: HA_URL + "/"  // O HA exige que isso seja enviado aqui!
      })
    });
    
    const flowData = await flowRes.json();
    const flowId = flowData.flow_id;

    if (!flowId) {
      console.error("Erro do HA:", flowData);
      return res.status(500).send("Erro ao gerar fluxo de login. Verifique o log do HA.");
    }

    // PASSO 2: Formulário que o navegador enviará
    res.send(`
      <html>
        <head><meta charset="utf-8"></head>
        <body onload="document.forms[0].submit()" style="font-family:sans-serif; text-align:center; padding-top:100px;">
          <h2>Autenticando na ${id}...</h2>
          
          <form method="POST" action="${HA_URL}/auth/login_flow/${flowId}">
            <input type="hidden" name="username" value="${config.user}">
            <input type="hidden" name="password" value="${config.pass}">
            <input type="hidden" name="client_id" value="${HA_URL}/">
            <input type="hidden" name="redirect_uri" value="${HA_URL}${config.dash}?kiosk">
          </form>
        </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send("Erro interno: " + error.message);
  }
});

app.listen(8099, '0.0.0.0', () => console.log("Servidor Multi-Casa Ativo 15:53"));
