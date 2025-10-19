# COMP 4537 - Lab 4: Dictionary REST API (Client)

## Project Overview

This project is the client-side implementation for a simple dictionary REST API service. The full application is built on a two-server architecture, where this repository represents **Server 1** (the client) and a separate repository holds the backend API for **Server 2**.

The purpose of this lab is to create a service that can store and retrieve word definitions. The client-side (this repository) provides the user interface for these actions and communicates with the backend (Server 2) using `XMLHttpRequest` (AJAX) calls.

## This Repository (Client-Side)

This repository contains only the front-end components of the application. These are static files intended to be hosted on a separate server from the API, forcing cross-origin resource sharing (CORS) communication.

The code herein is responsible for:

- Rendering the user-facing HTML forms.
- Handling user input and performing client-side validation.
- Initiating AJAX (GET and POST) requests to the backend API.
- Receiving JSON responses from the API and displaying appropriate feedback to the user.

### File Structure

- `store.html`: An HTML page containing a form with inputs for a **word** and its **definition**. Submitting this form triggers a `POST` request to the API.
- `search.html`: An HTML page containing a form with a single input for a **word** to search. Submitting this form triggers a `GET` request to the API.
- `ajax.js`: The core JavaScript module that handles all client-side logic. It contains functions to:
  - Add event listeners to the forms.
  - Validate user input (checking for non-empty strings).
  - Construct and send `XMLHttpRequest` objects for both `POST` and `GET` requests.
  - Handle API responses and update the DOM to show success messages, search results, or error/warning messages.

## Technology Stack

- **HTML5**
- **Vanilla JavaScript (ES6+)**
- **`XMLHttpRequest`** (for handling AJAX calls)

As per lab requirements, no external libraries (like jQuery) or modules requiring `npm` are used in this front-end implementation.

## Setup and Usage

1.  **Host Server 1 (This Repo):** Deploy the files in this repository (`store.html`, `search.html`, `ajax.js`) to a static hosting provider (Vercel).
2.  **Host Server 2 (Backend):** The separate backend Node.js API must be deployed to a _different_ hosting provider (DigitalOcean).
3.  **Configure API Endpoint:** The `ajax.js` file must be updated. The variable holding the API's base URL (e.g., `const API_ENDPOINT = ...`) must be set to the public URL of your deployed **Server 2**.

Once both servers are deployed and the client is configured with the correct API URL, you can navigate to `store.html` to add entries and `search.html` to retrieve them.

## Expected API Contract (Server 2)

This client-side application expects the backend API (Server 2) to adhere to the following contract:

### POST `/api/definitions`

- **Description:** Creates a new word/definition entry.
- **Request Body:** A JSON object.
  ```json
  {
    "word": "example",
    "definition": "A thing characteristic of its kind."
  }
  ```
- **Success Response (JSON):** Returns a message confirming the entry, the request number, and the new total number of entries.
- **Warning Response (JSON):** Returns a message if the word already exists.

### GET `/api/definitions/?word=<word>`

- **Description:** Retrieves the definition for a specific `<word>`.
- **Success Response (JSON):** Returns a message including the request number and the found definition.
- **Not Found Response (JSON):** Returns a message including the request number indicating the word was not found.
