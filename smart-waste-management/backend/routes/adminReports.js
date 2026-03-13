// // ============================================================
// // ADMIN FEATURE 3: Reports & PDF Export
// // FILE: backend/routes/adminReports.js
// // BASE URL: /api/admin/reports
// // ============================================================
// // Routes:
// //   GET /api/admin/reports/summary       — aggregated KPIs for the report page
// //   GET /api/admin/reports/collections   — filterable collection log (zone/month/status)
// //   GET /api/admin/reports/payments      — payment ledger with totals
// //   GET /api/admin/reports/volunteers    — program volunteer summary
// //   GET /api/admin/reports/pdf/monthly   — download full monthly PDF report
// //   GET /api/admin/reports/pdf/collections — download filtered collection PDF
// // ============================================================

// const express      = require('express');
// const router       = express.Router();
// const { jsPDF }    = require('jspdf');
// require('jspdf-autotable');

// const Collection = require('../models/Collection');
// const Payment    = require('../models/Payment');
// const Program    = require('../models/Program');
// const User       = require('../models/User');
// const { protect, authorize } = require('../middleware/auth');

// // ── Helpers ───────────────────────────────────────────────────
// const monthStart = (year, month) => new Date(year, month - 1, 1);
// const monthEnd   = (year, month) => new Date(year, month, 0, 23, 59, 59, 999);

// const nowY = new Date().getFullYear();
// const nowM = new Date().getMonth() + 1;

// // ── PDF brand colours ─────────────────────────────────────────
// const GREEN  = [22, 163, 74];
// const LIGHT  = [240, 253, 244];
// const GREY   = [100, 116, 139];
// const DARK   = [15, 23, 42];
// const YELLOW = [245, 158, 11];

// // ============================================================
// // @desc    GET report summary KPIs
// // @route   GET /api/admin/reports/summary
// // @access  Private/Admin
// // ============================================================
// router.get('/summary', protect, authorize('admin'), async (req, res) => {
//   try {
//     const { year = nowY, month = nowM } = req.query;
//     const start = monthStart(Number(year), Number(month));
//     const end   = monthEnd(Number(year),   Number(month));

//     const [
//       colMonth, colAllTime,
//       payMonth, payAllTime,
//       progStats,
//       userStats,
//     ] = await Promise.all([

//       Collection.aggregate([
//         { $match: { updatedAt: { $gte: start, $lte: end } } },
//         {
//           $group: {
//             _id:       null,
//             total:     { $sum: 1 },
//             collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } },
//             skipped:   { $sum: { $cond: [{ $eq: ['$status', 'Skipped']   }, 1, 0] } },
//             weight:    { $sum: '$actualWeight' },
//           },
//         },
//       ]),

//       Collection.aggregate([
//         {
//           $group: {
//             _id:       null,
//             total:     { $sum: 1 },
//             collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } },
//             weight:    { $sum: '$actualWeight' },
//           },
//         },
//       ]),

//       Payment.aggregate([
//         { $match: { status: 'completed', createdAt: { $gte: start, $lte: end } } },
//         {
//           $group: {
//             _id:        '$paymentMethod',
//             total:      { $sum: '$amount' },
//             count:      { $sum: 1 },
//             freeCount:  { $sum: { $cond: ['$isFreeService', 1, 0] } },
//           },
//         },
//       ]),

//       Payment.aggregate([
//         { $match: { status: 'completed', isFreeService: false } },
//         { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
//       ]),

//       Program.aggregate([
//         {
//           $group: {
//             _id:        '$status',
//             count:      { $sum: 1 },
//             volunteers: { $sum: '$currentVolunteers' },
//           },
//         },
//       ]),

//       User.aggregate([
//         {
//           $group: {
//             _id:           '$role',
//             count:         { $sum: 1 },
//             paid:          { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } },
//             freeService:   { $sum: { $cond: ['$isServiceFree', 1, 0] } },
//           },
//         },
//       ]),
//     ]);

//     const cm  = colMonth[0]   || { total: 0, collected: 0, skipped: 0, weight: 0 };
//     const cat = colAllTime[0] || { total: 0, collected: 0, weight: 0 };

//     const monthRevenue = payMonth.reduce((s, p) => s + (p.isFreeService ? 0 : p.total), 0);
//     const allRevenue   = payAllTime[0]?.total || 0;
//     const freeCount    = payMonth.reduce((s, p) => s + (p.freeCount || 0), 0);

//     const byStatus = {};
//     progStats.forEach(p => { byStatus[p._id] = p; });

//     const byRole = {};
//     userStats.forEach(u => { byRole[u._id] = u; });

//     res.json({
//       success: true,
//       period: { year: Number(year), month: Number(month) },
//       monthly: {
//         collections: cm.total,
//         collected:   cm.collected,
//         skipped:     cm.skipped,
//         weight:      Math.round(cm.weight * 10) / 10,
//         completionRate: cm.total > 0 ? Math.round((cm.collected / cm.total) * 100) : 0,
//         revenue:     monthRevenue,
//         freeRedemptions: freeCount,
//       },
//       allTime: {
//         collections: cat.total,
//         collected:   cat.collected,
//         weight:      Math.round(cat.weight * 10) / 10,
//         revenue:     allRevenue,
//         completionRate: cat.total > 0 ? Math.round((cat.collected / cat.total) * 100) : 0,
//       },
//       programs: {
//         active:    byStatus['active']?.count    || 0,
//         upcoming:  byStatus['upcoming']?.count  || 0,
//         completed: byStatus['completed']?.count || 0,
//         totalVolunteers: progStats.reduce((s, p) => s + p.volunteers, 0),
//       },
//       users: {
//         residents:   byRole['resident']?.count    || 0,
//         collectors:  byRole['collector']?.count   || 0,
//         paidResidents: byRole['resident']?.paid   || 0,
//         freeService:   byRole['resident']?.freeService || 0,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ============================================================
// // @desc    GET filterable collection log
// // @route   GET /api/admin/reports/collections
// // @access  Private/Admin
// // ============================================================
// router.get('/collections', protect, authorize('admin'), async (req, res) => {
//   try {
//     const { year = nowY, month = nowM, zone, status, wasteType, page = 1, limit = 50 } = req.query;

//     const match = {};
//     if (year && month) {
//       match.updatedAt = {
//         $gte: monthStart(Number(year), Number(month)),
//         $lte: monthEnd(Number(year),   Number(month)),
//       };
//     }
//     if (zone)      match['address.zone'] = zone;
//     if (status)    match.status          = status;
//     if (wasteType) match.wasteType       = wasteType;

//     const [collections, total] = await Promise.all([
//       Collection.find(match)
//         .populate('resident',  'name address')
//         .populate('collector', 'name')
//         .sort({ updatedAt: -1 })
//         .skip((page - 1) * limit)
//         .limit(Number(limit))
//         .select('status wasteType actualWeight estimatedWeight address updatedAt notes feedback'),
//       Collection.countDocuments(match),
//     ]);

//     // Aggregate weight by zone for the filtered set
//     const zoneBreakdown = await Collection.aggregate([
//       { $match: { ...match, status: 'Collected' } },
//       { $group: { _id: '$address.zone', count: { $sum: 1 }, weight: { $sum: '$actualWeight' } } },
//       { $sort: { weight: -1 } },
//     ]);

//     res.json({
//       success: true,
//       collections,
//       total,
//       totalPages: Math.ceil(total / limit),
//       zoneBreakdown,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ============================================================
// // @desc    GET payment ledger
// // @route   GET /api/admin/reports/payments
// // @access  Private/Admin
// // ============================================================
// router.get('/payments', protect, authorize('admin'), async (req, res) => {
//   try {
//     const { year = nowY, month = nowM, method, page = 1, limit = 50 } = req.query;

//     const match = { status: 'completed' };
//     if (year && month) {
//       match.createdAt = {
//         $gte: monthStart(Number(year), Number(month)),
//         $lte: monthEnd(Number(year),   Number(month)),
//       };
//     }
//     if (method) match.paymentMethod = method;

