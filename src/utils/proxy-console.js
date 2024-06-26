(function () {
  /* eslint-disable no-empty */

  function addEventListener(eventName, callback) {
    window.removeEventListener(eventName, callback);
    window.addEventListener(eventName, callback);
  }

  addEventListener("error", (e) => {
    const { message, stack } = e.error || e;
    window.parent.postMessage(
      { type: "iframe-error", message: stack || message },
      "*"
    );
  });

  addEventListener("unhandledrejection", (e) => {
    const { message, stack } = e.reason || e;
    window.parent.postMessage(
      { type: "iframe-error", message: stack || message },
      "*"
    );
  });

  addEventListener("click", () => {
    window.parent.postMessage({ type: "codepan-make-output-active" }, "*");
  });

  /**
   * Stringify.
   * Inspect native browser objects and functions.
   */
  const stringify = (function () {
    const sortci = function (a, b) {
      return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
    };

    /**
     * Recursively stringify an object. Keeps track of which objects it has
     * visited to avoid hitting circular references, and a buffer for indentation.
     * Goes 2 levels deep.
     */
    return function stringify(o, visited, buffer) {
      let i;
      let vi;
      let type = "";
      const parts = [];
      // const circular = false
      buffer = buffer || "";
      visited = visited || [];

      // Get out fast with primitives that don't like toString
      if (o === null) {
        return "null";
      }

      if (typeof o === "undefined") {
        return "undefined";
      }

      // Determine the type
      try {
        type = {}.toString.call(o);
      } catch (error) {
        // only happens when typeof is protected (...randomly)
        type = "[object Object]";
      }

      // Handle the primitive types
      if (type === "[object Number]") {
        return String(o);
      }

      if (type === "[object Boolean]") {
        return o ? "true" : "false";
      }

      if (type === "[object Function]") {
        return o
          .toString()
          .split("\n  ")
          .join("\n" + buffer);
      }

      if (type === "[object String]") {
        return '"' + o.replace(/"/g, '\\"') + '"';
      }

      // Check for circular references
      for (vi = 0; vi < visited.length; vi++) {
        if (o === visited[vi]) {
          // Notify the user that a circular object was found and, if available,
          // show the object's outerHTML (for body and elements)
          return (
            "[circular " +
            type.slice(1) +
            ("outerHTML" in o
              ? " :\n" + o.outerHTML.split("\n").join("\n" + buffer)
              : "")
          );
        }
      }

      // Remember that we visited this object
      visited.push(o);

      // Stringify each member of the array
      if (type === "[object Array]") {
        for (i = 0; i < o.length; i++) {
          parts.push(stringify(o[i], visited));
        }

        return "[" + parts.join(", ") + "]";
      }

      // Fake array – very tricksy, get out quickly
      if (type.match(/Array/)) {
        return type;
      }

      const typeStr = type + " ";
      const newBuffer = buffer + "  ";

      // Dive down if we're less than 2 levels deep
      if (buffer.length / 2 < 2) {
        const names = [];
        // Some objects don't like 'in', so just skip them
        try {
          for (i in o) {
            names.push(i);
          }
        } catch (error) {}

        names.sort(sortci);
        for (i = 0; i < names.length; i++) {
          try {
            parts.push(
              newBuffer +
                names[i] +
                ": " +
                stringify(o[names[i]], visited, newBuffer)
            );
          } catch (error) {}
        }
      }

      // If nothing was gathered, return empty object
      if (parts.length === 0) return typeStr + "{ ... }";

      // Return the indented object with new lines
      return typeStr + "{\n" + parts.join(",\n") + "\n" + buffer + "}";
    };
  })();
  /** =========================================================================
   * Console
   * Proxy console.logs out to the parent window
   * ========================================================================== */

  const proxyConsole = (function () {
    const ProxyConsole = function () {};

    /**
     * Stringify all of the console objects from an array for proxying
     */
    const stringifyArgs = function (args) {
      const newArgs = [];
      // TODO this was forEach but when the array is [undefined] it wouldn't
      // iterate over them
      let i = 0;
      const { length } = args;
      let arg;
      for (; i < length; i++) {
        arg = args[i];
        if (typeof arg === "undefined") {
          newArgs.push("undefined");
        } else {
          newArgs.push(stringify(arg) + " ");
        }
      }

      return newArgs;
    };

    /**
     * Add colors for console string
     */
    const styleText = function (textArray, styles) {
      return textArray.map((text, index) => {
        return index ? `<span style="${styles.shift()}">${text}</span>` : text;
      });
    };

    /**
     * Add string replace for console string
     */
    const replaceText = function (text, texts) {
      let output = text;
      while (output.indexOf("%s") !== -1) {
        output = output.replace("%s", texts.shift());
      }

      return output;
    };

    /**
     * Add colors/string replace for console string or fallback on stringifyArgs for non-string types
     */
    const handleArgs = function (args) {
      if (!args || args.length === 0) return [];

      if (typeof args[0] !== "string") {
        return stringifyArgs(args);
      }

      const replacements = args[0].match(/(%[sc])([^%]*)/gm);
      const texts = [];
      const styles = [];
      for (let i = 1; Array.isArray(replacements) && i < args.length; i++) {
        switch (replacements.shift().substr(0, 2)) {
          case "%s":
            texts.push(args[i]);
            break;
          case "%c":
            styles.push(args[i]);
            break;
          default:
        }
      }

      const replaced = replaceText(args[0], texts);
      return styleText(replaced.split("%c"), styles);
    };

    // Create each of these methods on the proxy, and postMessage up to JS Bin
    // when one is called.
    const methods = (ProxyConsole.prototype.methods = [
      "debug",
      "clear",
      "error",
      "info",
      "log",
      "warn",
      "dir",
      "props",
      "_raw",
      "group",
      "groupEnd",
      "dirxml",
      "table",
      "trace",
      "assert",
      "count",
      "markTimeline",
      "profile",
      "profileEnd",
      "time",
      "timeEnd",
      "timeStamp",
      "groupCollapsed",
    ]);

    methods.forEach((method) => {
      // Create console method
      const originalMethod = console[method] || console.log;
      ProxyConsole.prototype[method] = function (...originalArgs) {
        // Replace args that can't be sent through postMessage
        const args = handleArgs(originalArgs);

        // Post up with method and the arguments
        window.parent.postMessage(
          {
            type: "codepan-console",
            method: method === "_raw" ? originalArgs.shift() : method,
            args: method === "_raw" ? args.slice(1) : args,
          },
          "*"
        );

        if (method !== "_raw" && method !== "clear") {
          originalMethod.apply(ProxyConsole, originalArgs);
        }
      };
    });

    return new ProxyConsole();
  })();

  window.console = proxyConsole;
})();
