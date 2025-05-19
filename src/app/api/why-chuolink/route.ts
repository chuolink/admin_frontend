import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WhyChuolink from '@/models/WhyChuolink';

// GET why chuolink reasons
export async function GET() {
  try {
    await connectDB();
    const whyChuolink = await WhyChuolink.findOne({});
    return NextResponse.json(whyChuolink?.reasons || []);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reasons' },
      { status: 500 }
    );
  }
}

// POST update why chuolink reasons
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { reasons } = body;

    let whyChuolink = await WhyChuolink.findOne({});

    if (whyChuolink) {
      whyChuolink.reasons = reasons;
      await whyChuolink.save();
    } else {
      whyChuolink = await WhyChuolink.create({ reasons });
    }

    return NextResponse.json(whyChuolink);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update reasons' },
      { status: 500 }
    );
  }
}
