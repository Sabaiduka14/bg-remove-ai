import { NextResponse } from 'next/server'
import * as fal from "@fal-ai/serverless-client"

export async function POST(request) {
  try {
    const { image } = await request.json()

    if (!process.env.FAL_KEY) {
      console.error('FAL_KEY is not set')
      return NextResponse.json({ error: 'FAL_KEY is not set' }, { status: 500 })
    }

    fal.config({
      credentials: process.env.FAL_KEY,
    })

    console.log('Image data received:', image.slice(0, 100) + '...'); // Log the first 100 characters of the image data

    if (!image.startsWith('data:image')) {
      console.error('Invalid image data received');
      return NextResponse.json({ error: 'Invalid image data', details: 'Image data must be a valid Data URL' }, { status: 422 })
    }

    console.log('Calling fal.ai API...')
    const result = await fal.subscribe("fal-ai/imageutils/rembg", {
      input: {
        image_url: image,
      },
    })
    console.log('fal.ai API call successful', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Detailed error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ error: 'Failed to remove background', details: error.message }, { status: 500 })
  }
}