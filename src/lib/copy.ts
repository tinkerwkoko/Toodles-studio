export interface TimeOfDayGreeting {
  heading: string;
  wittyLine: string;
  isNight: boolean;
}

/**
 * Returns a stable greeting and supportive line based on the time of day and calendar day.
 * No em dashes are used.
 */
export function getTimeOfDayGreeting(now = new Date()): TimeOfDayGreeting {
  const hour = now.getHours();
  // Pick line by the day of the month so it stays stable during a day, then alternates
  const index = now.getDate() % 2;

  if (hour < 5) {
    const lines = [
      "The tasks will keep. The cat won't.",
      'Night owl mode. Keep it to one small win, then sleep.',
    ];
    return {
      heading: 'Still up?',
      wittyLine: lines[index] ?? lines[0],
      isNight: true,
    };
  }

  if (hour < 12) {
    const lines = [
      "Up with the roosters, or never went to bed? Either way, let's get these goals moving.",
      'Fresh day, blank list. Pick the one thing that counts.',
    ];
    return {
      heading: 'Good morning',
      wittyLine: lines[index] ?? lines[0],
      isNight: false,
    };
  }

  if (hour < 17) {
    const lines = [
      'Halfway through the day. The list is still winnable.',
      'Snack first, then the hard task.',
    ];
    return {
      heading: 'Good afternoon',
      wittyLine: lines[index] ?? lines[0],
      isNight: false,
    };
  }

  if (hour < 21) {
    const lines = [
      'One more small win before you switch off.',
      'Wrap up what matters and move the rest to tomorrow.',
    ];
    return {
      heading: 'Good evening',
      wittyLine: lines[index] ?? lines[0],
      isNight: false,
    };
  }

  const lines = [
    "Park what's unfinished. Tomorrow-you has a fresh list.",
    'Write a diary line and call it a day.',
  ];
  return {
    heading: 'Winding down?',
    wittyLine: lines[index] ?? lines[0],
    isNight: true,
  };
}
