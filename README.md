# Argand_Diagrams
Argand diagram library for ecma script/ javascript/ typescript.

Organization:
```md
  Argand_Diagrams/
  │
  ├── src/
  │   ├── index.js          // Main code of JS
  │   └── styles.css        // stylesheet
  │
  ├── index.html      // test file
  └──────────────────────────────
```

## Adding to your file:
2 Steps:
- Add the following code to your html file
```html
<link rel="stylesheet" type="text/css" href="https://argandiagram.github.io/src/styles.css"/>
<script src="https://argandiagram.github.io/src/index.js"></script>
```

- Create a div as follow in the body:
```html
<div class="ArgandDiagram no-select"></div>
```

> Note that the div can be copied and pasted multiple times to create new diagram.

> You can change the size of the diagram with css by simply changing the width and height as per requirements.

## Use Example
**Circles:**
- | Z | = 3: Circle at (0, 0), radius 3
- | Z - i + 2 | = 4: Circle at (-2, 1), radius 4
- | Z - i | > 3: Area outside radius 3 from (0, 0)
- | Z + 2 | <= 3: Area within radius 3 from (-2, 0)

---

**Points:**
- (a, b): Point at (a, b)

---

**Lines:**
- Im(Z) = 3: Line at 3i
- Re(Z) = 4: Line at 4
- Im(Z) >= 3: Area above and at 3i

## License
This project is licensed under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** License. You are free to copy, modify, and distribute the work, even for commercial purposes, as long as you provide appropriate credit.

> If too bored to attribute, ignore licence. You are free to do whatever with the code but I am not responsible.
