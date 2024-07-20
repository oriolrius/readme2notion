// @ts-check
import fs from 'node:fs/promises'; // use fs/promises for readFile to use async/await syntax
import { markdownToBlocks } from '@tryfabric/martian';
import { Client } from '@notionhq/client';

/**
 * Reads a file and converts its content from markdown to Notion blocks.
 *
 * @param {string} inputFile - The path of the input file to read.
 * @returns {Promise<Array>} - A promise that resolves to an array of Notion blocks.
 * @throws {Error} - If there is an error reading the file.
 */
export const getReadmeBlocks = async (inputFile) => {
  try {
    const data = await fs.readFile(inputFile, 'utf8');
    return markdownToBlocks(data, {
      notionLimits: {
        truncate: false
      }
    });
  } catch (err) {
    throw new Error(`Error reading file: ${err.message}`);
  }
};

/**
 * Deletes the content of a Notion page.
 * @param {Object} notion - The Notion client object.
 * @param {string} pageId - The ID of the page to delete the content from.
 * @returns {Promise<void>} - A promise that resolves when the content is deleted successfully.
 */
export const deletePageContent = async (notion, pageId) => {
  try {
    console.log(`Fetching blocks for page ID: ${pageId}`);

    const response = await notion.blocks.children.list({
      block_id: pageId,
    });

    const blocks = response.results;

    console.log(`Found ${blocks.length} blocks`);

    if (blocks.length === 0) {
      console.log('No blocks found to delete.');
      return;
    }

    for (const block of blocks) {
      console.log(`Deleting block with ID: ${block.id}`);
      try {
        await notion.blocks.delete({
          block_id: block.id,
        });
        console.log(`Successfully deleted block with ID: ${block.id}`);
      } catch (blockError) {
        console.error(`Error deleting block with ID: ${block.id}: ${blockError.message}`);
      }
    }

    console.log(`Successfully deleted content of the page with ID: ${pageId}`);
  } catch (error) {
    console.error(`Error deleting content of the page: ${error.message}`);
  }
};

/**
 * Adds children blocks to a Notion page.
 *
 * @param {Object} notion - The Notion client object.
 * @param {string} pageId - The ID of the page to add blocks to.
 * @param {Array} blocks - The array of blocks to add.
 * @returns {Promise<void>} - A promise that resolves when the blocks are successfully added.
 */
export const addChildrenBlocks = async (notion, pageId, blocks) => {
  try {
    console.log(`Adding blocks to page ID: ${pageId}`);

    await notion.blocks.children.append({
      block_id: pageId,
      children: blocks,
    });

    console.log(`Successfully added blocks to the page with ID: ${pageId}`);
    // console.log(response);
  } catch (error) {
    console.error(`Error adding blocks to the page: ${error.message}`);
  }
};

export const createNotionClient = (authToken) => {
  return new Client({ auth: authToken });
};

/**
 * Creates a new page in a Notion database.
 * @param {Object} notion - The Notion client object.
 * @param {string} databaseId - The ID of the database where the page will be created.
 * @param {string} title - The title of the page.
 * @param {string} hostname - The hostname associated with the page.
 * @param {string} commit_hash - The Git commit hash associated with the page.
 * @returns - The ID of the newly created page.
 */
export const createPage = async (notion, databaseId, title, hostname, commit_hash) => {
  try {
    console.log(`Creating a new page in database ID: ${databaseId}`);

    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: databaseId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: title
              }
            }
          ]
        },
        Hostname: {
          rich_text: [
            {
              text: {
                content: hostname
              }
            }
          ]
        },
        GitCommit: {
          rich_text: [
            {
              text: {
                content: commit_hash
              }
            }
          ]
        }
      },
    });

    console.log(`Successfully created (${response.id}) a new page in the database with ID: ${databaseId}`);
    return response.id;
  } catch (error) {
    console.error(`Error creating a new page in the database: ${error.message}`);
  }
};

/**
 * Updates the properties of a page in Notion.
 *
 * @param {Object} notion - The Notion client object.
 * @param {string} pageId - The ID of the page to update.
 * @param {Object} options - The options for updating the page properties.
 * @param {string} options.page_name - The new name of the page.
 * @param {string} options.hostname - The hostname to update.
 * @param {string} options.git_commit - The git commit to update.
 * @returns {Promise<void>} - A promise that resolves when the properties are successfully updated.
 */
export const updatePageProperties = async (notion, pageId, { page_name, hostname, git_commit }) => {
  try {
    console.log(`Updating properties of the page with ID: ${pageId}`);

    const properties = {
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
              content: git_commit
            }
          }
        ]
      }
    }

    await notion.pages.update({
      page_id: pageId,
      properties,
    });

    console.log(`Successfully updated properties of the page with ID: ${pageId}`);
  } catch (error) {
    console.error(`Error updating properties of the page: ${error.message}`);
  }
}

/**
 * Finds the page ID in a Notion database based on the provided title.
 * @param {Object} notion - The Notion client object.
 * @param {string} databaseId - The ID of the Notion database.
 * @param {string} title - The title of the page to find.
 * @returns {Promise<string>} - The ID of the found page, or false if not found.
 */
export const findPageId = async (notion, databaseId, title) => {
  console.log(`Finding page ID in database ID: ${databaseId}`);

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Name', // Adjust this to match the title property name in your database
      title: {
        equals: title,
      },
    },
  });

  if (response.results.length === 0) {
    console.log(`Page with name ${title} not found in database with ID ${databaseId}`);
    return "NOT_FOUND";
  }

  console.log(`Successfully found page ID in the database with ID: ${databaseId}`);
  return response.results[0].id;
};
