// Import CSS files
import "csshake/dist/csshake.min.css";
import "font-awesome/css/font-awesome.css";

// Import JavaScript files
import "core-js/client/shim.min.js";
import "zone.js/dist/zone.js";
import "createjs-soundjs/lib/soundjs-0.6.2.min.js";
import "createjs-preloadjs/lib/preloadjs-0.6.2.min.js";

import { inject } from "@vercel/analytics";
inject();

// Import your main application file
import "./main.ts";
