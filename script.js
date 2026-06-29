let contatos = [];
let indiceAtual = 0;
let campanhaAtual = {};

function limparTelefone(telefone) {
  return telefone.replace(/\D/g, "");
}

function formatarWhatsApp(telefone) {
  let numero = limparTelefone(telefone);

  if (!numero.startsWith("55")) {
    numero = "55" + numero;
  }

  return numero;
}

function iniciarCampanha() {
  const cidade = document.getElementById("cidade").value;
  const campanha = document.getElementById("campanha").value;
  const responsavel = document.getElementById("responsavel").value.trim();
  const listaTexto = document.getElementById("lista").value.trim();

  if (!responsavel || !listaTexto) {
    alert("Preencha o responsável e cole a lista de contatos.");
    return;
  }

  contatos = listaTexto
    .split("\n")
    .map(linha => linha.trim())
    .filter(linha => linha.length > 0)
    .map(linha => {
      const partes = linha.split(";");
      return {
        nome: partes[0]?.trim() || "Sem nome",
        telefone: partes[1]?.trim() || "",
        resultado: "",
        observacao: "",
        data: ""
      };
    })
    .filter(contato => contato.telefone);

  if (contatos.length === 0) {
    alert("Nenhum contato válido encontrado.");
    return;
  }

  campanhaAtual = {
    cidade,
    campanha,
    responsavel,
    inicio: new Date().toLocaleString("pt-BR")
  };

  indiceAtual = 0;
  salvarLocal();
  mostrarDiscador();
}

function mostrarDiscador() {
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("relatorio").classList.add("hidden");
  document.getElementById("discador").classList.remove("hidden");

  const contato = contatos[indiceAtual];

  if (!contato) {
    verRelatorio();
    return;
  }

  document.getElementById("nomeContato").innerText = contato.nome;
  document.getElementById("telefoneContato").innerText = contato.telefone;
  document.getElementById("infoCampanha").innerText =
    `${campanhaAtual.cidade} • ${campanhaAtual.campanha} • ${campanhaAtual.responsavel}`;

  document.getElementById("progresso").innerText =
    `Contato ${indiceAtual + 1} de ${contatos.length}`;

  document.getElementById("resultado").value = contato.resultado || "";
  document.getElementById("observacao").value = contato.observacao || "";

  const numeroWhats = formatarWhatsApp(contato.telefone);
  document.getElementById("abrirWhatsapp").href = `https://wa.me/${numeroWhats}`;
}

function salvarEProximo() {
  const resultado = document.getElementById("resultado").value;
  const observacao = document.getElementById("observacao").value.trim();

  if (!resultado) {
    alert("Selecione um resultado antes de avançar.");
    return;
  }

  contatos[indiceAtual].resultado = resultado;
  contatos[indiceAtual].observacao = observacao;
  contatos[indiceAtual].data = new Date().toLocaleString("pt-BR");

  indiceAtual++;
  salvarLocal();

  if (indiceAtual >= contatos.length) {
    verRelatorio();
  } else {
    mostrarDiscador();
  }
}

function verRelatorio() {
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("discador").classList.add("hidden");
  document.getElementById("relatorio").classList.remove("hidden");

  const total = contatos.length;
  const finalizados = contatos.filter(c => c.resultado).length;
  const agendou = contatos.filter(c => c.resultado === "Agendou").length;
  const interessados = contatos.filter(c => c.resultado === "Interessado").length;
  const semInteresse = contatos.filter(c => c.resultado === "Sem interesse").length;
  const naoRespondeu = contatos.filter(c => c.resultado === "Não respondeu").length;
  const conversao = total > 0 ? ((agendou / total) * 100).toFixed(1) : 0;

  document.getElementById("resumo").innerHTML = `
    <p><strong>Cidade:</strong> ${campanhaAtual.cidade}</p>
    <p><strong>Campanha:</strong> ${campanhaAtual.campanha}</p>
    <p><strong>Responsável:</strong> ${campanhaAtual.responsavel}</p>
    <hr>
    <p><strong>Total da lista:</strong> ${total}</p>
    <p><strong>Finalizados:</strong> ${finalizados}</p>
    <p><strong>Agendou:</strong> ${agendou}</p>
    <p><strong>Interessados:</strong> ${interessados}</p>
    <p><strong>Não respondeu:</strong> ${naoRespondeu}</p>
    <p><strong>Sem interesse:</strong> ${semInteresse}</p>
    <p><strong>Conversão:</strong> ${conversao}%</p>
  `;
}

function baixarCSV() {
  let csv = "Cidade;Campanha;Responsavel;Nome;Telefone;Resultado;Observacao;Data\n";

  contatos.forEach(c => {
    csv += `${campanhaAtual.cidade};${campanhaAtual.campanha};${campanhaAtual.responsavel};${c.nome};${c.telefone};${c.resultado};${c.observacao};${c.data}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = `relatorio-discov-${campanhaAtual.cidade}-${campanhaAtual.campanha}.csv`;
  link.click();
}

function salvarLocal() {
  localStorage.setItem("discov_contatos", JSON.stringify(contatos));
  localStorage.setItem("discov_indice", indiceAtual);
  localStorage.setItem("discov_campanha", JSON.stringify(campanhaAtual));
}

function continuarCampanha() {
  const contatosSalvos = localStorage.getItem("discov_contatos");
  const indiceSalvo = localStorage.getItem("discov_indice");
  const campanhaSalva = localStorage.getItem("discov_campanha");

  if (!contatosSalvos || !campanhaSalva) {
    alert("Nenhuma campanha salva encontrada.");
    return;
  }

  contatos = JSON.parse(contatosSalvos);
  indiceAtual = Number(indiceSalvo || 0);
  campanhaAtual = JSON.parse(campanhaSalva);

  mostrarDiscador();
}

function novaCampanha() {
  if (!confirm("Deseja iniciar uma nova campanha? Isso apaga o progresso salvo neste navegador.")) {
    return;
  }

  localStorage.removeItem("discov_contatos");
  localStorage.removeItem("discov_indice");
  localStorage.removeItem("discov_campanha");

  contatos = [];
  indiceAtual = 0;
  campanhaAtual = {};

  document.getElementById("setup").classList.remove("hidden");
  document.getElementById("discador").classList.add("hidden");
  document.getElementById("relatorio").classList.add("hidden");
}
