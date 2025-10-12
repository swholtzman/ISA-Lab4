// static/ajax.js
"use strict";

/**
 * Minimal front-end for Lab 4.
 * - Uses Fetch (no libraries).
 * - Talks to the partner API hosted on a different origin.
 * - Avoids CORS preflight by using a "simple" Content-Type for POST.
 * - Performs basic input validation on both forms.
 *
 * API:
 *   GET  https://assignments.isaaclauzon.com/comp4537/labs/4/api/definitions/?word={word}
 *   POST https://assignments.isaaclauzon.com/comp4537/labs/4/api/definitions
 *        Body (application/x-www-form-urlencoded): word={word}&definition={definition}
 *
 * Server returns JSON. Examples (shape may vary slightly based on backend):
 *   { "requestId": 102, "word": "book", "definition": "..." }
 *   { "requestId": 103, "message": "word 'book' not found!" }
 */

document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL =
    "https://assignments.isaaclauzon.com/comp4537/labs/4/api/definitions";

  /**
   * Validates a dictionary word: non-empty, alphabetic start, letters/spaces/-/' allowed.
   * This keeps the UI simple while rejecting numbers and obviously invalid input.
   */
  function isValidWord(word) {
    if (typeof word !== "string") return false;
    const trimmed = word.trim();
    if (trimmed.length === 0) return false;
    return /^[A-Za-z][A-Za-z\s\-']*$/.test(trimmed);
  }

  /**
   * Validates a definition: non-empty printable string.
   */
  function isValidDefinition(definition) {
    if (typeof definition !== "string") return false;
    const trimmed = definition.trim();
    return trimmed.length > 0;
  }

  /**
   * Renders a friendly JSON block into a <pre>.
   */
  function renderJson(preElement, payload) {
    preElement.textContent = JSON.stringify(payload, null, 2);
  }

  // ---- STORE (POST) ----
  const storeForm = document.getElementById("storeForm");
  const storeFeedback = document.getElementById("storeFeedback");

  if (storeForm && storeFeedback) {
    storeForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const wordInput = document.getElementById("wordInput");
      const definitionInput = document.getElementById("definitionInput");

      const word = (wordInput?.value ?? "").trim();
      const definition = (definitionInput?.value ?? "").trim();

      if (!isValidWord(word)) {
        renderJson(storeFeedback, {
          status: "error",
          message:
            "Please enter a valid English word (letters, spaces, hyphens, and apostrophes only).",
        });
        return;
      }

      if (!isValidDefinition(definition)) {
        renderJson(storeFeedback, {
          status: "error",
          message: "Please enter a valid definition (non-empty).",
        });
        return;
      }

      try {
        // use simple Content-Type to avoid CORS preflight
        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body:
            "word=" +
            encodeURIComponent(word) +
            "&definition=" +
            encodeURIComponent(definition),
        });

        const contentType = response.headers.get("Content-Type") || "";
        if (!response.ok) {
          //  attempt to parse error JSON if provided
          if (contentType.includes("application/json")) {
            const errorData = await response.json();
            renderJson(storeFeedback, {
              status: "error",
              httpStatus: response.status,
              server: errorData,
            });
          } else {
            const text = await response.text();
            renderJson(storeFeedback, {
              status: "error",
              httpStatus: response.status,
              message: text || response.statusText,
            });
          }
          return;
        }

        const data = contentType.includes("application/json")
          ? await response.json()
          : { message: await response.text() };

        renderJson(storeFeedback, { status: "ok", data });
        storeForm.reset();
      } catch (error) {
        renderJson(storeFeedback, {
          status: "network-error",
          message:
            "The request could not be completed. Please check your connection or try again.",
          detail: String(error),
        });
      }
    });
  }

  //   ---- SEARCH (GET) ----
  const searchForm = document.getElementById("searchForm");
  const searchFeedback = document.getElementById("searchFeedback");

  if (searchForm && searchFeedback) {
    searchForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const searchWordInput = document.getElementById("searchWordInput");
      const word = (searchWordInput?.value ?? "").trim();

      if (!isValidWord(word)) {
        renderJson(searchFeedback, {
          status: "error",
          message:
            "Please enter a valid English word (letters, spaces, hyphens, and apostrophes only).",
        });
        return;
      }

      try {
        const url = `${API_BASE_URL}/?word=${encodeURIComponent(word)}`;
        const response = await fetch(url, { method: "GET" });

        const contentType = response.headers.get("Content-Type") || "";
        if (!response.ok) {
          if (contentType.includes("application/json")) {
            const errorData = await response.json();
            renderJson(searchFeedback, {
              status: "error",
              httpStatus: response.status,
              server: errorData,
            });
          } else {
            const text = await response.text();
            renderJson(searchFeedback, {
              status: "error",
              httpStatus: response.status,
              message: text || response.statusText,
            });
          }
          return;
        }

        const data = contentType.includes("application/json")
          ? await response.json()
          : { message: await response.text() };

        renderJson(searchFeedback, { status: "ok", data });
        searchForm.reset();
      } catch (error) {
        renderJson(searchFeedback, {
          status: "network-error",
          message:
            "The request could not be completed. Please check your connection or try again.",
          detail: String(error),
        });
      }
    });
  }
});
