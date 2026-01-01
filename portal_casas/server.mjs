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

    // PASSO 2: Tentar autenticar
    const responseAuth = await fetch(`${HA_URL}/auth/login_flow/${flowId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flow_id: flowId,
        user: config.user,     // Algumas versões usam 'user'
        username: config.user, // Outras usam 'username'
        password: config.pass
      })
    });
    
    const authData = await responseAuth.json();
    console.log("Resposta do HA:", JSON.stringify(authData));

    // Se o tipo for 'create_entry', o login funcionou perfeitamente!
    if (authData.type === "create_entry" || authData.result === "success") {
       res.send(`
        <html>
          <body onload="document.forms[0].submit()">
            <form method="POST" action="${HA_URL}/auth/login">
              <input type="hidden" name="handler" value="homeassistant">
              <input type="hidden" name="username" value="${config.user}">
              <input type="hidden" name="password" value="${config.pass}">
              <input type="hidden" name="redirect_uri" value="${config.dash}?kiosk">
            </form>
            <p style="font-family:sans-serif; text-align:center;">Autenticado! Entrando na Dashboard...</p>
          </body>
        </html>
      `);
    } else {
      // Se falhar, vamos mostrar o que o HA respondeu para diagnosticar
      res.status(401).send(`
        <h2>Falha na Autenticação</h2>
        <p>O HA recusou as credenciais para o inquilino: <b>${id}</b></p>
        <p>Usuário tentado: <b>${config.user}</b></p>
        <p>Resposta técnica: <i>${authData.errors ? JSON.stringify(authData.errors) : authData.type}</i></p>
        <hr>
        <p>Dica: Verifique se o nome do usuário está correto em "Configurações > Pessoas" no HA.</p>
      `);
    }

  } catch (error) {
    res.status(500).send("Erro de conexão: " + error.message);
  }
});
