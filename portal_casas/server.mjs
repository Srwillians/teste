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
  if (!config) return res.status(404).send("Inquilino nao encontrado");

  try {
    const baseRedirect = `${HA_URL}${config.dash}`;

    // PASSO 1: Pedir o Flow ID com o formato de lista EXATO que o HA pediu
    const flowRes = await fetch(`${HA_URL}/auth/login_flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handler: ["homeassistant"], // O HA confirmou que quer uma lista []
        client_id: HA_URL + "/",
        redirect_uri: baseRedirect
      })
    });
    
    const responseText = await flowRes.text();

    if (!flowRes.ok) {
      return res.status(flowRes.status).send(`Erro no HA (${flowRes.status}): ${responseText}`);
    }

    const flowData = JSON.parse(responseText);
    const flowId = flowData.flow_id;

    // PASSO 2: O formulário que finaliza o login no navegador do usuário
    res.send(`
      <html>
        <head><meta charset="utf-8"></head>
        <body onload="document.forms[0].submit()" style="font-family:sans-serif; text-align:center; padding-top:100px;">
          <h2>Conectando à unidade ${id}...</h2>
          
          <form method="POST" action="${HA_URL}/auth/login_flow/${flowId}">
            <input type="hidden" name="username" value="${config.user}">
            <input type="hidden" name="password" value="${config.pass}">
            <input type="hidden" name="client_id" value="${HA_URL}/">
            <input type="hidden" name="redirect_uri" value="${baseRedirect}?kiosk">
          </form>
        </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send("Erro de rede: " + error.message);
  }
});

app.listen(8099, '0.0.0.0', () => console.log("Servidor Multi-Casa Ativo 1631"));
