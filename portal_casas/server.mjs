import express from 'express';
const app = express();

const HA_URL = "http://192.168.2.146:8123";

const inquilinos = {
  "casa1": { user: "visitante1", pass: "12345", dash: "/casa-wem" }
};

app.get('/login', async (req, res) => {
  const id = req.query.id;
  const config = inquilinos[id];
  if (!config) return res.status(404).send("ID nao encontrado");

  try {
    const baseRedirect = `${HA_URL}${config.dash}`;

    // PASSO 1: Pedir o Flow ID
   // PASSO 1: Pedir o Flow ID com o formato simplificado que evita o Erro 500
    const flowRes = await fetch(`${HA_URL}/auth/login_flow`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        handler: "homeassistant", // String simples, não array
        client_id: HA_URL + "/",
        redirect_uri: baseRedirect
      })
    });
    
    const responseText = await flowRes.text();

    if (!flowRes.ok) {
      return res.status(flowRes.status).send(`O HA negou o acesso (Erro ${flowRes.status}): ${responseText}`);
    }

    const flowData = JSON.parse(responseText);
    const flowId = flowData.flow_id;

    // PASSO 2: Formulário
    res.send(`
      <html>
        <body onload="document.forms[0].submit()">
          <form method="POST" action="${HA_URL}/auth/login_flow/${flowId}">
            <input type="hidden" name="username" value="${config.user}">
            <input type="hidden" name="password" value="${config.pass}">
            <input type="hidden" name="client_id" value="${HA_URL}/">
            <input type="hidden" name="redirect_uri" value="${baseRedirect}?kiosk">
          </form>
          <p>Autenticando...</p>
        </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send("Erro de conexão: " + error.message);
  }
});

app.listen(8099, '0.0.0.0', () => console.log("Online na 8099 1626"));

