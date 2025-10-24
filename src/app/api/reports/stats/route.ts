import { NextResponse } from 'next/server';
import { db } from '@/db';
import { reports } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/reports/stats - Get statistics about reports
 */
export async function GET() {
  try {
    const [
      allReports,
      onChainReports,
      phishingReports,
      scamWalletReports,
    ] = await Promise.all([
      db.select().from(reports),
      db.select().from(reports).where(eq(reports.anchorOnChain, true)),
      db.select().from(reports).where(eq(reports.reportType, 'phishing_url')),
      db.select().from(reports).where(eq(reports.reportType, 'scam_wallet')),
    ]);

    const totalReports = allReports.length;
    const anchoredReports = onChainReports.length;
    const anchoredPercentage = totalReports > 0 
      ? ((anchoredReports / totalReports) * 100).toFixed(1)
      : "0";

    // Count unique reporter addresses
    const uniqueReporters = new Set(allReports.map(r => r.reporterAddress)).size;

    return NextResponse.json({
      success: true,
      data: {
        totalReports,
        anchoredReports,
        phishingReports: phishingReports.length,
        scamWalletReports: scamWalletReports.length,
        totalUsers: uniqueReporters,
        anchoredPercentage,
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}