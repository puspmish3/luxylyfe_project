import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

async function verifyAdminAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.role || !['ADMIN', 'SUPERADMIN'].includes(decoded.role)) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

// POST /api/requests - Create a new request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, email, phone, subject, message, preferredDate, timeWindow } = body;

    // Validate required fields
    if (!type || !name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: type, name, email, phone' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['CONTACT_US', 'SCHEDULE_VIEWING'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid request type. Must be CONTACT_US or SCHEDULE_VIEWING' },
        { status: 400 }
      );
    }

    // Validate specific fields for SCHEDULE_VIEWING
    if (type === 'SCHEDULE_VIEWING' && (!preferredDate || !timeWindow)) {
      return NextResponse.json(
        { error: 'Missing required fields for scheduling: preferredDate, timeWindow' },
        { status: 400 }
      );
    }

    // Create the request
    const newRequest = await db.requests.create({
      type,
      name,
      email,
      phone,
      subject,
      message,
      preferredDate,
      timeWindow,
      status: 'PENDING'
    });

    return NextResponse.json({
      success: true,
      data: newRequest,
      message: 'Request submitted successfully'
    });

  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 }
    );
  }
}

// GET /api/requests - Get requests (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication for admin access
    const user = await verifyAdminAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;
    const assignedTo = searchParams.get('assignedTo') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    // Get requests based on filters
    const requests = await db.requests.findMany({
      status,
      type,
      assignedTo,
      limit,
      offset
    });

    // Get total count for pagination
    const totalCount = await db.requests.count({
      status,
      type
    });

    return NextResponse.json({
      success: true,
      data: requests,
      pagination: {
        total: totalCount,
        limit: limit || requests.length,
        offset: offset || 0
      }
    });

  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}