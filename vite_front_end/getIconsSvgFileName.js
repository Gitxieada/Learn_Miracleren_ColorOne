// 获取src/assets/icons/svg下所有文件名，并生成/src/IconSvgNames.json

import path from "path";
import fs from "fs";
const EXTENSION = ".svg";
const dirpath = path.resolve(process.cwd(), "src/assets/icons/svg");

fs.readdir(dirpath, function (err, files) {
  const filesList = files.filter(function (e) {
    return path.extname(e).toLowerCase() === EXTENSION;
  });
  //   console.log(filesList);
  let names = [];
  const len = filesList.length;
  for (let i = 0; i < len; i++) {
    const file = filesList[i];
    let name = file.substring(0, file.lastIndexOf("."));
    names.push(name);
  }
  //   console.log(names)
  fs.writeFile(
    "./src/IconSvgNames.json",
    JSON.stringify(names),
    function (err) {
      if (err) {
        console.error("writeFile error");
      }
    }
  );
});
