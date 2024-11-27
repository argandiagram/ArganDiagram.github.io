console.clear();
const argandDiagrams = document.getElementsByClassName("ArgandDiagram");

// Function to create the Argand Diagram elements
document.querySelectorAll(".ArgandDiagram").forEach(createArgandDiagram);
function createArgandDiagram(container) {
  // Create the elements
  const hideInputs = document.createElement("div");
  hideInputs.id = "hideInputs";
  hideInputs.textContent = "|||";

  const allInputs = document.createElement("div");
  allInputs.id = "AllInputs";

  const inputContainer = document.createElement("div");
  inputContainer.className = "input-container";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "...";
  input.required = true;

  const zoomControls = document.createElement("div");
  zoomControls.id = "zoom-controls";

  const zoomIn = document.createElement("div");
  zoomIn.id = "zoomIn";
  zoomIn.textContent = "+";

  const zoomOut = document.createElement("div");
  zoomOut.id = "zoomOut";
  zoomOut.textContent = "-";

  const useCase = document.createElement("div");
  useCase.id = "info";
  useCase.textContent = "?";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "svg";

  // Append the elements to the container
  inputContainer.appendChild(input);
  allInputs.appendChild(inputContainer);
  zoomControls.appendChild(zoomIn);
  zoomControls.appendChild(zoomOut);
  zoomControls.appendChild(useCase);
  container.appendChild(hideInputs);
  container.appendChild(allInputs);
  container.appendChild(zoomControls);
  container.appendChild(svg);
}

