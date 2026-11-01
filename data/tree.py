#!/usr/bin/env python3
"""
Write a compact indented tree of a directory.

Usage:
    python tree.py <path>                       # print to terminal
    python tree.py <path> -o tree.txt           # save to file
    python tree.py <path> -o tree.txt --hidden  # include dotfiles
"""

import argparse
from pathlib import Path

# ---- Default ignore rules ---------------------------------------------------

# Directories to skip entirely (matched by name at any depth)
IGNORE_DIRS = {
    # Build output / bundles
    "node_modules", "dist", "build", ".next", "out", "coverage",
    # Docs / static assets
    "docs", "public",
    # VCS / editors / tooling
    ".git", ".github", ".vscode", ".vs_code", ".idea",
    # Python
    "__pycache__", ".venv", "venv", ".pytest_cache", ".mypy_cache",
}

# Files to skip entirely (matched by exact name)
IGNORE_FILES = {
    # git
    ".gitignore", ".gitattributes", ".gitmodules",
    # js / ts tooling configs
    "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "vite.config.js", "vite.config.ts", "vite.config.mjs",
    "tailwind.config.js", "tailwind.config.ts",
    "postcss.config.js", "postcss.config.cjs", "postcss.config.mjs",
    "eslint.config.js", "eslint.config.mjs",
    # misc
    "LICENSE", "LICENSE.md", ".editorconfig",
}

# Extensions to skip (add more if you like)
IGNORE_EXTS = {
    ".lock", ".log", ".map",      # lockfiles, logs, sourcemaps
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp",
    ".woff", ".woff2", ".ttf", ".eot",
    ".mp4", ".mp3", ".wav",
    ".zip", ".tar", ".gz",
}


# ---- Tree writer ------------------------------------------------------------

def _is_ignored_file(name: str) -> bool:
    if name in IGNORE_FILES:
        return True
    return Path(name).suffix.lower() in IGNORE_EXTS


def _sorted_entries(directory: Path, include_hidden: bool):
    """Files first, then folders, alphabetical, respecting ignores."""
    files, folders = [], []
    try:
        for entry in directory.iterdir():
            name = entry.name

            # hidden check (dot-files/folders), but always allow if user asked
            if not include_hidden and name.startswith("."):
                # allow-list exceptions if you want, e.g. {".env.example"}
                continue

            if entry.is_dir():
                if name in IGNORE_DIRS:
                    continue
                folders.append(entry)
            elif entry.is_file():
                if _is_ignored_file(name):
                    continue
                files.append(entry)

    except PermissionError:
        yield from ()  # handled below
        return

    files.sort(key=lambda p: p.name.lower())
    folders.sort(key=lambda p: p.name.lower())
    yield from files
    yield from folders


def walk_tree(root: Path, include_hidden: bool = False):
    """
    Yield (line_str, is_dir) for the whole tree, root first.
    Uses an explicit stack to avoid recursion limits on huge trees.
    """
    yield f"{root.name}/", True

    # stack entries: (path, depth)
    stack = [(root, 1)]
    while stack:
        directory, depth = stack.pop()
        indent = "  " * depth

        try:
            entries = list(_sorted_entries(directory, include_hidden))
        except PermissionError:
            yield f"{indent}[permission denied]", False
            continue

        # push folders in reverse so they come out in order after files
        children_to_recurse = []
        for entry in entries:
            if entry.is_dir():
                yield f"{indent}{entry.name}/", True
                children_to_recurse.append((entry, depth + 1))
            else:
                yield f"{indent}{entry.name}", False

        # recurse into folders last so their contents appear under them
        # (we push in reverse so popping gives left-to-right order)
        for item in reversed(children_to_recurse):
            stack.append(item)


def write_tree(root: str, out_path: str | None = None,
               include_hidden: bool = False) -> None:
    root_path = Path(root).expanduser()  # handle ~

    if not root_path.exists():
        raise SystemExit(f"error: path does not exist: {root_path}")
    if not root_path.is_dir():
        raise SystemExit(f"error: not a directory: {root_path}")

    root_path = root_path.resolve()

    if out_path is None:
        # Terminal output
        for line, _is_dir in walk_tree(root_path, include_hidden):
            print(line)
        return

    # File output — write incrementally, no big buffer
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        for line, _is_dir in walk_tree(root_path, include_hidden):
            f.write(line)
            f.write("\n")
    print(f"Wrote {out_path}")


# ---- CLI --------------------------------------------------------------------

def main() -> None:
    ap = argparse.ArgumentParser(description="Write a compact directory tree.")
    ap.add_argument("path", nargs="?", default=".", help="root directory")
    ap.add_argument("-o", "--output", help="write to file instead of stdout")
    ap.add_argument("--hidden", action="store_true",
                    help="include dotfiles/dotfolders (ignores still apply)")
    args = ap.parse_args()

    write_tree(args.path, args.output, args.hidden)


if __name__ == "__main__":
    main()