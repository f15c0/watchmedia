import jsPDF from "jspdf";
import { format } from "date-fns";

interface AnalyticsData {
  totalMentions: number;
  sentimentBreakdown: { POSITIVE: number; NEGATIVE: number; NEUTRAL: number };
  mentionsTrend: { date: string; count: number }[];
  sourceBreakdown: { source: string; count: number }[];
  keywordStats: { keyword: string; positive: number; negative: number; neutral: number; total: number }[];
  avgSentimentScore: number;
}

export async function generatePDF(data: AnalyticsData, days: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 16;
  let y = 20;

  const primaryColor: [number, number, number] = [37, 99, 235];
  const textColor: [number, number, number] = [30, 41, 59];
  const mutedColor: [number, number, number] = [100, 116, 139];
  const bgColor: [number, number, number] = [248, 250, 252];

  // Header bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, W, 18, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("MediaWatch Pro", margin, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Sentiment Analytics Report", margin, 17);
  doc.text(`Generated ${format(new Date(), "PPP")}`, W - margin, 12, { align: "right" });
  doc.text(`Period: Last ${days} days`, W - margin, 17, { align: "right" });

  y = 28;

  // Title
  doc.setTextColor(...textColor);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Analytics Summary", margin, y);
  y += 10;

  // KPI row
  const kpiW = (W - margin * 2 - 9) / 4;
  const kpis = [
    { label: "Total Mentions", value: String(data.totalMentions), color: primaryColor },
    { label: "Positive", value: String(data.sentimentBreakdown.POSITIVE), color: [34, 197, 94] as [number, number, number] },
    { label: "Negative", value: String(data.sentimentBreakdown.NEGATIVE), color: [239, 68, 68] as [number, number, number] },
    { label: "Avg Score", value: String(data.avgSentimentScore), color: [100, 116, 139] as [number, number, number] },
  ];

  for (let i = 0; i < kpis.length; i++) {
    const x = margin + i * (kpiW + 3);
    doc.setFillColor(...bgColor);
    doc.roundedRect(x, y, kpiW, 22, 2, 2, "F");
    doc.setTextColor(...kpis[i].color);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(kpis[i].value, x + kpiW / 2, y + 12, { align: "center" });
    doc.setTextColor(...mutedColor);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(kpis[i].label, x + kpiW / 2, y + 19, { align: "center" });
  }
  y += 30;

  // Source breakdown section
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Mentions by Source", margin, y);
  y += 6;

  const barColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1"];
  const maxCount = Math.max(...data.sourceBreakdown.map((s) => s.count), 1);
  const barMaxW = W - margin * 2 - 40;

  for (const [i, src] of data.sourceBreakdown.entries()) {
    const barW = (src.count / maxCount) * barMaxW;
    const hex = barColors[i % barColors.length];
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    doc.setTextColor(...mutedColor);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(src.source, margin, y + 4);

    doc.setFillColor(r, g, b);
    doc.roundedRect(margin + 28, y, barW, 5, 1, 1, "F");

    doc.setTextColor(...textColor);
    doc.setFontSize(8);
    doc.text(String(src.count), margin + 28 + barW + 2, y + 4);

    y += 9;
  }
  y += 6;

  // Keyword sentiment table
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Keyword Breakdown", margin, y);
  y += 6;

  // Table header
  doc.setFillColor(...primaryColor);
  doc.rect(margin, y, W - margin * 2, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  const colX = [margin + 2, margin + 50, margin + 80, margin + 110, margin + 140];
  ["Keyword", "Total", "Positive", "Negative", "Neutral"].forEach((h, i) =>
    doc.text(h, colX[i], y + 5)
  );
  y += 7;

  for (const [idx, kw] of data.keywordStats.entries()) {
    if (idx % 2 === 0) {
      doc.setFillColor(...bgColor);
      doc.rect(margin, y, W - margin * 2, 7, "F");
    }
    doc.setTextColor(...textColor);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(kw.keyword, colX[0], y + 5);
    doc.text(String(kw.total), colX[1], y + 5);
    doc.setTextColor(34, 197, 94);
    doc.text(String(kw.positive), colX[2], y + 5);
    doc.setTextColor(239, 68, 68);
    doc.text(String(kw.negative), colX[3], y + 5);
    doc.setTextColor(...mutedColor);
    doc.text(String(kw.neutral), colX[4], y + 5);
    y += 7;
  }
  y += 8;

  // Mentions trend section
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Daily Mentions Trend", margin, y);
  y += 6;

  const trendMax = Math.max(...data.mentionsTrend.map((t) => t.count), 1);
  const trendW = (W - margin * 2) / Math.max(data.mentionsTrend.length, 1);

  for (const [i, trend] of data.mentionsTrend.entries()) {
    const barH = (trend.count / trendMax) * 20;
    const x = margin + i * trendW;
    doc.setFillColor(...primaryColor);
    doc.roundedRect(x + 1, y + 20 - barH, trendW - 2, barH, 1, 1, "F");
    doc.setTextColor(...mutedColor);
    doc.setFontSize(6);
    if (data.mentionsTrend.length <= 14) {
      doc.text(trend.date, x + trendW / 2, y + 24, { align: "center" });
    }
  }
  y += 30;

  // Footer
  doc.setFillColor(...bgColor);
  doc.rect(0, 282, W, 15, "F");
  doc.setTextColor(...mutedColor);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("MediaWatch Pro — Confidential", margin, 290);
  doc.text("mediawatch.pro", W - margin, 290, { align: "right" });

  doc.save(`mediawatch-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
