/* Live figures for the home page (both hero options).
   Fill in each `value` as a plain number, add a `suffix` such as "+" if needed,
   and set `asOf` to the month the figures describe, e.g. "September 2026".
   A figure left as null shows as pending and is flagged in review mode (#review). */
window.TH_IMPACT = {
  asOf: null,
  figures: [
    { id: 'clients',  value: null, suffix: '+', label: 'Clients we have worked with so far' },
    { id: 'patients', value: null, suffix: '',  label: 'Patients helped last month' },
    { id: 'clinics',  value: null, suffix: '',  label: 'Clinics onboarded last month' }
  ]
};