//     const [payments, total, breakdown] = await Promise.all([
//       Payment.find(match)
//         .populate('user', 'name email address')
//         .sort({ createdAt: -1 })
//         .skip((page - 1) * limit)
//         .limit(Number(limit))
//         .select('amount paymentMethod isFreeService coinsUsed createdAt forMonth'),

//       Payment.countDocuments(match),

//       Payment.aggregate([
//         { $match: match },
//         {
//           $group: {
//             _id:       '$paymentMethod',
//             total:     { $sum: '$amount' },
//             count:     { $sum: 1 },
//             freeCount: { $sum: { $cond: ['$isFreeService', 1, 0] } },
//           },
//         },
//       ]),
//     ]);

//     res.json({
//       success: true,
//       payments,
//       total,
//       totalPages:   Math.ceil(total / limit),
//       breakdown,
//       grandTotal:   breakdown.reduce((s, b) => s + b.total, 0),
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ============================================================
// // @desc    GET volunteer report
// // @route   GET /api/admin/reports/volunteers
// // @access  Private/Admin
// // ============================================================
// router.get('/volunteers', protect, authorize('admin'), async (req, res) => {
//   try {
//     const programs = await Program.find()
//       .populate('volunteers.user', 'name email address coins totalCoinsEarned')
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 })
//       .select('title organization zone status startDate endDate rewardCoins volunteers currentVolunteers maxVolunteers');

//     const rows = programs.map(p => ({
//       id:            p._id,
//       title:         p.title,
//       organization:  p.organization,
//       zone:          p.zone,
//       status:        p.status,
//       startDate:     p.startDate,
//       endDate:       p.endDate,
//       rewardCoins:   p.rewardCoins,
//       maxVolunteers: p.maxVolunteers,
//       approved:      p.volunteers.filter(v => v.status === 'approved').length,
//       pending:       p.volunteers.filter(v => v.status === 'pending').length,
//       rejected:      p.volunteers.filter(v => v.status === 'rejected').length,
//       totalCoinsAwarded: p.volunteers.filter(v => v.status === 'approved').length * (p.rewardCoins || 100),
//     }));

//     res.json({ success: true, programs: rows });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ============================================================
// // @desc    DOWNLOAD full monthly PDF report
// // @route   GET /api/admin/reports/pdf/monthly
// // @access  Private/Admin
// // ============================================================
// router.get('/pdf/monthly', protect, authorize('admin'), async (req, res) => {
//   try {
//     const { year = nowY, month = nowM } = req.query;
//     const y = Number(year);
//     const m = Number(month);
//     const start = monthStart(y, m);
//     const end   = monthEnd(y, m);

//     const monthLabel = new Date(y, m - 1, 1).toLocaleString('en-NP', { month: 'long', year: 'numeric' });

//     const [collections, payments, programs, users] = await Promise.all([
//       Collection.find({ updatedAt: { $gte: start, $lte: end } })
//         .populate('resident',  'name address')
//         .populate('collector', 'name')
//         .sort({ updatedAt: -1 }),
//       Payment.find({ status: 'completed', createdAt: { $gte: start, $lte: end } })
//         .populate('user', 'name')
//         .sort({ createdAt: -1 }),
//       Program.find().select('title status currentVolunteers maxVolunteers rewardCoins'),
//       User.aggregate([
//         { $group: { _id: '$role', count: { $sum: 1 } } },
//       ]),
//     ]);

//     // ── Aggregates ─────────────────────────────────────────
//     const totalWeight  = collections.filter(c => c.status === 'Collected').reduce((s, c) => s + (c.actualWeight || 0), 0);
//     const collected    = collections.filter(c => c.status === 'Collected').length;
//     const skipped      = collections.filter(c => c.status === 'Skipped').length;
//     const revenue      = payments.filter(p => !p.isFreeService).reduce((s, p) => s + (p.amount || 0), 0);
//     const freeService  = payments.filter(p => p.isFreeService).length;

//     // Zone breakdown
//     const zoneMap = {};
//     collections.filter(c => c.status === 'Collected').forEach(c => {
//       const z = (c.address?.zone || 'unknown').toUpperCase();
//       if (!zoneMap[z]) zoneMap[z] = { count: 0, weight: 0 };
//       zoneMap[z].count++;
//       zoneMap[z].weight += c.actualWeight || 0;
//     });

//     const userMap = {};
//     users.forEach(u => { userMap[u._id] = u.count; });

//     // ── Build PDF ──────────────────────────────────────────
//     const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
//     const W   = doc.internal.pageSize.getWidth();

//     const addPage = () => { doc.addPage(); return 20; };

//     const sectionHeader = (doc, text, y) => {
//       doc.setFillColor(...GREEN);
//       doc.roundedRect(14, y - 5, W - 28, 10, 2, 2, 'F');
//       doc.setFontSize(11);
//       doc.setTextColor(255, 255, 255);
//       doc.setFont(undefined, 'bold');
//       doc.text(text.toUpperCase(), 18, y + 2);
//       doc.setFont(undefined, 'normal');
//       doc.setTextColor(...DARK);
//       return y + 12;
//     };

//     const kpiBox = (doc, x, y, w, h, label, value, sub) => {
//       doc.setFillColor(...LIGHT);
//       doc.roundedRect(x, y, w, h, 3, 3, 'F');
//       doc.setFontSize(8);
//       doc.setTextColor(...GREY);
//       doc.text(label.toUpperCase(), x + 4, y + 7);
//       doc.setFontSize(16);
//       doc.setTextColor(...DARK);
//       doc.setFont(undefined, 'bold');
//       doc.text(String(value), x + 4, y + 18);
//       if (sub) {
//         doc.setFontSize(7);
//         doc.setTextColor(...GREY);
//         doc.setFont(undefined, 'normal');
//         doc.text(sub, x + 4, y + 24);
//       }
//     };

//     // ── COVER PAGE ─────────────────────────────────────────
//     doc.setFillColor(...GREEN);
//     doc.rect(0, 0, W, 55, 'F');

//     doc.setFontSize(22);
//     doc.setTextColor(255, 255, 255);
//     doc.setFont(undefined, 'bold');
//     doc.text('SMART WASTE MANAGEMENT SYSTEM', 14, 24);

//     doc.setFontSize(13);
//     doc.setFont(undefined, 'normal');
//     doc.text(`Monthly Operational Report — ${monthLabel}`, 14, 34);

//     doc.setFontSize(9);
//     doc.setTextColor(200, 255, 200);
//     doc.text(`Generated by: ${req.user.name}   ·   Date: ${new Date().toLocaleDateString('en-NP')}`, 14, 44);

//     let y = 68;

//     // ── KPI GRID ───────────────────────────────────────────
//     doc.setFontSize(13);
//     doc.setTextColor(...DARK);
//     doc.setFont(undefined, 'bold');
//     doc.text('Monthly Highlights', 14, y);
//     y += 8;

//     const kw = (W - 28 - 9) / 4;
//     kpiBox(doc, 14,          y, kw, 30, 'Total Pickups', collections.length, `${collected} collected`);
//     kpiBox(doc, 14 + kw + 3, y, kw, 30, 'Weight Collected', `${Math.round(totalWeight)}kg`, 'from collected jobs');
//     kpiBox(doc, 14 + (kw+3)*2, y, kw, 30, 'Revenue (Rs)', revenue.toLocaleString(), `${freeService} free redemptions`);
//     kpiBox(doc, 14 + (kw+3)*3, y, kw, 30, 'Completion %', `${collections.length > 0 ? Math.round((collected/collections.length)*100) : 0}%`, `${skipped} skipped`);
//     y += 38;

//     // ── ZONE BREAKDOWN ─────────────────────────────────────
//     y = sectionHeader(doc, 'Zone-wise Waste Collection', y);
//     const zoneRows = Object.entries(zoneMap).map(([z, d]) => [
//       z,
//       d.count,
//       `${Math.round(d.weight * 10) / 10} kg`,
//       `${totalWeight > 0 ? Math.round((d.weight / totalWeight) * 100) : 0}%`,
//     ]);

