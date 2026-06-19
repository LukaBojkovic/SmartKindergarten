export const developmentAreas = [
  {
    value: "SocialSkills",
    label: "Socijalne veštine",
  },
  {
    value: "CognitiveDevelopment",
    label: "Kognitivni razvoj",
  },
  {
    value: "MotorSkills",
    label: "Motoričke veštine",
  },
  {
    value: "SpeechLanguageDevelopment",
    label: "Govorno-jezički razvoj",
  },
];

export function getDevelopmentAreaLabel(value) {
  const area = developmentAreas.find((item) => item.value === value);

  return area ? area.label : value;
}