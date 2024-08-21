# readme2notion

`readme2notion` is a command-line tool that converts a Markdown file to Notion blocks and uploads them to a specified Notion page. It finds or creates a page with the specified name in the provided database.

## Features

- Converts Markdown files to Notion blocks.
- Uploads content to a Notion page.
- Finds or creates a page based on a database ID and page name.

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

Parameters:

- `--network host`: Uses the host network to access the Notion API, this is a trick for inherit the hostname.
- `-v ${REPOS_PATH}:/repos`: Mounts the repository the GIT repository.
- `--notionToken`: Notion API token.
- `--commit`: Git commit hash or tag.
- `/repos/README.md`: Path to the Markdown file to convert and upload.

**NOTE**: Images, attachments, and other non-text content are not supported.

## Configuration

The configuration file is automatically loaded from a file named `.notion.json` in the `/repos` directory or you can define the name and path using the parameter `--config` (`-c`). The configuration file should be in JSON format and include the following fields:

- `db_id`: The ID of the Notion database, where the page will be created/updated.
- `name`: The name of the Notion page. Final page name will be a combination of this name and the `hostname`: `hostname/name`.

### Example Configuration File (`.notionrc`)

```json
{
  "db_id": "acd90da1199d4b6181cdc0c3eb90fdd8",
  "name": "readme2notion"
}
```

## How It Works

1. **Command-line Parsing**: The tool uses `commander` to parse command-line options and arguments.
2. **Configuration Loading**: It loads configuration from a configuration file but it requires some additional parameters like `--notionToken` and `--commit`. This is because we don't want to store sensitive information in the repository.
3. **Markdown Conversion**: It reads the input Markdown file and converts it to Notion blocks using `@tryfabric/martian`.
4. **Notion Operations**: It uses the Notion API to find, create, or update the page. It finds a page by name in the specified database or creates a new one if it doesn't exist.

## How do I use it? Why is it useful?

In the `githooks/` directory, there is a `pre-push` hook that uses this tool to upload the `README.md` file to a Notion page. This is useful for keeping the documentation up-to-date and in sync with the repository.

As a developer you can mantain the `README.md` file in the repository and the `readme2notion` tool will keep the Notion page updated with the latest changes. 

Without any effort, every time you push changes to the repository, the `README.md` file will be uploaded to the Notion page.

### The `pre-push` hook 

The script available in publicly as a Gist [here](https://gist.githubusercontent.com/oriolrius/963795c149e11c084db763a578abc258/raw/iot-gw_stacks_pre-push). So, when you want to use the `pre-push` hook you can download it and save it in the `.git/hooks/` directory with the name `pre-push`. Or, just create a simple script that runs it directly from the Gist. Like this:

```bash
#!/bin/bash

curl -s https://gist.githubusercontent.com/oriolrius/963795c149e11c084db763a578abc258/raw/iot-gw_stacks_pre-push | bash
```

## Acknowledgements

- [Notion API](https://developers.notion.com/)
- [Commander.js](https://github.com/tj/commander.js/)
- [rc](https://github.com/dominictarr/rc)
- [@tryfabric/martian](https://github.com/tryfabric/martian)

## Contact

For any questions or issues, please open an issue on GitHub or contact the maintainer at [Oriol Rius](mailto:oriol@oriolrius.me).

Special thanks to [Nestor López](nestor@nstlopez.com) for his invaluable contribution to this project and his essential help in making this tool a reality.