//     doc.autoTable({
//       startY: y,
//       head: [['Zone', 'Collections', 'Weight (kg)', '% Share']],
//       body: zoneRows.length > 0 ? zoneRows : [['–', '–', '–', '–']],
//       theme: 'grid',
//       headStyles: { fillColor: GREEN, textColor: [255,255,255], fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       styles: { fontSize: 9, cellPadding: 3 },
//       margin: { left: 14, right: 14 },
//     });
//     y = doc.lastAutoTable.finalY + 10;

//     // ── COLLECTION LOG ─────────────────────────────────────
//     if (y > 220) { y = addPage(); }
//     y = sectionHeader(doc, `Collection Log (${collections.length} records)`, y);

//     const colRows = collections.slice(0, 100).map(c => [
//       new Date(c.updatedAt).toLocaleDateString('en-NP'),
//       c.resident?.name || '–',
//       (c.address?.zone || '–').toUpperCase(),
//       c.wasteType || '–',
//       c.actualWeight ? `${c.actualWeight}kg` : '–',
//       c.status,
//     ]);

//     doc.autoTable({
//       startY: y,
//       head: [['Date', 'Resident', 'Zone', 'Type', 'Weight', 'Status']],
//       body: colRows.length > 0 ? colRows : [['No records', '', '', '', '', '']],
//       theme: 'striped',
//       headStyles: { fillColor: GREEN, textColor: [255,255,255], fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       styles: { fontSize: 8, cellPadding: 2.5 },
//       columnStyles: { 5: { fontStyle: 'bold' } },
//       didDrawCell: (data) => {
//         if (data.section === 'body' && data.column.index === 5) {
//           const status = data.cell.raw;
//           if (status === 'Collected') doc.setTextColor(...GREEN);
//           else if (status === 'Skipped') doc.setTextColor(239, 68, 68);
//           else doc.setTextColor(...YELLOW);
//         }
//       },
//       margin: { left: 14, right: 14 },
//     });

//     // ── PAYMENT LEDGER ─────────────────────────────────────
//     doc.addPage();
//     y = 20;
//     y = sectionHeader(doc, `Payment Ledger — ${monthLabel}`, y);

//     const payRows = payments.slice(0, 80).map(p => [
//       new Date(p.createdAt).toLocaleDateString('en-NP'),
//       p.user?.name || '–',
//       p.isFreeService ? 'Coin Redeem' : (p.paymentMethod || '–'),
//       p.isFreeService ? 'FREE' : `Rs. ${(p.amount || 0).toLocaleString()}`,
//     ]);

//     doc.autoTable({
//       startY: y,
//       head: [['Date', 'Resident', 'Method', 'Amount']],
//       body: payRows.length > 0 ? payRows : [['No payments', '', '', '']],
//       theme: 'grid',
//       headStyles: { fillColor: GREEN, textColor: [255,255,255], fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       styles: { fontSize: 9, cellPadding: 3 },
//       margin: { left: 14, right: 14 },
//     });

//     y = doc.lastAutoTable.finalY + 8;
//     // Revenue total row
//     doc.setFillColor(240, 253, 244);
//     doc.roundedRect(14, y, W - 28, 12, 2, 2, 'F');
//     doc.setFontSize(10);
//     doc.setFont(undefined, 'bold');
//     doc.setTextColor(...GREEN);
//     doc.text(`Total Revenue (cash): Rs. ${revenue.toLocaleString()}   ·   Free service redemptions: ${freeService}`, 18, y + 8);
//     y += 20;

//     // ── PROGRAM SUMMARY ────────────────────────────────────
//     if (y > 230) { doc.addPage(); y = 20; }
//     y = sectionHeader(doc, 'Volunteer Program Summary', y);

//     const progRows = programs.map(p => [
//       p.title,
//       p.organization || 'SWM Admin',
//       (p.zone || 'All').toUpperCase(),
//       p.status,
//       p.currentVolunteers,
//       p.maxVolunteers,
//       `${p.rewardCoins || 100} coins`,
//     ]);

//     doc.autoTable({
//       startY: y,
//       head: [['Program', 'Org', 'Zone', 'Status', 'Volunteers', 'Capacity', 'Reward']],
//       body: progRows.length > 0 ? progRows : [['No programs', '', '', '', '', '', '']],
//       theme: 'striped',
//       headStyles: { fillColor: GREEN, textColor: [255,255,255], fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       styles: { fontSize: 8, cellPadding: 2.5 },
//       margin: { left: 14, right: 14 },
//     });

//     // ── FOOTER on every page ───────────────────────────────
//     const totalPages = doc.internal.getNumberOfPages();
//     for (let i = 1; i <= totalPages; i++) {
//       doc.setPage(i);
//       doc.setFillColor(248, 250, 252);
//       doc.rect(0, doc.internal.pageSize.getHeight() - 12, W, 12, 'F');
//       doc.setFontSize(7);
//       doc.setTextColor(...GREY);
//       doc.text(
//         `SWMS Official Report · ${monthLabel} · Generated ${new Date().toLocaleDateString('en-NP')} · Page ${i} of ${totalPages}`,
//         14, doc.internal.pageSize.getHeight() - 4
//       );
//     }

//     const filename = `SWMS_Report_${y}_${String(m).padStart(2,'0')}.pdf`;
//     res.set({
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': `attachment; filename="${filename}"`,
//     });
//     res.send(Buffer.from(doc.output('arraybuffer')));

//   } catch (err) {
//     console.error('PDF generation error:', err);
//     res.status(500).json({ success: false, message: 'PDF generation failed: ' + err.message });
//   }
// });

// // ============================================================
// // @desc    DOWNLOAD filtered collection PDF (quick export)
// // @route   GET /api/admin/reports/pdf/collections
// // @access  Private/Admin
// // ============================================================
// router.get('/pdf/collections', protect, authorize('admin'), async (req, res) => {
//   try {
//     const { year = nowY, month = nowM, zone, status } = req.query;
//     const y = Number(year);
//     const m = Number(month);
//     const start = monthStart(y, m);
//     const end   = monthEnd(y, m);
//     const monthLabel = new Date(y, m - 1, 1).toLocaleString('en-NP', { month: 'long', year: 'numeric' });

//     const match = { updatedAt: { $gte: start, $lte: end } };
//     if (zone)   match['address.zone'] = zone;
//     if (status) match.status          = status;

//     const collections = await Collection.find(match)
//       .populate('resident',  'name address')
//       .populate('collector', 'name')
//       .sort({ updatedAt: -1 });

//     const doc = new jsPDF();
//     const W = doc.internal.pageSize.getWidth();

//     doc.setFillColor(...GREEN);
//     doc.rect(0, 0, W, 38, 'F');
//     doc.setFontSize(16);
//     doc.setTextColor(255, 255, 255);
//     doc.setFont(undefined, 'bold');
//     doc.text('SWMS — Collection Export', 14, 18);
//     doc.setFontSize(9);
//     doc.setFont(undefined, 'normal');
//     doc.text(`${monthLabel}${zone ? ' · Zone ' + zone.toUpperCase() : ''}${status ? ' · ' + status : ''} · ${collections.length} records`, 14, 28);

//     const rows = collections.map(c => [
//       new Date(c.updatedAt).toLocaleDateString('en-NP'),
//       c.resident?.name || '–',
//       (c.address?.zone || '–').toUpperCase(),
//       c.wasteType || '–',
//       c.actualWeight ? `${c.actualWeight}kg` : '–',
//       c.collector?.name || 'Unassigned',
//       c.status,
//     ]);

//     doc.autoTable({
//       startY: 44,
//       head: [['Date', 'Resident', 'Zone', 'Type', 'Weight', 'Collector', 'Status']],
//       body: rows,
//       theme: 'grid',
//       headStyles: { fillColor: GREEN, textColor: [255,255,255], fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       styles: { fontSize: 8, cellPadding: 2.5 },
//       margin: { left: 14, right: 14 },
//     });

//     const totalPages = doc.internal.getNumberOfPages();
//     for (let i = 1; i <= totalPages; i++) {
//       doc.setPage(i);
//       doc.setFontSize(7);
//       doc.setTextColor(...GREY);
//       doc.text(`Page ${i} of ${totalPages}`, 14, doc.internal.pageSize.getHeight() - 5);
//     }

