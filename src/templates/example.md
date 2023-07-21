# example template title

> example template description

- [ ] example item
    > example item description

- [x] example item
    > example item description duplicate

- [ ] example item other
    > example item description

- (likert) [always] some likert

- (likert) another likert

- (likert) with description
    > likert description

- (likert) [] empty value likert


```config
{
    "id":"default",
    "checkbox" : {
        "checked": {
            "color":"pink"
        },
        "unchecked": {
            "color":"white"
        }
    },
    "likert": {
        "options":[
            {
                "value":"always",
                "description":"strongly agree",
                "color":"lime"
            },
            {
                "value":"mostly",
                "description":"agree",
                "color":"lightcyan"
            },
            {
                "value":"unknown",
                "description":"neutral",
                "color":"white"
            },
            {
                "value":"rarely",
                "description":"disagree",
                "color":"yellow"
            },
            {
                "value":"never",
                "description":"strongly disagree",
                "color":"red"
            }
        ]
    }
}
```
