const BASE_URL = 'https://archlinux.tailed4748.ts.net';

export const api = {
  criarPrestador: async (dadosPrestador) => {
    const response = await fetch(`${BASE_URL}/prestadores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosPrestador),
    });

    if (!response.ok) {
      const erro = await response.json().catch(() => ({}));
      throw new Error(erro.message || 'Erro ao realizar o cadastro do prestador.');
    }

    return await response.json();
  }, // <-- 1. Vírgula adicionada aqui

  criarCliente: async (dadosCliente) => {
    const response = await fetch(`${BASE_URL}/clientes`, { // <-- 2. Rota alterada para /clientes
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosCliente), // <-- 3. Variável corrigida para dadosCliente
    });

    if (!response.ok) {
      const erro = await response.json().catch(() => ({}));
      throw new Error(erro.message || 'Erro ao realizar o cadastro do cliente.');
    }

    return await response.json();
  }
};