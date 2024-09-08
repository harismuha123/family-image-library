import React, { useEffect, useState } from 'react';
import './App.css';
import { getRandomGradient } from './utils';
const oauth2Client = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
};

function App() {
  const [imageUrl, setImageUrl] = useState('');
  const [isVideo, setIsVideo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState('');
  const [date, setDate] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const setRandomGradient = () => {
    const gradient = getRandomGradient();
    document.body.style.background = gradient;
  };

  const fetchAccessToken = async (authCode) => {
    try {
      const tokenResponse = await fetch(oauth2Client.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: authCode,
          client_id: oauth2Client.clientId,
          client_secret: oauth2Client.clientSecret,
          redirect_uri: process.env.REACT_APP_REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(`Failed to fetch access token: ${errorData.error}`);
      }
      if (!tokenResponse.ok) {
        throw new Error('Failed to fetch access token');
      }
      const tokens = await tokenResponse.json();
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      setAccessToken(tokens.access_token);
    } catch (error) {
      console.error('Error fetching access token:', error);
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return;

    const tokenResponse = await fetch(oauth2Client.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: oauth2Client.clientId,
        client_secret: oauth2Client.clientSecret,
        grant_type: 'refresh_token',
      }),
    });
    const tokens = await tokenResponse.json();
    localStorage.setItem('access_token', tokens.access_token);
    setAccessToken(tokens.access_token);
  };

  const handleRefresh = () => {
    setRandomGradient();
    setLoading(true);

    const getRandomDateInRange = (start, end) => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    const fourYearsAgo = new Date();
    fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);
    const randomStartDate = getRandomDateInRange(fourYearsAgo, new Date());
    const randomEndDate = getRandomDateInRange(randomStartDate, new Date());

    fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filters: {
          dateFilter: {
            ranges: [
              {
                startDate: {
                  year: randomStartDate.getFullYear(),
                  month: randomStartDate.getMonth() + 1,
                  day: randomStartDate.getDate(),
                },
                endDate: {
                  year: randomEndDate.getFullYear(),
                  month: randomEndDate.getMonth() + 1,
                  day: randomEndDate.getDate(),
                },
              },
            ],
          },
          contentFilter: {
            includedContentCategories: ['PEOPLE'],
          },
        },
      }),
    })
      .then(response => response.json())
      .then(data => {
        const mediaItems = data.mediaItems;
        const randomMedia = mediaItems[Math.floor(Math.random() * mediaItems.length)];
        if (randomMedia.mimeType && randomMedia.mimeType.startsWith('video/')) {
          setIsVideo(true);
          setImageUrl(randomMedia.baseUrl);
        } else {
          setIsVideo(false);
          setImageUrl(randomMedia.baseUrl);
        }
        setLoading(false);
      });

    fetch('https://api.quotable.io/random')
      .then(response => response.json())
      .then(data => setQuote(data.content));

    const today = new Date();
    setDate(today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  };

  useEffect(() => {
    setRandomGradient();
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const storedAccessToken = localStorage.getItem('access_token');
    const storedRefreshToken = localStorage.getItem('refresh_token');

    if (authCode) {
      fetchAccessToken(authCode).then(() => {
        window.history.replaceState({}, document.title, "/");
      });
    } else if (!accessToken) {
      if (storedAccessToken) {
        setAccessToken(storedAccessToken);
      } else {
        const authUrl = `${oauth2Client.authorizationEndpoint}?client_id=${oauth2Client.clientId}&redirect_uri=http://localhost:3000/callback&response_type=code&scope=https://www.googleapis.com/auth/photoslibrary.readonly`;
        window.location.href = authUrl;
      }
    }
  }, [accessToken]);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('access_token');
    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    } else {
      const authUrl = `${oauth2Client.authorizationEndpoint}?client_id=${oauth2Client.clientId}&redirect_uri=http://localhost:3000/callback&response_type=code&scope=https://www.googleapis.com/auth/photoslibrary.readonly`;
      window.location.href = authUrl;
    }
  }, []);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('access_token');
    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    } else {
      const authUrl = `${oauth2Client.authorizationEndpoint}?client_id=${oauth2Client.clientId}&redirect_uri=http://localhost:3000/callback&response_type=code&scope=https://www.googleapis.com/auth/photoslibrary.readonly`;
      window.location.href = authUrl;
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      // Fetch image URL from Google Photos
      const getRandomDateInRange = (start, end) => {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      };

      const fourYearsAgo = new Date();
      fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);
      const randomStartDate = getRandomDateInRange(fourYearsAgo, new Date());
      const randomEndDate = getRandomDateInRange(randomStartDate, new Date());

      fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            dateFilter: {
              ranges: [
                {
                  startDate: {
                    year: randomStartDate.getFullYear(),
                    month: randomStartDate.getMonth() + 1,
                    day: randomStartDate.getDate(),
                  },
                  endDate: {
                    year: randomEndDate.getFullYear(),
                    month: randomEndDate.getMonth() + 1,
                    day: randomEndDate.getDate(),
                  },
                },
              ],
            },
            contentFilter: {
              includedContentCategories: ['PEOPLE'],
            },
          },
        }),
      })
        .then(response => response.json())
        .then(data => {
          const mediaItems = data.mediaItems;
          const randomMedia = mediaItems[Math.floor(Math.random() * mediaItems.length)];
          if (randomMedia.mimeType && randomMedia.mimeType.startsWith('video/')) {
            setIsVideo(true);
            setImageUrl(randomMedia.baseUrl);
          } else {
            setIsVideo(false);
            setImageUrl(randomMedia.baseUrl);
          }
          setLoading(false);
        });

      // Fetch quote from a free quote API
      fetch('https://api.quotable.io/random')
        .then(response => response.json())
        .then(data => setQuote(data.content));

      // Set current date and day
      const today = new Date();
      setDate(today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }
  }, [accessToken]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>{date}</h1>
        {loading ? (
          <div className="loading-spinner"></div>
        ) : isVideo ? (
          <iframe
            title="Family Video"
            className="family-video"
            src={`${imageUrl}=m18`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <img src={imageUrl} alt="Family" className="family-image" />
        )}
        <p className="quote">{quote}</p>
        <button className="refresh-button" onClick={handleRefresh}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="refresh-icon">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          Refresh
        </button>
      </header>
    </div>
  );
}

export default App;
