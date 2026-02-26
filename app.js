// Keep all rows in memory so we can update table and summary easily.
const rows = [];

// Grab elements once to keep code clean and beginner-friendly.
const form = document.getElementById('roas-form');
const channelInput = document.getElementById('channel');
const costInput = document.getElementById('cost');
const revenueInput = document.getElementById('revenue');
const message = document.getElementById('message');
const rowsBody = document.getElementById('rows-body');
const bestChannelEl = document.getElementById('best-channel');
const worstChannelEl = document.getElementById('worst-channel');

/**
 * Round a number to 2 decimals for display.
 */
function roundTo2(value) {
  return Number(value.toFixed(2));
}

/**
 * Validate form values according to the requested rules.
 */
function validateInputs(channel, cost, revenue) {
  if (!channel.trim()) {
    return 'Channel is required.';
  }

  if (Number.isNaN(cost) || cost <= 0) {
    return 'Cost must be a number greater than 0.';
  }

  if (Number.isNaN(revenue) || revenue < 0) {
    return 'Revenue must be a number greater than or equal to 0.';
  }

  return '';
}

/**
 * Render all saved rows in the table.
 */
function renderTable() {
  if (rows.length === 0) {
    rowsBody.innerHTML = '<tr id="empty-row"><td colspan="4">No rows yet. Add your first channel above.</td></tr>';
    return;
  }

  rowsBody.innerHTML = rows
    .map((row) => {
      return `
        <tr>
          <td>${row.channel}</td>
          <td>${row.cost.toFixed(2)}</td>
          <td>${row.revenue.toFixed(2)}</td>
          <td>${row.roas.toFixed(2)}</td>
        </tr>
      `;
    })
    .join('');
}

/**
 * Find and render best/worst channels by ROAS.
 */
function renderSummary() {
  if (rows.length === 0) {
    bestChannelEl.textContent = 'N/A';
    worstChannelEl.textContent = 'N/A';
    return;
  }

  // Initialize with first row and compare each next row.
  let best = rows[0];
  let worst = rows[0];

  rows.forEach((row) => {
    if (row.roas > best.roas) {
      best = row;
    }

    if (row.roas < worst.roas) {
      worst = row;
    }
  });

  bestChannelEl.textContent = `${best.channel} (${best.roas.toFixed(2)})`;
  worstChannelEl.textContent = `${worst.channel} (${worst.roas.toFixed(2)})`;
}

/**
 * Handle form submit: validate, add row, then update UI.
 */
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const channel = channelInput.value;
  const cost = parseFloat(costInput.value);
  const revenue = parseFloat(revenueInput.value);

  const error = validateInputs(channel, cost, revenue);
  if (error) {
    message.textContent = error;
    return;
  }

  const roas = roundTo2(revenue / cost);

  rows.push({
    channel: channel.trim(),
    cost,
    revenue,
    roas,
  });

  message.textContent = '';
  renderTable();
  renderSummary();

  // Reset fields for faster entry of the next row.
  form.reset();
  channelInput.focus();
});
