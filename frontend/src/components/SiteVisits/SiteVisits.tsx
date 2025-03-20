import React, { useState } from 'react';
import axios from 'axios';

const SiteVisits: React.FC = () => {
  const [siteVisits, setSiteVisits] = useState<number | null>(null);

  const fetchSiteVisits = async () => {
    try {
      const response = await axios.get('http://localhost:3000/analytics/site-visits');
      const pageviews = response.data.totalsForAllResults['ga:pageviews'];
      setSiteVisits(pageviews);
    } catch (error) {
      console.error('Error fetching site visits:', error);
    }
  };

  return (
    <div>
      <button onClick={fetchSiteVisits}>Get Site Visits</button>
      {siteVisits !== null && <p>Site Visits: {siteVisits}</p>}
    </div>
  );
};

export default SiteVisits;