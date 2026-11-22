#!/bin/sh
# Rebuild The Library: the pages under public/library/ and the search index beside them.
# Run from the repository root after changing anything in library/books/, library/build.mjs or the site's header and footer.
set -e
node library/build.mjs
npx -y pagefind@1.6.0 --site public --glob "library/**/*.html" --output-path public/library/pagefind
# Pagefind also writes its own ready-made search boxes, which this site does not use.
rm -f public/library/pagefind/pagefind-ui.* public/library/pagefind/pagefind-modular-ui.* public/library/pagefind/pagefind-component-ui.* public/library/pagefind/pagefind-highlight.js
