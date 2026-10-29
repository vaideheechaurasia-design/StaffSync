/**
 * Client-side CSV export utility.
 * Generates and triggers download of clean, sanitised CSV files.
 *
 * @param {string} filename - Output file name (e.g., 'staffsync-employees.csv')
 * @param {Array<Object>} data - Array of row objects
 * @param {Array<{ key: string, label: string }>} columns - Column definitions
 */
export function exportToCSV(filename, data, columns) {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // 1. Header row
  const headerRow = columns.map((col) => `"${(col.label || col.key).replace(/"/g, '""')}"`).join(',');

  // 2. Data rows
  const dataRows = data.map((item) => {
    return columns
      .map((col) => {
        let val = item[col.key];

        // Support dot notation for nested properties (e.g., 'departmentId.name')
        if (col.key.includes('.')) {
          const parts = col.key.split('.');
          val = parts.reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : ''), item);
        }

        if (val === null || val === undefined) {
          val = '';
        } else if (typeof val === 'object') {
          val = JSON.stringify(val);
        } else {
          val = String(val);
        }

        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  const csvContent = [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default exportToCSV;

