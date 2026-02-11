import { expect, test } from "@playwright/test";

test("homepage renders the primary hero", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Turn raw notes into clear, client-ready briefs.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "BriefGen.ai" })).toBeVisible();
});

test("admin page loads", async ({ page }) => {
  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "BriefGen Admin" })).toBeVisible();
});

test("create-checkout validates required fields", async ({ request }) => {
  const response = await request.post("/api/create-checkout", {
    data: {},
  });

  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toEqual({ error: "Missing required fields" });
});