//     res.set({
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': `attachment; filename="SWMS_Collections_${y}_${String(m).padStart(2,'0')}.pdf"`,
//     });
//     res.send(Buffer.from(doc.output('arraybuffer')));

//   } catch (err) {
//     res.status(500).json({ success: false, message: 'PDF export failed: ' + err.message });
//   }
// });

// module.exports = router;

// // ============================================================
// // ADMIN FEATURE 3: Reports & PDF Export
// // FILE: backend/routes/adminReports.js
// // BASE URL: /api/admin/reports
// // ============================================================

// const express      = require('express');
// const router       = express.Router();
// const { jsPDF }    = require('jspdf');
// const autoTable    = require('jspdf-autotable'); 

// const Collection = require('../models/Collection');
// const Payment    = require('../models/Payment');
// const Program    = require('../models/Program');
// const User       = require('../models/User');
// const { protect, authorize } = require('../middleware/auth');

// // ── Helpers ───────────────────────────────────────────────────
// const monthStart = (year, month) => new Date(year, month - 1, 1);
// const monthEnd   = (year, month) => new Date(year, month, 0, 23, 59, 59, 999);

// const nowY = new Date().getFullYear();
// const nowM = new Date().getMonth() + 1;

// // ── PDF brand colours ─────────────────────────────────────────
// const GREEN  = [22, 163, 74];
// const LIGHT  = [240, 253, 244];
// const GREY   = [100, 116, 139];
// const DARK   = [15, 23, 42];
// const YELLOW = [245, 158, 11];

// // ============================================================
// // @desc    GET report summary KPIs
// // @route   GET /api/admin/reports/summary
// // ============================================================
// router.get('/summary', protect, authorize('admin'), async (req, res) => {
//   try {
//     const { year = nowY, month = nowM } = req.query;
//     const start = monthStart(Number(year), Number(month));
//     const end   = monthEnd(Number(year),   Number(month));

//     const [
//       colMonth, colAllTime,
//       payMonth, payAllTime,
//       progStats,
//       userStats,
//     ] = await Promise.all([
//       Collection.aggregate([
//         { $match: { updatedAt: { $gte: start, $lte: end } } },
//         { $group: { _id: null, total: { $sum: 1 }, collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } }, skipped: { $sum: { $cond: [{ $eq: ['$status', 'Skipped'] }, 1, 0] } }, weight: { $sum: '$actualWeight' } } },
//       ]),
//       Collection.aggregate([
//         { $group: { _id: null, total: { $sum: 1 }, collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } }, weight: { $sum: '$actualWeight' } } },
//       ]),
//       Payment.aggregate([
//         { $match: { status: 'completed', createdAt: { $gte: start, $lte: end } } },
//         { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 }, freeCount: { $sum: { $cond: ['$isFreeService', 1, 0] } } } },
//       ]),
//       Payment.aggregate([
//         { $match: { status: 'completed', isFreeService: false } },
//         { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
//       ]),
//       Program.aggregate([
//         { $group: { _id: '$status', count: { $sum: 1 }, volunteers: { $sum: '$currentVolunteers' } } },
//       ]),
//       User.aggregate([
//         { $group: { _id: '$role', count: { $sum: 1 }, paid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } }, freeService: { $sum: { $cond: ['$isServiceFree', 1, 0] } } } },
//       ]),
//     ]);

//     const cm  = colMonth[0]   || { total: 0, collected: 0, skipped: 0, weight: 0 };
//     const cat = colAllTime[0] || { total: 0, collected: 0, weight: 0 };
//     const monthRevenue = payMonth.reduce((s, p) => s + (p.isFreeService ? 0 : p.total), 0);
//     const allRevenue   = payAllTime[0]?.total || 0;
//     const freeCount    = payMonth.reduce((s, p) => s + (p.freeCount || 0), 0);

//     const byStatus = {}; progStats.forEach(p => { byStatus[p._id] = p; });
//     const byRole = {}; userStats.forEach(u => { byRole[u._id] = u; });

//     res.json({
//       success: true,
//       period: { year: Number(year), month: Number(month) },
//       monthly: { collections: cm.total, collected: cm.collected, skipped: cm.skipped, weight: Math.round(cm.weight * 10) / 10, completionRate: cm.total > 0 ? Math.round((cm.collected / cm.total) * 100) : 0, revenue: monthRevenue, freeRedemptions: freeCount },
//       allTime: { collections: cat.total, collected: cat.collected, weight: Math.round(cat.weight * 10) / 10, revenue: allRevenue, completionRate: cat.total > 0 ? Math.round((cat.collected / cat.total) * 100) : 0 },
//       programs: { active: byStatus['active']?.count || 0, upcoming: byStatus['upcoming']?.count || 0, completed: byStatus['completed']?.count || 0, totalVolunteers: progStats.reduce((s, p) => s + p.volunteers, 0) },
//       users: { residents: byRole['resident']?.count || 0, collectors: byRole['collector']?.count || 0, paidResidents: byRole['resident']?.paid || 0, freeService: byRole['resident']?.freeService || 0 },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ============================================================
// // @desc    GET filterable collection log
// // @route   GET /api/admin/reports/collections
// // ============================================================
// router.get('/collections', protect, authorize('admin'), async (req, res) => {
//   try {
//     const { year = nowY, month = nowM, zone, status, wasteType, page = 1, limit = 50 } = req.query;

//     const match = {};
//     if (year && month) {
//       match.updatedAt = { $gte: monthStart(Number(year), Number(month)), $lte: monthEnd(Number(year), Number(month)) };
//     }
//     if (zone)      match['address.zone'] = zone;
//     if (status)    match.status          = status;
//     if (wasteType) match.wasteType       = wasteType;

//     const [collections, total] = await Promise.all([
//       Collection.find(match).populate('resident', 'name address').populate('collector', 'name').sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).select('status wasteType actualWeight estimatedWeight address updatedAt notes feedback'),
//       Collection.countDocuments(match),
//     ]);

//     const zoneBreakdown = await Collection.aggregate([
//       { $match: { ...match, status: 'Collected' } },
//       { $group: { _id: '$address.zone', count: { $sum: 1 }, weight: { $sum: '$actualWeight' } } },
//       { $sort: { weight: -1 } },
//     ]);

//     res.json({ success: true, collections, total, totalPages: Math.ceil(total / limit), zoneBreakdown });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ============================================================
// // @desc    GET payment ledger
// // @route   GET /api/admin/reports/payments
// // ============================================================
// router.get('/payments', protect, authorize('admin'), async (req, res) => {
//   try {
//     const { year = nowY, month = nowM, method, page = 1, limit = 50 } = req.query;
//     const match = { status: 'completed' };
//     if (year && month) {
//       match.createdAt = { $gte: monthStart(Number(year), Number(month)), $lte: monthEnd(Number(year), Number(month)) };
//     }
//     if (method) match.paymentMethod = method;

//     const [payments, total, breakdown] = await Promise.all([
//       Payment.find(match).populate('user', 'name email address').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).select('amount paymentMethod isFreeService coinsUsed createdAt forMonth'),
//       Payment.countDocuments(match),
//       Payment.aggregate([{ $match: match }, { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 }, freeCount: { $sum: { $cond: ['$isFreeService', 1, 0] } } } }]),
//     ]);

//     res.json({ success: true, payments, total, totalPages: Math.ceil(total / limit), breakdown, grandTotal: breakdown.reduce((s, b) => s + b.total, 0) });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ============================================================
// // @desc    GET volunteer report
// // @route   GET /api/admin/reports/volunteers
// // ============================================================
// router.get('/volunteers', protect, authorize('admin'), async (req, res) => {
//   try {
//     const programs = await Program.find().populate('volunteers.user', 'name email address coins totalCoinsEarned').populate('createdBy', 'name').sort({ createdAt: -1 }).select('title organization zone status startDate endDate rewardCoins volunteers currentVolunteers maxVolunteers');
//     const rows = programs.map(p => ({
//       id: p._id, title: p.title, organization: p.organization, zone: p.zone, status: p.status, startDate: p.startDate, endDate: p.endDate, rewardCoins: p.rewardCoins, maxVolunteers: p.maxVolunteers,
//       approved: p.volunteers.filter(v => v.status === 'approved').length, pending: p.volunteers.filter(v => v.status === 'pending').length, rejected: p.volunteers.filter(v => v.status === 'rejected').length,
//       totalCoinsAwarded: p.volunteers.filter(v => v.status === 'approved').length * (p.rewardCoins || 100),
//     }));
//     res.json({ success: true, programs: rows });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ============================================================
// // @desc    DOWNLOAD full monthly PDF report
// // @route   GET /api/admin/reports/pdf/monthly
// // ============================================================
// router.get('/pdf/monthly', protect, authorize('admin'), async (req, res) => {
//   try {
//     const { year = nowY, month = nowM } = req.query;
    
