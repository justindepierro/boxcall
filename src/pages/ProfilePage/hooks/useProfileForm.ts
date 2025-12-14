/**
 * useProfileForm - Manages profile form state and validation
 */
import { useState, useEffect, useCallback } from "react";
import type { Database } from "../../../types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface ProfileFormData {
  display_name: string;
  full_name: string;
  phone: string;
  bio: string;
  address: string;
  // Athletic information
  position: string;
  jersey_number: string;
  height_inches: string;
  weight_lbs: string;
  grade_level: string;
  // Emergency contact information
  emergency_contact: string;
  emergency_phone: string;
  // Coaching information
  coaching_experience: string;
  education: string;
  certifications: string;
  coaching_philosophy: string;
  specializations: string;
  current_school: string;
  previous_schools: string;
  mentors: string;
  coaching_system: string;
  years_coaching: string;
  // Social media links
  social_twitter: string;
  social_instagram: string;
  social_linkedin: string;
  social_tiktok: string;
  social_youtube: string;
  personal_website: string;
}

export type ValidationErrors = Record<string, string>;

const createInitialFormData = (): ProfileFormData => ({
  display_name: "",
  full_name: "",
  phone: "",
  bio: "",
  address: "",
  position: "",
  jersey_number: "",
  height_inches: "",
  weight_lbs: "",
  grade_level: "",
  emergency_contact: "",
  emergency_phone: "",
  coaching_experience: "",
  education: "",
  certifications: "",
  coaching_philosophy: "",
  specializations: "",
  current_school: "",
  previous_schools: "",
  mentors: "",
  coaching_system: "",
  years_coaching: "",
  social_twitter: "",
  social_instagram: "",
  social_linkedin: "",
  social_tiktok: "",
  social_youtube: "",
  personal_website: "",
});

/** Helper to safely get string value from profile field */
const str = (value: string | null | undefined): string => value ?? "";

/** Helper to safely convert number to string */
const numStr = (value: number | null | undefined): string =>
  value !== null && value !== undefined ? String(value) : "";

/** Populate basic info fields */
const populateBasicInfo = (profile: Profile) => ({
  display_name: str(profile.display_name),
  full_name: str(profile.full_name),
  phone: str(profile.phone),
  bio: str(profile.bio),
  address: str(profile.address),
});

/** Populate athletic info fields */
const populateAthleticInfo = (profile: Profile) => ({
  position: str(profile.position),
  jersey_number: numStr(profile.jersey_number),
  height_inches: numStr(profile.height_inches),
  weight_lbs: numStr(profile.weight_lbs),
  grade_level: str(profile.grade_level),
});

/** Populate emergency contact fields */
const populateEmergencyInfo = (profile: Profile) => ({
  emergency_contact: str(profile.emergency_contact),
  emergency_phone: str(profile.emergency_phone),
});

/** Populate coaching info fields */
const populateCoachingInfo = (profile: Profile) => ({
  coaching_experience: str(profile.coaching_experience),
  education: str(profile.education),
  certifications: str(profile.certifications),
  coaching_philosophy: str(profile.coaching_philosophy),
  specializations: str(profile.specializations),
  current_school: str(profile.current_school),
  previous_schools: str(profile.previous_schools),
  mentors: str(profile.mentors),
  coaching_system: str(profile.coaching_system),
  years_coaching: numStr(profile.years_coaching),
});

/** Populate social media fields */
const populateSocialInfo = (profile: Profile) => ({
  social_twitter: str(profile.social_twitter),
  social_instagram: str(profile.social_instagram),
  social_linkedin: str(profile.social_linkedin),
  social_tiktok: str(profile.social_tiktok),
  social_youtube: str(profile.social_youtube),
  personal_website: str(profile.personal_website),
});

const populateFormFromProfile = (profile: Profile): ProfileFormData => ({
  ...populateBasicInfo(profile),
  ...populateAthleticInfo(profile),
  ...populateEmergencyInfo(profile),
  ...populateCoachingInfo(profile),
  ...populateSocialInfo(profile),
});

// Phone regex for validation
const PHONE_REGEX = /^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$|^\d{3}-\d{3}-\d{4}$/;

// Validation rules extracted for lower complexity
const validatePhone = (phone: string, errors: ValidationErrors): void => {
  if (phone && !PHONE_REGEX.test(phone)) {
    errors.phone =
      "Please enter a valid phone number (e.g., (555) 123-4567 or 555-123-4567)";
  }
};

const validateEmergencyPhone = (
  emergencyPhone: string,
  errors: ValidationErrors
): void => {
  if (emergencyPhone && !PHONE_REGEX.test(emergencyPhone)) {
    errors.emergency_phone =
      "Please enter a valid emergency contact phone number";
  }
};

const validateHeight = (
  heightInches: string,
  errors: ValidationErrors
): void => {
  if (heightInches) {
    const height = parseFloat(heightInches);
    if (isNaN(height) || height < 48 || height > 84) {
      errors.height_inches =
        "Height must be between 48 and 84 inches (4-7 feet)";
    }
  }
};

const validateWeight = (weightLbs: string, errors: ValidationErrors): void => {
  if (weightLbs) {
    const weight = parseFloat(weightLbs);
    if (isNaN(weight) || weight < 80 || weight > 400) {
      errors.weight_lbs = "Weight must be between 80 and 400 lbs";
    }
  }
};

const validateJerseyNumber = (
  jerseyNumber: string,
  errors: ValidationErrors
): void => {
  if (jerseyNumber) {
    const jerseyNum = parseInt(jerseyNumber);
    if (isNaN(jerseyNum) || jerseyNum < 0 || jerseyNum > 99) {
      errors.jersey_number = "Jersey number must be between 0 and 99";
    }
  }
};

const validateEmergencyContact = (
  profile: Profile | null,
  formData: ProfileFormData,
  errors: ValidationErrors
): void => {
  // Emergency contact required for players/minors
  if (
    (profile?.role === "player" || formData.grade_level) &&
    !formData.emergency_contact
  ) {
    errors.emergency_contact = "Emergency contact is required for players";
  }

  // Emergency phone required if emergency contact is provided
  if (formData.emergency_contact && !formData.emergency_phone) {
    errors.emergency_phone =
      "Emergency contact phone is required when emergency contact is provided";
  }
};

export interface UseProfileFormReturn {
  formData: ProfileFormData;
  validationErrors: ValidationErrors;
  handleInputChange: (field: string, value: string) => void;
  validateForm: () => boolean;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

export function useProfileForm(profile: Profile | null): UseProfileFormReturn {
  const [formData, setFormData] = useState<ProfileFormData>(
    createInitialFormData()
  );
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFormData(populateFormFromProfile(profile));
    }
  }, [profile]);

  // Handle form input changes
  const handleInputChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear validation error for this field when user starts typing
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [validationErrors]
  );

  // Validation function - broken into smaller pieces
  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {};

    validatePhone(formData.phone, errors);
    validateEmergencyPhone(formData.emergency_phone, errors);
    validateHeight(formData.height_inches, errors);
    validateWeight(formData.weight_lbs, errors);
    validateJerseyNumber(formData.jersey_number, errors);
    validateEmergencyContact(profile, formData, errors);

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, profile]);

  return {
    formData,
    validationErrors,
    handleInputChange,
    validateForm,
    setValidationErrors,
  };
}
