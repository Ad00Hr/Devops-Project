import React from "react";

const NotificationItem = ({ icon, title, message, time, isRead }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        padding: "16px",
        borderRadius: "12px",
        background: isRead ? "#f8fafc" : "#eef6ff",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "#3b82f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div style={{ color: "#555", fontSize: 14 }}>{message}</div>
        <div style={{ color: "#999", fontSize: 12 }}>{time}</div>
      </div>

      {!isRead && (
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#2563eb",
          }}
        />
      )}
    </div>
  );
};

export default NotificationItem;
