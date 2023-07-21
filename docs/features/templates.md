# Templates

## Goals

- Allow selection from lists of pre-designed checklists.

- Provide a set of useful everyday checklist.

- Enable creation of checklist repositories that contain a list of predefined checklists.

## Scenarios

- Create a new checklist repository.
- Add a checklist repository.
- View checklists in repository.
- Allow preservation of favorite repositories and favorite checklists.

## Constraints

- Do not access external urls without explicit action from a person.
- Security - only load data from places authorized by a person (ideally only safe urls)

## Brainstorm

Would it be sufficient to have one single repository that contains all templates? This would allow templates to be discovered in one place. note: external templates outside of the repository could still be loaded via markdown file and shared via url.

## Design

Repositories are added via a single URL pointing to a repository definition file that contains metadata about the repository and the checklists inside.

### Checklist Repository

Repositories of checklists contain a list of checklists. The 





Allow for the creation and access of repositories of checklists.



Templates are 