# readme2notion

`readme2notion` is a command-line tool that converts a Markdown file to Notion blocks and uploads them to a specified Notion page. If a page ID is provided, it updates the content of that page. If not, it finds or creates a page with the specified name in the provided database.

## Features

- Converts Markdown files to Notion blocks.
- Uploads content to a specified Notion page.
- Finds or creates a page based on a database ID and page name.
- Updates page content if a page ID is provided.

## Usage

```bash
REPOS_PATH=/path/to/repos
docker pull ghcr.io/oriolrius/readme2notion
docker run --rm -v ${REPOS_PATH}:/repos ghcr.io/oriolrius/readme2notion /repos/README.md
```

### Options

- `-r, --rc <app_name>`: Application name for configuration (default: `notion`).

So, it has to be a .notionrc file in the REPOS_PATH directory. Or wathever file you specify. The parameter only sets the base name not the full name of the config file.

### Arguments

- `<input-file>`: The path to the input Markdown file.

### Example

```sh
REPOS_PATH=/path/to/repos
docker run --rm --network host -v ${REPOS_PATH}:/repos ghcr.io/oriolrius/readme2notion -r notion /repos/README.md
```

This command reads `README.md` and uploads its content to a Notion page as specified in the configuration.

## Configuration

The configuration file is automatically loaded from a file named `.notionrc` in the current directory or any of its parent directories. The configuration file should be in JSON format and include the following fields:

- `db_id`: The ID of the Notion database.
- `page_id`: The ID of the Notion page (optional). If not provided, the tool will find or create a page based on the name.
- `name`: The name of the Notion page.
- `token`: The Notion integration token.

### Example Configuration File (`.notionrc`)

```json
{
  "db_id": "acd90da1199d4b6181cdc0c3eb90fdd8",
  "page_id": "",
  "name": "readme2notion",
  "token": "secret_iuvD3aTAUfDU4TvSt6PGVFWYYro2Oq14SIysNVSwmYX"
}
```

## How It Works

1. **Command-line Parsing**: The tool uses `commander` to parse command-line options and arguments.
2. **Configuration Loading**: It loads configuration from an `.notionrc` file using the `rc` module.
3. **Markdown Conversion**: It reads the input Markdown file and converts it to Notion blocks using `@tryfabric/martian`.
4. **Notion Operations**: It uses the Notion API to find, create, or update pages:
   - If a page ID is provided, it deletes the existing content and uploads the new blocks.
   - If no page ID is provided, it finds a page by name in the specified database or creates a new one if it doesn't exist.
5. **Configuration Saving**: If a new page is created, it updates the configuration file with the new page ID.

## Error Handling

The tool includes basic error handling to catch and log errors that occur during file reading, Notion API operations, and configuration saving.

## Acknowledgements

- [Notion API](https://developers.notion.com/)
- [Commander.js](https://github.com/tj/commander.js/)
- [rc](https://github.com/dominictarr/rc)
- [@tryfabric/martian](https://github.com/tryfabric/martian)

## Contact

For any questions or issues, please open an issue on GitHub or contact the maintainer at [Oriol Rius](mailto:oriol@oriolrius.me).
