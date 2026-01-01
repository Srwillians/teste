import express from 'express';
// O Node 18+ já tem fetch nativo, não precisa de import externo.
const app = express();

const HA_URL = "http://192.168.2.146:8123";

const inquilinos = {
  "casa1": { user: "visitante1", pass: "12345", dash: "/casa-wem" },
  "casa2": { user: "visitante2", pass: "12345", dash: "/outra-casa" }
};

app.get('/login', async (req, res) => {
  const id = req.query.id;
  const config = inquilinos[id];

  if (!config) return res.status(404).send("ID não encontrado");

  try {
    // PASSO 1: Iniciar o fluxo
    const responseFlow = await fetch(`${HA_URL}/auth/login_flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: HA_URL + "/", handler: ["homeassistant", "homeassistant"] })
    });
    const flowData = await responseFlow.json();
    const flowId = flowData.flow_id;

    // PASSO 2: Validar credenciais via JSON (O segredo está aqui)
    const responseAuth = await fetch(`${HA_URL}/auth/login_flow/${flowId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: config.user,
        password: config.pass
      })
    });
    const authData = await responseAuth.json();

    // Se o HA retornou um código de autorização, montamos o formulário de redirecionamento final
    if (authData.result === "success" || authData.type === "create_entry") {
       // O HA logou com sucesso internamente, agora precisamos que o navegador do usuário receba o cookie
       res.send(`
        <html>
          <body onload="document.forms[0].submit()">
            <form method="POST" action="${HA_URL}/auth/login">
              <input type="hidden" name="handler" value="homeassistant">
              <input type="hidden" name="username" value="${config.user}">
              <input type="hidden" name="password" value="${config.pass}">
              <input type="hidden" name="redirect_uri" value="${HA_URL}${config.dash}?kiosk">
            </form>
            <p>Redirecionando para a Dashboard...</p>
          </body>
        </html>
      `);
    } else {
      res.status(401).send("Falha na autenticação: Verifique usuário e senha no server.mjs");
    }

  } catch (error) {
    console.error(error);
    res.status(500).send("Erro de conexão: " + error.message);
  }
});

app.listen(8099, '0.0.0.0', () => console.log("Servidor Multi-Inquilino v2 Rodando 15:31"));

