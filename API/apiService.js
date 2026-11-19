const BASE_URL = 'https://archlinux.tailee8728.ts.net';

const buscarPerfil = async (rota, token) => {
  const response = await fetch(`${BASE_URL}/${rota}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await tratarErroResponse(response, rota);
  }

  return await response.json();
};

const tratarErroResponse = async (response, tipo) => {
  let mensagem = `Erro ao processar ${tipo}.`;

  try {
    const dados = await response.json();
    mensagem = dados.message || dados.error || dados.detail || mensagem;
  } catch (_) {
    // Mantém a mensagem padrão quando a resposta não contém JSON.
  }

  const erro = new Error(mensagem);
  erro.status = response.status;
  throw erro;
};

export const api = {
  buscarCliente: (token) => buscarPerfil('clientes', token),
  buscarPrestador: (token) => buscarPerfil('prestadores', token),

  criarPrestador: async (dadosPrestador) => {
    const response = await fetch(`${BASE_URL}/prestadores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosPrestador),
    });

    if (!response.ok) {
      await tratarErroResponse(response, 'prestador');
    }

    return await response.json();
  },

  criarCliente: async (dadosCliente) => {
    const response = await fetch(`${BASE_URL}/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosCliente),
    });

    if (!response.ok) {
      await tratarErroResponse(response, 'cliente');
    }

    return await response.json();
  }
};
