import { ShopCard } from '@/components/shops/ShopCard';
import { Input } from '@/components/ui/input';
import { prisma } from '@/lib/prisma';

type GetShopsParams = { page?: number; search?: string }

async function getShops({ page = 1, search = '' }: GetShopsParams) {
  const limit = 12
  const where = search
    ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }
    : undefined

  const [items, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { products: true } } },
    }),
    prisma.shop.count({ where }),
  ])

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}

export default async function ShopsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = Number(params?.page ?? '1') || 1
  const search = (params?.search ?? '').trim()

  const { items } = await getShops({ page, search })

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Marketplace Vendors</h1>
        <form action="/shops" method="GET">
          <Input
            name="search"
            defaultValue={search}
            placeholder="Search vendors"
            className="h-9 w-[300px]"
          />
        </form>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No shops found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((shop) => (
            <ShopCard key={shop.id} shop={shop as any} />
          ))}
        </div>
      )}
    </div>
  )
}
