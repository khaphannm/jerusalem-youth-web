import { LinkButton } from "@/components/ui/link-button";
import type { EventRegistrationState } from "@/features/events/registration";
import { formatEventDateTime } from "@/lib/format-date";

export function RegistrationPanel({
  state,
}: Readonly<{ state: EventRegistrationState }>) {
  const title =
    state.kind === "open"
      ? "Registration is open"
      : state.kind === "closed"
        ? "Registration is closed"
        : "Registration is not available online";
  const description =
    state.kind === "closed" && state.reason === "event-ended"
      ? "This event has ended."
      : state.kind === "closed"
        ? "The registration deadline has passed."
        : state.kind === "unavailable"
          ? "No online registration link is configured for this event."
          : "Save your place for this gathering.";

  return (
    <aside
      aria-labelledby="registration-title"
      className="rounded-medium border border-border bg-surface p-6 sm:p-8"
    >
      <p className="font-label text-label font-bold uppercase text-accent">
        Registration
      </p>
      <h2
        className="mt-3 font-heading text-heading-3 font-bold"
        id="registration-title"
      >
        {title}
      </h2>
      <p className="mt-3 text-muted">{description}</p>
      {state.deadline ? (
        <p className="mt-4 text-body-small text-muted">
          {state.kind === "open" ? "Register by " : "Deadline: "}
          <time dateTime={state.deadline}>
            {formatEventDateTime(state.deadline)}
          </time>
        </p>
      ) : null}
      {state.kind === "open" ? (
        <div className="mt-6">
          <LinkButton href={state.registrationUrl} size="large">
            Register for this event
          </LinkButton>
        </div>
      ) : null}
    </aside>
  );
}
