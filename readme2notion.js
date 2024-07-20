// @ts-check

import fs from 'node:fs';
import { program } from 'commander';
import { createPage, findPageId, getReadmeBlocks, deletePageContent, addChildrenBlocks, createNotionClient, updatePageProperties } from './notionUtils.js';
import os from 'os';

const hostname = os.hostname();
console.log(`Hostname: ${hostname}`);

/**
 * Converts a readme file to Notion blocks and updates a Notion page with the converted content.
 * @param {string} inputFile - The path to the input readme file.
 * @param {object} options - The options for the conversion process.
 * @param {string} options.config - The path to the configuration file.
 * @param {string} options.commit - The git commit hash associated with the conversion.
 * @returns {Promise<void>} - A promise that resolves when the conversion is complete.
 */
async function readme2Notion(inputFile, options) {
  console.log(`Input file: ${inputFile}`);
  console.log(`Configuration file: ${options.config}`);

  const { default: config } = await import(options.config, { with: { type: 'json' } });
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
    }

    let page_id = await findPageId(notion, config.db_id, page_name);

    if (page_id === "Not found") {
      page_id = await createPage(notion, config.db_id, page_name, hostname, options.commit);
    } else {
      await updatePageProperties(notion, page_id, {
        page_name, hostname, git_commit: options.commit
      });
      await deletePageContent(notion, page_id);
    }

    if (blocks.length > 20) {
      let chunks = [];
      for (let i = 0; i < chunks.length; i += 20) {
        chunks.push(blocks.slice(i, i + 20));
      }

      for (let chunk of chunks) {
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
  .option('-n, --notion-token <token>', 'Notion API token')
  .action(readme2Notion);

// Parse the command-line arguments
program.parse(process.argv);

// If no input file is provided, display help and exit
if (!program.args.length) {
  program.help();
}
