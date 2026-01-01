import express from 'express';
const app = express();

const HA_URL = "http://192.168.2.146:8123";

const inquilinos = {
  "casa1": { user: "visitante1", dash: "/casa-wem" },
  "casa2": { user: "visitante2", dash: "/outra-casa" }
};

app.get('/login', async (req, res) => {
  const id = req.query.id;
  const config = inquilinos[id];
  if (!config) return res.status(404).send("Inquilino nao encontrado");

  try {
    const finalRedirect = `${HA_URL}${config.dash}?kiosk`;

    // PASSO 1: Inicia o fluxo de login
    const flowRes = await fetch(`${HA_URL}/auth/login_flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handler: ["trusted_networks", "trusted_networks"],
        client_id: HA_URL + "/",
        redirect_uri: finalRedirect
      })
    });

    const flowData = await flowRes.json();
    const flowId = flowData.flow_id;

    // PASSO 2: Envia a escolha do usuário DIRETO para o fluxo aberto
    // É aqui que o "clique" é simulado
    res.send(`
      <html>
        <body onload="document.forms[0].submit()">
          <form method="POST" action="${HA_URL}/auth/login_flow/${flowId}">
            <input type="hidden" name="user" value="${config.user}">
            <input type="hidden" name="client_id" value="${HA_URL}/">
            <input type="hidden" name="redirect_uri" value="${finalRedirect}">
          </form>
          <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
            <h2>Autenticando Unidade ${id}...</h2>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send("Erro: " + error.message);
  }
});

app.listen(8099, '0.0.0.0', () => console.log("Login Automático Ativo"));
