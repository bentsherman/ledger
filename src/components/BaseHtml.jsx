
export function BaseHtml({ children }) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" href="/favicon.ico">
        <title>The Ledger</title>
        <script src="https://unpkg.com/htmx.org@1.9.5/dist/htmx.min.js"></script>
        <script src="https://unpkg.com/htmx.org@1.9.5/dist/ext/json-enc.js"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.11"></script>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js"></script>
        <link href="/styles.css" rel="stylesheet">
    </head>
    <body>
        <nav class="navbar navbar-expand navbar-dark bg-dark mb-5">
            <div class="container-fluid">
                <a class="navbar-brand" href="/">Ledger</a>
            </div>
        </nav>

        <div class="container-fluid">
            ${children}
        </div>
    </body>
    `
}
