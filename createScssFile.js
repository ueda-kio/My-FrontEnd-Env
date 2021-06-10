const fs = require('fs');
const prefix = process.argv[2];
const fileName = process.argv[3];
const errorMessage = `Please enter "l", "c", "p" or "u" for 2nd argument
      "l": layout,
      "c": component,
      "p": project,
      "u": utility`;
let dirName = '';

/**
 * @summary 新しいscssファイルを作成する
 */
const createNewScssFile = () => {
  const temp = `@use "../${prefix !== 'l' ? '../' : '' }foundation/var.scss";

.${prefix}-${fileName} {

}
`;

  fs.writeFileSync(`src/scss/${dirName}/_${fileName}.scss`, temp, 'utf8');
};

/**
 * @summary index.scssファイルに"@forward"を追記する
 */
const appendIndexFile = () => {
  fs.appendFileSync(`src/scss/${dirName}/index.scss`, `\n@forward "${fileName}";`, 'utf8');
};


try {
  /**
   * @summary 入力されたprefixごとにディレクトリ名を決定
   */
  switch(true) {
    case(prefix === 'l'):
      dirName = 'layout';
      break;

    case(prefix === 'c'):
      dirName = 'component';
      break;

    case(prefix === 'p'):
      dirName = 'project';
      break;

    case(prefix === 'u'):
      dirName = 'utility';
      break;

    default:
      throw Error(errorMessage);
  }

  /**
   * @summary layout以外の場合パスに'object/'を追加
   */
  if(dirName !== 'layout') dirName = `object/${dirName}`;

  /**
   * @summary 既に同名のファイルが存在する場合エラー
   */
  if(fs.existsSync(`src/scss/${dirName}/_${fileName}.scss`)) {
    throw Error(`src/scss/${dirName}/_${fileName}.scss already exits!`);
  }

  createNewScssFile();
  appendIndexFile();

} catch (err) {
  console.error(err);
}