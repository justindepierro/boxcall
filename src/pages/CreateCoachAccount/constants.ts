/**
 * Constants for CreateCoachAccount page
 */

import type { StepDefinition } from './types';

export const COACH_ACCOUNT_STEPS: StepDefinition[] = [
  {
    id: 'intro',
    title: 'Welcome',
    description: 'Get started with your coach account',
  },
  {
    id: 'personal-info',
    title: 'Personal Information',
    description: 'Basic contact details',
  },
  {
    id: 'address-info',
    title: 'Address',
    description: 'Location information',
  },
  {
    id: 'coaching-info',
    title: 'Coaching Background',
    description: 'Your coaching experience',
  },
  {
    id: 'team-connection',
    title: 'Team Connection',
    description: 'Optional team linking',
  },
  {
    id: 'payment',
    title: 'Payment',
    description: 'Complete your purchase',
  },
  {
    id: 'complete',
    title: 'Complete',
    description: 'Account ready to use',
  },
];

export const SPORT_OPTIONS = [
  { value: 'Football', label: 'Football' },
  { value: 'Basketball', label: 'Basketball' },
  { value: 'Baseball', label: 'Baseball' },
  { value: 'Soccer', label: 'Soccer' },
  { value: 'Track & Field', label: 'Track & Field' },
  { value: 'Wrestling', label: 'Wrestling' },
  { value: 'Volleyball', label: 'Volleyball' },
  { value: 'Cross Country', label: 'Cross Country' },
  { value: 'Swimming', label: 'Swimming' },
  { value: 'Tennis', label: 'Tennis' },
  { value: 'Golf', label: 'Golf' },
  { value: 'Lacrosse', label: 'Lacrosse' },
  { value: 'Field Hockey', label: 'Field Hockey' },
  { value: 'Softball', label: 'Softball' },
  { value: 'Other', label: 'Other' },
];

export const EXPERIENCE_OPTIONS = [
  { value: 'New Coach', label: 'New Coach (0 years)' },
  { value: '1-3 years', label: '1-3 years' },
  { value: '4-7 years', label: '4-7 years' },
  { value: '8-15 years', label: '8-15 years' },
  { value: '15+ years', label: '15+ years' },
];

export const COACHING_LEVEL_OPTIONS = [
  { value: 'Youth', label: 'Youth (Under 14)' },
  { value: 'High School', label: 'High School' },
  { value: 'College', label: 'College' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Multiple Levels', label: 'Multiple Levels' },
];

export const DEFAULT_FORM_DATA = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  yearsExperience: '1-3 years',
  primarySport: 'Football',
  coachingLevel: 'High School',
  hasSchoolCode: false,
  schoolCode: '',
  schoolName: '',
  requestTeamLink: false,
};
