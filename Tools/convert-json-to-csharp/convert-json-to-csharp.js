const path = require("path");
const fs = require("fs");

const jsonFile = path.resolve(__dirname, "./tracking_one_scaled.json");
const outputFile = path.resolve(__dirname, "./tracking_one_scaled.cs");

const jsonContent = fs.readFileSync(jsonFile, "utf-8");
const trackingData = JSON.parse(jsonContent);

const output = [];

output.push(`using System.Collections.Generic;`);
output.push(`public class TrackingData`);
output.push(`{`);

output.push(
  `\tpublic Dictionary<string, List<float[]>> data = new Dictionary<string, List<float[]>>()`
);
output.push(`\t{`);

Object.keys(trackingData).forEach((frame) => {
  output.push(`\t\t{`);
  output.push(`\t\t\t"${frame}", new List<float[]>()`);
  output.push(`\t\t\t{`);
  const topLeft = trackingData[frame]["seven"]["1"];
  const topRight = trackingData[frame]["seven"]["2"];
  const bottomLeft = trackingData[frame]["seven"]["3"];
  const bottomRight = trackingData[frame]["seven"]["4"];

  output.push(`\t\t\t\tnew float[] { ${topLeft.x}f, ${topLeft.y}f },`);
  output.push(`\t\t\t\tnew float[] { ${topRight.x}f, ${topRight.y}f },`);
  output.push(`\t\t\t\tnew float[] { ${bottomLeft.x}f, ${bottomLeft.y}f },`);
  output.push(`\t\t\t\tnew float[] { ${bottomRight.x}f, ${bottomRight.y}f }`);

  output.push(`\t\t\t\t`);
  output.push(`\t\t\t}`);
  output.push(`\t\t},`);
});

output.push(`\t};`);
output.push(`}`);

fs.writeFileSync(outputFile, output.join("\n"));

/* public class TrackingData
{
    public Dictionary<string, List<Vector2>> data = new Dictionary<string, List<Vector2>>()
    {
        {
            "henk", new List<Vector2>()
            {
                new Vector2(0,0),
                new Vector2(0,5),
            }
        }
    };
    

    void bla()
    {
        //new ArrayList()
        List < Vector2 > a = new List<Vector2>();
        a.Add(new Vector2(0, 0));
        data.Add("henk", a);
    }
} */
