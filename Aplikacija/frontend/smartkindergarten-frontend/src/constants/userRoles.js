export const USER_ROLES = Object.freeze({
  ADMINISTRATOR: "Administrator",
  TEACHER: "Teacher",
  PARENT: "Parent",
  ADMINISTRATIVE_STAFF: "AdministrativeStaff",
});

export const USER_ROLE_LABELS = Object.freeze({
  [USER_ROLES.ADMINISTRATOR]: "Administrator",
  [USER_ROLES.TEACHER]: "Vaspitač",
  [USER_ROLES.PARENT]: "Roditelj",
  [USER_ROLES.ADMINISTRATIVE_STAFF]: "Administrativno osoblje",
});

export const USER_ROLE_OPTIONS = [
  {
    value: USER_ROLES.ADMINISTRATOR,
    label: USER_ROLE_LABELS[USER_ROLES.ADMINISTRATOR],
  },
  {
    value: USER_ROLES.TEACHER,
    label: USER_ROLE_LABELS[USER_ROLES.TEACHER],
  },
  {
    value: USER_ROLES.PARENT,
    label: USER_ROLE_LABELS[USER_ROLES.PARENT],
  },
  {
    value: USER_ROLES.ADMINISTRATIVE_STAFF,
    label: USER_ROLE_LABELS[USER_ROLES.ADMINISTRATIVE_STAFF],
  },
];

export const MANAGEABLE_USER_ROLE_OPTIONS = [
  {
    value: USER_ROLES.TEACHER,
    label: USER_ROLE_LABELS[USER_ROLES.TEACHER],
  },
  {
    value: USER_ROLES.PARENT,
    label: USER_ROLE_LABELS[USER_ROLES.PARENT],
  },
  {
    value: USER_ROLES.ADMINISTRATIVE_STAFF,
    label: USER_ROLE_LABELS[USER_ROLES.ADMINISTRATIVE_STAFF],
  },
];
