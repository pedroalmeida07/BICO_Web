const BASE_URL = 'https://archlinux.tailee8728.ts.net/';

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
