import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

type OrderStatus = "Processing" | "Shipped" | "Delivered";

type OrderItem = {
  id: string;
  title: string;
  imageUrl: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  status: OrderStatus;
  placedOn: string;
  items: OrderItem[];
  shippingAddress: string;
  paymentInfo: string;
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function OrderTimeline({ status }: { status: OrderStatus }) {
  const steps: OrderStatus[] = ["Processing", "Shipped", "Delivered"];
  const activeIndex = steps.indexOf(status);

  return (
    <div className="flex items-center gap-3">
      {steps.map((step, idx) => {
        const active = idx <= activeIndex;
        return (
          <div key={step} className="flex items-center gap-3">
            <span
              className={`${
                active ? "text-primary font-semibold" : "text-muted-foreground"
              } text-sm`}
            >
              {step}
            </span>
            {idx < steps.length - 1 && (
              <div className="h-[1px] w-8 bg-border" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Order #{order.id}</CardTitle>
            <Badge variant="outline" className="rounded-sm">
              {order.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Placed on {order.placedOn}</p>
        </CardHeader>
        <CardContent>
          <OrderTimeline status={order.status} />
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.id} className="py-2">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="size-12 rounded border object-cover"
                    />
                    <div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Qty {item.quantity}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right align-middle">
                  <div className="text-sm">{formatCurrency(item.price * item.quantity)}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="text-sm text-muted-foreground whitespace-pre-line">
            {order.shippingAddress}
          </div>
          <Separator className="my-3" />
          <div className="text-sm text-muted-foreground">{order.paymentInfo}</div>
        </div>
        <div className="md:text-right">
          <div className="space-y-1">
            <div className="flex items-center justify-between md:justify-end md:gap-6">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm">{formatCurrency(order.totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between md:justify-end md:gap-6">
              <span className="text-sm text-muted-foreground">Shipping</span>
              <span className="text-sm">{formatCurrency(order.totals.shipping)}</span>
            </div>
            <div className="flex items-center justify-between md:justify-end md:gap-6">
              <span className="text-sm text-muted-foreground">Tax</span>
              <span className="text-sm">{formatCurrency(order.totals.tax)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between md:justify-end md:gap-6">
              <span className="text-sm font-medium">Total</span>
              <span className="text-sm font-medium">
                {formatCurrency(order.totals.total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

