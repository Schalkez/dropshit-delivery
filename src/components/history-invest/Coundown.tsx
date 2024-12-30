import React, { useState, useEffect } from 'react';

interface TimeLeft {
  total: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Countdown = ({ date }: { date: Date | string }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(date));

  useEffect(() => {
    const timer = setInterval(() => {
      const time = calculateTimeLeft(date);
      setTimeLeft(time);

      if (time.total <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [date]);



  if (timeLeft.total <= 0) {
    return <span>Hết giờ</span>;
  }

  return (
    <span>
      {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
    </span>
  );
};

const calculateTimeLeft = (endDate: Date | string): TimeLeft => {
  const difference = new Date(endDate).getTime() - new Date().getTime();
  let timeLeft: TimeLeft;

  if (difference > 0) {
    timeLeft = {
      total: difference,
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  } else {
    timeLeft = { total: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return timeLeft;
};

export default Countdown;