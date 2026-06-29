import "./style.css";
import { cidades, campanhas, resultados } from "./data.js";
import { gerarLinkWhatsApp } from "./whatsapp.js";
import { salvarCampanha, carregarCampanha, apagarCampanha } from "./storage.js";

let estado = {
  cidade: "",
  campanha: "",
  responsavel: "",
  contatos: [],
  indiceAtual: 0,
  inicio: ""
};

const app = document.querySelector("#app");

function renderSetup() {
  app.innerHTML = `
    <main class="app">
      <section class="card">
        <div class="brand">
          <div class="logo">D</div>
          <div>
            <h1>DISCOV</h1>
            <p>Discador WhatsApp Top</p>
          </div>
        </div>

        <label>Cidade</label>
        <select id="cidade">
          ${cidades.map(cidade => `<option>${cidade}</option>`).join("")}
        </select>

        <label>Campanha</label>
        <select id="campanha">
          ${campanhas.map(campanha => `<option>${campanha}</option>`).join("")}
        </select>

        <label>Responsável</label>
        <input id="responsavel" placeholder="Nome da recepcionista" />

        <label>Lista de contatos</label>
        <textarea id="lista" placeholder="Cole assim:
Maria Silva;54999999999
João Pereira;54988888888
Ana Costa;54977777777"></textarea>

        <button id="iniciar">Iniciar lista</button>
        <button id="continuar" class="secondary">Continuar campanha</button>
      </section>
    </main>
  `;

  document.querySelector("#iniciar").addEventListener("click", iniciarCampanha);
  document.querySelector("#continuar").addEventListener("click", continuarCampanha);
}

function iniciarCampanha() {
  const cidade = document.querySelector("#cidade").value;
  const campanha = document.querySelector("#campanha").value;
  const responsavel = document.querySelector("#responsavel").value.trim();
  const lista = document.querySelector("#lista").value.trim();

  if (!responsavel || !lista) {
    alert("Preencha o responsável e cole a lista de contatos.");
    return;
  }

  const contatos = lista
    .split("\n")
    .map(linha => linha.trim())
    .filter(Boolean)
    .map(linha => {
      const [nome, telefone, origem = "", observacaoInicial = ""] = linha.split(";");

      return {
        nome: nome?.trim() || "Sem nome",
        telefone: telefone?.trim() || "",
        origem: origem?.trim() || "",
        observacaoInicial: observacaoInicial?.trim() || "",
        resultado: "",
        observacao: "",
        dataContato: ""
      };
    })
    .filter(contato => contato.telefone);

  if (contatos.length === 0) {
    alert("Nenhum contato válido encontrado.");
    return;
  }

  estado = {
    cidade,
    campanha,
    responsavel,
    contatos,
    indiceAtual: 0,
    inicio: new Date().toLocaleString("pt-BR")
  };

  salvarCampanha(estado);
  renderDiscador();
}

function continuarCampanha() {
  const campanhaSalva = carregarCampanha();

  if (!campanhaSalva) {
    alert("Nenhuma campanha salva encontrada.");
    return;
  }

  estado = campanhaSalva;
  renderDiscador();
}

function renderDiscador() {
  const contato = estado.contatos[estado.indiceAtual];

  if (!contato) {
    renderRelatorio();
    return;
  }

  app.innerHTML = `
    <main class="app">
      <section class="card discador">
        <div class="topbar">
          <span>${estado.cidade}</span>
          <span>${estado.campanha}</span>
        </div>

        <p class="contador">Contato ${estado.indiceAtual + 1} de ${estado.contatos.length}</p>

        <h2>${contato.nome}</h2>
        <p class="telefone">${contato.telefone}</p>

        ${
          contato.origem
            ? `<p class="muted"><strong>Origem:</strong> ${contato.origem}</p>`
            : ""
        }

        ${
          contato.observacaoInicial
            ? `<p class="muted"><strong>Obs. inicial:</strong> ${contato.observacaoInicial}</p>`
            : ""
        }

        <a class="whatsapp" href="${gerarLinkWhatsApp(contato.telefone)}" target="_blank">
          Abrir WhatsApp
        </a>

        <label>Resultado</label>
        <select id="resultado">
          <option value="">Selecione</option>
          ${resultados
            .map(resultado => `
              <option ${contato.resultado === resultado ? "selected" : ""}>
                ${resultado}
              </option>
            `)
            .join("")}
        </select>

        <label>Observações</label>
        <textarea id="observacao" placeholder="Digite uma observação...">${contato.observacao || ""}</textarea>

        <button id="proximo">Salvar e próximo</button>
        <button id="relatorio" class="secondary">Ver relatório</button>
      </section>
    </main>
  `;

  document.querySelector("#proximo").addEventListener("click", salvarEProximo);
  document.querySelector("#relatorio").addEventListener("click", renderRelatorio);
}

