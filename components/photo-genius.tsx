'use client'
import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, Maximize, X, Image, HelpCircle, FileImage } from "lucide-react"

export function PhotoGenius() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image()
        img.onload = (event: Event) => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (ctx) {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            const dataUrl = canvas.toDataURL('image/jpeg')
            setOriginalImage(dataUrl)
          }
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const removeBackground = async () => {
    if (!originalImage) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/remove-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: originalImage }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to remove background: ${errorData.error}. Details: ${errorData.details}`)
      }

      const result = await response.json()
      console.log('API response:', result);

      setProcessedImage(result.image.url)
    } catch (error) {
      console.error('Detailed error removing background:', error);
      alert(`Failed to remove background. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false)
    }
  }

  const downloadImage = async () => {
    if (processedImage) {
      try {
        setIsLoading(true);
        const response = await fetch(processedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'processed_image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading image:', error);
        alert('Failed to download the image. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const viewFullScreen = () => {
    setIsFullScreen(true)
  }

  const closeFullScreen = () => {
    setIsFullScreen(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl flex items-center gap-1 font-semibold">
            <Image className='w-6 h-6 relative -top-[1px]' />Photo Genius
          </h1>
          <Button variant="outline" className='flex items-center gap-[5px]'>Help<HelpCircle className='w-4 h-4' /></Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Remove Image Background</CardTitle>
            <p className="text-center text-gray-600">
              Upload an image to remove the background instantly, no account required
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-4">
                <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  {originalImage ? (
                    <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-gray-500">Uploaded image will appear here</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-center">
                  <Button onClick={triggerFileInput}>
                    <Upload className="mr-2 h-4 w-4" /> Upload Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  {processedImage ? (
                    <img src={processedImage} alt="Processed" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-gray-500">Processed image will appear here</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-center">
                  <Button onClick={removeBackground} disabled={!originalImage || isLoading}>
                    {isLoading ? 'Processing...' : <><FileImage className='mr-1 w-4 h-4' /> Remove Background</>}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={downloadImage}
              disabled={!processedImage || isLoading}
            >
              {isLoading ? 'Downloading...' : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Download
                </>
              )}
            </Button>
            <Button variant="outline" onClick={viewFullScreen} disabled={!processedImage}>
              <Maximize className="mr-2 h-4 w-4" /> View Full Screen
            </Button>
          </CardFooter>

          {isFullScreen && processedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="relative max-w-4xl max-h-screen w-full h-full">
                <img
                  src={processedImage}
                  alt="Full Screen"
                  className="w-full h-full object-contain"
                />
                <Button
                  className="absolute top-4 right-4"
                  variant="outline"
                  onClick={closeFullScreen}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}