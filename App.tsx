import { useState, useEffect, useMemo } from 'react';
import quotesData from './data/quotes.json';
import './App.css';

interface Quote {
  timePhrase: string;
  quote: string;
  book: string;
  author: string;
  rating: string;
}

interface QuotesData {
  [key: string]: Quote[];
}

const typedQuotesData = quotesData as QuotesData;

// Get a random quote for the given time
function getQuoteForTime(timeKey: string): Quote | null {
  const quotes = typedQuotesData[timeKey];
  if (!quotes || quotes.length === 0) return null;
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// Format time as HH:MM
function formatTimeKey(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

// Calculate year progress (0-100)
function calculateYearProgress(date: Date): number {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);
  const totalMilliseconds = endOfYear.getTime() - startOfYear.getTime();
  const elapsedMilliseconds = date.getTime() - startOfYear.getTime();
  return (elapsedMilliseconds / totalMilliseconds) * 100;
}

function App() {
  const [now, setNow] = useState(new Date());
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update quote when minute changes
  useEffect(() => {
    const timeKey = formatTimeKey(now);
    const quote = getQuoteForTime(timeKey);
    setCurrentQuote(quote);
  }, [now.getMinutes(), now.getHours()]);

  // Format time for Beijing (UTC+8)
  const beijingTime = useMemo(() => {
    return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  }, [now]);

  // Calculate year progress
  const yearProgress = useMemo(() => {
    return calculateYearProgress(beijingTime);
  }, [beijingTime]);

  // Format date - day, month, date, year (single line)
  const formattedDate = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    };
    return beijingTime.toLocaleDateString('en-US', options);
  }, [beijingTime]);

  // Format 24-hour time
  const time24h = useMemo(() => {
    return beijingTime.toTimeString().slice(0, 5);
  }, [beijingTime]);

  return (
    <div className="literary-clock">
      {/* Background gradient */}
      <div className="background-gradient" />
      
      {/* Top left - 24h Clock */}
      <div className="clock-container top-left">
        <div className="digital-clock">{time24h}</div>
        <div className="clock-seconds">{beijingTime.toTimeString().slice(6, 8)}</div>
      </div>

      {/* Top right - Beijing Time label */}
      <div className="beijing-label top-right">
        <span className="beijing-en">Beijing Time</span>
        <span className="beijing-cn">北京时间</span>
      </div>

      {/* Center - Literary Quote */}
      <div className="quote-container">
        {currentQuote ? (
          <>
            <div className="quote-text" dangerouslySetInnerHTML={{ 
              __html: `"${currentQuote.quote}"` 
            }} />
            <div className="quote-attribution">
              <span className="quote-book">{currentQuote.book}</span>
              <span className="quote-author">{currentQuote.author}</span>
            </div>
          </>
        ) : (
          <div className="no-quote">
            <p>No quote available for this time</p>
          </div>
        )}
      </div>

      {/* Bottom left - Date */}
      <div className="date-container bottom-left">
        <div className="full-date">{formattedDate}</div>
      </div>

      {/* Bottom right - Year of the Horse Image */}
      <div className="horse-wrapper bottom-right">
        <img src="/horse.png" alt="Year of the Horse" className="horse-image" />
        <div className="progress-text">{yearProgress.toFixed(1)}% through the year</div>
      </div>
    </div>
  );
}

export default App;
