import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/index";

export const metadata: Metadata = {
  title: "My Orders | IGMART",
};

export default function OrdersPage() {
  const mockOrders = [
    { id: "ORD-12345", date: "Oct 12, 2026", title: "Level 100 Account", price: 150, status: "completed", seller: "ProGamer99" },
    { id: "ORD-12346", date: "Oct 10, 2026", title: "10,000 Gold Coins", price: 45, status: "processing", seller: "GoldFarm" },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 24, color: "#FAFAFA", marginBottom: 24 }}>My Orders</h1>
      
      <div style={{ background: "#171A21", border: "1px solid #272A30", borderRadius: 12, overflow: "hidden" }}>
        {mockOrders.length > 0 ? (
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead style={{ background: "#1F232B" }}>
              <tr>
                <th style={{ padding: "16px", fontSize: 13, color: "#A1A1AA", fontWeight: 600 }}>Order ID</th>
                <th style={{ padding: "16px", fontSize: 13, color: "#A1A1AA", fontWeight: 600 }}>Item</th>
                <th style={{ padding: "16px", fontSize: 13, color: "#A1A1AA", fontWeight: 600 }}>Seller</th>
                <th style={{ padding: "16px", fontSize: 13, color: "#A1A1AA", fontWeight: 600 }}>Price</th>
                <th style={{ padding: "16px", fontSize: 13, color: "#A1A1AA", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "16px", fontSize: 13, color: "#A1A1AA", fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: "1px solid #272A30" }}>
                  <td style={{ padding: "16px", fontSize: 14, color: "#FAFAFA", fontWeight: 500 }}>{order.id}<br/><span style={{ fontSize: 11, color: "#71717A", fontWeight: 400 }}>{order.date}</span></td>
                  <td style={{ padding: "16px", fontSize: 14, color: "#FAFAFA" }}>{order.title}</td>
                  <td style={{ padding: "16px", fontSize: 14, color: "#3381FF", textDecoration: "underline" }}>
                    <Link href={`/seller/${order.seller}`}>{order.seller}</Link>
                  </td>
                  <td style={{ padding: "16px", fontSize: 14, color: "#FAFAFA", fontWeight: 700 }}>${order.price}</td>
                  <td style={{ padding: "16px" }}>
                    <Badge variant={order.status === "completed" ? "popular" : "hot"}>{order.status}</Badge>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <button style={{ background: "transparent", border: "1px solid #3381FF", color: "#3381FF", padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 64, textAlign: "center" }}>
            <p style={{ fontSize: 16, color: "#FAFAFA", fontWeight: 600 }}>No orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
