# readme2notion

`readme2notion` is a command-line tool that converts a Markdown file to Notion blocks and uploads them to a specified Notion page. It finds or creates a page with the specified name in the provided Notion database. The page name is a combination of the system's hostname and a specified name from the configuration.

## Features

- Converts Markdown files to Notion blocks.
- Uploads content to a Notion page.
- Finds or creates a page based on a database ID and page name.
- Updates page properties such as hostname and Git commit hash.
- Handles large Markdown files by batching Notion API requests.

## Example

```bash
REPOS_PATH=/path/to/repos
docker pull ghcr.io/oriolrius/readme2notion
docker run --rm \
  --network host \
  -v ${REPOS_PATH}:/repos \
  ghcr.io/oriolrius/readme2notion \
    --notionToken ${NOTION_API_TOKEN} \
    --commit ${LATEST_COMMIT} \
    /repos/README.md
```

This command reads `README.md` and uploads its content to a Notion page as specified in the configuration.

### Parameters:

- `--network host`: Uses the host network to access the Notion API; this allows the tool to inherit the host's network settings and hostname.
- `-v ${REPOS_PATH}:/repos`: Mounts the local repository to the `/repos` directory in the container.
- `--notionToken`: (Required) Notion API token.
- `--commit`: (Optional) Git commit hash or tag.
- `/repos/README.md`: Path to the Markdown file to convert and upload.

**Note**: Images, attachments, and other non-text content are not supported.

## Command-Line Options

The `readme2notion` tool accepts the following command-line options:

- `--notionToken <token>` or `-n <token>`: (Required) The Notion API integration token. This token is used to authenticate with the Notion API. You must have a Notion integration set up with the necessary permissions.
- `--commit <commit_hash>` or `-t <commit_hash>`: (Optional) The latest Git commit hash. This is used to update the `GitCommit` property of the Notion page. Default is `'null'`.
- `--config <file_path>` or `-c <file_path>`: (Optional) Path to the JSON configuration file. This file contains the `db_id` (Notion database ID) and `name` (page name). Default is `/repos/.notion.json`.
- `--notionLimit <number>` or `-l <number>`: (Optional) Maximum number of blocks per Notion API request. The Notion API has a limit on the number of blocks that can be added in a single request. Default is `1000`.
- `--help`: Displays help information about the command-line options.

### Positional Arguments

- `<input-file>`: (Required) The path to the Markdown file to convert and upload to Notion.

## Configuration

The configuration file is automatically loaded from a file named `.notion.json` in the `/repos` directory, or you can specify a custom path using the parameter `--config` (`-c`). The configuration file should be in JSON format and include the following fields:

- `db_id`: The ID of the Notion database where the page will be created or updated.
- `name`: The name of the Notion page. The final page name will be a combination of the system's `hostname` and this `name`, formatted as `hostname/name`.

### Example Configuration File (`.notion.json`)

```json
{
  "db_id": "acd90da1199d4b6181cdc0c3eb90fdd8",
  "name": "readme2notion"
}
```

## How It Works

1. **Command-Line Parsing**: The tool uses `commander` to parse command-line options and arguments.
2. **Configuration Loading**: It loads configuration from a JSON file specified by the `--config` option (default is `/repos/.notion.json`).
3. **Hostname Retrieval**: It obtains the system's hostname using `os.hostname()` and uses it to construct the page name.
4. **Markdown Conversion**: It reads the input Markdown file and converts it to Notion blocks using `@tryfabric/martian`.
5. **Notion Operations**:
   - **Page Identification**: It searches for a page with the constructed name in the specified database.
   - **Page Creation or Update**: If the page exists, it updates its properties and content; otherwise, it creates a new page.
   - **Content Management**: It deletes existing content of the page and uploads the new blocks. If the number of blocks exceeds the Notion API limit, it handles this by batching the requests.
   - **Page Properties**: It updates the page's properties such as `Name`, `Hostname`, and `GitCommit`.

## Usage Scenario

In the `githooks/` directory, there is a `pre-push` hook that uses this tool to upload the `README.md` file to a Notion page. This is useful for keeping the documentation up-to-date and in sync with the repository.

As a developer, you can maintain the `README.md` file in the repository, and the `readme2notion` tool will keep the Notion page updated with the latest changes.

Without any extra effort, every time you push changes to the repository, the `README.md` file will be uploaded to the Notion page.

### The `pre-push` Hook 

The script is available publicly as a Gist [here](https://gist.githubusercontent.com/oriolrius/963795c149e11c084db763a578abc258/raw/iot-gw_stacks_pre-push). To use the `pre-push` hook, you can download it and save it in the `.git/hooks/` directory with the name `pre-push`. Alternatively, you can create a simple script that runs it directly from the Gist, like this:

```bash
#!/bin/bash

curl -s https://gist.githubusercontent.com/oriolrius/963795c149e11c084db763a578abc258/raw/iot-gw_stacks_pre-push | bash
```

## Prerequisites

- **Notion API Token**: You need a Notion API integration token with access to the database where the page will be created or updated.
- **Notion Database ID**: The ID of the Notion database where the page will be stored.
- **Docker**: If you are using the Docker image, ensure that Docker is installed on your system.
- **Node.js and npm**: If you are running the tool directly from the source code, you need Node.js and npm installed.

## Installation

### Using Docker

Pull the Docker image:

```bash
docker pull ghcr.io/oriolrius/readme2notion
```

### Building from Source

Clone the repository and install dependencies:

```bash
git clone https://github.com/oriolrius/readme2notion.git
cd readme2notion
npm install
```

## Limitations

- The tool currently does not support images, attachments, and other non-text content in the Markdown file.
- The Notion API has limitations on the number of blocks that can be added in a single request. The tool handles this by batching requests, but extremely large documents may still encounter issues.

## Acknowledgements

- [Notion API](https://developers.notion.com/)
- [Commander.js](https://github.com/tj/commander.js/)
- [@tryfabric/martian](https://github.com/tryfabric/martian)
- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)

## Contact

For any questions or issues, please open an issue on GitHub or contact the maintainer at [Oriol Rius](mailto:oriol@oriolrius.me).

Special thanks to [Nestor López](mailto:nestor@nstlopez.com) for his invaluable contribution to this project and his essential help in making this tool a reality.
