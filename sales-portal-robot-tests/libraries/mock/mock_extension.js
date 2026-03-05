"use strict";
/**
 * Browser Library JS extension for network response mocking via Playwright route interception.
 *
 * The `page` argument is a reserved name that Browser Library automatically injects with the
 * active Playwright Page object. All other arguments are passed from the Python caller via
 * `Browser.call_js_keyword(keyword_name, **kwargs)`.
 *
 * Functions MUST use positional named parameters (not destructuring) so that Browser Library
 * can extract argument names from the function source with its regex parser.
 */

/**
 * Register a Playwright route that intercepts requests matching `url` and fulfills them with a
 * mocked JSON response.
 *
 * @param {import('playwright').Page} page - injected by Browser Library
 * @param {string} url - Glob URL pattern to intercept (e.g. "** /api/orders")
 * @param {string} body - JSON-serialized response body string
 * @param {number|string} status - HTTP status code
 * @param {string} contentType - value for the Content-Type response header
 */
async function routeMockResponse(page, url, body, status, contentType) {
  await page.route(url, async (route) => {
    await route.fulfill({
      status: Number(status),
      contentType: contentType || "application/json",
      body: body,
    });
  });
}
routeMockResponse.rfdoc =
  "Register a Playwright route that intercepts requests matching url and returns a mocked response.";

/**
 * Register a Playwright route using a regex pattern string.
 * Useful for matching URLs with query parameters (e.g. /\/api\/orders\?/).
 *
 * @param {import('playwright').Page} page - injected by Browser Library
 * @param {string} regexStr - regex source string (without delimiters), e.g. "\\/api\\/orders\\?"
 * @param {string} body - JSON-serialized response body string
 * @param {number|string} status - HTTP status code
 * @param {string} contentType - value for the Content-Type response header
 */
async function routeMockResponseRegex(page, regexStr, body, status, contentType) {
  const pattern = new RegExp(regexStr);
  await page.route(pattern, async (route) => {
    await route.fulfill({
      status: Number(status),
      contentType: contentType || "application/json",
      body: body,
    });
  });
}
routeMockResponseRegex.rfdoc =
  "Register a Playwright route using a regex pattern string and return a mocked response.";

/**
 * Remove all active Playwright route handlers from the current page.
 *
 * @param {import('playwright').Page} page - injected by Browser Library
 */
async function unrouteAll(page) {
  await page.unrouteAll({ behavior: "ignoreErrors" });
}
unrouteAll.rfdoc = "Remove all active route handlers from the current Playwright page.";

module.exports = { routeMockResponse, routeMockResponseRegex, unrouteAll };
