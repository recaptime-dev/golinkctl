# `golinkctl`

TypeScript-based CLI for managing your <https://github.com/tailscale/golink> compatible API and
friends, built in Deno using [`jsr:@cliffy/command`](https://jsr.io/@cliffy/command) library
instead of [`npm:commander`](https://npmjs.com/package/commander).

## Install

> **Note**: Currently works only on Deno for now, but feel free to contribute patches
> for npm and bun support

Requires Tailscale to be installed and authenicated with MagicDNS enabled
if you want to use the default base URL.

```bash
deno install -gArf jsr:@recaptime-dev/golinkctl
```

## Usage

* `golinkctl set http://reallylonglink.com your-mom` - create a golink with custom short link
(omit `your-mom` to generate a 8-character slug)
  * note that you can reuse the `set` command to update existing golinks
  * to avoid confusion and to ease integration, command aliases `new` and `update` exist
* `golinkctl info <short>` - get information about a golink
* `golinkctl export -f ./bak` -  back up JSON Lines-formatted golinks DB
* `golinkctl --url https://go.andreijiroh.dev --api-key ${GITHUB_TOKEN} ...` - example usage for @ajhalili2006's golink server

### Environment variables / global flags

* `GOLINK_URL` / `-u | --url` - defaults to `http://go`
* `GOLINK_API_KEY` / `-k | --api-key` - golink API key

## License

MPL-2.0
