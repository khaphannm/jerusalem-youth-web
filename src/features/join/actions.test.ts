import { describe, expect, it } from "vitest";

import { resolveJoinPrimaryAction } from "@/features/join/actions";

describe("Join primary action", () => {
  it("uses an approved configured action", () => {
    const action = {
      label: "Join the community",
      url: "https://signup.example.test/community",
    };

    expect(resolveJoinPrimaryAction(action)).toBe(action);
  });

  it.each([null, { label: "Join", url: "/join" }, { label: "Join", url: "/join/" }])(
    "uses the events fallback for missing and self-referential actions",
    (action) => {
      expect(resolveJoinPrimaryAction(action)).toEqual({
        label: "Tìm một buổi gặp gỡ",
        url: "/events",
      });
    },
  );
});
