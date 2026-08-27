import React from "react";
import { render, screen } from "@testing-library/react";
import CookieConsenter from "../src/components/CookieConsenter";
import {
  cookieThemeNames,
  cookieThemePresets,
  getCookieThemePreset,
} from "../src/utils/themes";
import { createTFunction } from "../src/utils/translations";

describe("built-in themes", () => {
  test("exports metadata for every supported theme", () => {
    expect(cookieThemeNames).toEqual([
      "light",
      "dark",
      "minimal",
      "soft",
      "midnight",
      "forest",
      "ocean",
      "sunset",
      "rose",
      "sand",
      "terminal",
      "contrast",
    ]);
    expect(cookieThemePresets.map((preset) => preset.name)).toEqual(
      cookieThemeNames
    );
    expect(getCookieThemePreset("midnight").colorScheme).toBe("dark");
    expect(getCookieThemePreset("contrast").colorScheme).toBe("dark");
  });

  test("applies a preset to the complete consent surface", () => {
    render(
      <CookieConsenter
        tFunction={createTFunction()}
        displayType="popup"
        theme="forest"
        showManageButton
      />
    );

    const themeRoot = document.querySelector(
      '.cookie-manager[data-cookie-theme="forest"]'
    );

    expect(themeRoot).toBeInTheDocument();
    expect(themeRoot?.querySelector(".rcm-surface")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept" })).toHaveClass(
      "rcm-button-primary"
    );
    expect(screen.getByRole("button", { name: "Decline" })).toHaveClass(
      "rcm-button-secondary"
    );
    expect(screen.getByRole("button", { name: "Manage Cookies" })).toHaveClass(
      "rcm-button-outline"
    );
  });

  test("keeps className overrides in control", () => {
    render(
      <CookieConsenter
        tFunction={createTFunction()}
        displayType="popup"
        theme="soft"
        classNames={{ acceptButton: "my-accept-button" }}
      />
    );

    expect(screen.getByRole("button", { name: "Accept" })).toHaveClass(
      "my-accept-button"
    );
    expect(screen.getByRole("button", { name: "Accept" })).not.toHaveClass(
      "rcm-button-primary"
    );
  });
});
