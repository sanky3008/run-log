export default function PrivacyPage() {
  return (
    <div className="pixel-panel p-5 pop">
      <h2 className="font-pixel text-[11px] mb-3">PRIVACY</h2>
      <div className="flex flex-col gap-2 text-xl">
        <p>
          This is a personal training log. It displays workout, recovery, and sleep data for one
          person — me, Sankalp — synced from my own WHOOP device via the WHOOP API.
        </p>
        <p>
          No visitor data is collected, no cookies are set, and no analytics run on this site. The
          only stored data is my own WHOOP data, kept in a private database to render these pages.
        </p>
        <p>
          Questions? Email phadnis.sankalp691@gmail.com.
        </p>
      </div>
    </div>
  );
}
