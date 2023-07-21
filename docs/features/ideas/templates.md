# Templates

## Goals

- Provide a `template set` of useful pre-designed checklist.

## Scenarios

- Allow exploration of templates in the `template set`

- Allow selection of a template from the `template set`.

## Constraints

- Do not access external urls without explicit action from a person.
- Security - only load data from safe urls
- allow testing templates

## Design

Repositories are added via a single URL pointing to a repository definition file that contains metadata about the repository and the checklists inside.

- Template Repository
- Template Access

### Template Repository

The Template Repositories contain:

- all templates
- a generated    metadata file with template summaries

. The 

Allow for the creation and access of repositories of checklists.


### Template Access





## Brainstorm

Would it be sufficient to have one single repository that contains all templates? This would allow templates to be discovered in one place. note: external templates outside of the repository could still be loaded via markdown file and shared via url.


### Future 

- Enable creation of checklist repositories that contain a list of predefined checklists.

### Scenarios

- Create a new checklist repository.
- Add a checklist repository.
- View checklists in repository.
- Allow preservation of favorite repositories and favorite checklists.