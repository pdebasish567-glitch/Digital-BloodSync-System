export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const bloodAvailability = [
  { group: "A+", units: 14, status: "Available" },
  { group: "A-", units: 4, status: "Low Stock" },
  { group: "B+", units: 18, status: "Available" },
  { group: "B-", units: 3, status: "Critical" },
  { group: "AB+", units: 8, status: "Available" },
  { group: "AB-", units: 2, status: "Critical" },
  { group: "O+", units: 22, status: "Available" },
  { group: "O-", units: 5, status: "Low Stock" }
];

export const inventory = [
  { id: 1, group: "A+", component: "Whole Blood", units: 8, collection: "2026-07-21", expiry: "2026-08-25", status: "Available" },
  { id: 2, group: "A+", component: "PRBC", units: 6, collection: "2026-07-28", expiry: "2026-08-27", status: "Available" },
  { id: 3, group: "A-", component: "PRBC", units: 4, collection: "2026-07-15", expiry: "2026-08-19", status: "Expiring Soon" },
  { id: 4, group: "B+", component: "Whole Blood", units: 10, collection: "2026-07-26", expiry: "2026-08-29", status: "Available" },
  { id: 5, group: "B+", component: "PRBC", units: 8, collection: "2026-07-30", expiry: "2026-09-01", status: "Available" },
  { id: 6, group: "B-", component: "PRBC", units: 3, collection: "2026-07-12", expiry: "2026-08-16", status: "Critical" },
  { id: 7, group: "AB+", component: "Plasma", units: 8, collection: "2026-07-20", expiry: "2026-08-20", status: "Expiring Soon" },
  { id: 8, group: "AB-", component: "PRBC", units: 2, collection: "2026-07-10", expiry: "2026-08-14", status: "Critical" },
  { id: 9, group: "O+", component: "Whole Blood", units: 12, collection: "2026-07-25", expiry: "2026-08-29", status: "Available" },
  { id: 10, group: "O+", component: "PRBC", units: 10, collection: "2026-07-31", expiry: "2026-09-02", status: "Available" },
  { id: 11, group: "O-", component: "PRBC", units: 5, collection: "2026-07-17", expiry: "2026-08-18", status: "Low Stock" }
];

export const donors = [
  { id: 1, name: "Arjun Kumar", bloodGroup: "O+", city: "Bhubaneswar", phone: "98XXXXXX21", eligible: true, available: true, donations: 4, lastDonation: "2026-05-18" },
  { id: 2, name: "Priya Das", bloodGroup: "A+", city: "Cuttack", phone: "97XXXXXX54", eligible: true, available: true, donations: 3, lastDonation: "2026-04-12" },
  { id: 3, name: "Rahul Mohanty", bloodGroup: "B+", city: "Bhubaneswar", phone: "99XXXXXX12", eligible: true, available: false, donations: 5, lastDonation: "2026-06-03" },
  { id: 4, name: "Sneha Patnaik", bloodGroup: "O-", city: "Puri", phone: "96XXXXXX80", eligible: true, available: true, donations: 2, lastDonation: "2026-03-27" },
  { id: 5, name: "Amit Sahu", bloodGroup: "AB+", city: "Bhubaneswar", phone: "95XXXXXX67", eligible: true, available: true, donations: 6, lastDonation: "2026-05-30" }
];

export const emergencyRequests = [
  { id: "ER-1001", patient: "Demo Patient", group: "O-", units: 2, level: "Critical", location: "Bhubaneswar", status: "Searching", date: "2026-08-13" },
  { id: "ER-1002", patient: "Demo Patient", group: "B+", units: 3, level: "Urgent", location: "Cuttack", status: "2 Donors Responded", date: "2026-08-12" },
  { id: "ER-1003", patient: "Demo Patient", group: "A+", units: 1, level: "Normal", location: "Puri", status: "Completed", date: "2026-08-11" }
];