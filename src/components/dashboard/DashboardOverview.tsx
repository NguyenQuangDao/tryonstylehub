import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { ComponentType } from 'react'

type MetricItem = {
  title: string
  value: string | number
  trend?: string
  icon?: ComponentType<{ className?: string }>
}

export function DashboardOverview({ items }: { items: MetricItem[] }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon
        return (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {item.title}
              </CardTitle>
              {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {item.value}
              </div>
            </CardContent>
            {item.trend ? (
              <CardFooter>
                <p className="text-xs text-muted-foreground">{item.trend}</p>
              </CardFooter>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}

export default DashboardOverview

