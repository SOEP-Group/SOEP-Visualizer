const core = require("@gltf-transform/core");
const functions = require("@gltf-transform/functions");

function optimizeGLTF(inputPath, outputPath) {
  const NodeIO = core.NodeIO;
  const dedup = functions.dedup;
  const prune = functions.prune;

  const io = new NodeIO();

  // Load the original GLTF model
  io.read(inputPath)
    .then(function (document) {
      // Apply deduplication and other optimizations
      return document.transform(dedup(), prune());
    })
    .then(function (document) {
      // Save the optimized model
      return io.write(outputPath, document);
    })
    .then(function () {
      console.log("Optimized model saved to " + outputPath);
    })
    .catch(function (error) {
      console.error("Error optimizing GLTF model:", error);
    });
}

// Capture input and output paths from command line arguments
const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error("Please provide both input and output file paths.");
  console.error("Usage: npm run optimize <input_file> <output_file>");
  process.exit(1);
}

optimizeGLTF(inputPath, outputPath);
