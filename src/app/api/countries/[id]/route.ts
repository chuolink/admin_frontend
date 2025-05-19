import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Country from '@/models/Country';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectDB();
    const country = await Country.findById(id);

    if (!country) {
      return NextResponse.json(
        { message: 'Country not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(country);
  } catch (error) {
    console.error('Error fetching country:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectDB();
    const body = await request.json();

    console.log('Received body:', body);
    console.log('Reasons before processing:', body.reasons);

    // Ensure reasons is an array
    const countryData = {
      ...body,
      reasons: Array.isArray(body.reasons) ? body.reasons : []
    };

    console.log('Country data to update:', countryData);
    console.log('Reasons after processing:', countryData.reasons);

    const country = await Country.findByIdAndUpdate(id, countryData, {
      new: true,
      runValidators: true
    });

    console.log('Updated country:', country);

    if (!country) {
      return NextResponse.json(
        { message: 'Country not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(country);
  } catch (error) {
    console.error('Error updating country:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectDB();
    const country = await Country.findByIdAndDelete(id);

    if (!country) {
      return NextResponse.json(
        { message: 'Country not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Country deleted successfully' });
  } catch (error) {
    console.error('Error deleting country:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
