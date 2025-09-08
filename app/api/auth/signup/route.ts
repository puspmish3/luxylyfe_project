import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, name, phone, propertyId, propertyAddress, propertyNumber } = await request.json()

    // Validate input
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    // Validate role (only allow MEMBER signup)
    if (role !== 'MEMBER') {
      return NextResponse.json(
        { error: 'Invalid role. Only member registration is allowed.' },
        { status: 400 }
      )
    }

    // Validate required fields for members
    if (!name || !phone || !propertyId || !propertyAddress || !propertyNumber) {
      return NextResponse.json(
        { error: 'Name, phone, property ID, property address, and property number are required for member registration' },
        { status: 400 }
      )
    }

    // Validate property information against database
    const property = await prisma.property.findUnique({
      where: { propertyId }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Invalid Property ID. Please check and try again.' },
        { status: 400 }
      )
    }

    // Validate that the provided information matches the property
    const propertyEmail = property.email?.toLowerCase()
    const propertyPhone = property.phone
    const userEmail = email.toLowerCase()
    const userPhone = phone

    // Check if email matches (if property has email)
    if (propertyEmail && propertyEmail !== userEmail) {
      return NextResponse.json(
        { error: 'Email does not match the property records. Please contact support if you believe this is an error.' },
        { status: 400 }
      )
    }

    // Check if phone matches (if property has phone)
    if (propertyPhone && propertyPhone !== userPhone) {
      return NextResponse.json(
        { error: 'Phone number does not match the property records. Please contact support if you believe this is an error.' },
        { status: 400 }
      )
    }

    // Validate that the property address contains key elements from the provided address
    const propertyFullAddress = `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`.toLowerCase()
    const userProvidedAddress = propertyAddress.toLowerCase()
    
    // Check if key components are present
    const addressComponents = [
      property.address.toLowerCase(),
      property.city.toLowerCase(),
      property.state.toLowerCase(),
      property.zipCode.toLowerCase()
    ]
    
    const hasMatchingComponents = addressComponents.some(component => 
      userProvidedAddress.includes(component)
    )
    
    if (!hasMatchingComponents) {
      return NextResponse.json(
        { error: 'Property address does not match our records. Please verify the address and try again.' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with validated property information
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        name,
        phone,
        propertyAddress,
        propertyNumber
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        propertyAddress: true,
        propertyNumber: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Account created successfully! Your information has been validated against our property records.',
      user,
      propertyInfo: {
        propertyId: property.propertyId,
        title: property.title,
        address: `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
