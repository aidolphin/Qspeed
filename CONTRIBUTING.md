# Contributing to Qspeed

Thanks for taking the time to contribute. This document explains how to get started.

---

## Development setup

```bash
git clone https://github.com/QuantumLeafAutomation/qspeed.git
cd qspeed
python3 serve.py        # starts http://localhost:8080
```

No build step. No bundler. Edit files and refresh the browser.

---

## Code style

- Vanilla JS only — no frameworks, no TypeScript
- Each file has one responsibility (see project structure in README)
- Keep functions small and named clearly
- No comments explaining *what* the code does — only *why* when non-obvious

---

## Commit message format

```
type: short description

feat:     new feature
fix:      bug fix
docs:     documentation only
style:    formatting, no logic change
refactor: code restructure, no behaviour change
perf:     performance improvement
```

---

## Reporting bugs

Open an issue at [github.com/QuantumLeafAutomation/qspeed/issues](https://github.com/QuantumLeafAutomation/qspeed/issues)

Include:
- Browser and version
- Operating system
- Steps to reproduce
- Expected vs actual result
- Console errors if any

---

## Pull request checklist

- [ ] Tested locally via `python3 serve.py`
- [ ] No new external dependencies added
- [ ] Works on Chrome, Firefox, and Safari
- [ ] Mobile responsive
- [ ] No console errors
