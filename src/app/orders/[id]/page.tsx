import OrderDetails from "@/components/orders/OrderDetails";

type PageProps = {
  params: { id: string };
};

function getMockOrder(id: string) {
  const items = [
    {
      id: "sku-1",
      title: "AI-Generated Tee",
      imageUrl:
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=400&auto=format&fit=crop",
      quantity: 2,
      price: 24.0,
    },
    {
      id: "sku-2",
      title: "Style Hub Hoodie",
      imageUrl:
        "https://images.unsplash.com/photo-1520975922203-c7a3a83dcac7?q=80&w=400&auto=format&fit=crop",
      quantity: 1,
      price: 58.0,
    },
  ];

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const shipping = 8.5;
  const tax = Math.round(subtotal * 0.085 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  return {
    id,
    status: "Processing" as const,
    placedOn: new Date().toLocaleDateString(),
    items,
    shippingAddress: [
      "John Appleseed",
      "123 Market Street",
      "San Francisco, CA 94103",
      "United States",
    ].join("\n"),
    paymentInfo: "Visa •••• 4242",
    totals: { subtotal, shipping, tax, total },
  };
}

export default function Page({ params }: PageProps) {
  const order = getMockOrder(params.id);
  return (
    <div className="container mx-auto max-w-3xl py-6">
      <OrderDetails order={order} />
    </div>
  );
}

