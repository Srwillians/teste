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

    // PASSO 1: Iniciar o fluxo sem 'handler' fixo. 
    // O HA responderá com os handlers disponíveis ou iniciará o padrão.
    const flowRes = await fetch(`${HA_URL}/auth/login_flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: HA_URL + "/",
        redirect_uri: baseRedirect
      })
    });
    
    const responseText = await flowRes.text();
    const flowData = JSON.parse(responseText);

    // Se o HA pedir para escolher um handler (comum em Erro 500 anteriores)
    // nós pegamos o 'flow_id' que ele gerou nesta etapa de escolha.
    const flowId = flowData.flow_id;

    if (!flowId) {
      return res.status(500).send("Erro ao obter Flow ID: " + responseText);
    }

    // PASSO 2: Aqui é onde as informações de login REALMENTE entram.
    // O formulário abaixo envia o usuário e senha para o fluxo que acabamos de abrir.
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
            Validando credenciais para ${config.user}...
          </p>
        </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send("Erro de rede: " + error.message);
  }
});

app.listen(8099, '0.0.0.0', () => console.log("Porteiro Online 1637"));
