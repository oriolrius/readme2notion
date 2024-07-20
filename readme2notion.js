// @ts-check

import fs from 'node:fs';
import { program } from 'commander';
import { createPage, findPageId, getReadmeBlocks, deletePageContent, addChildrenBlocks, createNotionClient, updatePageProperties } from './notionUtils.js';
import os from 'os';

const hostname = os.hostname();
console.log(`Hostname: ${hostname}`);


async function readme2Notion(inputFile, options) {
  console.log(`Input file: ${inputFile}`);
  console.log(`Configuration file: ${options.config}`);

  const notion = createNotionClient(options.notionToken);
  const blockLimit = Number.parseInt(options.notionLimit);

  const { default: config } = await import(options.config, { with: { type: 'json' } });
  console.log(config);
  const page_name = `${hostname}/${config.name}`;

  try {
    // Read the input file and convert it to Notion blocks
    const blocks = await getReadmeBlocks(inputFile);
    console.log(`Read ${blocks.length} blocks from the input file`);

    // If a page ID is provided, delete its content
    if (config.pageId) {
      await deletePageContent(notion, config.page_id);
      await addChildrenBlocks(notion, config.page_id, blocks);
    }

    let page_id = await findPageId(notion, config.db_id, page_name);

    if (page_id === "NOT_FOUND") {
      page_id = await createPage(notion, config.db_id, page_name, hostname, options.commit);
    } else {
      await updatePageProperties(notion, page_id, {
        page_name, hostname, git_commit: options.commit
      });
      await deletePageContent(notion, page_id);
    }

    if (blocks.length > blockLimit) {
      let chunks = [];
      for (let i = 0; i < blocks.length; i += blockLimit) {
        chunks.push(blocks.slice(i, i + blockLimit));
      }

      for (let chunk of chunks) {
        console.log(`Adding ${chunk.length} blocks to the page`);
        await addChildrenBlocks(notion, page_id, chunk);
      };
    } else {
      await addChildrenBlocks(notion, page_id, blocks);
    }
    config.page_id = page_id;


    fs.writeFile(options.config, JSON.stringify(config, null, 2), (err) => {
      if (err) {
        console.error(`Error saving configuration: ${err}`);
      } else {
        console.log(`Configuration saved with page ID: ${page_id}`);
      }
    });

  } catch (error) {
    console.error(`Error processing input file: ${error}`);
  }
}

// Define the command-line options and arguments
program
  .name('readme2notion')
  .usage('[options] <input-file>')
  .arguments('<input-file>')
  .option('-c, --config <file_path_to_config_file>', 'JSON Config file path', '/repos/.notion.json')
  .option('-t, --commit <commit_hash>', 'The latest GIT commit hash', 'null')
  .option('-n, --notionToken <token>', 'Notion API token')
  .option('-l, --notionLimit <number>', 'Notion API limited to maximum number of blocks.', "1000")
  .action(readme2Notion);

// Parse the command-line arguments
program.parse(process.argv);

// If no input file is provided, display help and exit
if (!program.args.length) {
  program.help();
}