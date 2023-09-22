import fs from "fs";
import path from "path";
import Converter from "api-spec-converter";
import {rimrafSync} from "rimraf";
import child_process from "child_process";

const openapi3Dir = "./openapi";
const swagger2Dir = "./swagger2";
const apis = fs.readdirSync(openapi3Dir).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));

if (fs.existsSync(swagger2Dir)) {
    rimrafSync(swagger2Dir);
}
fs.mkdirSync(swagger2Dir);


for (let i = 0; i < apis.length; i++) {
    const api = apis[i];
    console.log(`Processing ${i + 1} of ${apis.length}: ${api}`);
    console.log("Converting to Swagger 2.0");
    const swagger2 = await Converter.convert({
        from: 'openapi_3',
        to: 'swagger_2',
        source: path.join(openapi3Dir, api + ".json")
    }).then((c) => c.stringify());
    console.log("Writing Swagger 2.0");
    fs.writeFileSync(path.join(swagger2Dir, api + ".json"), swagger2);
    console.log("Generating Library");
    child_process.execSync(`npx openapi-generator-cli generate --skip-validate-spec -i ${path.join(swagger2Dir, api + ".json")} -g javascript -o ./generated/${api}`, {stdio: "inherit"});
}