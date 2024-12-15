# Front-end guiden

## Table of Contents

1.  [Libraries we use](#libraries-we-use)
2.  [Important concepts](#important-concepts)
3.  [Adding something new to the front end](#adding-something-new-to-the-front-end)

## Libraries we use

As of writing this guide the libraries we use are as follows:

<ul>
  <li><a href="https://threejs.org/">Three js</a></li>
  <li><a href="https://tailwindcss.com/">Tailwind</a></li>
  <li><a href="https://augmented-ui.com/">Augmented UI</a></li>
</ul>

**Some notes**:

<ul>
  <li>
    Three js is our 3D rendering webgl wrapper of choice. 
    All of our rendering code and everything associated with renderering/3D (like scene management) will sit in the <b>gl/</b> folder.
  </li>
  <li>
    Tailwind is our styling library. It comes with a metric TON of premade classes for us that lets us do just about anything with css that we would want. If you need an associated class name with a certain css property, please search on their website, they have everything there. <b>Avoid</b> using regular css unless absolutely necessary. That is because looking through one big file is hard, looking through two big files is even harder. So lets try and keep both styling and structure in the <i>.html</i> file unless absolutely necessary.
  </li>
  <li>
    Augmented UI is our library for making the sci-fi esque windows and borders that we have. This library can be a hassle to use at times, so don't hesitate to contact me (Ivan) incase you need any help.
  </li>
</ul>

## Important concepts

**_This section is purely js related_**

## Module based javascript vs old javascript

We use modular javascript (ES modules) instead of regular javascript (CommonJS) so that we can eliminate passing too many global variables here and there. Use that and do not include your files into the _.html_ file unless absolutely necessary.

:x:

**your_js_file.js**

```
const variable = "value";
```

**index.html**

```
<script src="js/your_js_file.js"></script>
<script src="js/your_other_js_file.js"></script>
```

**your_other_js_file.js**

```
let variable2 = variable + "value2";
```

:white_check_mark:

**your_js_file.js**

```
export const variable = "value"; // Explicitly state which variable/function to export

```

**your_other_js_file.js**

```
import {variable} from "./your_js_file.js"

let variable2 = variable + "value2";
```

More info: <a href="https://www.syncfusion.com/blogs/post/js-commonjs-vs-es-modules">Understanding CommonJS vs. ES Modules in JavaScript</a>

### States

Our app uses a reactive way of handling states. That means whenever you update an already created state, chances are there are callbacks that are going to be called as soon as the update happens. This all depends on if certain files have subscribed to the state change event.
You can also subscribe to events of state changes by just checking the name of the state change in any sections index file.

**_Example_**: **/gl/index.js**

```
export const glState = new State("glStateChanged", initialGlState);
```

This means that whenever the glState is updated, an event called glStateChanged will be triggered. Functions that have sbuscribed to this even will be automatically fired like so:

**_Example_**: **/gl/debug.js**

```
export function initDebug() {
  subscribe("glStateChanged", updateDebugMenu);
}

function updateDebugMenu(prevState) {
   if (!("rendererInfo" in prevState)) {
    return;
  }

  // rest of the code
}

```

Notice how the function also gets a variable called prevState. This is a simle key-value map `{"rendererInfo": true, "some_other_state_variable": false}`. This let's you know if
a certain state variable has been changed during this event call. Use this in order to not call some function every time a state change has occured as that would be taxing on the system.

To then get that variables value, use `const rendererInfo = glState.get("rendererInfo");`.
This will give a **_deep copy_** of the variable (<a href="https://makimo.com/blog/shallow-and-deep-copies-in-javascript/">Shallow and deep copies in javascript</a>).

Setting the data can be done by `glState.set({some_variable: any_type_of_value});` **Note**: This will trigger the on state changed event.

### Event buss

Maybe you don't only want to have events that are purely from state changes, you can create your own events. By using the **publish** function, you can publish any type of event:

**_Example_**: **/main.js**

```
window.addEventListener("load", () => {
  publish("appStartup");
});
```

**_Example_**: **/gl/index.js**

```
subscribe("appStartup", onStart);
```

**Note**: You can also send some data with your event `publish("some_event", some_data);`

**_Example_**: **/globalState.js**

```
// Set function
if (hasChanges) {
    publish(this.eventName, dirtyFlags);
}
```

## Adding something new to the front end

**_This section is purely js related_**

When adding certain a new file, make sure you do not add any native javascript events as a global event, instead initialize them in some sort of **init** function.

:x:

```
element.addEventListener("click", () => {
  // Function body
});

```

:white_check_mark:

```
export function initYourSection(){
    element.addEventListener("click", () => {
        // Function body
    });
}
```

And then call the exported function from your nearest index file:

**_Example_**: **/gl/index.js**

```
import {initYourSection} from "./your_section.js";

export * from "./your_section.js" // Adding this is important

function onStart() {
  loadingManager.onStart = () => {};
  loadingManager.onLoad = onLoadFinished;
  loadingManager.onProgress = onLoadProgress;
  loadingManager.onError = onLoadError;
  initRenderer();
  initYourSection(); // Call from here
  initScene();
  initDebug();
  loadAllModels();
  initViewer();
}
```

This is important because alot of our functionality depends on that the website is fully loaded, so to remove the potential of bugs, this system was implemented.

Notice how in the function I mentioned that **exporting** everything from your index file is important, that is because adding global variables into your file is extremely important for certain tasks. And in order to have them initialized you can export everything from your index file.
