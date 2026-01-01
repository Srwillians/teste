import express from 'express';
import fetch from 'node-fetch'; // Certifique-se de que o fetch está disponível
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
    // PASSO 1: Iniciar o fluxo de autenticação
    const flowResponse = await fetch(`${HA_URL}/auth/login_flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handler: ["homeassistant", "homeassistant"],
        client_id: HA_URL + "/"
      })
    });
    
    const flowData = await flowResponse.json();
    const flowId = flowData.flow_id;

    // PASSO 2: Enviar as credenciais para o Flow ID gerado
    // Isso evita o erro 404 porque estamos seguindo o protocolo oficial
    res.send(`
      <html>
        <body onload="document.forms[0].submit()">
          <form method="POST" action="${HA_URL}/auth/login_flow/${flowId}">
            <input type="hidden" name="username" value="${config.user}">
            <input type="hidden" name="password" value="${config.pass}">
            <input type="hidden" name="client_id" value="${HA_URL}/">
            <input type="hidden" name="redirect_uri" value="${HA_URL}${config.dash}?kiosk">
          </form>
          <p>Autenticando na ${id}...</p>
        </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send("Erro ao conectar com o HA: " + error.message);
  }
});

app.listen(8099, '0.0.0.0', () => console.log("Servidor Multi-Inquilino Rodando"));
