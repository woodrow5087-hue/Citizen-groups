import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const width of [320, 375, 390, 430, 980]) {
  test(`Bible reader and local privacy at ${width}px`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Grow", exact: true }).click();
    await expect(page.getByRole("heading", { name: /One day/ })).toBeVisible();
    await page.getByRole("button", { name: /Read today’s passage/ }).click();
    await expect(page.getByRole("list", { name: /verses$/ })).toBeVisible();
    await page
      .getByRole("combobox", { name: "Book", exact: true })
      .selectOption("JHN");
    await page
      .getByRole("combobox", { name: "Chapter", exact: true })
      .selectOption("3");
    await expect(
      page.getByRole("list", { name: "John 3 verses" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Increase Bible font size" })
      .click();
    await page
      .getByRole("button", { name: "Increase Bible font size" })
      .click();
    await expect(
      page.getByRole("button", { name: "Increase Bible font size" }),
    ).toBeDisabled();
    await expect(page.getByText("24px", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: /^Verse 16\./ }).click();
    await page
      .getByRole("textbox", { name: "Personal reflection", exact: true })
      .fill("Fictional personal reflection; never in the group preview.");
    await page.getByRole("button", { name: "Save reflection locally" }).click();
    await page.getByRole("button", { name: "Mark chapter read today" }).click();
    await expect(
      page.getByRole("button", { name: "✓ Read today" }),
    ).toHaveAttribute("aria-pressed", "true");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    expect(overflow).toBe(false);
    const small = await page
      .locator("button:visible,select:visible")
      .evaluateAll((elements) =>
        elements
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width < 44 || r.height < 44;
          })
          .map((el) => el.textContent?.slice(0, 50)),
      );
    expect(small).toEqual([]);
    const readerAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(readerAxe.violations).toEqual([]);
    await page.getByRole("button", { name: "Preview with My Group" }).click();
    const dialog = page.getByRole("dialog", {
      name: "My Group · Demo preview",
    });
    await expect(
      dialog.getByText(/Nothing is posted to My Group/),
    ).toBeVisible();
    await expect(dialog.getByText("John 3:16", { exact: true })).toBeVisible();
    await expect(
      dialog.getByText(
        "Fictional personal reflection; never in the group preview.",
        { exact: true },
      ),
    ).toHaveCount(0);
    const posts = await page.evaluate(
      () =>
        JSON.parse(
          localStorage.getItem("citizen-groups-concept-v03") || '{"posts":[]}',
        ).posts,
    );
    expect(posts).toEqual([]);
    const sheetAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(sheetAxe.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Preview with My Group" }),
    ).toBeFocused();
    await page.getByRole("button", { name: "Next →" }).click();
    await expect(
      page.getByRole("heading", { name: "John 4", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "← Previous" }).click();
    await page.reload();
    await page.getByRole("button", { name: "Grow", exact: true }).click();
    await page.getByRole("button", { name: /Open Bible/ }).click();
    await expect(
      page.getByRole("list", { name: "John 3 verses" }),
    ).toBeVisible();
    await page.getByRole("button", { name: /^Verse 16\./ }).click();
    await expect(
      page.getByRole("textbox", { name: "Personal reflection", exact: true }),
    ).toHaveValue("Fictional personal reflection; never in the group preview.");
    await expect(page.getByText("24px", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "✓ Read today" }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.evaluate(() => scrollTo(0, 0));
    await testInfo.attach(`reader-${width}`, {
      body: await page.screenshot({ fullPage: false }),
      contentType: "image/png",
    });
    expect(errors).toEqual([]);
  });
}
