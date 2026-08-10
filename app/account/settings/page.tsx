import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | IGMART",
};

export default function SettingsPage() {
  return (
    <div>
      <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 24, color: "#FAFAFA", marginBottom: 24 }}>Account Settings</h1>
      
      <div style={{ background: "#171A21", border: "1px solid #272A30", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 16, color: "#FAFAFA", marginBottom: 16 }}>Profile Information</h2>
        
        <div className="grid gap-4 max-w-md">
          <div>
            <label style={{ display: "block", fontSize: 13, color: "#A1A1AA", marginBottom: 6 }}>Display Name</label>
            <input type="text" defaultValue="User" style={{ width: "100%", background: "#0F1116", border: "1px solid #272A30", borderRadius: 8, padding: "10px 14px", color: "#FAFAFA", fontSize: 14 }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, color: "#A1A1AA", marginBottom: 6 }}>Email Address</label>
            <input type="email" defaultValue="user@example.com" disabled style={{ width: "100%", background: "#1F232B", border: "1px solid #272A30", borderRadius: 8, padding: "10px 14px", color: "#71717A", fontSize: 14, cursor: "not-allowed" }} />
          </div>
          <button style={{ background: "#3381FF", color: "white", padding: "10px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14, marginTop: 8, width: "fit-content" }}>
            Save Changes
          </button>
        </div>
      </div>

      <div style={{ background: "#171A21", border: "1px solid #272A30", borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 16, color: "#FAFAFA", marginBottom: 16 }}>Security</h2>
        <div className="flex items-center justify-between py-4 border-b border-[#272A30]">
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#FAFAFA" }}>Password</p>
            <p style={{ fontSize: 13, color: "#71717A" }}>Last changed 3 months ago</p>
          </div>
          <button style={{ background: "transparent", border: "1px solid #272A30", color: "#FAFAFA", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600 }}>Update</button>
        </div>
        <div className="flex items-center justify-between py-4">
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#FAFAFA" }}>Two-Factor Authentication (2FA)</p>
            <p style={{ fontSize: 13, color: "#EF4343" }}>Not enabled</p>
          </div>
          <button style={{ background: "transparent", border: "1px solid #3381FF", color: "#3381FF", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600 }}>Enable 2FA</button>
        </div>
      </div>
    </div>
  );
}
