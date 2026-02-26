// Keep rows in memory so rendering stays simple.
const rows = [];

// Sorting + editing state.
let sortDescending = true;
let editingRowId = null;

// Unique id counter so each row can be edited/deleted reliably.
let nextId = 1;

// Grab all useful DOM nodes once.
const form = document.getElementById('roas-form');
const channelInput = document.getElementById('channel');
const costInput = document.getElementById('cost');
const revenueInput = document.getElementById('revenue');
const message = document.getElementById('message');
const rowsBody = document.getElementById('rows-body');
const bestChannelEl = document.getElementById('best-channel');
const worstChannelEl = document.getElementById('worst-channel');
const totalCostEl = document.getElementById('total-cost');
const totalRevenueEl = document.getElementById('total-revenue');
const overallRoasEl = document.getElementById('overall-roas');
const sortButton = document.getElementById('sort-button');
const copySummaryButton = document.getElementById('copy-summary');
const exportCsvButton = document.getElementById('export-csv');

/**
 * Validate row values and return an error text (or empty string if valid).
 */
function validateInputs(channel, cost, revenue) {
  if (!channel.trim()) return 'Channel is required.';
  if (Number.isNaN(cost) || cost <= 0) return 'Cost must be a number greater than 0.';
  if (Number.isNaN(revenue) || revenue < 0) return 'Revenue must be a number greater than or equal to 0.';
  return '';
}

/**
 * Safe numeric formatter for table and totals.
 */
function format2(value) {
  return value.toFixed(2);
}

/**
 * Return sorted copy of rows based on ROAS toggle.
 */
function getSortedRows() {
  return [...rows].sort((a, b) => {
    if (sortDescending) return b.roas - a.roas;
    return a.roas - b.roas;
  });
}

/**
 * Calculate totals for cost/revenue and overall ROAS.
 */
function calculateTotals() {
  const totals = rows.reduce(
    (acc, row) => {
      acc.cost += row.cost;
      acc.revenue += row.revenue;
      return acc;
    },
    { cost: 0, revenue: 0 }
  );

  const overallRoas = totals.cost > 0 ? totals.revenue / totals.cost : 0;

  return {
    totalCost: totals.cost,
    totalRevenue: totals.revenue,
    overallRoas,
  };
}

/**
 * Find best and worst channels based on ROAS.
 */
function getBestWorst() {
  if (rows.length === 0) {
    return {
      best: null,
      worst: null,
    };
  }

  let best = rows[0];
  let worst = rows[0];

  rows.forEach((row) => {
    if (row.roas > best.roas) best = row;
    if (row.roas < worst.roas) worst = row;
  });

  return { best, worst };
}

/**
 * Render table rows. Supports inline editing.
 */
