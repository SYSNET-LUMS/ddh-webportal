import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import '../../styles/AssignmentCards.css';

const BACKEND = import.meta.env.VITE_SERVER_HTTP_ADDRESS
  ? `https://${import.meta.env.VITE_SERVER_HTTP_ADDRESS}`
  : '';

const LiveSensorStream = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  // Get user email for filtering
  const email = user?.emailAddresses?.[0]?.emailAddress;


  console.log(user);
  useEffect(() => {
    if (!email) return;

    const fetchData = async () => {
      try {
        console.log(`Fetching: ${BACKEND}/api/live-sensor-stream?email=${encodeURIComponent(email)}`);
        const response = await fetch(`${BACKEND}/api/live-sensor-stream?email=${encodeURIComponent(email)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const formattedData = await response.json();
        setData(formattedData);
        if (formattedData.length === 0) {
          setError("No data found for the last 30 seconds for user: " + email);
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(`Connection Error: ${err.message}.`);
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 1.5 seconds for live updates
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [email]);

  return (
    <div className="assignment-page" style={{ height: '100vh', width: '100vw', maxWidth: 'none', margin: 0, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <header className="assignment-page-header" style={{ padding: '0.5rem 1.5rem', flexShrink: 0 }}>
        <h1 className="assignment-page-title" style={{ fontSize: '1.2rem' }}>Live Sensor Stream (Last 30s)</h1>
        <div className="user-info" style={{ color: 'white', opacity: 0.8 }}>
          User: {email}
        </div>
      </header>

      <main className="assignment-page-body" style={{
        flex: 1,
        width: '100%',
        padding: '1rem',
        margin: 0,
        background: '#121212',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        overflow: 'hidden'
      }}>
        {error && (
          <div style={{
            color: '#ff6b6b',
            padding: '8px 16px',
            background: 'rgba(255,107,107,0.1)',
            borderRadius: '8px',
            borderLeft: '4px solid #ff6b6b',
            fontSize: '0.85rem',
            flexShrink: 0
          }}>
            <strong>Status:</strong> {error}
          </div>
        )}

        {/* Accelerometer Graph */}
        <div style={{ flex: 1, width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 600, paddingLeft: '40px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Accelerometer (m/s²)
          </div>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#555" 
                  fontSize={10} 
                  tick={true} 
                  axisLine={false}
                  tickFormatter={(iso) => new Date(iso).toLocaleTimeString([], { second: '2-digit', fractionalSecondDigits: 3 })}
                />
                <YAxis stroke="#888" fontSize={10} width={40} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #444', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  itemStyle={{ padding: '0' }}
                />
                <Legend verticalAlign="top" align="right" height={20} iconSize={8} wrapperStyle={{ fontSize: '11px', top: -10 }} />
                <Line type="monotone" dataKey="acc_x" stroke="#ff4d4d" name="X" dot={false} isAnimationActive={false} strokeWidth={1.5} connectNulls />
                <Line type="monotone" dataKey="acc_y" stroke="#00e676" name="Y" dot={false} isAnimationActive={false} strokeWidth={1.5} connectNulls />
                <Line type="monotone" dataKey="acc_z" stroke="#2979ff" name="Z" dot={false} isAnimationActive={false} strokeWidth={1.5} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gyroscope Graph */}
        <div style={{ flex: 1, width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 600, paddingLeft: '40px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Gyroscope (rad/s)
          </div>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#555" 
                  fontSize={10} 
                  tickMargin={10}
                  tickFormatter={(iso) => new Date(iso).toLocaleTimeString([], { second: '2-digit', fractionalSecondDigits: 3 })}
                />
                <YAxis stroke="#888" fontSize={10} width={40} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #444', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  itemStyle={{ padding: '0' }}
                />
                <Legend verticalAlign="top" align="right" height={20} iconSize={8} wrapperStyle={{ fontSize: '11px', top: -10 }} />
                <Line type="monotone" dataKey="gyro_x" stroke="#ff9800" name="X" dot={false} isAnimationActive={false} strokeWidth={1.5} connectNulls />
                <Line type="monotone" dataKey="gyro_y" stroke="#e91e63" name="Y" dot={false} isAnimationActive={false} strokeWidth={1.5} connectNulls />
                <Line type="monotone" dataKey="gyro_z" stroke="#00bcd4" name="Z" dot={false} isAnimationActive={false} strokeWidth={1.5} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <footer style={{
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '10px',
          fontSize: '0.8rem',
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          border: '1px solid #222'
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>📊 Windows: 30s</span>
            <span>🔄 1.5s refresh</span>
          </div>
          <div style={{ fontWeight: 600, color: '#999' }}>Live Data Stream — Digital Health Portal</div>
        </footer>
      </main>
    </div>
  );
};

export default LiveSensorStream;
