/**
 * Moon Phase Calculator
 * Calculates current moon phase, upcoming new/full moons, and phase information
 */

export interface MoonPhaseInfo {
  phase: string;
  phaseName: string;
  emoji: string;
  dayOfCycle: number;
  illumination: number;
  isNewMoon: boolean;
  isFullMoon: boolean;
  daysUntilNewMoon: number;
  daysUntilFullMoon: number;
  nextNewMoon: Date;
  nextFullMoon: Date;
  cycleProgress: number;
}

const LUNAR_CYCLE = 29.53;
const KNOWN_NEW_MOON = new Date(2000, 0, 6, 18, 14, 0);

export function getMoonPhase(date: Date = new Date()): MoonPhaseInfo {
  const daysSinceKnownNewMoon = (date.getTime() - KNOWN_NEW_MOON.getTime()) / (1000 * 60 * 60 * 24);
  const currentCycleDay = daysSinceKnownNewMoon % LUNAR_CYCLE;
  const normalizedDay = currentCycleDay < 0 ? currentCycleDay + LUNAR_CYCLE : currentCycleDay;
  
  const illumination = Math.round((1 - Math.cos((normalizedDay / LUNAR_CYCLE) * 2 * Math.PI)) / 2 * 100);
  const { phase, phaseName, emoji } = getPhaseInfo(normalizedDay);
  
  const isNewMoon = normalizedDay < 1 || normalizedDay > 28.5;
  const isFullMoon = normalizedDay >= 14 && normalizedDay <= 15.5;
  
  const daysUntilNewMoon = normalizedDay > 0 ? LUNAR_CYCLE - normalizedDay : -normalizedDay;
  const daysUntilFullMoon = normalizedDay < 14.75 ? 14.75 - normalizedDay : LUNAR_CYCLE - normalizedDay + 14.75;
  
  const nextNewMoon = new Date(date.getTime() + daysUntilNewMoon * 24 * 60 * 60 * 1000);
  const nextFullMoon = new Date(date.getTime() + daysUntilFullMoon * 24 * 60 * 60 * 1000);
  
  const cycleProgress = Math.round((normalizedDay / LUNAR_CYCLE) * 100);
  
  return {
    phase,
    phaseName,
    emoji,
    dayOfCycle: Math.round(normalizedDay),
    illumination,
    isNewMoon,
    isFullMoon,
    daysUntilNewMoon: Math.round(daysUntilNewMoon),
    daysUntilFullMoon: Math.round(daysUntilFullMoon),
    nextNewMoon,
    nextFullMoon,
    cycleProgress,
  };
}

function getPhaseInfo(dayOfCycle: number): { phase: string; phaseName: string; emoji: string } {
  if (dayOfCycle < 1.85) {
    return { phase: 'new', phaseName: 'New Moon', emoji: '🌑' };
  } else if (dayOfCycle < 7.38) {
    return { phase: 'waxing_crescent', phaseName: 'Waxing Crescent', emoji: '🌒' };
  } else if (dayOfCycle < 9.23) {
    return { phase: 'first_quarter', phaseName: 'First Quarter', emoji: '🌓' };
  } else if (dayOfCycle < 14.77) {
    return { phase: 'waxing_gibbous', phaseName: 'Waxing Gibbous', emoji: '🌔' };
  } else if (dayOfCycle < 16.61) {
    return { phase: 'full', phaseName: 'Full Moon', emoji: '🌕' };
  } else if (dayOfCycle < 22.15) {
    return { phase: 'waning_gibbous', phaseName: 'Waning Gibbous', emoji: '🌖' };
  } else if (dayOfCycle < 24) {
    return { phase: 'last_quarter', phaseName: 'Last Quarter', emoji: '🌗' };
  } else {
    return { phase: 'waning_crescent', phaseName: 'Waning Crescent', emoji: '🌘' };
  }
}

export function getMoonTheme(phase: string): { theme: string; energy: string; activities: string[] } {
  switch (phase) {
    case 'new':
      return {
        theme: 'New Beginnings',
        energy: 'Plant seeds of intention',
        activities: ['Set new goals', 'Start new habits', 'Meditation for clarity'],
      };
    case 'waxing_crescent':
    case 'first_quarter':
    case 'waxing_gibbous':
      return {
        theme: 'Growth & Building',
        energy: 'Take action on intentions',
        activities: ['Build momentum', 'Active yoga', 'Progressive challenges'],
      };
    case 'full':
      return {
        theme: 'Celebration & Release',
        energy: 'Peak energy, time to release',
        activities: ['Celebrate progress', 'Release what no longer serves', 'Full expression'],
      };
    case 'waning_gibbous':
    case 'last_quarter':
    case 'waning_crescent':
      return {
        theme: 'Rest & Reflection',
        energy: 'Slow down, integrate lessons',
        activities: ['Gentle practices', 'Yin yoga', 'Journaling', 'Rest'],
      };
    default:
      return {
        theme: 'Balance',
        energy: 'Find your center',
        activities: ['Meditation', 'Gentle movement', 'Reflection'],
      };
  }
}

export function formatMoonDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getDaysRemainingText(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export function isNewMoonDate(date: Date): boolean {
  const phaseInfo = getMoonPhase(date);
  return phaseInfo.dayOfCycle < 1.5 || phaseInfo.dayOfCycle > 28;
}

export function isFullMoonDate(date: Date): boolean {
  const phaseInfo = getMoonPhase(date);
  return phaseInfo.dayOfCycle >= 14 && phaseInfo.dayOfCycle <= 16;
}