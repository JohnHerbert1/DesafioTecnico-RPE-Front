// --- faturasScript.js ---

const params     = new URLSearchParams(window.location.search);
const clientId   = params.get('clientId');
const clientName = params.get('clientName');
document.getElementById('title')
        .textContent = `Faturas de ${clientName}`;

function formatDate(d) {
  if (!d) return '-';
  const dt = new Date(d);
  return isNaN(dt) ? '–' : dt.toLocaleDateString('pt-BR');
}

// mapeia B → Aberto, A → Atrasado, P → Pago
function formatStatusFatura(code) {
  switch ((code || '').toString().toUpperCase()) {
    case 'B': return 'Aberto';
    case 'A': return 'Atrasado';
    case 'P': return 'Pago';
    default:  return '–';
  }
}

async function fetchFaturas() {
  const res = await fetch(`http://localhost:8080/faturas/clients/${clientId}`);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

async function registerPayment(id) {
  const res = await fetch(`http://localhost:8080/faturas/${id}/pay`, { method: 'POST' });
  if (!res.ok) {
    const txt = await res.text();
    return alert(`Erro ao registrar pagamento (${res.status}): ${txt}`);
  }
  alert('Pagamento registrado!');
  loadFaturas();
}

function createRow(f) {
  const valor = f.valor != null
    ? Number(f.valor).toFixed(2)
    : '0.00';

  const statusText = formatStatusFatura(f.statusFatura);

  return `
    <tr>
      <td>R$ ${valor}</td>
      <td>${formatDate(f.dataVencimento)}</td>
      <td>${statusText}</td>
      <td>${f.dataPagamento ? formatDate(f.dataPagamento) : '-'}</td>
      <td>
        ${statusText !== 'Pago'
          ? `<button onclick="registerPayment('${f.id}')">Registrar pagamento</button>`
          : '-'
        }
      </td>
    </tr>
  `;
}

async function loadFaturas() {
  try {
    const faturas = await fetchFaturas();
    const tbody = document.querySelector('#faturas-table tbody');
    tbody.innerHTML = faturas.map(createRow).join('');
  } catch (e) {
    console.error(e);
    document.body.insertAdjacentHTML(
      'beforeend',
      `<p style="color:red">Falha ao carregar faturas:<br>${e.message}</p>`
    );
  }
}

function goBack() {
  window.location.href = 'telaClients.html';
}

// dispara o carregamento
loadFaturas();
