const CHAVE = "discov_campanha_atual";

export function salvarCampanha(dados) {
  localStorage.setItem(CHAVE, JSON.stringify(dados));
}

export function carregarCampanha() {
  const dados = localStorage.getItem(CHAVE);
  return dados ? JSON.parse(dados) : null;
}

export function apagarCampanha() {
  localStorage.removeItem(CHAVE);
}