for (const diagram of argandDiagrams) {
  const svg = diagram.querySelector("svg");
  const equationInputs = diagram.querySelectorAll("input[type='text']");

  const toggleMenu = diagram.querySelector("div#hideInputs");

  toggleMenu.addEventListener("click", () => {
    const equationInputsTemp = diagram.querySelectorAll(
      "div#AllInputs input[type='text'], div#zoomIn, div#zoomOut",
    );

    equationInputsTemp.forEach((input) => {
      input.style.display = input.style.display === "none" ? "block" : "none";
    });
  });

  // Set SVG dimensions
  let temp = diagram.getBoundingClientRect();
  svg.setAttribute("width", temp.width * 0.97); // Matching with css to align the center perfectly
  svg.setAttribute("height", temp.height * 0.99);

  const width = svg.getAttribute("width");
  const height = svg.getAttribute("height");
  const centerX = Math.floor(width / 2); // Center of SVG for x-axis
  const centerY = Math.floor(height / 2); // Center of SVG for y-axis
  const scale = 35; // 1 unit = 35 pixels
  let virtualScale = scale; // This is the scale that user see on zoom controlling: Placebo maybe?

  const allInputs = diagram.querySelectorAll("#inputs input");

  function addInputEventListener(inputField) {
    function handleKeyPress(event) {
      // Not perfect but get's the job done hopefully
      let regexPattern = [
        /^\s*\(\s*-?\d*\.?\d+\s*,\s*-?\d*\.?\d+\s*\)\s*/,
        /^\s*im|re\s*\(\s*[A-Za-z]+\s*\)\s*\>=|\<=|>|<|=\s*\+?\s*\(?-?\d*\.?\d+\)?\s*/i,
        /^\s*\|\s*[a-zA-Z]\s*([+-]\s*\d*\.?\d*(i)?\s*)*\|\s*\>|\<|\=\s*[+-]?\d*\.?\d+\s*$/,
      ];
      let isInValid = true;
      for (const pattern of regexPattern) {
        if (pattern.test(this.value)) {
          isInValid = false;
          break;
        }
      }

      if (isInValid) return;

      if (event.key === "Enter") {
        const newInputField = document.createElement("input");
        newInputField.type = "text";
        newInputField.placeholder = "...";
        newInputField.classList.add("equations");

        // Add the same event listener to the new input field
        addInputEventListener(newInputField);

        // Insert a <br> and the new input field after the current input
        const br = document.createElement("br");
        inputField.parentNode.insertBefore(br, inputField.nextSibling);
        inputField.parentNode.insertBefore(newInputField, br.nextSibling);
        newInputField.focus();

        // Remove the event listener
        inputField.removeEventListener("keypress", handleKeyPress);
      }
    }

    inputField.addEventListener("keypress", handleKeyPress);
    inputField.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        drawAxesAndGridAndTickMarkings(svg, centerX, centerY, scale);

        const equationInputsTemp = diagram.querySelectorAll(
          "div#AllInputs input[type='text']",
        );

        equationInputsTemp.forEach((inputFields) => {
          const equation = inputFields.value.trim();
          plotComplexNumber(equation, svg, centerX, centerY, scale);
        });
      }
    });
  }

  // Attach event listener to all initial input fields
  equationInputs.forEach((inputField) => {
    addInputEventListener(inputField);
  });

  // Draw axes and grid
  function drawAxesAndGridAndTickMarkings(svg, centerX, centerY, scale) {
    // Clear SVG
    svg.innerHTML = "";

    circlesOnThePlot(svg, centerX, centerY, 0, 0); // Center of the screen

    // Draw grid
    drawGrid(svg, centerX, centerY, scale);

    // Draw axes
    const xAxis = createLine(0, centerY, width, centerY, "black", 1.5);
    svg.appendChild(xAxis);

    const yAxis = createLine(centerX, 0, centerX, height, "black", 1.5);
    svg.appendChild(yAxis);

    // Draw tick markings:
    let fontSize = 14,
      varValue = 1;
    for (let x = centerX % scale; x <= width; x += scale) {
      let PosReal = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      if (Math.abs(varValue) < 10) {
        PosReal.setAttribute("x", centerX + scale * varValue - fontSize / 4);
      } else {
        PosReal.setAttribute("x", centerX + scale * varValue - fontSize / 2);
      }
      PosReal.setAttribute("y", centerY - scale / 9);
      PosReal.setAttribute("font-size", fontSize);
      PosReal.setAttribute("fill", "black");
      PosReal.setAttribute("fontFamily", "Monaco");
      PosReal.setAttribute("stroke", "white");
      PosReal.setAttribute("stroke-width", "2");
      PosReal.setAttribute("paint-order", "stroke");
      PosReal.textContent = `${varValue}`;
      svg.appendChild(PosReal);

      // Mirror value print in opposite direction
      let NegReal = PosReal.cloneNode(true);
      NegReal.textContent = `-${varValue}`;
      if (Math.abs(varValue) < 10) {
        NegReal.setAttribute(
          "x",
          centerX - scale * varValue + fontSize / 2 - fontSize,
        );
      } else {
        NegReal.setAttribute(
          "x",
          centerX - scale * varValue - fontSize + (fontSize / 7) * 2,
        );
      }
      svg.appendChild(NegReal);

      varValue++;
    }

    varValue = 1;
    for (let y = centerY % scale; y <= height; y += scale) {
      let NegImag = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );

      NegImag.setAttribute("x", centerX + 4);
      NegImag.setAttribute("y", centerY + scale * varValue + fontSize / 4 - 1);

      NegImag.setAttribute("font-size", fontSize);
      NegImag.setAttribute("fill", "black");
      NegImag.setAttribute("fontFamily", "Monaco");
      NegImag.setAttribute("stroke", "white");
      NegImag.setAttribute("stroke-width", "1");
      NegImag.setAttribute("paint-order", "stroke");
      NegImag.textContent = `-${varValue}𝑖`;
      svg.appendChild(NegImag);

      // Mirror value print in opposite direction
      let PosImag = NegImag.cloneNode(true);
      PosImag.setAttribute("x", centerX + fontSize / 3);
      PosImag.textContent = `${varValue}𝑖`;
      PosImag.setAttribute("y", centerY - scale * varValue + fontSize / 4 - 1);

      svg.appendChild(PosImag);

      varValue++;
    }
  }

  function drawGrid(svg, centerX, centerY, scale) {
    // Vertical grid lines
    for (let x = centerX % scale; x <= width; x += scale) {
      const line = createLine(x, 0, x, height, "#a0b0c0", 0.5);
      svg.appendChild(line);
    }

    // Horizontal grid lines
    for (let y = centerY % scale; y <= height; y += scale) {
      const line = createLine(0, y, width, y, "#a0b0c0", 0.5);
      svg.appendChild(line);
    }

    // Axis Name:
    let fontSize = 22;
    let NegReal = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    NegReal.setAttribute("x", 5);
    NegReal.setAttribute("font-size", fontSize);
    NegReal.setAttribute("y", centerY + fontSize);
    NegReal.setAttribute("font-style", "italic");
    NegReal.setAttribute("stroke", "white");
    NegReal.setAttribute("stroke-width", "2");
    NegReal.setAttribute("paint-order", "stroke");
    NegReal.setAttribute("fill", "green");
    NegReal.textContent = "-Re";
    svg.appendChild(NegReal);

    let PosReal = NegReal.cloneNode(true);
    PosReal.textContent = "+Re";
    PosReal.setAttribute(
      "x",
      width - PosReal.textContent.length * fontSize + scale / 2,
    );
    svg.appendChild(PosReal);

    let PosImag = PosReal.cloneNode(true);
    PosImag.textContent = "+Im";
    PosImag.setAttribute("fill", "red");
    PosImag.setAttribute("x", centerX - fontSize * 2);
    PosImag.setAttribute("y", fontSize);
    svg.appendChild(PosImag);

    let NegImag = PosImag.cloneNode(true);
    NegImag.textContent = "-Im";
    NegImag.setAttribute("y", height - fontSize / 2);
    svg.appendChild(NegImag);
  }

  function createLine(x1, y1, x2, y2, color, strokeWidth, other = "") {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", strokeWidth);
    if (other) {
      line.setAttribute("stroke-dasharray", "5, 5"); // Dotted effect
    }
    return line;
  }

  // Plot a complex number
  function plotComplexNumber(equation, svg, centerX, centerY, scale) {
    // Parse the complex number
    let real = 0,
      imaginary = 0,
      other = "",
      regexPattern,
      match;
    try {
      // Match (a, b) format
      regexPattern = /^\s*\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)\s*/;
      match = equation.match(regexPattern);

      if (match && match.length == 3) {
        real = parseFloat(match[1]);
        imaginary = parseFloat(match[2]);
      } else {
        throw new Error();
      }
    } catch (error) {
      try {
        // Match Im(z) = b, Re(z) = a format
        // IM(z) > = 3
        regexPattern =
          /^\s*(im|re)\s*\(\s*[a-zA-Z]+\s*\)\s*(\>=|\<=|>|<|=)\s*\+?\s*\(?(-?\d*\.?\d+)\)?\s*/i;
        match = equation.match(regexPattern);
        other = match[1].toUpperCase();
        if (other == "RE") {
          real = parseFloat(match[3]);
        } else if (other == "IM") {
          imaginary = parseFloat(match[3]);
        } else {
          throw new Error();
        }
        other = `${other}${match[2]}`;
      } catch (error) {
        // Match |Z + a + ib| = x format
        real = 0;
        imaginary = 0;
        other = "";
        try {
          // Check if the equation matches the expected format
          const formatRegex =
            /^\s*\|\s*[a-zA-Z]\s*([+-]\s*\d*\.?\d*(i)?\s*)*\|\s*\>|\<|\=\s*[+-]?\d*\.?\d+\s*$/;
          if (!formatRegex.test(equation)) {
            throw new Error("Invalid format");
          }

          // Split
          const operatorRegex = /([>=<]=?|=)/; // Matches >, >=, <, <=, =
          let parts = equation.split(operatorRegex).map((part) => part.trim());

          // Check if the split resulted in the expected number of parts
          if (parts.length < 3) {
            throw new Error("Invalid format");
          }

          let lhs = parts[0];
          const operator = parts[1];
          let rhs = parts[2];

          lhs = lhs.replace(/\|/g, "").trim(); // Remove '|' and trim
          let value = parseFloat(rhs.trim());

          // Tokenize terms (regex to capture real and imaginary parts)
          let terms = lhs.match(
            /[\+\-]?\s*\d*\.?\d*i|[\+\-]?\s*\d*\.?\d+|[a-zA-Z]+/g,
          );

          terms.forEach((term) => {
            term = term.replace(/\s+/g, "");

            if (term.includes("i")) {
              let imagValue = term.replace("i", "").trim(); // Remove 'i' and trim spaces
              if (imagValue === "+" || imagValue === "") {
                imagValue = "1";
              } else if (imagValue === "-") {
                imagValue = "-1"; // "-i" is treated as "-1i"
              }

              imaginary += parseFloat(imagValue);
            } else if (!isNaN(parseFloat(term))) {
              real += parseFloat(term);
            }
          });

          other = `CIRCLE,${value},${operator}`;
          real = -1 * real;
          imaginary = -1 * imaginary;
        } catch (error) {
          console.log(
            "Not another format but Invalid Entry (empty or gibrish)",
          );
          return;
        }
      }
    }

    // Convert to canvas coordinates
    const canvasX = centerX + real * scale;
    const canvasY = centerY - imaginary * scale;

    // Draw the line for real and imaginary circles
    if (other) {
      try {
        if (other.includes("RE")) {
          const sign = other.replace("RE", "");

          if (!other.includes("=")) {
            const line = createLine(
              centerX + (canvasX - centerX),
              0,
              canvasX,
              height - 5,
              "blue",
              2,
              "dotted",
            );
            svg.appendChild(line);
          } else {
            line = createLine(
              centerX + (canvasX - centerX),
              0,
              canvasX,
              height - 5,
              "blue",
              2,
            );
            svg.appendChild(line);
          }

          const rect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect",
          );
          rect.setAttribute("fill", "green"); // Fill color
          rect.setAttribute("fill-opacity", "0.3"); // 30% transparency

          if (sign.includes(">")) {
            rect.setAttribute("x", centerX + (canvasX - centerX));
            rect.setAttribute("y", 0);
            rect.setAttribute("width", width);
            rect.setAttribute("height", height);

            svg.appendChild(rect);
          } else if (sign.includes("<")) {
            rect.setAttribute("x", 0);
            rect.setAttribute("y", 0);
            rect.setAttribute("width", centerX + (canvasX - centerX));
            rect.setAttribute("height", height);

            svg.appendChild(rect);
          }
        } else if (other.includes("IM")) {
          const sign = other.replace("IM", "");

          if (sign.includes("=")) {
            const line = createLine(
              0,
              centerY - (centerY - canvasY),
              width,
              canvasY,
              "blue",
              2,
            );
            svg.appendChild(line);
          } else {
            const line = createLine(
              0,
              centerY - (centerY - canvasY),
              width,
              canvasY,
              "blue",
              2,
              "dotted",
            );
            svg.appendChild(line);
          }

          const rect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect",
          );
          rect.setAttribute("fill", "red"); // Fill color
          rect.setAttribute("fill-opacity", "0.3"); // 50% transparency for the fill

          // Im(Z) >= 3
          if (sign.includes("<")) {
            rect.setAttribute("x", 0);
            rect.setAttribute("y", centerY - (centerY - canvasY));
            rect.setAttribute("width", width);
            rect.setAttribute("height", height);

            svg.appendChild(rect);
          } else if (sign.includes(">")) {
            rect.setAttribute("x", 0);
            rect.setAttribute("y", 0);
            rect.setAttribute("width", width);
            rect.setAttribute("height", centerY - (centerY - canvasY));

            svg.appendChild(rect);
          }
        } else if (other.includes("CIRCLE")) {
          // Draw Circle
          const circle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle",
          );
          let parts = other.split(",").map((part) => part.trim());
          let radius = parseFloat(parts[1]);
          let operator = parts[2];
          circle.setAttribute("cx", centerX + real * scale);
          circle.setAttribute("cy", centerY - imaginary * scale);
          circle.setAttribute("r", radius * scale);
          circle.setAttribute("stroke", "blue");
          if (!operator.includes("=")) {
            circle.setAttribute("stroke-dasharray", "10, 15"); // Dotted effect
          }
          circle.setAttribute("stroke-width", "2");

          circle.setAttribute("fill", "none");

          if (operator.includes("<")) {
            circle.setAttribute("fill", "rgba(0, 0, 255, 0.3)");
          } else if (operator.includes(">")) {
            // Create the main rectangle covering the entire area
            const rect = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "rect",
            );
            rect.setAttribute("fill", "black");
            rect.setAttribute("fill-opacity", "0.4");
            rect.setAttribute("x", 0);
            rect.setAttribute("y", 0);
            rect.setAttribute("width", width);
            rect.setAttribute("height", height);

            // Create a mask to make the point area transparent
            const mask = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "mask",
            );
            mask.setAttribute("id", "transparentPointMask");

            // Create a white background that covers the entire SVG
            const maskRect = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "rect",
            );
            maskRect.setAttribute("x", 0);
            maskRect.setAttribute("y", 0);
            maskRect.setAttribute("width", width);
            maskRect.setAttribute("height", height);
            maskRect.setAttribute("fill", "white");

            // Create a black circle to create a transparent "hole"
            const maskCircle = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle",
            );
            maskCircle.setAttribute("cx", circle.getAttribute("cx"));
            maskCircle.setAttribute("cy", circle.getAttribute("cy"));
            maskCircle.setAttribute("r", circle.getAttribute("r"));
            maskCircle.setAttribute("fill", "black");

            // Add elements to the mask
            mask.appendChild(maskRect);
            mask.appendChild(maskCircle);

            // Apply the mask to the rectangle
            rect.setAttribute("mask", "url(#transparentPointMask)");

            // Yellow semi-transparent fill for the circle
            circle.setAttribute("fill", "none");

            // Append mask and rectangle to SVG first
            svg.appendChild(mask);
            svg.appendChild(rect);
          }

          // Always append the circle last
          svg.appendChild(circle);
        }
      } catch (error) {
        return;
      }
    }
    circlesOnThePlot(svg, canvasX, canvasY, real, imaginary, other); // Draw the circle's location on the plane
  }

  const allSVGcircleTexts = new Set();
  function circlesOnThePlot(svg, X, Y, displayX, displayY, other = "") {
    if (other) if (!other.includes("CIRCLE")) return;

    // Draw the circle
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    circle.setAttribute("cx", X);
    circle.setAttribute("cy", Y);
    circle.setAttribute("fill", "blue");
    circle.setAttribute("r", 3);
    svg.appendChild(circle);

    // Create an SVG <text> element
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", X);
    text.setAttribute("y", Y);
    text.setAttribute("font-style", "italic");
    text.setAttribute("font-size", "20");
    text.setAttribute("stroke", "white");
    text.setAttribute("stroke-width", "2");
    text.setAttribute("paint-order", "stroke");
    text.setAttribute("fill", "red");

    if (displayX != 0) {
      if (displayY > 0) {
        text.textContent = `${displayX}+${displayY}i`;
      } else if (displayY == 0) {
        text.textContent = `${displayX}`;
      } else {
        text.textContent = `${displayX}-${Math.abs(displayY)}i`;
      }
    } else {
      if (displayY != 0) {
        text.textContent = `${displayY}i`;
      } else {
        text.textContent = `(0, 0)`;
      }
    }
    text.style.display = "none"; // Hide the text

    const hovercircles = function (event) {
      const rect = svg.getBoundingClientRect(); // Get the SVG's position
      const mouseX = event.clientX - rect.left; // Mouse X relative to SVG
      const mouseY = event.clientY - rect.top; // Mouse Y relative to SVG

      // Check if mouse is near (centerX, centerY) within a tolerance
      const tolerance = 5; // Tolerance distance
      if (
        Math.abs(mouseX - X) <= tolerance &&
        Math.abs(mouseY - Y) <= tolerance
      ) {
        // Center the text above the mouse cursor
        text.setAttribute("x", mouseX - text.getBBox().width / 2); // Center horizontally
        text.setAttribute("y", mouseY - 5); // 10px above mouse
        return true;
      }
      return false;
    };

    let isHoverEnabled = true;
    const mouseMoveHandler = function (event) {
      if (isHoverEnabled && hovercircles(event)) {
        text.style.display = "block"; // Show the text
      } else {
        text.style.display = "none"; // Hide the text
      }
    };

    const clickHandler = function (event) {
      if (hovercircles(event)) {
        isHoverEnabled = !isHoverEnabled;
        if (isHoverEnabled) {
          svg.addEventListener("mousemove", mouseMoveHandler);
        } else {
          svg.removeEventListener("mousemove", mouseMoveHandler);
          text.style.display = "block";
        }
      }
    };

    svg.addEventListener("mousemove", mouseMoveHandler);
    svg.addEventListener("click", clickHandler);
    svg.appendChild(text);
  }

  // Initial setup
  drawAxesAndGridAndTickMarkings(svg, centerX, centerY, scale);
}
