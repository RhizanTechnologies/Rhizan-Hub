After completing a change, follow this workflow:

1. Identify the functionality affected by the changes.
2. Check the current branch and determine whether the changes are related to it.
3. If the changes are not related to the current branch, check all existing local and remote branches for a branch related to the changes.
4. If a related branch already exists, switch to that branch and commit the changes there.
5. If no related branch exists, create a new branch using this format:

```text id="9jvzxy"
type/short-description
```

Examples:

```text id="8wl4qu"
feature/user-authentication
feature/product-management
fix/product-validation
```

**Example:** If the current branch is:

```text id="l3k92d"
feature/user-authentication
```

but the changes are related to product management, the agent must first check whether a related branch exists, such as:

```text id="t3shnv"
feature/product-management
```

* If it exists, switch to it.
* If it does not exist, create it from the appropriate base branch.
* Then commit the changes using a clear, professional commit message.

Do not create duplicate branches for the same or closely related work.
