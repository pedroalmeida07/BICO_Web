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
    const texto = await response.text();
    if (texto) {
      try {
        const dados = JSON.parse(texto);
        mensagem = dados.message || dados.error || dados.detail || texto;
      } catch {
        mensagem = texto;
      }
    }
  } catch (_) {
    mensagem = `Erro ao ler a resposta de ${tipo}.`;
  }

  const erro = new Error(mensagem);
  erro.status = response.status;
  throw erro;
};

const enviarPrestador = async (token, dadosPrestador) => {
  const response = await fetch(`${BASE_URL}/prestadores`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dadosPrestador),
  });

  if (!response.ok) {
    await tratarErroResponse(response, 'prestador');
  }

  return await response.json();
};

const atualizarFavorito = async (token, prestadorId, method) => {
  const parametros = new URLSearchParams({ id: prestadorId });
  const response = await fetch(`${BASE_URL}/clientes/favoritos?${parametros}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await tratarErroResponse(response, 'favorito');
  }

  return await response.json();
};

export const api = {
  buscarCliente: (token) => buscarPerfil('clientes', token),
  buscarPrestador: (token) => buscarPerfil('prestadores', token),
  buscarPrestadores: async (token, filtros = {}) => {
    const parametros = new URLSearchParams();
    Object.entries(filtros).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        parametros.set(chave, String(valor));
      }
    });
    const query = parametros.toString();
    return buscarPerfil(`prestadores/busca${query ? `?${query}` : ''}`, token);
  },
  buscarFavoritos: (token) => buscarPerfil('clientes/favoritos', token),
  adicionarFavorito: (token, prestadorId) => atualizarFavorito(token, prestadorId, 'PUT'),
  removerFavorito: (token, prestadorId) => atualizarFavorito(token, prestadorId, 'DELETE'),

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
  atualizarPrestador: (token, dadosPrestador) => enviarPrestador(token, dadosPrestador),

  enviarImagem: async (token, arquivo) => {
    const formulario = new FormData();
    formulario.append('file', arquivo);
    const response = await fetch(`${BASE_URL}/uploads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formulario,
    });

    if (!response.ok) {
      await tratarErroResponse(response, 'imagem');
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
