import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { renderToStream, DocumentProps } from '@react-pdf/renderer'
import { ClaimPDF } from '@/components/pdf/ClaimPDF'
import React from 'react'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch claim data from database
    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        },
        claimant: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
    })

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    // Generate PDF stream
    const stream = await renderToStream(
      React.createElement(ClaimPDF, { claim }) as React.ReactElement<DocumentProps>
    )

    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }
    const buffer = Buffer.concat(chunks)

    // Return PDF with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Claim-${claim.claimNumber || 'export'}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
