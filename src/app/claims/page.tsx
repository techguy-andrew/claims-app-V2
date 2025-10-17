import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { SearchableClaims } from '@/components/custom/SearchableClaims'
import type { ClaimStatus } from '@prisma/client'

// Force dynamic rendering - don't statically generate this page
export const dynamic = 'force-dynamic'

interface ClaimsPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function ClaimsPage({ searchParams }: ClaimsPageProps) {
  const params = await searchParams
  const initialStatus = params.status as ClaimStatus | 'all' | undefined
  // Fetch claims from database
  const claims = await prisma.claim.findMany({
    include: {
      claimant: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="w-full px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-4 sm:gap-6 w-full">
          <div className="grid grid-cols-[1fr,auto] gap-6 items-start w-full">
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold">Claims</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your claims here.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button asChild className="gap-2">
                <Link href="/claims/new">
                  <Plus className="h-4 w-4" />
                  New Claim
                </Link>
              </Button>
            </div>
          </div>

          <SearchableClaims initialClaims={claims} initialStatus={initialStatus} />
        </div>
      </div>
    </div>
  )
}