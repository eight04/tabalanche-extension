# tabalanche-extension

[![Join the chat at https://gitter.im/tabalanche/tabalanche-extension](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/tabalanche/tabalanche-extension)

The Tabalanche browser extension

## Search syntax

The search pattern is composed by multiple terms, separated by spaces.

Each term can be:

- A regular expression, which will be matched against the title and URL of the tabs. For example, `github` will match all tabs with "github" in their title or URL.
- A regular expression prefixed with `-`, which will exclude tabs that match the pattern. For example, `-github` will exclude all tabs with "github" in their title or URL.
- A date can be parsed by `Date()` prefixed with `until:`, which will match tabs that were opened before the specified date. For example, `until:2024-01-01` will match all tabs that were opened before January 1, 2024.
