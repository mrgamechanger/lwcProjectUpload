# MCP Server Configuration for OmniStudio

This workspace has been configured with MCP (Model Context Protocol) support for OmniStudio analysis and integration.

## Configuration Details

**VS Code Settings** (`.vscode/settings.json`):
```json
{
  "modelContextProtocol": {
    "servers": {
      "omnistudio": {
        "command": "npx",
        "args": ["-y", "@sf-explorer/omnistudio-mcp-server"],
        "env": {
          "SF_AUTH_MODE": "sfdx",
          "SF_SFDX_ORG_ALIAS": "dev-ed",
          "SF_API_VERSION": "61.0"
        }
      }
    }
  }
}
```

## Usage Instructions

### 1. **Ensure Salesforce CLI Authentication**
The MCP server relies on SFDX authentication. Verify your org is authenticated:

```bash
sf auth list
```

If needed, authenticate:
```bash
sf org login web --alias dev-ed
```

### 2. **Using with AI Assistants**
Once configured, you can use prompts like:

> "Analyze dependencies for [OmniScript Name] with depth 5 in Mermaid format"

Example:
> "Analyze dependencies for api_cricket with depth 5 in Mermaid format"

### 3. **MCP Tools Available**
The OmniStudio MCP server provides tools for:
- Analyzing OmniScript dependencies
- Exploring Integration Procedures
- Understanding FlexCard configurations
- Dependency mapping in multiple formats (Mermaid, GraphViz, JSON)

## Environment Variables

If running the MCP server directly, set these environment variables:

```bash
export SF_AUTH_MODE=sfdx
export SF_SFDX_ORG_ALIAS=dev-ed
export SF_API_VERSION=61.0
```

## References

- [OmniStudio MCP Server GitHub](https://github.com/sf-explorer/omnistudio-mcp-server)
- [Model Context Protocol Docs](https://modelcontextprotocol.io/)
- [Salesforce CLI Documentation](https://developer.salesforce.com/docs/atlasing-tools/sfdx-cli/)

## Cricket API Integration

The `api_cricket` Integration Procedure is now available for analysis via MCP. Use the tools provided to understand its dependencies and structure.

## Troubleshooting

**Error: "Invalid configuration for selected auth mode"**
- Ensure you have authenticated with `sf org login web --alias dev-ed`
- Verify `SF_SFDX_ORG_ALIAS` matches your actual org alias
- Check that the SFDX auth credentials are stored locally

**MCP Server not found**
- Ensure you have a recent version of Node.js installed (v18+)
- Try running: `npx -y @sf-explorer/omnistudio-mcp-server` to verify availability