function renderTable() {
  const sortedRows = getSortedRows();

  if (sortedRows.length === 0) {
    rowsBody.innerHTML = '<tr id="empty-row"><td colspan="5">No rows yet. Add your first channel above.</td></tr>';
    return;
  }

  rowsBody.innerHTML = sortedRows
    .map((row) => {
      const isEditing = editingRowId === row.id;

      if (isEditing) {
        return `
          <tr>
            <td><input class="inline-input" id="edit-channel-${row.id}" type="text" value="${row.channel}" /></td>
            <td><input class="inline-input" id="edit-cost-${row.id}" type="number" min="0.01" step="0.01" value="${format2(
              row.cost
            )}" /></td>
            <td><input class="inline-input" id="edit-revenue-${row.id}" type="number" min="0" step="0.01" value="${format2(
              row.revenue
            )}" /></td>
            <td>${format2(row.roas)}</td>
            <td>
              <button type="button" class="save-btn" data-action="save" data-id="${row.id}">Save</button>
              <button type="button" class="cancel-btn" data-action="cancel" data-id="${row.id}">Cancel</button>
            </td>
          </tr>
        `;
      }

      return `
        <tr>
          <td>${row.channel}</td>
          <td>${format2(row.cost)}</td>
          <td>${format2(row.revenue)}</td>
          <td>${format2(row.roas)}</td>
          <td>
            <button type="button" data-action="edit" data-id="${row.id}">Edit</button>
            <button type="button" class="delete-btn" data-action="delete" data-id="${row.id}">Delete</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

/**
 * Render best/worst summary + totals.
 */
function renderSummaryAndTotals() {
  const { best, worst } = getBestWorst();
  const totals = calculateTotals();

  bestChannelEl.textContent = best ? `${best.channel} (${format2(best.roas)})` : 'N/A';
  worstChannelEl.textContent = worst ? `${worst.channel} (${format2(worst.roas)})` : 'N/A';

  totalCostEl.textContent = format2(totals.totalCost);
  totalRevenueEl.textContent = format2(totals.totalRevenue);
  overallRoasEl.textContent = format2(totals.overallRoas);
}

/**
 * Re-render all UI pieces.
 */
function renderAll() {
  renderTable();
  renderSummaryAndTotals();
  sortButton.textContent = `Sort by ROAS: ${sortDescending ? 'Desc' : 'Asc'}`;
}

/**
 * Add a new row from the form inputs.
 */
function addRow() {
  const channel = channelInput.value;
  const cost = parseFloat(costInput.value);
  const revenue = parseFloat(revenueInput.value);

  const error = validateInputs(channel, cost, revenue);
  if (error) {
    message.textContent = error;
    return;
  }

  rows.push({
    id: nextId,
    channel: channel.trim(),
    cost,
    revenue,
    roas: revenue / cost,
  });
  nextId += 1;

  message.textContent = '';
  form.reset();
  channelInput.focus();
  renderAll();
}

/**
 * Save inline edits for a row.
 */
function saveEdit(rowId) {
  const row = rows.find((item) => item.id === rowId);
  if (!row) return;

  const editChannel = document.getElementById(`edit-channel-${rowId}`);
  const editCost = document.getElementById(`edit-cost-${rowId}`);
  const editRevenue = document.getElementById(`edit-revenue-${rowId}`);

  const channel = editChannel.value;
  const cost = parseFloat(editCost.value);
  const revenue = parseFloat(editRevenue.value);

  const error = validateInputs(channel, cost, revenue);
  if (error) {
    message.textContent = `Edit error: ${error}`;
    return;
  }

  row.channel = channel.trim();
  row.cost = cost;
  row.revenue = revenue;
  row.roas = revenue / cost;

  editingRowId = null;
  message.textContent = '';
  renderAll();
}

/**
 * Build the exact summary string for copy button.
 */
function buildSummaryText() {
  const { best, worst } = getBestWorst();
  const totals = calculateTotals();

  const bestText = best ? `${best.channel} (ROAS=${format2(best.roas)})` : 'N/A (ROAS=0.00)';
  const worstText = worst ? `${worst.channel} (ROAS=${format2(worst.roas)})` : 'N/A (ROAS=0.00)';
  const totalText = format2(totals.overallRoas);

  return `Best: ${bestText}, Worst: ${worstText}, Total ROAS=${totalText}`;
}

/**
 * Export currently visible table rows to CSV.
 */
function exportCsv() {
  const sortedRows = getSortedRows();

  const csvLines = ['Channel,Cost,Revenue,ROAS'];
  sortedRows.forEach((row) => {
    const escapedChannel = `"${row.channel.replaceAll('"', '""')}"`;
    csvLines.push(`${escapedChannel},${format2(row.cost)},${format2(row.revenue)},${format2(row.roas)}`);
  });

  const csvText = csvLines.join('\n');
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'roas-table.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Submit (button click or Enter in any input) adds a row.
form.addEventListener('submit', (event) => {
  event.preventDefault();
  addRow();
});

// Explicit Enter handler for beginner clarity.
form.querySelectorAll('input').forEach((input) => {
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      form.requestSubmit();
    }
  });
});

// Event delegation for Edit/Delete/Save/Cancel row buttons.
rowsBody.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const action = button.dataset.action;
  const rowId = Number(button.dataset.id);

  if (action === 'edit') {
    editingRowId = rowId;
    message.textContent = '';
    renderAll();
    return;
  }

  if (action === 'delete') {
    const index = rows.findIndex((row) => row.id === rowId);
    if (index >= 0) rows.splice(index, 1);
    if (editingRowId === rowId) editingRowId = null;
    message.textContent = '';
    renderAll();
    return;
  }

  if (action === 'save') {
    saveEdit(rowId);
    return;
  }

  if (action === 'cancel') {
    editingRowId = null;
    message.textContent = '';
    renderAll();
  }
});

// Toggle sort direction by ROAS.
sortButton.addEventListener('click', () => {
  sortDescending = !sortDescending;
  renderAll();
});

// Copy summary text to clipboard.
copySummaryButton.addEventListener('click', async () => {
  const text = buildSummaryText();

  try {
    await navigator.clipboard.writeText(text);
    message.textContent = 'Summary copied to clipboard.';
  } catch (error) {
    message.textContent = 'Could not copy summary. Please copy manually.';
  }
});

// Export CSV of current table order.
exportCsvButton.addEventListener('click', () => {
  exportCsv();
  message.textContent = 'CSV export started.';
});

// Initial render.
renderAll();
