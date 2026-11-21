"use client";

export function SkipLink({label}: {label: string}) {
  return <a className="skip-link" href="#main" onClick={event => {
    const main = document.getElementById("main");
    if (!main) return;
    event.preventDefault();
    main.tabIndex = -1;
    main.focus({preventScroll: true});
    main.scrollIntoView({block: "start"});
  }}>{label}</a>;
}
