'use client'

import { useState, useEffect, useTransition } from 'react'
import { ClaimCard, ClaimCardStack } from '@/components/active-components/ClaimCard'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { searchClaims } from '@/app/claims/actions'
import type { Claim, User } from '@prisma/client'

type ClaimWithClaimant = Claim & {
  claimant: User
}

interface SearchableClaimsProps {
  initialClaims: ClaimWithClaimant[]
}

export function SearchableClaims({ initialClaims }: SearchableClaimsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [claims, setClaims] = useState<ClaimWithClaimant[]>(initialClaims)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    // Debounce the search
    const timer = setTimeout(() => {
      startTransition(async () => {
        const results = await searchClaims(searchTerm)
        setClaims(results as ClaimWithClaimant[])
      })
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm])

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search claims by any field (claim number, client name, status, items, etc.)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
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
