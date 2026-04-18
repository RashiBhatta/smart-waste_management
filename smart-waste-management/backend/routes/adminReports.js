// ============================================================
// ADMIN FEATURE 3: Reports & PDF Export
// FILE: backend/routes/adminReports.js
// Uses PDFKit (server-safe). Run: npm install pdfkit
// ============================================================

const express = require('express');
const router  = express.Router();
const PDFDoc  = require('pdfkit');

const Collection = require('../models/Collection');
const Payment    = require('../models/Payment');
const Program    = require('../models/Program');
const User       = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// ── Helpers ───────────────────────────────────────────────────
const monthStart = (y, m) => new Date(y, m - 1, 1);
const monthEnd   = (y, m) => new Date(y, m, 0, 23, 59, 59, 999);
const fmt        = (d)    => d ? new Date(d).toLocaleDateString('en-US') : '–';
const rs         = (n)    => `Rs. ${(n || 0).toLocaleString()}`;
const nowY = new Date().getFullYear();
const nowM = new Date().getMonth() + 1;

// ── Colours ───────────────────────────────────────────────────
const GREEN = '#16a34a';
const DARK  = '#0f172a';
const GREY  = '#64748b';
const WHITE = '#ffffff';
const LIGHT = '#f0fdf4';

// ── PDF drawing helpers ───────────────────────────────────────

function sectionHeader(doc, text, y) {
  const W = doc.page.width - 56;
  doc.rect(28, y, W, 18).fill(GREEN);
  doc.fontSize(10).fillColor(WHITE).font('Helvetica-Bold')
     .text(text.toUpperCase(), 34, y + 5, { width: W - 12, lineBreak: false });
  doc.font('Helvetica').fillColor(DARK);
  return y + 26;
}

function kpiRow(doc, items, y) {
  const W    = doc.page.width - 56;
  const boxW = (W - 9) / 4;
  const boxH = 36;
  items.forEach((item, i) => {
    const bx = 28 + i * (boxW + 3);
    doc.rect(bx, y, boxW, boxH).fill(LIGHT);
    doc.fontSize(7).fillColor(GREY).font('Helvetica-Bold')
       .text(item.label.toUpperCase(), bx + 5, y + 5, { width: boxW - 10, lineBreak: false });
    doc.fontSize(13).fillColor(DARK).font('Helvetica-Bold')
       .text(String(item.value), bx + 5, y + 14, { width: boxW - 10, lineBreak: false });
    if (item.sub) {
      doc.fontSize(7).fillColor(GREY).font('Helvetica')
         .text(item.sub, bx + 5, y + 27, { width: boxW - 10, lineBreak: false });
    }
  });
  doc.font('Helvetica').fillColor(DARK);
  return y + boxH + 12;
}

function drawTable(doc, headers, rows, startY, colWidths) {
  const W       = doc.page.width - 56;
  const cellPad = 5;
  const rowH    = 18;
  const headerH = 20;

  if (!colWidths) {
    const w = W / headers.length;
    colWidths = headers.map(() => w);
  }

  let y = startY;

  // Header
  doc.rect(28, y, W, headerH).fill(GREEN);
  doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold');
  let x = 28;
  headers.forEach((h, i) => {
    doc.text(h, x + cellPad, y + 6, { width: colWidths[i] - cellPad * 2, lineBreak: false, ellipsis: true });
    x += colWidths[i];
  });
  y += headerH;

  // Rows
  doc.font('Helvetica').fillColor(DARK).fontSize(8);
  rows.forEach((row, rowIdx) => {
    if (y + rowH > doc.page.height - 50) {
      doc.addPage();
      y = 40;
      // Redraw header on new page
      doc.rect(28, y, W, headerH).fill(GREEN);
      doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold');
      x = 28;
      headers.forEach((h, i) => {
        doc.text(h, x + cellPad, y + 6, { width: colWidths[i] - cellPad * 2, lineBreak: false, ellipsis: true });
        x += colWidths[i];
      });
      y += headerH;
      doc.font('Helvetica').fillColor(DARK).fontSize(8);
    }

    if (rowIdx % 2 === 0) doc.rect(28, y, W, rowH).fill('#f8fafc');
    doc.fillColor(DARK);
    x = 28;
    row.forEach((cell, i) => {
      doc.text(String(cell ?? '–'), x + cellPad, y + 5, {
        width: colWidths[i] - cellPad * 2,
        lineBreak: false,
        ellipsis: true
      });
      x += colWidths[i];
    });
    doc.moveTo(28, y + rowH).lineTo(28 + W, y + rowH)
       .strokeColor('#e2e8f0').lineWidth(0.5).stroke();
    y += rowH;
  });

  return y + 8;
}

