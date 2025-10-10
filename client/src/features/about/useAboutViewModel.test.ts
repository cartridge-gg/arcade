import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import type { EditionModel } from "@cartridge/arcade";
import { useAboutViewModel } from "./useAboutViewModel";

describe("useAboutViewModel", () => {
  const edition = {
    id: 1,
    description: "Test description",
    socials: {
      videos: ["https://youtu.be/test"],
      images: ["https://example.com/image.png"],
    },
  } as unknown as EditionModel;

  it("collects media items from edition socials", () => {
    const { result } = renderHook(() =>
      useAboutViewModel({ edition, socials: undefined }),
    );
    expect(result.current.mediaItems).toHaveLength(2);
    expect(result.current.details).toBe("Test description");
  });

  it("exposes socials flag when provided", () => {
    const socials = { twitter: "https://twitter.com/test" };
    const { result } = renderHook(() =>
      useAboutViewModel({ edition, socials }),
    );
    expect(result.current.hasSocials).toBe(true);
    expect(result.current.socials).toEqual(socials);
  });
});
