# Put the game online (GitHub + Netlify)

You only do this setup once. After that, every update is two commands.

## A. Put the code on GitHub
1. In a terminal, go to the project folder: `cd path/to/learning-platformer`
2. `git init` creates a hidden history book for this folder.
3. `git add .` marks all files to be saved (the `.gitignore` file keeps private and bulky files out).
4. `git commit -m "M1: first playable version"` saves a snapshot with a note.
5. On github.com (signed in as rayjit0709): click **+** (top right) > **New repository**.
   Name: `learning-platformer`. Choose **Public** or **Private** (both work with Netlify). Do NOT tick "Add a README". Click **Create repository**.
6. GitHub then shows commands. Run these two (replace nothing if the username is right):
   - `git branch -M main` names the main line of history "main".
   - `git remote add origin https://github.com/rayjit0709/learning-platformer.git` tells Git where the online copy lives.
   - `git push -u origin main` uploads your snapshot. A browser sign-in may appear the first time.

## B. Publish with Netlify
1. On app.netlify.com: **Add new project** > **Import an existing project** > **GitHub**. Allow access when asked.
2. Pick the `learning-platformer` repository.
3. Settings are read from `netlify.toml` (build command `npm run build`, folder `dist`). Check they show these, then click **Deploy**.
4. After about a minute you get an address like `something.netlify.app`. Open it: that is your public link.
5. Optional: **Project configuration > Change project name** to get a nicer address.

## C. Every later update
`git add .` then `git commit -m "what changed"` then `git push`. Netlify republishes automatically.
