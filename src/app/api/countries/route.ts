import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Country from '@/models/Country';

// GET all countries
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    const query = slug ? { slug } : {};
    const countries = await Country.find(query);
    return NextResponse.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { message: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}

// POST new country
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    console.log('Received body:', body);

    // Ensure reasons is an array
    const countryData = {
      ...body,
      reasons: Array.isArray(body.reasons) ? body.reasons : []
    };

    console.log('Country data to create:', countryData);
    const country = await Country.create(countryData);
    console.log('Country created:', country);
    return NextResponse.json(country, { status: 201 });
  } catch (error) {
    console.error('Error creating country:', error);
    return NextResponse.json(
      { message: 'Failed to create country' },
      { status: 500 }
    );
  }
}

// PUT update country
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, ...updateData } = body;

    const country = await Country.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

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
      { message: 'Failed to update country' },
      { status: 500 }
    );
  }
}

// DELETE country
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

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
      { message: 'Failed to delete country' },
      { status: 500 }
    );
  }
}
