'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface DownloadClaimPDFProps {
  claimId: string
  claimNumber: string
}

export function DownloadClaimPDF({ claimId, claimNumber }: DownloadClaimPDFProps) {
  const [isGenerating, setIsGenerating] = React.useState(false)

  const handleDownload = async () => {
    try {
      setIsGenerating(true)

      // Fetch PDF from API route
      const response = await fetch(`/api/claims/${claimId}/pdf`)

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Get the blob from response
      const blob = await response.blob()

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Claim-${claimNumber || 'export'}.pdf`

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      {isGenerating ? 'Generating...' : 'Download PDF'}
    </Button>
  )
}
