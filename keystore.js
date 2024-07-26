#!/usr/bin/env node
require('dotenv').config()
const crypto = require('crypto')
const { program } = require('commander');
const jsonfile = require('jsonfile');
const { encrypt, decrypt } = require('./lib/crypto-helper')
const secretsFilePath = './secrets.json'; // Adjust the path as necessary

program.version('1.0.0', '-v, --version')
  .description('CLI tool for managing encryption keys and applications within a keystore.');

// List all applications
const listApplications = () => {
  jsonfile.readFile(secretsFilePath, (err, obj) => {
    if (err) return console.error(err);
    console.log('Applications:');
    Object.entries(obj).forEach(([guid, appDetails]) => {
      console.log(`${appDetails.name} (GUID: ${guid})`);
    });
  });
};

// List all keys
const listAllKeys = (appName) => {
  jsonfile.readFile(secretsFilePath, (err, obj) => {
    if (err) return console.error(err);
    const appGuid = Object.keys(obj).find(key => obj[key].name === appName);
    if (!appGuid) {
      console.error('Application not found');
      return;
    }
    console.log('Keys:');
    Object.keys(obj[appGuid]['keys']).forEach(key => {
      console.log(`  "${key}"`);
    });
  });
};

// Add a new application
const addApplication = (appName) => {
  const appGuid = crypto.randomUUID(); // Generates a new GUID
  const newApp = {
    [appGuid]: { name: appName, keys: {} }
  };
  jsonfile.readFile(secretsFilePath, (err, obj) => {
    if (err) return console.error(err);
    obj = { ...obj, ...newApp };
    jsonfile.writeFile(secretsFilePath, obj, (err) => {
      if (err) console.error(err);
      console.log(`Added new application: ${appName} (GUID: ${appGuid})`);
    });
  });
};

// Add or update a key for an application
const addOrUpdateKey = (appName, keyName, value) => {
  jsonfile.readFile(secretsFilePath, (err, obj) => {
    if (err) return console.error(err);
    const appEntry = Object.entries(obj).find(([_, details]) => details.name === appName);
    if (!appEntry) {
      console.error('Application not found');
      return;
    }
    const [appGuid, appDetails] = appEntry;
    appDetails.keys[keyName] = encrypt(value); // Encrypt the value before storing
    jsonfile.writeFile(secretsFilePath, obj, (err) => {
      if (err) console.error(err);
      console.log(`Key '${keyName}' updated for application '${appName}'.`);
    });
  });
};

// Subcommand to delete an application
const deleteApplication = (appName) => {
  jsonfile.readFile(secretsFilePath, (err, obj) => {
    if (err) return console.error(err);
    const appGuid = Object.keys(obj).find(key => obj[key].name === appName);
    if (!appGuid) {
      console.error('Application not found');
      return;
    }
    delete obj[appGuid];
    jsonfile.writeFile(secretsFilePath, obj, (err) => {
      if (err) console.error(err);
      console.log(`Application '${appName}' deleted.`);
    });
  });
};

// Subcommand to delete a key from an application
const deleteKey = (appName, keyName) => {
  jsonfile.readFile(secretsFilePath, (err, obj) => {
    if (err) return console.error(err);
    const appGuid = Object.keys(obj).find(key => obj[key].name === appName);
    if (!appGuid) {
      console.error('Application not found');
      return;
    }
    if (obj[appGuid].keys[keyName]) {
      delete obj[appGuid].keys[keyName];
      jsonfile.writeFile(secretsFilePath, obj, (err) => {
        if (err) console.error(err);
        console.log(`Key '${keyName}' deleted from '${appName}'.`);
      });
    } else {
      console.log('Key not found.');
    }
  });
};

// Define commands with detailed descriptions
program
  .command('list')
  .description('list all applications and their app codes')
  .action(listApplications);

program
  .command('listkeys <app_name>')
  .description('list all keys for a given application')
  .action(listAllKeys);

program
  .command('addapp <app_name>')
  .description('add a new application with a unique GUID')
  .action(addApplication);

program
  .command('addkey <app_name> <key_name> <value>')
  .description('add or update a key for a specified application')
  .action(addOrUpdateKey);

program
  .command('delapp <app_name>')
  .description('delete a specified application by name')
  .action(deleteApplication);

program
  .command('delkey <app_name> <key_name>')
  .description('delete a specified key from an application')
  .action(deleteKey);

program.parse(process.argv);
