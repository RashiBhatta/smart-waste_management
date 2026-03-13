const { jsPDF } = require("jspdf");
require("jspdf-autotable");

const generateMonthlyReport = (data) => {
  const doc = new jsPDF();
  
  // Header [cite: 44, 67]
  doc.setFontSize(18);
  doc.text("Smart Waste Management - Monthly Report", 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  // Table Data [cite: 67]
  const tableRows = data.map(item => [
    item.resident.name,
    item.address.zone,
    item.wasteType,
    `${item.actualWeight}kg`,
    item.status
  ]);

  doc.autoTable({
    startY: 40,
    head: [['Resident', 'Zone', 'Type', 'Weight', 'Status']],
    body: tableRows,
  });

  return doc.output('arraybuffer');
};