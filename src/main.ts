import fs from 'fs';
import * as core from '@actions/core';
import * as github from '@actions/github';

function readFile(filename: string): string {
  console.log(`Reading file ${filename}`);
  const rawdata: Buffer = fs.readFileSync(filename);
  return rawdata.toString();
}

// expected format 0.0.0
function bumpVersion(version: string) {
  const split = version.split('.');
  const versionBump = split[0] + '.' + split[1] + '.' + (Number.parseInt(split[2]) + 1);

  console.log(`Bumping version ${version} to ${versionBump}`);

  return versionBump;
}

function bumpChart(chartYaml: string): string {
  const chartVersionMatch = chartYaml.match(/(?<=version: )\d+.\d+.\d+/gm);
  if (chartVersionMatch == null) {
    throw new Error('No chart version found in file');
  } else if (chartVersionMatch.length > 1) {
    throw new Error('Multiple chart versions found in file. This is currently not handled.');
  }

  const appVersionMatch = chartYaml.match(/(?<=appVersion: '|")\d+.\d+.\d+/);
  if (appVersionMatch == null) {
    throw new Error('No app version found in file');
  } else if (appVersionMatch.length > 1) {
    throw new Error('Multiple app versions found in file. This is currently not handled.');
  }

  const appVersion = appVersionMatch[0];
  const chartVersion = chartVersionMatch[0];

  const appVersionBump = bumpVersion(appVersion);
  const chartVersionBump = bumpVersion(chartVersion);

  return chartYaml.replace(appVersion, appVersionBump).replace(chartVersion, chartVersionBump);
}

//const file = readFile('example-helm-chart.yml');
//const match = bumpChart(file);
//console.log(match);

async function run() {
  const inputFileName = core.getInput('input_file');

  const file = readFile(inputFileName);

  const bumpedFile = bumpChart(file);

  fs.writeFileSync(inputFileName, bumpedFile);

  //const githubToken = core.getInput('token');
  //const octokit = github.getOctokit(githubToken);
  //octokit.git.createCommit();
}

run().catch((error) => core.setFailed('Workflow failed! ' + error.message));
