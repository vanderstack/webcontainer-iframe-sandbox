# webcontainer-iframe-sandbox
A repository used so that GitHub pages can be loaded in an iframe as a mechanism of creating a sandbox to intercept the needed headers to run webcontainers within an otherwise client only application

The goal here is to create the simplest possible iframe app on GitHub Pages that does only one thing: **load, enable the required headers, and send a "ready" message.**

**Step 1: Create a New, Public GitHub Repository**
*   Name it something simple, like `iframe-host`. This repository will *only* contain the files for your iframe.

**Step 2: Create an `index.html` File**
*   In this new repository, create a file named `index.html`. This file does two things: it loads the `coi-serviceworker` to enable the headers, and it sends a message to its parent window when it's ready.

**Step 3: Add the `coi-serviceworker.js` File**
*   Go to this URL: `https://unpkg.com/coi-serviceworker/coi-serviceworker.js`
*   Save the content of that page as a new file named `coi-serviceworker.js` in your `iframe-host` repository.

**Step 4: Enable GitHub Pages**
*   In your `iframe-host` repository, go to **Settings > Pages**.
*   Under "Build and deployment," select the source as **"Deploy from a branch"**.
*   Set the branch to `main` and the folder to `/ (root)`. Click **Save**.
*   Wait a minute or two. The page will deploy, and you will get a public URL like `https://your-username.github.io/iframe-host/`. **This is the URL you will need for the next part.**
