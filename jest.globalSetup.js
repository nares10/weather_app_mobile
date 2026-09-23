// Run every test as if the phone were in New York (UTC-4/-5).
// Date bugs — reading a date as UTC but formatting it in local time — only
// show up when the device isn't on UTC, so we make sure it isn't.
// This must happen here, before Jest starts its workers: changing
// process.env.TZ inside a test has no effect on Date.
module.exports = () => {
  process.env.TZ = "America/New_York";
};
