"use client";

import { useEffect, useState, useCallback } from "react";

interface Device {
  id: string;
  name: string;
  type: string;
  room: string;
  status: string;
  value: number | null;
  metadata: Record<string, unknown> | null;
}

const deviceIcons: Record<string, string> = {
  light: "💡",
  thermostat: "🌡️",
  security: "🛡️",
  speaker: "🔊",
  lock: "🔒",
  camera: "📹",
};

const deviceTypeLabels: Record<string, string> = {
  light: "Lighting",
  thermostat: "Climate",
  lock: "Security Lock",
  camera: "Surveillance",
  speaker: "Audio",
};

export default function SmartHomeView() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDevices = useCallback(() => {
    fetch("/api/devices")
      .then((r) => r.json())
      .then((data) => {
        setDevices(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => { loadDevices(); }, [loadDevices]);

  const toggleDevice = async (device: Device) => {
    await fetch("/api/devices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: device.id,
        status: device.status === "on" ? "off" : "on",
      }),
    });
    loadDevices();
  };

  const updateValue = async (device: Device, newValue: number) => {
    await fetch("/api/devices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: device.id,
        value: newValue,
      }),
    });
    loadDevices();
  };

  // Group devices by room
  const rooms = devices.reduce((acc, device) => {
    if (!acc[device.room]) acc[device.room] = [];
    acc[device.room].push(device);
    return acc;
  }, {} as Record<string, Device[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border border-jarvis-blue mx-auto mb-3 animate-arc-reactor" />
          <p className="text-jarvis-text-dim text-xs font-mono">Scanning smart home network...</p>
        </div>
      </div>
    );
  }

  const activeCount = devices.filter(d => d.status === "on").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-jarvis-text">Smart Home Control</h2>
          <p className="text-xs text-jarvis-text-dim mt-1">
            {activeCount}/{devices.length} devices active • {Object.keys(rooms).length} rooms
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-jarvis-green animate-pulse" />
          <span className="text-jarvis-green font-mono">NETWORK OK</span>
        </div>
      </div>

      {/* Room-based layout */}
      {Object.entries(rooms).map(([room, roomDevices]) => (
        <div key={room} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-jarvis-blue uppercase tracking-wider">{room}</span>
            <div className="flex-1 h-px bg-jarvis-border/30" />
            <span className="text-[10px] text-jarvis-text-dim">
              {roomDevices.filter(d => d.status === "on").length}/{roomDevices.length} active
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {roomDevices.map((device) => (
              <div
                key={device.id}
                className={`bg-jarvis-panel border rounded-xl p-4 transition-all ${
                  device.status === "on"
                    ? "border-jarvis-blue/40 shadow-[0_0_15px_rgba(0,180,216,0.08)]"
                    : "border-jarvis-border/30"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{deviceIcons[device.type] || "📱"}</span>
                    <div>
                      <h4 className="text-sm font-medium text-jarvis-text">{device.name}</h4>
                      <p className="text-[10px] text-jarvis-text-dim uppercase">
                        {deviceTypeLabels[device.type] || device.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDevice(device)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${
                      device.status === "on" ? "bg-jarvis-blue" : "bg-jarvis-border"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        device.status === "on" ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Value slider for applicable devices */}
                {device.value !== null && device.type !== "lock" && device.type !== "camera" && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-jarvis-text-dim mb-1">
                      <span>{device.type === "thermostat" ? "Temperature" : device.type === "speaker" ? "Volume" : "Brightness"}</span>
                      <span className="font-mono text-jarvis-blue">
                        {device.value}{device.type === "thermostat" ? "°F" : "%"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={device.type === "thermostat" ? 60 : 0}
                      max={device.type === "thermostat" ? 85 : 100}
                      value={device.value}
                      onChange={(e) => updateValue(device, parseInt(e.target.value))}
                      className="w-full h-1.5 bg-jarvis-border rounded-full appearance-none cursor-pointer accent-jarvis-blue"
                    />
                  </div>
                )}

                {/* Status indicator */}
                <div className="flex items-center gap-1.5 mt-3 text-[10px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${device.status === "on" ? "bg-jarvis-green" : "bg-jarvis-text-dim/30"}`} />
                  <span className={device.status === "on" ? "text-jarvis-green" : "text-jarvis-text-dim"}>
                    {device.status === "on" ? "Active" : "Standby"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
