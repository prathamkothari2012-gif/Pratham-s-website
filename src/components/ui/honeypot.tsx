/**
 * A hidden field every protected public form includes.
 *
 * `company` is a honeypot — positioned off-screen and hidden from screen
 * readers, so no real person ever fills it in, while naive form-filling bots
 * populate every field they find. Submissions that carry a value are dropped.
 */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="company">Company (leave this blank)</label>
      <input
        id="company"
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}
