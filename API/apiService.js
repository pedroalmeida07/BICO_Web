const BASE_URL = 'https://archlinux.tailed4748.ts.net/'; // Substitua pela URL da sua API

export const api = {
  criarPrestador: async (dadosPrestador) => {
    const response = await fetch(`${BASE_URL}/prestador`, {
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
  }
};