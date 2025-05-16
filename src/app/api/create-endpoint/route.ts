import { NextResponse } from 'next/server';
import { createChain } from '@/lib/chainUtils';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    
    // Get user info from the request body instead of Firebase auth
    const { chainData, apiKey, userInfo } = requestData;
    
    // Check user info
    if (!userInfo || !userInfo.email) {
      return NextResponse.json(
        { error: 'User information required' },
        { status: 401 }
      );
    }
    
    // Validate request data
    if (!chainData || !chainData.steps || chainData.steps.length === 0) {
      return NextResponse.json(
        { error: 'Invalid chain data. Chain must have at least one step.' },
        { status: 400 }
      );
    }

    // Check if API key is provided
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is required' },
        { status: 400 }
      );
    }

    // Get host for URL generation
    const host = request.headers.get('host') || 'localhost:3001';
    
    // Create the chain using our utility function
    console.log("Creating chain with utility function...");
    
    const chainResult = await createChain(chainData, userInfo, apiKey, host);
    
    console.log(`Created endpoint: ${chainResult.endpointUrl}`);
    console.log(`Created simplified API: ${chainResult.simplifiedApiUrl}`);
    console.log(`Stored chain ID: ${chainResult.id}`);

    return NextResponse.json({
      id: chainResult.id,
      endpointUrl: chainResult.endpointUrl,
      simplifiedApiUrl: chainResult.simplifiedApiUrl,
      portNumber: chainResult.portNumber,
      userName: chainResult.userName,
      message: 'Chain endpoint created successfully'
    });
    
  } catch (error: any) {
    console.error('Error creating endpoint:', error);
    return NextResponse.json(
      { error: `Failed to create endpoint: ${error.message}` },
      { status: 500 }
    );
  }
} 