import { readFile } from 'fs/promises'; // use fs/promises for readFile to use async/await syntax
import { markdownToBlocks } from '@tryfabric/martian';
import { Client } from '@notionhq/client';

export const getReadmeBlocks = async (inputFile) => {
  try {
    const data = await readFile(inputFile, 'utf8');
    return markdownToBlocks(data);
  } catch (err) {
    throw new Error(`Error reading file: ${err.message}`);
  }
};

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

export const addChildrenBlocks = async (notion, pageId, blocks) => {
  try {
    console.log(`Adding blocks to page ID: ${pageId}`);

    const response = await notion.blocks.children.append({
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

export const createPage = async (notion, databaseId, title) => {
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
      },
    });

    console.log(`Successfully created (${response.id}) a new page in the database with ID: ${databaseId}`);
    // console.log(response);
    return response.id;
  } catch (error) {
    console.error(`Error creating a new page in the database: ${error.message}`);
  }
};

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
    return false;
  }

  console.log(`Successfully found page ID in the database with ID: ${databaseId}`);
  // console.log(response);
  return response.results[0].id;
};