//     // FIX: Renamed to reportYear and reportMonth to avoid naming collision
//     const reportYear = Number(year);
//     const reportMonth = Number(month);
//     const start = monthStart(reportYear, reportMonth);
//     const end   = monthEnd(reportYear, reportMonth);

//     const monthLabel = new Date(reportYear, reportMonth - 1, 1).toLocaleString('en-NP', { month: 'long', year: 'numeric' });

//     const [collections, payments, programs, users] = await Promise.all([
//       Collection.find({ updatedAt: { $gte: start, $lte: end } }).populate('resident', 'name address').populate('collector', 'name').sort({ updatedAt: -1 }),
//       Payment.find({ status: 'completed', createdAt: { $gte: start, $lte: end } }).populate('user', 'name').sort({ createdAt: -1 }),
//       Program.find().select('title status currentVolunteers maxVolunteers rewardCoins'),
//       User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
//     ]);

//     const totalWeight  = collections.filter(c => c.status === 'Collected').reduce((s, c) => s + (c.actualWeight || 0), 0);
//     const collected    = collections.filter(c => c.status === 'Collected').length;
//     const skipped      = collections.filter(c => c.status === 'Skipped').length;
//     const revenue      = payments.filter(p => !p.isFreeService).reduce((s, p) => s + (p.amount || 0), 0);
//     const freeService  = payments.filter(p => p.isFreeService).length;

//     const zoneMap = {};
//     collections.filter(c => c.status === 'Collected').forEach(c => {
//       const z = (c.address?.zone || 'unknown').toUpperCase();
//       if (!zoneMap[z]) zoneMap[z] = { count: 0, weight: 0 };
//       zoneMap[z].count++;
//       zoneMap[z].weight += c.actualWeight || 0;
//     });

//     const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
//     const W   = doc.internal.pageSize.getWidth();
//     const addPage = () => { doc.addPage(); return 20; };

//     const sectionHeader = (doc, text, y) => {
//       doc.setFillColor(...GREEN);
//       doc.roundedRect(14, y - 5, W - 28, 10, 2, 2, 'F');
//       doc.setFontSize(11);
//       doc.setTextColor(255, 255, 255);
//       doc.setFont(undefined, 'bold');
//       doc.text(text.toUpperCase(), 18, y + 2);
//       doc.setFont(undefined, 'normal');
//       doc.setTextColor(...DARK);
//       return y + 12;
//     };

//     const kpiBox = (doc, x, y, w, h, label, value, sub) => {
//       doc.setFillColor(...LIGHT);
//       doc.roundedRect(x, y, w, h, 3, 3, 'F');
//       doc.setFontSize(8);
//       doc.setTextColor(...GREY);
//       doc.text(label.toUpperCase(), x + 4, y + 7);
//       doc.setFontSize(16);
//       doc.setTextColor(...DARK);
//       doc.setFont(undefined, 'bold');
//       doc.text(String(value), x + 4, y + 18);
//       if (sub) {
//         doc.setFontSize(7);
//         doc.setTextColor(...GREY);
//         doc.setFont(undefined, 'normal');
//         doc.text(sub, x + 4, y + 24);
//       }
//     };

//     // COVER PAGE
//     doc.setFillColor(...GREEN);
//     doc.rect(0, 0, W, 55, 'F');
//     doc.setFontSize(22);
//     doc.setTextColor(255, 255, 255);
//     doc.setFont(undefined, 'bold');
//     doc.text('SMART WASTE MANAGEMENT SYSTEM', 14, 24);
//     doc.setFontSize(13);
//     doc.setFont(undefined, 'normal');
//     doc.text(`Monthly Operational Report — ${monthLabel}`, 14, 34);
//     doc.setFontSize(9);
//     doc.setTextColor(200, 255, 200);
//     doc.text(`Generated by: ${req.user.name}   ·   Date: ${new Date().toLocaleDateString('en-NP')}`, 14, 44);

//     // FIX: Using 'y' strictly for vertical positioning
//     let y = 68;

//     doc.setFontSize(13);
//     doc.setTextColor(...DARK);
//     doc.setFont(undefined, 'bold');
//     doc.text('Monthly Highlights', 14, y);
//     y += 8;

//     const kw = (W - 28 - 9) / 4;
//     kpiBox(doc, 14,          y, kw, 30, 'Total Pickups', collections.length, `${collected} collected`);
//     kpiBox(doc, 14 + kw + 3, y, kw, 30, 'Weight Collected', `${Math.round(totalWeight)}kg`, 'from collected jobs');
//     kpiBox(doc, 14 + (kw+3)*2, y, kw, 30, 'Revenue (Rs)', revenue.toLocaleString(), `${freeService} free redemptions`);
//     kpiBox(doc, 14 + (kw+3)*3, y, kw, 30, 'Completion %', `${collections.length > 0 ? Math.round((collected/collections.length)*100) : 0}%`, `${skipped} skipped`);
//     y += 38;

//     y = sectionHeader(doc, 'Zone-wise Waste Collection', y);
//     const zoneRows = Object.entries(zoneMap).map(([z, d]) => [
//       z, d.count, `${Math.round(d.weight * 10) / 10} kg`, `${totalWeight > 0 ? Math.round((d.weight / totalWeight) * 100) : 0}%`,
//     ]);

//     autoTable(doc, {
//       startY: y,
//       head: [['Zone', 'Collections', 'Weight (kg)', '% Share']],
//       body: zoneRows.length > 0 ? zoneRows : [['–', '–', '–', '–']],
//       theme: 'grid',
//       headStyles: { fillColor: GREEN, textColor: [255,255,255], fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       styles: { fontSize: 9, cellPadding: 3 },
//       margin: { left: 14, right: 14 },
//     });
    
//     y = doc.lastAutoTable.finalY + 10;

//     if (y > 220) { y = addPage(); }
//     y = sectionHeader(doc, `Collection Log (${collections.length} records)`, y);

//     const colRows = collections.slice(0, 100).map(c => [
//       new Date(c.updatedAt).toLocaleDateString('en-NP'),
//       c.resident?.name || '–',
//       (c.address?.zone || '–').toUpperCase(),
//       c.wasteType || '–',
//       c.actualWeight ? `${c.actualWeight}kg` : '–',
//       c.status,
//     ]);

//     autoTable(doc, {
//       startY: y,
//       head: [['Date', 'Resident', 'Zone', 'Type', 'Weight', 'Status']],
//       body: colRows.length > 0 ? colRows : [['No records', '', '', '', '', '']],
//       theme: 'striped',
//       headStyles: { fillColor: GREEN, textColor: [255,255,255], fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       styles: { fontSize: 8, cellPadding: 2.5 },
//       columnStyles: { 5: { fontStyle: 'bold' } },
//       didDrawCell: (data) => {
//         if (data.section === 'body' && data.column.index === 5) {
//           const status = data.cell.raw;
//           if (status === 'Collected') doc.setTextColor(...GREEN);
//           else if (status === 'Skipped') doc.setTextColor(239, 68, 68);
//           else doc.setTextColor(...YELLOW);
//         }
//       },
//       margin: { left: 14, right: 14 },
//     });

//     doc.addPage();
//     y = 20;
//     y = sectionHeader(doc, `Payment Ledger — ${monthLabel}`, y);

