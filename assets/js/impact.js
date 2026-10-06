/* How many clients moved from one stage to the next with Tequity (home page journey).
   Set each `value` as a plain number. A value left as null shows as a dash and is
   flagged in review mode (#review). Each number needs an owner and evidence. */
window.TH_IMPACT = {
  asOf: null,
  figures: [
    { id: 'idea-seed', value: null, suffix: '', label: 'Clients taken from Idea to Seed' },
    { id: 'seed-pmf',  value: null, suffix: '', label: 'Clients taken from Seed to PMF' },
    { id: 'pmf-scale', value: null, suffix: '', label: 'Clients taken from PMF to Scale' }
  ]
};