// ── Add footer to a single page (call while on that page) ─────
function addFooter(doc, pageNum, monthLabel) {
  const ph = doc.page.height;
  const pw = doc.page.width;
  doc.rect(0, ph - 18, pw, 18).fill('#f8fafc');
  doc.fontSize(7).fillColor(GREY).font('Helvetica')
     .text(
       `SWMS Official Report · ${monthLabel} · Generated ${new Date().toLocaleDateString('en-US')} · Page ${pageNum}`,
       28, ph - 11, { lineBreak: false }
     );
}

// ============================================================
// GET /api/admin/reports/summary
// ============================================================
router.get('/summary', protect, authorize('admin'), async (req, res) => {
  try {
    const { year = nowY, month = nowM } = req.query;
    const start = monthStart(Number(year), Number(month));
    const end   = monthEnd(Number(year),   Number(month));

    const [colMonth, colAllTime, payMonth, payAllTime, progStats, userStats] = await Promise.all([
      Collection.aggregate([{ $match: { updatedAt: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: 1 }, collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } }, skipped: { $sum: { $cond: [{ $eq: ['$status', 'Skipped'] }, 1, 0] } }, weight: { $sum: '$actualWeight' } } }]),
      Collection.aggregate([{ $group: { _id: null, total: { $sum: 1 }, collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } }, weight: { $sum: '$actualWeight' } } }]),
      Payment.aggregate([{ $match: { status: 'completed', createdAt: { $gte: start, $lte: end } } }, { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 }, freeCount: { $sum: { $cond: ['$isFreeService', 1, 0] } } } }]),
      Payment.aggregate([{ $match: { status: 'completed', isFreeService: false } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Program.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, volunteers: { $sum: '$currentVolunteers' } } }]),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 }, paid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } }, freeService: { $sum: { $cond: ['$isServiceFree', 1, 0] } } } }])
    ]);

    const cm  = colMonth[0]   || { total: 0, collected: 0, skipped: 0, weight: 0 };
    const cat = colAllTime[0] || { total: 0, collected: 0, weight: 0 };
    const monthRevenue = payMonth.reduce((s, p) => s + (p.isFreeService ? 0 : p.total), 0);
    const freeCount    = payMonth.reduce((s, p) => s + (p.freeCount || 0), 0);
    const byStatus = {}; progStats.forEach(p => { byStatus[p._id] = p; });
    const byRole   = {}; userStats.forEach(u => { byRole[u._id]   = u; });

    res.json({
      success: true,
      period:  { year: Number(year), month: Number(month) },
      monthly: { collections: cm.total, collected: cm.collected, skipped: cm.skipped, weight: Math.round(cm.weight * 10) / 10, completionRate: cm.total > 0 ? Math.round((cm.collected / cm.total) * 100) : 0, revenue: monthRevenue, freeRedemptions: freeCount },
      allTime: { collections: cat.total, collected: cat.collected, weight: Math.round(cat.weight * 10) / 10, revenue: payAllTime[0]?.total || 0, completionRate: cat.total > 0 ? Math.round((cat.collected / cat.total) * 100) : 0 },
      programs: { active: byStatus['active']?.count || 0, upcoming: byStatus['upcoming']?.count || 0, completed: byStatus['completed']?.count || 0, totalVolunteers: progStats.reduce((s, p) => s + p.volunteers, 0) },
      users:    { residents: byRole['resident']?.count || 0, collectors: byRole['collector']?.count || 0, paidResidents: byRole['resident']?.paid || 0, freeService: byRole['resident']?.freeService || 0 }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// GET /api/admin/reports/collections
// ============================================================
router.get('/collections', protect, authorize('admin'), async (req, res) => {
  try {
    const { year = nowY, month = nowM, zone, status, wasteType, page = 1, limit = 50 } = req.query;
    const match = {};
    if (year && month) match.updatedAt = { $gte: monthStart(Number(year), Number(month)), $lte: monthEnd(Number(year), Number(month)) };
    if (zone)      match['address.zone'] = zone;
    if (status)    match.status          = status;
    if (wasteType) match.wasteType       = wasteType;

    const [collections, total] = await Promise.all([
      Collection.find(match).populate('resident', 'name address').populate('collector', 'name').sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Collection.countDocuments(match)
    ]);
    const zoneBreakdown = await Collection.aggregate([{ $match: { ...match, status: 'Collected' } }, { $group: { _id: '$address.zone', count: { $sum: 1 }, weight: { $sum: '$actualWeight' } } }, { $sort: { weight: -1 } }]);
    res.json({ success: true, collections, total, totalPages: Math.ceil(total / limit), zoneBreakdown });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// GET /api/admin/reports/payments
// ============================================================
router.get('/payments', protect, authorize('admin'), async (req, res) => {
  try {
    const { year = nowY, month = nowM, method, page = 1, limit = 50 } = req.query;
    const match = { status: 'completed' };
    if (year && month) match.createdAt = { $gte: monthStart(Number(year), Number(month)), $lte: monthEnd(Number(year), Number(month)) };
    if (method) match.paymentMethod = method;
    const [payments, total, breakdown] = await Promise.all([
      Payment.find(match).populate('user', 'name email address').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Payment.countDocuments(match),
      Payment.aggregate([{ $match: match }, { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 }, freeCount: { $sum: { $cond: ['$isFreeService', 1, 0] } } } }])
    ]);
    res.json({ success: true, payments, total, totalPages: Math.ceil(total / limit), breakdown, grandTotal: breakdown.reduce((s, b) => s + b.total, 0) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// GET /api/admin/reports/volunteers
// ============================================================
router.get('/volunteers', protect, authorize('admin'), async (req, res) => {
  try {
    const programs = await Program.find()
      .populate('volunteers.user', 'name email address coins totalCoinsEarned')
      .sort({ createdAt: -1 })
      .select('title organization zone status startDate endDate rewardCoins volunteers currentVolunteers volunteerLimit');
    const rows = programs.map(p => ({
      id: p._id, title: p.title, organization: p.organization, zone: p.zone,
      status: p.status, startDate: p.startDate, endDate: p.endDate,
      rewardCoins: p.rewardCoins, maxVolunteers: p.volunteerLimit,
      approved: p.volunteers.filter(v => v.status === 'approved').length,
      pending:  p.volunteers.filter(v => v.status === 'pending').length,
      rejected: p.volunteers.filter(v => v.status === 'rejected').length,
      totalCoinsAwarded: p.volunteers.filter(v => v.status === 'approved').length * (p.rewardCoins || 100)
    }));
    res.json({ success: true, programs: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// GET /api/admin/reports/pdf/monthly
// ============================================================
router.get('/pdf/monthly', protect, authorize('admin'), async (req, res) => {
  try {
    const { year = nowY, month = nowM } = req.query;
    const reportYear  = Number(year);
    const reportMonth = Number(month);
    const start = monthStart(reportYear, reportMonth);
    const end   = monthEnd(reportYear, reportMonth);
    const monthLabel = new Date(reportYear, reportMonth - 1, 1)
      .toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const [collections, payments, programs] = await Promise.all([
      Collection.find({ updatedAt: { $gte: start, $lte: end } })
        .populate('resident', 'name address').populate('collector', 'name').sort({ updatedAt: -1 }),
      Payment.find({ status: 'completed', createdAt: { $gte: start, $lte: end } })
        .populate('user', 'name').sort({ createdAt: -1 }),
      Program.find().select('title organization zone status currentVolunteers volunteerLimit rewardCoins')
    ]);

    const collected   = collections.filter(c => c.status === 'Collected').length;
    const skipped     = collections.filter(c => c.status === 'Skipped').length;
    const totalWeight = collections.filter(c => c.status === 'Collected').reduce((s, c) => s + (c.actualWeight || 0), 0);
    const revenue     = payments.filter(p => !p.isFreeService).reduce((s, p) => s + (p.amount || 0), 0);
    const freeService = payments.filter(p => p.isFreeService).length;
    const compRate    = collections.length > 0 ? Math.round((collected / collections.length) * 100) : 0;

    const zoneMap = {};
    collections.filter(c => c.status === 'Collected').forEach(c => {
      const z = (c.address?.zone || 'unknown').toUpperCase();
      if (!zoneMap[z]) zoneMap[z] = { count: 0, weight: 0 };
      zoneMap[z].count++;
      zoneMap[z].weight += c.actualWeight || 0;
    });

    // ── Build PDF ─────────────────────────────────────────────
    // ✅ bufferPages:true lets us iterate all pages for footer AFTER content is written
    const doc    = new PDFDoc({ margin: 28, size: 'A4', bufferPages: true });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    const W = doc.page.width - 56;

    // ── Page 1: Cover + KPIs + Zone table + Collection log ───
    // Cover header
    doc.rect(0, 0, doc.page.width, 60).fill(GREEN);
    doc.fontSize(17).fillColor(WHITE).font('Helvetica-Bold')
       .text('SMART WASTE MANAGEMENT SYSTEM', 28, 14);
    doc.fontSize(11).font('Helvetica')
       .text(`Monthly Operational Report — ${monthLabel}`, 28, 36);
    doc.fontSize(8).fillColor('#c6f6d5')
       .text(`Generated: ${new Date().toLocaleDateString('en-US')}   ·   Confidential`, 28, 50);
    doc.fillColor(DARK).font('Helvetica');

    let y = 76;

    // KPIs
    doc.fontSize(12).font('Helvetica-Bold').fillColor(DARK).text('Monthly Highlights', 28, y);
    y += 14;
    y = kpiRow(doc, [
      { label: 'Total Pickups',    value: collections.length,             sub: `${collected} collected` },
      { label: 'Weight Collected', value: `${Math.round(totalWeight)}kg`, sub: 'from completed jobs' },
      { label: 'Revenue',          value: rs(revenue),                    sub: `${freeService} free redemptions` },
      { label: 'Completion Rate',  value: `${compRate}%`,                 sub: `${skipped} skipped` }
    ], y);

    // Zone breakdown
    y = sectionHeader(doc, 'Zone-wise Waste Collection', y);
    const zoneRows = Object.entries(zoneMap).map(([z, d]) => [
      z, d.count, `${Math.round(d.weight * 10) / 10} kg`,
      `${totalWeight > 0 ? Math.round((d.weight / totalWeight) * 100) : 0}%`
    ]);
    y = drawTable(doc,
      ['Zone', 'Collections', 'Weight (kg)', '% Share'],
      zoneRows.length ? zoneRows : [['No data', '–', '–', '–']],
      y,
      [W * 0.3, W * 0.25, W * 0.25, W * 0.2]
    );

    // Collection log
    if (y > 650) { doc.addPage(); y = 40; }
    y = sectionHeader(doc, `Collection Log (${collections.length} records)`, y);
    const colRows = collections.slice(0, 80).map(c => [
      fmt(c.updatedAt),
      c.resident?.name || '–',
      (c.address?.zone || '–').toUpperCase(),
      c.wasteType || '–',
      c.actualWeight ? `${c.actualWeight}kg` : '–',
      c.status
    ]);
    drawTable(doc,
      ['Date', 'Resident', 'Zone', 'Type', 'Weight', 'Status'],
      colRows.length ? colRows : [['No records', '', '', '', '', '']],
      y,
      [W*0.13, W*0.22, W*0.13, W*0.15, W*0.12, W*0.25]
    );

    // ── Page N: Payment ledger ────────────────────────────────
    doc.addPage();
    y = 40;
    y = sectionHeader(doc, `Payment Ledger — ${monthLabel}`, y);
    const payRows = payments.slice(0, 80).map(p => [
      fmt(p.createdAt),
      p.user?.name || '–',
      p.isFreeService ? 'Coin Redeem' : (p.paymentMethod || '–'),
      p.isFreeService ? 'FREE' : rs(p.amount)
    ]);
    y = drawTable(doc,
      ['Date', 'Resident', 'Method', 'Amount'],
      payRows.length ? payRows : [['No payments', '', '', '']],
      y,
      [W*0.2, W*0.35, W*0.25, W*0.2]
    );

    if (y > 650) { doc.addPage(); y = 40; }
    doc.rect(28, y, W, 20).fill(LIGHT);
    doc.fontSize(9).font('Helvetica-Bold').fillColor(GREEN)
       .text(`Total Cash Revenue: ${rs(revenue)}   ·   Free Redemptions: ${freeService}`, 34, y + 6, { lineBreak: false });
    y += 28;

    // ── Programs summary ──────────────────────────────────────
    if (y > 650) { doc.addPage(); y = 40; }
    y = sectionHeader(doc, 'Volunteer Program Summary', y);
    const progRows = programs.map(p => [
      p.title,
      p.organization || 'SWM Admin',
      (p.zone || 'All').toUpperCase(),
      p.status,
      p.currentVolunteers || 0,
      p.volunteerLimit    || 50,
      `${p.rewardCoins || 100} coins`
    ]);
    drawTable(doc,
      ['Program', 'Org', 'Zone', 'Status', 'Volunteers', 'Capacity', 'Reward'],
      progRows.length ? progRows : [['No programs', '', '', '', '', '', '']],
      y,
      [W*0.22, W*0.15, W*0.09, W*0.12, W*0.1, W*0.1, W*0.22]
    );

    // ── ✅ Footer: iterate buffered pages BEFORE flush ────────
    const pageRange = doc.bufferedPageRange();  // { start, count }
    for (let i = 0; i < pageRange.count; i++) {
      doc.switchToPage(pageRange.start + i);    // ✅ correct index
      addFooter(doc, i + 1, monthLabel);
    }

    // Flush — must call flushPages() then end()
    doc.flushPages();
    doc.end();

    // Collect buffer
    await new Promise((resolve, reject) => {
      doc.on('end',   resolve);
      doc.on('error', reject);
    });

    const pdfBuffer = Buffer.concat(chunks);
    const filename  = `SWMS_Report_${reportYear}_${String(reportMonth).padStart(2, '0')}.pdf`;

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      pdfBuffer.length
    });
    res.send(pdfBuffer);

  } catch (err) {
    console.error('🔥 PDF generation error:', err);
    res.status(500).json({ success: false, message: 'PDF generation failed: ' + err.message });
  }
});

// ============================================================
// GET /api/admin/reports/pdf/collections
// ============================================================
router.get('/pdf/collections', protect, authorize('admin'), async (req, res) => {
  try {
    const { year = nowY, month = nowM, zone, status } = req.query;
    const reportYear  = Number(year);
    const reportMonth = Number(month);
    const start = monthStart(reportYear, reportMonth);
    const end   = monthEnd(reportYear, reportMonth);
    const monthLabel = new Date(reportYear, reportMonth - 1, 1)
      .toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const match = { updatedAt: { $gte: start, $lte: end } };
    if (zone)   match['address.zone'] = zone;
    if (status) match.status          = status;

    const collections = await Collection.find(match)
      .populate('resident', 'name address').populate('collector', 'name')
      .sort({ updatedAt: -1 });

    const doc    = new PDFDoc({ margin: 28, size: 'A4', bufferPages: true });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    const W = doc.page.width - 56;

    // Header
    doc.rect(0, 0, doc.page.width, 44).fill(GREEN);
    doc.fontSize(15).fillColor(WHITE).font('Helvetica-Bold')
       .text('SWMS — Collection Export', 28, 12);
    doc.fontSize(8).font('Helvetica')
       .text(
         `${monthLabel}${zone ? ' · Zone ' + zone.toUpperCase() : ''}${status ? ' · ' + status : ''} · ${collections.length} records`,
         28, 30, { lineBreak: false }
       );

    const rows = collections.map(c => [
      fmt(c.updatedAt),
      c.resident?.name || '–',
      (c.address?.zone || '–').toUpperCase(),
      c.wasteType || '–',
      c.actualWeight ? `${c.actualWeight}kg` : '–',
      c.collector?.name || 'Unassigned',
      c.status
    ]);

    drawTable(doc,
      ['Date', 'Resident', 'Zone', 'Type', 'Weight', 'Collector', 'Status'],
      rows.length ? rows : [['No data', '', '', '', '', '', '']],
      58,
      [W*0.12, W*0.2, W*0.1, W*0.13, W*0.1, W*0.18, W*0.17]
    );

    // Footer
    const pageRange = doc.bufferedPageRange();
    for (let i = 0; i < pageRange.count; i++) {
      doc.switchToPage(pageRange.start + i);
      addFooter(doc, i + 1, monthLabel);
    }

    doc.flushPages();
    doc.end();

    await new Promise((resolve, reject) => {
      doc.on('end',   resolve);
      doc.on('error', reject);
    });

    const pdfBuffer = Buffer.concat(chunks);
    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="SWMS_Collections_${reportYear}_${String(reportMonth).padStart(2, '0')}.pdf"`,
      'Content-Length':      pdfBuffer.length
    });
    res.send(pdfBuffer);

  } catch (err) {
    console.error('🔥 Collections PDF error:', err);
    res.status(500).json({ success: false, message: 'PDF export failed: ' + err.message });
  }
});

module.exports = router;