//     const payRows = payments.slice(0, 80).map(p => [
//       new Date(p.createdAt).toLocaleDateString('en-NP'),
//       p.user?.name || '–',
//       p.isFreeService ? 'Coin Redeem' : (p.paymentMethod || '–'),
//       p.isFreeService ? 'FREE' : `Rs. ${(p.amount || 0).toLocaleString()}`,
//     ]);

//     autoTable(doc, {
//       startY: y,
//       head: [['Date', 'Resident', 'Method', 'Amount']],
//       body: payRows.length > 0 ? payRows : [['No payments', '', '', '']],
//       theme: 'grid',
//       headStyles: { fillColor: GREEN, textColor: [255,255,255], fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       styles: { fontSize: 9, cellPadding: 3 },
//       margin: { left: 14, right: 14 },
//     });

//     y = doc.lastAutoTable.finalY + 8;
//     doc.setFillColor(240, 253, 244);
//     doc.roundedRect(14, y, W - 28, 12, 2, 2, 'F');
//     doc.setFontSize(10);
//     doc.setFont(undefined, 'bold');
//     doc.setTextColor(...GREEN);
//     doc.text(`Total Revenue (cash): Rs. ${revenue.toLocaleString()}   ·   Free service redemptions: ${freeService}`, 18, y + 8);
//     y += 20;

//     if (y > 230) { doc.addPage(); y = 20; }
//     y = sectionHeader(doc, 'Volunteer Program Summary', y);

//     const progRows = programs.map(p => [
//       p.title,
//       p.organization || 'SWM Admin',
//       (p.zone || 'All').toUpperCase(),
//       p.status,
//       p.currentVolunteers,
//       p.maxVolunteers,
//       `${p.rewardCoins || 100} coins`,
//     ]);

//     autoTable(doc, {
//       startY: y,
//       head: [['Program', 'Org', 'Zone', 'Status', 'Volunteers', 'Capacity', 'Reward']],
//       body: progRows.length > 0 ? progRows : [['No programs', '', '', '', '', '', '']],
//       theme: 'striped',
//       headStyles: { fillColor: GREEN, textColor: [255,255,255], fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       styles: { fontSize: 8, cellPadding: 2.5 },
//       margin: { left: 14, right: 14 },
//     });

//     const totalPages = doc.internal.getNumberOfPages();
//     for (let i = 1; i <= totalPages; i++) {
//       doc.setPage(i);
//       doc.setFillColor(248, 250, 252);
//       doc.rect(0, doc.internal.pageSize.getHeight() - 12, W, 12, 'F');
//       doc.setFontSize(7);
//       doc.setTextColor(...GREY);
//       doc.text(
//         `SWMS Official Report · ${monthLabel} · Generated ${new Date().toLocaleDateString('en-NP')} · Page ${i} of ${totalPages}`,
//         14, doc.internal.pageSize.getHeight() - 4
//       );
//     }

//     const filename = `SWMS_Report_${reportYear}_${String(reportMonth).padStart(2,'0')}.pdf`;
//     res.set({
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': `attachment; filename="${filename}"`,
//     });
//     res.send(Buffer.from(doc.output('arraybuffer')));

//   } catch (err) {
//     console.error('PDF generation error:', err);
//     res.status(500).json({ success: false, message: 'PDF generation failed: ' + err.message });
//   }
// });

// // ============================================================
// // @desc    DOWNLOAD filtered collection PDF (quick export)
// // @route   GET /api/admin/reports/pdf/collections
// // ============================================================
// router.get('/pdf/collections', protect, authorize('admin'), async (req, res) => {
//   try {
//     const { year = nowY, month = nowM, zone, status } = req.query;
    
//     // FIX: Consistent variable renaming applied here as well
//     const reportYear = Number(year);
//     const reportMonth = Number(month);
//     const start = monthStart(reportYear, reportMonth);
//     const end   = monthEnd(reportYear, reportMonth);
//     const monthLabel = new Date(reportYear, reportMonth - 1, 1).toLocaleString('en-NP', { month: 'long', year: 'numeric' });

//     const match = { updatedAt: { $gte: start, $lte: end } };
//     if (zone)   match['address.zone'] = zone;
//     if (status) match.status          = status;

//     const collections = await Collection.find(match)
//       .populate('resident',  'name address')
//       .populate('collector', 'name')
//       .sort({ updatedAt: -1 });

//     const doc = new jsPDF();
//     const W = doc.internal.pageSize.getWidth();

//     doc.setFillColor(...GREEN);
//     doc.rect(0, 0, W, 38, 'F');
//     doc.setFontSize(16);
//     doc.setTextColor(255, 255, 255);
//     doc.setFont(undefined, 'bold');
//     doc.text('SWMS — Collection Export', 14, 18);
//     doc.setFontSize(9);
//     doc.setFont(undefined, 'normal');
//     doc.text(`${monthLabel}${zone ? ' · Zone ' + zone.toUpperCase() : ''}${status ? ' · ' + status : ''} · ${collections.length} records`, 14, 28);

//     const rows = collections.map(c => [
//       new Date(c.updatedAt).toLocaleDateString('en-NP'),
//       c.resident?.name || '–',
//       (c.address?.zone || '–').toUpperCase(),
//       c.wasteType || '–',
//       c.actualWeight ? `${c.actualWeight}kg` : '–',
//       c.collector?.name || 'Unassigned',
//       c.status,
//     ]);

//     autoTable(doc, {
//       startY: 44,
//       head: [['Date', 'Resident', 'Zone', 'Type', 'Weight', 'Collector', 'Status']],
//       body: rows,
//       theme: 'grid',
//       headStyles: { fillColor: GREEN, textColor: [255,255,255], fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       styles: { fontSize: 8, cellPadding: 2.5 },
//       margin: { left: 14, right: 14 },
//     });

//     const totalPages = doc.internal.getNumberOfPages();
//     for (let i = 1; i <= totalPages; i++) {
//       doc.setPage(i);
//       doc.setFontSize(7);
//       doc.setTextColor(...GREY);
//       doc.text(`Page ${i} of ${totalPages}`, 14, doc.internal.pageSize.getHeight() - 5);
//     }

//     res.set({
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': `attachment; filename="SWMS_Collections_${reportYear}_${String(reportMonth).padStart(2,'0')}.pdf"`,
//     });
//     res.send(Buffer.from(doc.output('arraybuffer')));

//   } catch (err) {
//     res.status(500).json({ success: false, message: 'PDF export failed: ' + err.message });
//   }
// });

// module.exports = router;


// ============================================================
// ADMIN FEATURE 3: Reports & PDF Export
// FILE: backend/routes/adminReports.js
// ============================================================

const express      = require('express');
const router       = express.Router();
const { jsPDF }    = require('jspdf');
const autoTable    = require('jspdf-autotable'); 

const Collection = require('../models/Collection');
const Payment    = require('../models/Payment');
const Program    = require('../models/Program');
const User       = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// ── Helpers ───────────────────────────────────────────────────
const monthStart = (year, month) => new Date(year, month - 1, 1);
const monthEnd   = (year, month) => new Date(year, month, 0, 23, 59, 59, 999);

const nowY = new Date().getFullYear();
const nowM = new Date().getMonth() + 1;

// ── PDF brand colours ─────────────────────────────────────────
const GREEN  = [22, 163, 74];
const LIGHT  = [240, 253, 244];
const GREY   = [100, 116, 139];
const DARK   = [15, 23, 42];
const YELLOW = [245, 158, 11];

