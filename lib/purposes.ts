export const PURPOSE_OPTIONS = [
  "Property Showing",
  "Listing Appointment",
  "Client Meeting",
  "Inspection",
  "Open House",
  "Office Visit",
  "Networking",
  "Supply Run",
  "Other",
] as const;

export type PurposeCategory = (typeof PURPOSE_OPTIONS)[number];
