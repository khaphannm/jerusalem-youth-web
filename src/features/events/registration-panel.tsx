import { LinkButton } from "@/components/ui/link-button";
import type { EventRegistrationState } from "@/features/events/registration";
import { formatEventDateTime } from "@/lib/format-date";

export function RegistrationPanel({
  state,
}: Readonly<{ state: EventRegistrationState }>) {
  const title =
    state.kind === "open"
      ? "Đang mở đăng ký"
      : state.kind === "closed"
        ? "Đã đóng đăng ký"
        : "Không có đăng ký trực tuyến";
  const description =
    state.kind === "closed" && state.reason === "event-ended"
      ? "Sự kiện này đã kết thúc."
      : state.kind === "closed"
        ? "Đã qua hạn đăng ký."
        : state.kind === "unavailable"
          ? "Sự kiện này chưa có đường dẫn đăng ký trực tuyến."
          : "Giữ chỗ cho buổi gặp gỡ này.";

  return (
    <aside
      aria-labelledby="registration-title"
      className="motion-reveal rounded-large border border-border bg-surface p-6 sm:rounded-xlarge sm:p-8"
    >
      <p className="font-label text-label font-bold uppercase text-accent">
        Đăng ký
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
          {state.kind === "open" ? "Đăng ký trước " : "Hạn đăng ký: "}
          <time dateTime={state.deadline}>
            {formatEventDateTime(state.deadline, "vi")}
          </time>
        </p>
      ) : null}
      {state.kind === "open" ? (
        <div className="mt-6">
          <LinkButton href={state.registrationUrl} size="large">
            Đăng ký tham gia
          </LinkButton>
        </div>
      ) : null}
    </aside>
  );
}