function salvarEProximo() {
  const resultado = document.querySelector("#resultado").value;
  const observacao = document.querySelector("#observacao").value.trim();

  if (!resultado) {
    alert("Selecione um resultado antes de avançar.");
    return;
  }

  estado.contatos[estado.indiceAtual].resultado = resultado;
  estado.contatos[estado.indiceAtual].observacao = observacao;
  estado.contatos[estado.indiceAtual].dataContato = new Date().toLocaleString("pt-BR");

  estado.indiceAtual += 1;

  salvarCampanha(estado);
  renderDiscador();
}

function renderRelatorio() {
  const total = estado.contatos.length;
  const finalizados = estado.contatos.filter(c => c.resultado).length;
  const agendou = estado.contatos.filter(c => c.resultado === "Agendou").length;
  const interessados = estado.contatos.filter(c => c.resultado === "Interessado").length;
  const semInteresse = estado.contatos.filter(c => c.resultado === "Sem interesse").length;
  const naoRespondeu = estado.contatos.filter(c => c.resultado === "Não respondeu").length;
  const conversao = total ? ((agendou / total) * 100).toFixed(1) : "0.0";

  app.innerHTML = `
    <main class="app">
      <section class="card">
        <h2>Relatório</h2>

        <div class="report">
          <p><strong>Cidade:</strong> ${estado.cidade}</p>
          <p><strong>Campanha:</strong> ${estado.campanha}</p>
          <p><strong>Responsável:</strong> ${estado.responsavel}</p>
          <hr>
          <p><strong>Total:</strong> ${total}</p>
          <p><strong>Finalizados:</strong> ${finalizados}</p>
          <p><strong>Agendou:</strong> ${agendou}</p>
          <p><strong>Interessados:</strong> ${interessados}</p>
          <p><strong>Não respondeu:</strong> ${naoRespondeu}</p>
          <p><strong>Sem interesse:</strong> ${semInteresse}</p>
          <p><strong>Conversão:</strong> ${conversao}%</p>
        </div>

        <button id="csv">Baixar CSV</button>
        <button id="voltar" class="secondary">Voltar ao discador</button>
        <button id="nova" class="danger">Nova campanha</button>
      </section>
    </main>
  `;

  document.querySelector("#csv").addEventListener("click", baixarCSV);
  document.querySelector("#voltar").addEventListener("click", renderDiscador);
  document.querySelector("#nova").addEventListener("click", novaCampanha);
}

function baixarCSV() {
  let csv = "Cidade;Campanha;Responsavel;Nome;Telefone;Origem;Resultado;Observacao;Data\n";

  estado.contatos.forEach(contato => {
    csv += [
      estado.cidade,
      estado.campanha,
      estado.responsavel,
      contato.nome,
      contato.telefone,
      contato.origem,
      contato.resultado,
      contato.observacao,
      contato.dataContato
    ].join(";") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = `relatorio-discov-${estado.cidade}-${estado.campanha}.csv`;
  link.click();
}

function novaCampanha() {
  const confirmar = confirm("Deseja iniciar uma nova campanha? O progresso salvo será apagado.");

  if (!confirmar) return;

  apagarCampanha();
  renderSetup();
}

renderSetup();
