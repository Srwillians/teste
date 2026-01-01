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

    const flowRes = await fetch(`${HA_URL}/auth/login_flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handler: "homeassistant",
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

    // Se chegamos aqui, o flowId existe!
    // Agora o navegador faz o POST final das credenciais
    res.send(`
      <html>
        <body onload="document.forms[0].submit()">
          <form method="POST" action="${HA_URL}/auth/login_flow/${flowId}">
            <input type="hidden" name="username" value="${config.user}">
            <input type="hidden" name="password" value="${config.pass}">
            <input type="hidden" name="client_id" value="${HA_URL}/">
            <input type="hidden" name="redirect_uri" value="${baseRedirect}?kiosk">
          </form>
          <div style="text-align:center;margin-top:50px;font-family:sans-serif;">
            <p>Conectando à unidade ${id}...</p>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send("Erro de rede: " + error.message);
  }
});

app.listen(8099, '0.0.0.0', () => console.log("Porteiro Multi-Inquilino Online 1627"));
