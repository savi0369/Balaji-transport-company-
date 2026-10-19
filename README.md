# Balaji-transport-company-
It is GR tracking aps
import React, { useState } from 'react';
import axios from 'axios';

interface TrackingData {
  gr_number: string;
  sender_name: string;
  receiver_name: string;
  origin: string;
  destination: string;
  status: string;
  weight_quintal: number;
}

interface LogItem {
  id: number;
  status_update: string;
  location_name: string;
  updated_at: string;
}

export default function GrTrackingSystem() {
  const [grNumber, setGrNumber] = useState('');
  const [shipment, setShipment] = useState<TrackingData | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grNumber.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/track/${grNumber}`);
      if (response.data.success) {
        setShipment(response.data.shipment);
        setLogs(response.data.trackingHistory);
      }
    } catch (err: any) {
      setError('GR Number not found or invalid. Please check and try again.');
      setShipment(null);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2>🚛 Balaji Transport - GR Tracking</h2>
      
      {/* Search Form */}
      <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Enter GR Number (e.g., BTC-2026-001)" 
          value={grNumber}
          onChange={(e) => setGrNumber(e.target.value)}
          style={{ flex: 1, padding: '10px', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: '#white', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Shipment Details Card */}
      {shipment && (
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', background: '#f9f9f9', marginBottom: '20px' }}>
          <h3>Shipment Details</h3>
          <p><strong>GR Number:</strong> {shipment.gr_number}</p>
          <p><strong>From:</strong> {shipment.origin} ➔ <strong>To:</strong> {shipment.destination}</p>
          <p><strong>Sender:</strong> {shipment.sender_name} | <strong>Receiver:</strong> {shipment.receiver_name}</p>
          <p><strong>Current Status:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>{shipment.status}</span></p>
        </div>
      )}

      {/* Timeline / Tracking History */}
      {logs.length > 0 && (
        <div>
          <h4>Tracking History</h4>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {logs.map((log) => (
              <li key={log.id} style={{ borderLeft: '3px solid #007bff', paddingLeft: '15px', marginBottom: '15px' }}>
                <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>{log.status_update}</p>
                <small style={{ color: '#666' }}>📍 Location: {log.location_name} | 🕒 {new Date(log.updated_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
