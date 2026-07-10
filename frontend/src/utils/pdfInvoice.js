// Генерация HTML-накладной, открываемой в новой вкладке браузера
export const openInvoicePDF = (invoice) => {
  const rows = (invoice.items || [])
    .map(
      (item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.product?.name || '—'}</td>
        <td>${item.quantity}</td>
        <td>${item.product?.unit || 'шт'}</td>
        <td>${Number(item.price).toLocaleString('ru-RU')} ₸</td>
        <td>${Number(item.total).toLocaleString('ru-RU')} ₸</td>
      </tr>`
    )
    .join('');

  const date = new Date(invoice.issuedAt || invoice.createdAt).toLocaleDateString('ru-RU', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8"/>
  <title>Накладная ${invoice.number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #1a1a1a; padding: 40px; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .logo { font-size: 26px; font-weight: 700; color: #FFB7C5; letter-spacing: 1px; }
    .logo span { color: #1a1a1a; }
    .doc-title { text-align: right; }
    .doc-title h1 { font-size: 22px; color: #1a1a1a; }
    .doc-title p { color: #888; font-size: 13px; margin-top: 4px; }
    .divider { border: none; border-top: 2px solid #FFB7C5; margin: 24px 0; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .meta-block label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta-block p { font-size: 15px; font-weight: 600; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #fff5f7; color: #1a1a1a; font-size: 12px; text-transform: uppercase;
         letter-spacing: 0.5px; padding: 10px 12px; text-align: left; border-bottom: 2px solid #FFB7C5; }
    td { padding: 10px 12px; border-bottom: 1px solid #ffe4ea; font-size: 14px; }
    tr:last-child td { border-bottom: none; }
    .total-row { background: #fff5f7; font-weight: 700; }
    .total-row td { border-top: 2px solid #FFB7C5; font-size: 15px; }
    .footer { margin-top: 48px; display: flex; justify-content: space-between; font-size: 12px; color: #aaa; }
    .sign-block { text-align: center; }
    .sign-line { border-bottom: 1px solid #ccc; width: 160px; margin: 32px auto 6px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">CRM <span>Sakura</span></div>
    <div class="doc-title">
      <h1>${invoice.type === 'outgoing' ? 'Расходная' : 'Приходная'} накладная</h1>
      <p>№ ${invoice.number} от ${date}</p>
    </div>
  </div>
  <hr class="divider"/>
  <div class="meta">
    <div class="meta-block">
      <label>Клиент</label>
      <p>${invoice.client?.name || '—'}</p>
    </div>
    <div class="meta-block">
      <label>Статус</label>
      <p>${{ draft: 'Черновик', issued: 'Выставлена', paid: 'Оплачена', cancelled: 'Отменена' }[invoice.status] || invoice.status}</p>
    </div>
    ${invoice.notes ? `<div class="meta-block" style="grid-column: 1/-1"><label>Примечание</label><p>${invoice.notes}</p></div>` : ''}
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Наименование</th><th>Кол-во</th><th>Ед.</th><th>Цена</th><th>Сумма</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total-row">
        <td colspan="5" style="text-align:right">ИТОГО:</td>
        <td>${Number(invoice.totalAmount).toLocaleString('ru-RU')} ₸</td>
      </tr>
    </tbody>
  </table>
  <div style="display:flex; justify-content:space-around; margin-top:48px;">
    <div class="sign-block">
      <div class="sign-line"></div>
      <div>Отпустил / Принял</div>
    </div>
    <div class="sign-block">
      <div class="sign-line"></div>
      <div>Получил / Сдал</div>
    </div>
  </div>
  <div class="footer">
    <span>Документ сформирован: ${new Date().toLocaleString('ru-RU')}</span>
    <span>CRM Sakura © 2026</span>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
};