// ============================================================
// @desc    GET report summary KPIs
// ============================================================
router.get('/summary', protect, authorize('admin'), async (req, res) => {
  try {
    const { year = nowY, month = nowM } = req.query;
    const start = monthStart(Number(year), Number(month));
    const end   = monthEnd(Number(year),   Number(month));

    const [
      colMonth, colAllTime,
      payMonth, payAllTime,
      progStats,
      userStats,
    ] = await Promise.all([
      Collection.aggregate([
        { $match: { updatedAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: 1 }, collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } }, skipped: { $sum: { $cond: [{ $eq: ['$status', 'Skipped'] }, 1, 0] } }, weight: { $sum: '$actualWeight' } } },
      ]),
      Collection.aggregate([
        { $group: { _id: null, total: { $sum: 1 }, collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } }, weight: { $sum: '$actualWeight' } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 }, freeCount: { $sum: { $cond: ['$isFreeService', 1, 0] } } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'completed', isFreeService: false } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Program.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, volunteers: { $sum: '$currentVolunteers' } } },
      ]),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 }, paid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } }, freeService: { $sum: { $cond: ['$isServiceFree', 1, 0] } } } },
      ]),
    ]);

    const cm  = colMonth[0]   || { total: 0, collected: 0, skipped: 0, weight: 0 };
    const cat = colAllTime[0] || { total: 0, collected: 0, weight: 0 };
    const monthRevenue = payMonth.reduce((s, p) => s + (p.isFreeService ? 0 : p.total), 0);
    const allRevenue   = payAllTime[0]?.total || 0;
    const freeCount    = payMonth.reduce((s, p) => s + (p.freeCount || 0), 0);

    const byStatus = {}; progStats.forEach(p => { byStatus[p._id] = p; });
    const byRole = {}; userStats.forEach(u => { byRole[u._id] = u; });

    res.json({
      success: true,
      period: { year: Number(year), month: Number(month) },
      monthly: { collections: cm.total, collected: cm.collected, skipped: cm.skipped, weight: Math.round(cm.weight * 10) / 10, completionRate: cm.total > 0 ? Math.round((cm.collected / cm.total) * 100) : 0, revenue: monthRevenue, freeRedemptions: freeCount },
      allTime: { collections: cat.total, collected: cat.collected, weight: Math.round(cat.weight * 10) / 10, revenue: allRevenue, completionRate: cat.total > 0 ? Math.round((cat.collected / cat.total) * 100) : 0 },
      programs: { active: byStatus['active']?.count || 0, upcoming: byStatus['upcoming']?.count || 0, completed: byStatus['completed']?.count || 0, totalVolunteers: progStats.reduce((s, p) => s + p.volunteers, 0) },
      users: { residents: byRole['resident']?.count || 0, collectors: byRole['collector']?.count || 0, paidResidents: byRole['resident']?.paid || 0, freeService: byRole['resident']?.freeService || 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    GET filterable collection log
// ============================================================
router.get('/collections', protect, authorize('admin'), async (req, res) => {
  try {
    const { year = nowY, month = nowM, zone, status, wasteType, page = 1, limit = 50 } = req.query;

    const match = {};
    if (year && month) {
      match.updatedAt = { $gte: monthStart(Number(year), Number(month)), $lte: monthEnd(Number(year), Number(month)) };
    }
    if (zone)      match['address.zone'] = zone;
    if (status)    match.status          = status;
    if (wasteType) match.wasteType       = wasteType;

    const [collections, total] = await Promise.all([
      Collection.find(match).populate('resident', 'name address').populate('collector', 'name').sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).select('status wasteType actualWeight estimatedWeight address updatedAt notes feedback'),
      Collection.countDocuments(match),
    ]);

    const zoneBreakdown = await Collection.aggregate([
      { $match: { ...match, status: 'Collected' } },
      { $group: { _id: '$address.zone', count: { $sum: 1 }, weight: { $sum: '$actualWeight' } } },
      { $sort: { weight: -1 } },
    ]);

    res.json({ success: true, collections, total, totalPages: Math.ceil(total / limit), zoneBreakdown });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    GET payment ledger
// ============================================================
router.get('/payments', protect, authorize('admin'), async (req, res) => {
  try {
    const { year = nowY, month = nowM, method, page = 1, limit = 50 } = req.query;
    const match = { status: 'completed' };
    if (year && month) {
      match.createdAt = { $gte: monthStart(Number(year), Number(month)), $lte: monthEnd(Number(year), Number(month)) };
    }
    if (method) match.paymentMethod = method;

    const [payments, total, breakdown] = await Promise.all([
      Payment.find(match).populate('user', 'name email address').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).select('amount paymentMethod isFreeService coinsUsed createdAt forMonth'),
      Payment.countDocuments(match),
      Payment.aggregate([{ $match: match }, { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 }, freeCount: { $sum: { $cond: ['$isFreeService', 1, 0] } } } }]),
    ]);

    res.json({ success: true, payments, total, totalPages: Math.ceil(total / limit), breakdown, grandTotal: breakdown.reduce((s, b) => s + b.total, 0) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    GET volunteer report
// ============================================================
router.get('/volunteers', protect, authorize('admin'), async (req, res) => {
  try {
    const programs = await Program.find().populate('volunteers.user', 'name email address coins totalCoinsEarned').populate('createdBy', 'name').sort({ createdAt: -1 }).select('title organization zone status startDate endDate rewardCoins volunteers currentVolunteers maxVolunteers');
    const rows = programs.map(p => ({
      id: p._id, title: p.title, organization: p.organization, zone: p.zone, status: p.status, startDate: p.startDate, endDate: p.endDate, rewardCoins: p.rewardCoins, maxVolunteers: p.maxVolunteers,
      approved: p.volunteers.filter(v => v.status === 'approved').length, pending: p.volunteers.filter(v => v.status === 'pending').length, rejected: p.volunteers.filter(v => v.status === 'rejected').length,
      totalCoinsAwarded: p.volunteers.filter(v => v.status === 'approved').length * (p.rewardCoins || 100),
    }));
    res.json({ success: true, programs: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    DOWNLOAD full monthly PDF report
// ============================================================
router.get('/pdf/monthly', protect, authorize('admin'), async (req, res) => {
  try {
    const { year = nowY, month = nowM } = req.query;
    
    const reportYear = Number(year);
    const reportMonth = Number(month);
    const start = monthStart(reportYear, reportMonth);
    const end   = monthEnd(reportYear, reportMonth);

    const monthLabel = new Date(reportYear, reportMonth - 1, 1).toLocaleString('en-NP', { month: 'long', year: 'numeric' });

    const [collections, payments, programs, users] = await Promise.all([
      Collection.find({ updatedAt: { $gte: start, $lte: end } }).populate('resident', 'name address').populate('collector', 'name').sort({ updatedAt: -1 }),
      Payment.find({ status: 'completed', createdAt: { $gte: start, $lte: end } }).populate('user', 'name').sort({ createdAt: -1 }),
      Program.find().select('title status currentVolunteers maxVolunteers rewardCoins'),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    ]);

    const totalWeight  = collections.filter(c => c.status === 'Collected').reduce((s, c) => s + (c.actualWeight || 0), 0);
    const collected    = collections.filter(c => c.status === 'Collected').length;
    const skipped      = collections.filter(c => c.status === 'Skipped').length;
    const revenue      = payments.filter(p => !p.isFreeService).reduce((s, p) => s + (p.amount || 0), 0);
    const freeService  = payments.filter(p => p.isFreeService).length;

    const zoneMap = {};
    collections.filter(c => c.status === 'Collected').forEach(c => {
      const z = (c.address?.zone || 'unknown').toUpperCase();
      if (!zoneMap[z]) zoneMap[z] = { count: 0, weight: 0 };
      zoneMap[z].count++;
      zoneMap[z].weight += c.actualWeight || 0;
    });

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W   = doc.internal.pageSize.getWidth();
    const addPage = () => { doc.addPage(); return 20; };

    // FIX: Using explicit string "helvetica" instead of undefined for fonts
    const sectionHeader = (doc, text, y) => {
      doc.setFillColor(...GREEN);
      doc.roundedRect(14, y - 5, W - 28, 10, 2, 2, 'F');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold'); 
      doc.text(text.toUpperCase(), 18, y + 2);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...DARK);
      return y + 12;
    };

    const kpiBox = (doc, x, y, w, h, label, value, sub) => {
      doc.setFillColor(...LIGHT);
      doc.roundedRect(x, y, w, h, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setTextColor(...GREY);
      doc.text(label.toUpperCase(), x + 4, y + 7);
      doc.setFontSize(16);
      doc.setTextColor(...DARK);
      doc.setFont('helvetica', 'bold');
      doc.text(String(value), x + 4, y + 18);
      if (sub) {
        doc.setFontSize(7);
        doc.setTextColor(...GREY);
        doc.setFont('helvetica', 'normal');
        doc.text(sub, x + 4, y + 24);
      }
    };

    // COVER PAGE
    doc.setFillColor(...GREEN);
    doc.rect(0, 0, W, 55, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('SMART WASTE MANAGEMENT SYSTEM', 14, 24);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.text(`Monthly Operational Report — ${monthLabel}`, 14, 34);
    doc.setFontSize(9);
    doc.setTextColor(200, 255, 200);
    doc.text(`Generated by: Admin   ·   Date: ${new Date().toLocaleDateString('en-NP')}`, 14, 44);

    let y = 68;

    doc.setFontSize(13);
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Highlights', 14, y);
    y += 8;

    const kw = (W - 28 - 9) / 4;
    kpiBox(doc, 14,          y, kw, 30, 'Total Pickups', collections.length, `${collected} collected`);
    kpiBox(doc, 14 + kw + 3, y, kw, 30, 'Weight Collected', `${Math.round(totalWeight)}kg`, 'from collected jobs');
    kpiBox(doc, 14 + (kw+3)*2, y, kw, 30, 'Revenue (Rs)', revenue.toLocaleString(), `${freeService} free redemptions`);
    kpiBox(doc, 14 + (kw+3)*3, y, kw, 30, 'Completion %', `${collections.length > 0 ? Math.round((collected/collections.length)*100) : 0}%`, `${skipped} skipped`);
    y += 38;

    y = sectionHeader(doc, 'Zone-wise Waste Collection', y);
    const zoneRows = Object.entries(zoneMap).map(([z, d]) => [
      z, d.count, `${Math.round(d.weight * 10) / 10} kg`, `${totalWeight > 0 ? Math.round((d.weight / totalWeight) * 100) : 0}%`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Zone', 'Collections', 'Weight (kg)', '% Share']],
      body: zoneRows.length > 0 ? zoneRows : [['–', '–', '–', '–']],
      theme: 'grid',
      headStyles: { fillColor: GREEN, textColor: [255,255,255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });
    
    // FIX: Safe retrieval of final Y coordinate
    y = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : y + 30;

    if (y > 220) { y = addPage(); }
    y = sectionHeader(doc, `Collection Log (${collections.length} records)`, y);

    const colRows = collections.slice(0, 100).map(c => [
      new Date(c.updatedAt).toLocaleDateString('en-NP'),
      c.resident?.name || '–',
      (c.address?.zone || '–').toUpperCase(),
      c.wasteType || '–',
      c.actualWeight ? `${c.actualWeight}kg` : '–',
      c.status,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Date', 'Resident', 'Zone', 'Type', 'Weight', 'Status']],
      body: colRows.length > 0 ? colRows : [['No records', '', '', '', '', '']],
      theme: 'striped',
      headStyles: { fillColor: GREEN, textColor: [255,255,255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: { 5: { fontStyle: 'bold' } },
      margin: { left: 14, right: 14 },
    });

    doc.addPage();
    y = 20;
    y = sectionHeader(doc, `Payment Ledger — ${monthLabel}`, y);

    const payRows = payments.slice(0, 80).map(p => [
      new Date(p.createdAt).toLocaleDateString('en-NP'),
      p.user?.name || '–',
      p.isFreeService ? 'Coin Redeem' : (p.paymentMethod || '–'),
      p.isFreeService ? 'FREE' : `Rs. ${(p.amount || 0).toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Date', 'Resident', 'Method', 'Amount']],
      body: payRows.length > 0 ? payRows : [['No payments', '', '', '']],
      theme: 'grid',
      headStyles: { fillColor: GREEN, textColor: [255,255,255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });

    // FIX: Safe retrieval of final Y coordinate
    y = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 8 : y + 30;
    
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, y, W - 28, 12, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GREEN);
    doc.text(`Total Revenue (cash): Rs. ${revenue.toLocaleString()}   ·   Free service redemptions: ${freeService}`, 18, y + 8);
    y += 20;

    if (y > 230) { doc.addPage(); y = 20; }
    y = sectionHeader(doc, 'Volunteer Program Summary', y);

    const progRows = programs.map(p => [
      p.title,
      p.organization || 'SWM Admin',
      (p.zone || 'All').toUpperCase(),
      p.status,
      p.currentVolunteers,
      p.maxVolunteers,
      `${p.rewardCoins || 100} coins`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Program', 'Org', 'Zone', 'Status', 'Volunteers', 'Capacity', 'Reward']],
      body: progRows.length > 0 ? progRows : [['No programs', '', '', '', '', '', '']],
      theme: 'striped',
      headStyles: { fillColor: GREEN, textColor: [255,255,255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8, cellPadding: 2.5 },
      margin: { left: 14, right: 14 },
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(248, 250, 252);
      doc.rect(0, doc.internal.pageSize.getHeight() - 12, W, 12, 'F');
      doc.setFontSize(7);
      doc.setTextColor(...GREY);
      doc.text(
        `SWMS Official Report · ${monthLabel} · Generated ${new Date().toLocaleDateString('en-NP')} · Page ${i} of ${totalPages}`,
        14, doc.internal.pageSize.getHeight() - 4
      );
    }

    const filename = `SWMS_Report_${reportYear}_${String(reportMonth).padStart(2,'0')}.pdf`;
    
    // FIX: Using Buffer.from directly creates a node-compatible buffer from the arraybuffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length
    });
    
    res.send(pdfBuffer);

  } catch (err) {
    console.error('🔥 PDF generation error:', err);
    res.status(500).json({ success: false, message: 'PDF generation failed: ' + err.message });
  }
});

// ============================================================
// @desc    DOWNLOAD filtered collection PDF (quick export)
// ============================================================
router.get('/pdf/collections', protect, authorize('admin'), async (req, res) => {
  try {
    const { year = nowY, month = nowM, zone, status } = req.query;
    
    const reportYear = Number(year);
    const reportMonth = Number(month);
    const start = monthStart(reportYear, reportMonth);
    const end   = monthEnd(reportYear, reportMonth);
    const monthLabel = new Date(reportYear, reportMonth - 1, 1).toLocaleString('en-NP', { month: 'long', year: 'numeric' });

    const match = { updatedAt: { $gte: start, $lte: end } };
    if (zone)   match['address.zone'] = zone;
    if (status) match.status          = status;

    const collections = await Collection.find(match)
      .populate('resident',  'name address')
      .populate('collector', 'name')
      .sort({ updatedAt: -1 });

    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();

    doc.setFillColor(...GREEN);
    doc.rect(0, 0, W, 38, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('SWMS — Collection Export', 14, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${monthLabel}${zone ? ' · Zone ' + zone.toUpperCase() : ''}${status ? ' · ' + status : ''} · ${collections.length} records`, 14, 28);

    const rows = collections.map(c => [
      new Date(c.updatedAt).toLocaleDateString('en-NP'),
      c.resident?.name || '–',
      (c.address?.zone || '–').toUpperCase(),
      c.wasteType || '–',
      c.actualWeight ? `${c.actualWeight}kg` : '–',
      c.collector?.name || 'Unassigned',
      c.status,
    ]);

    autoTable(doc, {
      startY: 44,
      head: [['Date', 'Resident', 'Zone', 'Type', 'Weight', 'Collector', 'Status']],
      body: rows.length > 0 ? rows : [['No data', '', '', '', '', '', '']],
      theme: 'grid',
      headStyles: { fillColor: GREEN, textColor: [255,255,255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8, cellPadding: 2.5 },
      margin: { left: 14, right: 14 },
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(...GREY);
      doc.text(`Page ${i} of ${totalPages}`, 14, doc.internal.pageSize.getHeight() - 5);
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="SWMS_Collections_${reportYear}_${String(reportMonth).padStart(2,'0')}.pdf"`,
      'Content-Length': pdfBuffer.length
    });
    
    res.send(pdfBuffer);

  } catch (err) {
    console.error('🔥 PDF generation error:', err);
    res.status(500).json({ success: false, message: 'PDF export failed: ' + err.message });
  }
});

module.exports = router;