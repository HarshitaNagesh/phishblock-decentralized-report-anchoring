import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reports } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

// GET handler - Read records with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status');
    const reportType = searchParams.get('reportType');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;
    
    // Build where conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(reports.status, status));
    }
    if (reportType) {
      conditions.push(eq(reports.reportType, reportType));
    }
    if (search) {
      conditions.push(
        or(
          like(reports.targetValue, `%${search}%`),
          like(reports.description, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch reports with filters
    const [reportsList, allReports] = await Promise.all([
      db.select().from(reports).where(whereClause).orderBy(desc(reports.createdAt)).limit(limit).offset(offset),
      db.select().from(reports).where(whereClause)
    ]);
    
    const total = allReports.length;

    // Transform reports to match expected interface
    const transformedReports = reportsList.map(report => ({
      id: report.id,
      reportType: report.reportType,
      targetValue: report.targetValue,
      description: report.description,
      reportHash: report.reportHash,
      isAnchoredOnChain: report.anchorOnChain,
      onChainTxHash: report.onChainTxHash,
      createdAt: report.createdAt,
      reporter: {
        walletAddress: report.reporterAddress
      }
    }));

    return NextResponse.json({
      success: true,
      data: {
        reports: transformedReports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

// POST handler - Create record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reportType,
      targetValue,
      description,
      reporterAddress,
      anchorOnChain,
      onChainTxHash,
      contractId,
      reportHash,
      userId,
    } = body;
    
    // Validate required fields
    if (!reportType || !targetValue || !description || !reporterAddress) {
      return NextResponse.json({ 
        success: false,
        error: "reportType, targetValue, description, and reporterAddress are required" 
      }, { status: 400 });
    }

    // Validate reportType
    if (!['phishing_url', 'scam_wallet'].includes(reportType)) {
      return NextResponse.json({ 
        success: false,
        error: "reportType must be either 'phishing_url' or 'scam_wallet'" 
      }, { status: 400 });
    }
    
    const newRecord = await db.insert(reports).values({
      reportType,
      targetValue,
      description,
      reporterAddress,
      userId: userId || null,
      anchorOnChain: anchorOnChain !== undefined ? anchorOnChain : false,
      onChainTxHash: onChainTxHash || null,
      contractId: contractId || null,
      reportHash: reportHash || null,
      voteScore: 0,
      upvotes: 0,
      downvotes: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();
    
    return NextResponse.json({
      success: true,
      data: newRecord[0]
    }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}