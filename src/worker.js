import { createTwoFilesPatch } from "diff";
import { compareTexts } from "./comparison.js";

self.onmessage = ({ data }) => {
  try {
    if (data.type === "patch") {
      const patch = createTwoFilesPatch(
        "original.txt",
        "modified.txt",
        data.original,
        data.modified,
        "",
        "",
        { timeout: 3000 },
      );
      if (patch === undefined)
        throw new Error(
          "This diff is too complex to copy. Try a smaller section.",
        );
      self.postMessage({ type: "patch", patch, id: data.id });
    } else {
      self.postMessage({
        type: "comparison",
        result: compareTexts(data.original, data.modified),
        id: data.id,
      });
    }
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error.message || "Comparison failed. Try a smaller section.",
      id: data.id,
    });
  }
};
