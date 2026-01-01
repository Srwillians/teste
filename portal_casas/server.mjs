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
  if (!config) return res.status(404).send("Inquilino não encontrado");

  try {
    const baseRedirect = `${HA_URL}${config.dash}`;

    // PASSO 1: Iniciar o fluxo com o handler no formato de lista simples
// PASSO 1: Lista de 2 itens exigida, mas com o par Provedor + Método
    const flowRes = await fetch(`${HA_URL}/auth/login_flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handler: ["homeassistant", "homeassistant"], // Voltamos para 2 itens
        client_id: HA_URL + "/",
        redirect_uri: baseRedirect
      })
    });
    
    const responseText = await flowRes.text();
    const flowData = JSON.parse(responseText);
    const flowId = flowData.flow_id;

    if (!flowId) {
      return res.status(500).send("Erro ao obter Flow ID: " + responseText);
    }

    // PASSO 2: O formulário que "digita" os dados para o usuário
    res.send(`
      <html>
        <body onload="document.forms[0].submit()">
          <form method="POST" action="${HA_URL}/auth/login_flow/${flowId}">
            <input type="hidden" name="username" value="${config.user}">
            <input type="hidden" name="password" value="${config.pass}">
            <input type="hidden" name="client_id" value="${HA_URL}/">
            <input type="hidden" name="redirect_uri" value="${baseRedirect}?kiosk">
          </form>
          <p style="text-align:center; font-family:sans-serif; margin-top:50px;">
            Entrando na unidade ${id}...
          </p>
        </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send("Erro de rede: " + error.message);
  }
});

app.listen(8099, '0.0.0.0', () => console.log("Porteiro v10 Ativo 16:39"));

