export function limparTelefone(telefone) {
  return String(telefone || "").replace(/\D/g, "");
}

export function gerarLinkWhatsApp(telefone) {
  let numero = limparTelefone(telefone);

  if (!numero.startsWith("55")) {
    numero = `55${numero}`;
  }

  return `https://wa.me/${numero}`;
}
