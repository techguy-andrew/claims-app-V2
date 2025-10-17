'use client'

import { useState, useEffect, useTransition } from 'react'
import { ClaimCard, ClaimCardStack } from '@/components/active-components/ClaimCard'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import { searchClaims } from '@/app/claims/actions'
import type { Claim, User, ClaimStatus } from '@prisma/client'

type ClaimWithClaimant = Claim & {
  claimant: User
}

interface SearchableClaimsProps {
  initialClaims: ClaimWithClaimant[]
  initialStatus?: ClaimStatus | 'all'
}

export function SearchableClaims({ initialClaims, initialStatus }: SearchableClaimsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ClaimStatus | 'all'>(initialStatus || 'all')
  const [claims, setClaims] = useState<ClaimWithClaimant[]>(initialClaims)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    // Debounce the search
    const timer = setTimeout(() => {
      startTransition(async () => {
        const results = await searchClaims(searchTerm, selectedStatus)
        setClaims(results as ClaimWithClaimant[])
      })
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm, selectedStatus])

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4 w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, claim number, or status"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ClaimStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending && (
        <p className="text-sm text-muted-foreground">Searching...</p>
      )}

      {!isPending && claims.length === 0 && searchTerm && (
        <p className="text-sm text-muted-foreground">No claims found matching &ldquo;{searchTerm}&rdquo;</p>
      )}

      <ClaimCardStack className="w-full">
        {claims.map((claim) => (
          <ClaimCard
            key={claim.id}
            claimNumber={claim.claimNumber}
            clientName={claim.claimant.name || 'Unknown Client'}
            status={claim.status}
            href={`/claims/${claim.id}`}
          />
        ))}
      </ClaimCardStack>
    </div>
  )
}
