import chokidar from "chokidar";
import { exec } from "child_process";

chokidar.watch("dev/bundle.js").on("change", (path) => {
  console.log(`file changed: ${path}`);
  exec(
    "node util/postBundle.js dev/bundle.js --out-file=dev/calendar-dev.js",
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    }
  );
});

chokidar.watch("dev/calendar-dev.js").on("change", (path) => {
  console.log(`file changed: ${path}`);
  exec(
    "cp dev/calendar-dev.js ~/Library/Mobile\\ Documents/iCloud\\~dk\\~simonbs\\~Scriptable/Documents/calendar-dev.js",
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`calendar-dev.js copied to iCloud`);
    }
  );
});
