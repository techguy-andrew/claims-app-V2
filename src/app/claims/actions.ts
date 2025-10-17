'use server'

import { prisma } from '@/lib/prisma'

export async function searchClaims(searchTerm: string) {
  if (!searchTerm || searchTerm.trim() === '') {
    // Return all claims if no search term
    return await prisma.claim.findMany({
      include: {
        claimant: true,
        items: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  const term = searchTerm.trim()
  const termUpper = term.toUpperCase()

  // Build status filter based on search term (word boundary matching)
  const statusFilters = []
  if (termUpper.includes('PEND')) statusFilters.push({ status: 'PENDING' as const })
  if (termUpper.includes('UNDER') || termUpper.includes('REVIEW')) statusFilters.push({ status: 'UNDER_REVIEW' as const })
  if (termUpper.includes('APPROV')) statusFilters.push({ status: 'APPROVED' as const })
  if (termUpper.includes('REJECT')) statusFilters.push({ status: 'REJECTED' as const })
  if (termUpper.includes('CLOSE')) statusFilters.push({ status: 'CLOSED' as const })

  // Hybrid search strategy (optimized for performance and UX):
  // - startsWith: structured/predictable fields (faster with indexes)
  // - contains: free-text and human name fields (flexible matching)
  // - Excludes: claim items (not searched)
  return await prisma.claim.findMany({
    where: {
      OR: [
        // Structured fields: startsWith for index optimization
        { claimNumber: { startsWith: term, mode: 'insensitive' } },
        { clientPhone: { startsWith: term, mode: 'insensitive' } },
        { insuranceCompany: { startsWith: term, mode: 'insensitive' } },
        { claimant: { email: { startsWith: term, mode: 'insensitive' } } },

        // Human name fields: contains for flexible matching
        { claimant: { name: { contains: term, mode: 'insensitive' } } },
        { adjustor: { contains: term, mode: 'insensitive' } },

        // Free-text claim fields: contains for full-text flexibility
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { clientAddress: { contains: term, mode: 'insensitive' } },

        // Status filters based on keyword matching
        ...statusFilters
      ]
    },
    include: {
      claimant: true,
      items: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}
