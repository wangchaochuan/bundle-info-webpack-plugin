const fs = require("fs");
const path = require("path");
const execSync = require("shelljs").exec;

const appDirectory = fs.realpathSync(process.cwd());
const PLUGIN_NAME = "BundleInfoPlugin";

const resolveApp = (relativePath: string): string =>
  path.resolve(appDirectory, relativePath);

export type TBundleInfoType = {
  // build date
  buildDate?: string;
  // last commit author
  commitAuthor?: string;
  // last commit hash
  commitHash?: string;
  // last commit title
  commitTitle?: string;
  //  where bundle info output  default value is 'dist'
  dir?: string;
  // output filename  default value is 'version'
  filename?: string;
  // last commit ref
  ref?: string;
};

const defaultOptions: TBundleInfoType = {
  buildDate: new Date().toLocaleString(),
  commitAuthor: execSync("git config user.name").toString().trim(),
  commitHash: execSync("git show -s --format=%H").toString().trim(),
  commitTitle: execSync("git show -s --format=%s").toString().trim(),
  dir: resolveApp("./dist"),
  filename: "version",
  ref: execSync("git show -s --format=%d").toString().trim(),
};

class BundleInfoPlugin {
  options = defaultOptions;
  constructor(options: TBundleInfoType) {
    this.options = {
      ...defaultOptions,
      ...options,
    };
  }

  async writeFile() {
    const { dir, filename } = this.options;
    if (!dir) {
      throw new Error("dir should not be empty!");
    }
    if (!filename) {
      throw new Error("filename should not be empty!");
    }
    fs.writeFileSync(
      path.resolve(dir, `./${filename}.json`),
      JSON.stringify(this.options, null, 2)
    );
  }

  apply(compiler: any) {
    compiler.hooks.afterEmit.tapPromise(PLUGIN_NAME, this.writeFile.bind(this));
  }
}

export default BundleInfoPlugin;
