// Calcula idade a partir de dataNacimento (LocalDate)
function calculateAge(dataNacimento) {
  if (!dataNacimento) return '—';
  const today = new Date();
  const birth = new Date(dataNacimento);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatStatus(statusBloqueio) {
  if (!statusBloqueio) return 'Ativo';
  return statusBloqueio.toString().toUpperCase() === 'BLOQUEIO'
    ? 'Bloqueado'
    : 'Ativo';
}


async function fetchClients() {
  const res = await fetch('http://localhost:8080/clients');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

function createRow(client) {
  const tr = document.createElement('tr');

  const idade = calculateAge(client.dataNacimento);
  const limite = client.limiteCredito != null
    ? Number(client.limiteCredito).toFixed(2)
    : '0.00';

  tr.innerHTML = `
    <td>${client.name}</td>
    <td>${client.cpf}</td>
    <td>${idade}</td>
    <td>${formatStatus(client.statusBloqueio)}</td>
    <td>R$ ${limite}</td>
    <td>
      <button onclick="goToFaturas('${client.id}', '${client.name}')">
        Ver Faturas
      </button>
    </td>
  `;
  return tr;
}

function goToFaturas(clientId, clientName) {
  window.location.href =
    `telaFaturas.html?clientId=${clientId}&clientName=${encodeURIComponent(clientName)}`;
}

(async () => {
  try {
    const clients = await fetchClients();
    const tbody = document.querySelector('#clients-table tbody');
    tbody.innerHTML = '';
    clients.forEach(c => tbody.appendChild(createRow(c)));
  } catch (err) {
    console.error('Erro ao carregar clientes:', err);
    document.body.insertAdjacentHTML(
      'beforeend',
      '<p style="color:red">Falha ao carregar clientes. Veja no console.</p>'
    );
  }
})();
