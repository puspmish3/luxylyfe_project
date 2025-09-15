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

// PATCH /api/requests/[id] - Update a request
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication for admin access
    const user = await verifyAdminAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const requestId = params.id;
    const body = await request.json();
    const { status, assignedTo } = body;

    // Validate status if provided
    if (status && !['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be PENDING, IN_PROGRESS, COMPLETED, or CANCELLED' },
        { status: 400 }
      );
    }

    // Check if request exists
    const existingRequest = await db.requests.findById(requestId);
    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Update the request
    const updatedRequest = await db.requests.update(requestId, {
      ...(status && { status }),
      ...(assignedTo !== undefined && { assignedTo })
    });

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: 'Request updated successfully'
    });

  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}

// GET /api/requests/[id] - Get a specific request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication for admin access
    const user = await verifyAdminAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const requestId = params.id;

    // Get the request
    const requestData = await db.requests.findById(requestId);
    if (!requestData) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: requestData
    });

  } catch (error) {
    console.error('Error fetching request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}

// DELETE /api/requests/[id] - Delete a request (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication for admin access
    const user = await verifyAdminAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const requestId = params.id;

    // Check if request exists
    const existingRequest = await db.requests.findById(requestId);
    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Delete the request
    await db.requests.delete(requestId);

    return NextResponse.json({
      success: true,
      message: 'Request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting request:', error);
    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    );
  }
}