/* Tap & Tidy Cleaning site config.
   TODO(owner): set FORM_ENDPOINT to a free form relay to receive requests by email, e.g.
   "https://formsubmit.co/ajax/YOUR-BUSINESS-EMAIL" (FormSubmit sends a one-time activation email first).
   While it is empty, booking, contact, and cleaner forms run in preview mode: they save on the visitor's device only. */
window.TT_CONFIG = {
  FORM_ENDPOINT: "",
  PHONE: "",   // TODO(owner): business phone, e.g. "+1-905-000-0000"
  EMAIL: "",   // TODO(owner): business email
  /* Ontario holidays and peak dates: prepayment required, holiday premium applies */
  HOLIDAYS: ["2026-12-24","2026-12-25","2026-12-26","2026-12-31","2027-01-01","2027-02-15","2027-03-26","2027-05-24","2027-07-01","2027-08-02","2027-09-06","2027-10-11","2027-12-24","2027-12-25","2027-12-26","2027-12-31"],
  /* Availability stub. TODO: replace with the live calendar feed. Days are 0=Sun..6=Sat */
  SLOTS: ["08:00","10:00","12:00","14:00","16:00","18:00","20:00","22:00"],
  AFTER_HOURS_FROM: "22:00",
  LEAD_HOURS: 72,
  DAYS_AHEAD: 60
};
