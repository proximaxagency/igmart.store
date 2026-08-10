import type { Metadata } from "next";
import { Search, MoreVertical, Send, Image as ImageIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Messages | IGMART",
};

export default function MessagesPage() {
  const conversations = [
    { id: 1, user: "ProGamer99", lastMessage: "Yes, the account is still available.", time: "10:30 AM", unread: true, active: true },
    { id: 2, user: "GoldFarm", lastMessage: "I have delivered the gold. Please check.", time: "Yesterday", unread: false, active: false },
    { id: 3, user: "BoostMaster", lastMessage: "Thanks for the order!", time: "Oct 10", unread: false, active: false },
  ];

  return (
    <div className="container py-8 max-w-7xl h-[calc(100vh-76px)]">
      <div style={{ display: "flex", height: "100%", background: "#171A21", border: "1px solid #272A30", borderRadius: 12, overflow: "hidden" }}>
        
        {/* Sidebar */}
        <div style={{ width: 320, borderRight: "1px solid #272A30", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 20, borderBottom: "1px solid #272A30" }}>
            <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 20, color: "#FAFAFA", marginBottom: 16 }}>Messages</h1>
            <div style={{ background: "#0F1116", border: "1px solid #272A30", borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center" }}>
              <Search size={16} color="#71717A" style={{ marginRight: 8 }} />
              <input placeholder="Search conversations..." style={{ background: "transparent", border: "none", outline: "none", color: "#FAFAFA", fontSize: 13, width: "100%" }} />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: "auto" }}>
            {conversations.map(conv => (
              <div key={conv.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", cursor: "pointer", background: conv.active ? "rgba(51,129,255,0.05)" : "transparent", borderLeft: conv.active ? "3px solid #3381FF" : "3px solid transparent", borderBottom: "1px solid #272A30" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#2563EB,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", flexShrink: 0 }}>
                  {conv.user.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <p style={{ fontSize: 14, fontWeight: conv.unread ? 700 : 500, color: "#FAFAFA", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.user}</p>
                    <span style={{ fontSize: 11, color: conv.unread ? "#3381FF" : "#71717A", fontWeight: conv.unread ? 600 : 400 }}>{conv.time}</span>
                  </div>
                  <p style={{ fontSize: 13, color: conv.unread ? "#FAFAFA" : "#A1A1AA", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{conv.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0F1116" }}>
          {/* Chat Header */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #272A30", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#171A21" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#2563EB,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white" }}>
                PR
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#FAFAFA" }}>ProGamer99</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80" }} />
                  <span style={{ fontSize: 12, color: "#A1A1AA" }}>Online</span>
                </div>
              </div>
            </div>
            <button style={{ color: "#A1A1AA" }}><MoreVertical size={20} /></button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ alignSelf: "center", background: "#1F232B", padding: "4px 12px", borderRadius: 99, fontSize: 11, color: "#71717A", fontWeight: 600 }}>
              TODAY
            </div>
            
            <div style={{ alignSelf: "flex-end", maxWidth: "70%" }}>
              <div style={{ background: "#3381FF", color: "white", padding: "12px 16px", borderRadius: "16px 16px 4px 16px", fontSize: 14, lineHeight: 1.5 }}>
                Hi, is the Level 100 account still available? I'm interested in buying it today.
              </div>
              <p style={{ fontSize: 11, color: "#71717A", marginTop: 6, textAlign: "right" }}>10:25 AM</p>
            </div>
            
            <div style={{ alignSelf: "flex-start", maxWidth: "70%" }}>
              <div style={{ background: "#1F232B", border: "1px solid #272A30", color: "#FAFAFA", padding: "12px 16px", borderRadius: "16px 16px 16px 4px", fontSize: 14, lineHeight: 1.5 }}>
                Yes, the account is still available. It has all the items mentioned in the description. Let me know if you have any questions!
              </div>
              <p style={{ fontSize: 11, color: "#71717A", marginTop: 6 }}>10:30 AM</p>
            </div>
          </div>

          {/* Input Area */}
          <div style={{ padding: 20, borderTop: "1px solid #272A30", background: "#171A21" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#0F1116", border: "1px solid #272A30", borderRadius: 12, padding: "8px 16px" }}>
              <button style={{ color: "#A1A1AA", padding: 8 }}><ImageIcon size={20} /></button>
              <input type="text" placeholder="Type a message..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#FAFAFA", fontSize: 14 }} />
              <button style={{ background: "#3381FF", color: "white", padding: 10, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Send size={18} />
              </button>
            </div>
            <p style={{ fontSize: 11, color: "#71717A", textAlign: "center", marginTop: 12 }}>
              Keep all communication on IGMART. Do not share external contact info to stay protected by our escrow system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
