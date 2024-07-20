#!/usr/bin/env node
// @ts-check

import { readFile, symlinkSync, writeFile } from 'node:fs';
import { markdownToBlocks } from '@tryfabric/martian';
import { Client } from '@notionhq/client';
import { program } from 'commander';
import rc from 'rc';
import { create } from 'node:domain';
import { createPage, findPageId, getReadmeBlocks, deletePageContent, addChildrenBlocks, createNotionClient, updatePageProperties } from './notionUtils.js';
import os from 'os'; 
import { exit } from 'node:process';

const hostname = os.hostname();
console.log(`Hostname: ${hostname}`);

// Define the command-line options and arguments
program
  .name('readme2notion')
  .usage('[options] <input-file>')
  .arguments('<input-file>')
  .option('-r, --rc <app_name>', 'Application name for configuration', 'notion')
  .option('-t, --commit <commit_hash>', 'The latest GIT commit hash', 'null')
  .option('-n, --notion-token <token>', 'Notion API token')

  .action(async (inputFile, options) => { // make this function async
    // Your main script logic here
    console.log(`Input file: ${inputFile}`);
    console.log(`Configuration file: ${options.rc}`);

    // Load configuration for 'notion' from the rc file
    // the module rc automatically looks for a configuration file named .notionrc
    const config = rc(options.rc, {
      // Default values (if not found in config file)
      "db_id": "",
      "page_id": "",
      "name": "",
    });

    console.log(config);

    const page_name = `${hostname}/${config.name}`;
    const notion = createNotionClient(config['notion-token']);

    try {
      // Read the input file and convert it to Notion blocks
      const blocks = await getReadmeBlocks(inputFile);
      console.log(`Read ${blocks.length} blocks from the input file`);

      // If a page ID is provided, delete its content
      if (config.pageId) {
        await deletePageContent(notion, config.page_id);
        await addChildrenBlocks(notion, config.page_id, blocks);
      } else {
        // find the page ID based on the database ID and page name
        let page_id = await findPageId(notion, config.db_id, page_name);
        if (!page_id) {
          page_id = await createPage(notion, config.db_id, page_name, hostname, options.commit);
        } else {
          await updatePageProperties(notion, page_id, {
            Name: {
              title: [
                {
                  text: {
                    content: page_name
                  }
                }
              ]
            },
            Hostname: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: hostname
                  }
                }
              ]
            },
            GitCommit: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: options.commit
                  }
                }
              ]
            }
          });
          await deletePageContent(notion, page_id);
        }
        await addChildrenBlocks(notion, page_id, blocks);
        // save page_id in the rc file
        config.page_id = page_id;
        // remove unneded config fields
        delete config.config;
        delete config.configs;
        delete config._;
        delete config.commit;
        writeFile(`.${options.rc}rc`, JSON.stringify(config, null, 2), (err) => {
          if (err) {
            console.error(`Error saving configuration: ${err}`);
          } else {
            console.log(`Configuration saved with page ID: ${page_id}`);
          }
        });
      }


    } catch (error) {
      console.error(`Error processing input file: ${error}`);
    }
  });

// Parse the command-line arguments
program.parse(process.argv);

// If no input file is provided, display help and exit
if (!program.args.length) {
  program.help();
}
