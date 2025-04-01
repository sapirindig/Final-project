import React, { useState } from 'react';
import axios from 'axios';

const SiteVisits: React.FC = () => {
  const [activeUsersYesterday, setActiveUsersYesterday] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSiteVisits = async () => {
    setIsLoading(true);
    setError(null);
    setActiveUsersYesterday(null);

    try {
      const response = await axios.get('http://localhost:3000/analytics/site-visits');

      const visitorsString = response.data.visitors;
      const visitorsNumber = parseInt(visitorsString, 10);

      if (isNaN(visitorsNumber)) {
        console.error("Received non-numeric data from backend:", visitorsString);
        setError("Received invalid data format from server.");
        setActiveUsersYesterday(0);
      } else {
        setActiveUsersYesterday(visitorsNumber);
      }

    } catch (err: any) {
      console.error('Error fetching site visits:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchSiteVisits} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Get Site Visits (Yesterday)'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {activeUsersYesterday !== null && !error && (
        <p>Active Users (Yesterday): {activeUsersYesterday}</p>
      )}
    </div>
  );
};

export default SiteVisits;