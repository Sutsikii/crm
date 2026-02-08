# CRM

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Commit Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <description>
```

### Types

| Type       | Description                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | A new feature                                    |
| `fix`      | A bug fix                                        |
| `docs`     | Documentation only changes                       |
| `style`    | Code style changes (formatting, no logic change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test`     | Adding or updating tests                         |
| `chore`    | Maintenance tasks (deps, config, build, etc.)    |

### Examples

```
feat(auth): add google oauth provider
fix(db): resolve unique constraint on customer email
style(ui): update primary button hover state
chore(deps): bump next.js to v15
docs(api): document the new invoice endpoint
refactor(utils): simplify date formatting logic
test(orders): add unit tests for order validation
```
