'use server'

import { prisma } from '@/lib/prisma'
import type { ClaimStatus } from '@prisma/client'

export async function searchClaims(searchTerm: string, statusFilter?: ClaimStatus | 'all') {
  if (!searchTerm || searchTerm.trim() === '') {
    // Return all claims if no search term, optionally filtered by status
    return await prisma.claim.findMany({
      where: statusFilter && statusFilter !== 'all'
        ? { status: statusFilter }
        : undefined,
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

  // Map status text search to enum values
  const statusTextMap: Record<string, ClaimStatus> = {
    'pending': 'PENDING',
    'under review': 'UNDER_REVIEW',
    'approved': 'APPROVED',
    'rejected': 'REJECTED',
    'closed': 'CLOSED',
  }

  // Check if search term matches a status
  const matchedStatus = Object.entries(statusTextMap).find(([key]) =>
    key.toLowerCase().includes(term.toLowerCase())
  )?.[1]

  // Word boundary matching for names + claim numbers + status:
  // - Claim number: prefix match (startsWith)
  // - Claimant name (first word): prefix match for first names
  // - Claimant name (subsequent words): space-prefixed match for last names
  // - Status: exact match if search term matches a status keyword
  // Examples: "Chen" matches "Michael Chen", "Michael" matches "Michael Chen", "pending" matches PENDING status
  return await prisma.claim.findMany({
    where: {
      AND: [
        // Apply status filter if provided
        statusFilter && statusFilter !== 'all'
          ? { status: statusFilter }
          : {},
        // Apply search term to OR conditions
        {
          OR: [
            // Claim number prefix match
            { claimNumber: { startsWith: term, mode: 'insensitive' } },

            // Name: first word (first name)
            { claimant: { name: { startsWith: term, mode: 'insensitive' } } },

            // Name: any subsequent word (last name, middle name, etc.)
            { claimant: { name: { contains: ` ${term}`, mode: 'insensitive' } } },

            // Status: match if search term matches a status keyword
            ...(matchedStatus ? [{ status: matchedStatus }] : []),
          ]
        }
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
