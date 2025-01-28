#!/usr/bin/env -S deno run -A
import { Command } from "@cliffy/command";
import { exit } from "jsr:@cliffy/internal@1.0.0-rc.7/runtime/exit";

// types go here
const headers: Record<string, string> = {
  "Sec-Golink": "1",
  "Authorization": ""
}

type GoLinkData = {
  Short: string,
  Long: string,
  Created: string,
  LastEdit: string,
  Owner: string,
  Clicks?: number
}

// utility function go here
function generateSlug(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function getBaseGolink(url: string) {
  if (url == "http://go") {
    const chaos = await fetch(url)
    return chaos.url
  } else {
    return url
  }
}

// the main entrypoint
const command = await new Command()
  .name("golinkctl")
  .env(
    "URL=<url:string>",
    "base URL of the golink server, used if you manage another tailnet's golink server using shared machines or building your own over the internet",
    { global: true, required: false, prefix: "GOLINK_", value: () => "http://go" }
  )
  .env(
    "API_KEY=<apiKey:string>",
    "Golink API key, used by custom implementations of golink server (see https://github.com/andreijiroh-dev/golinks for context)",
    { global: true, required: false, prefix: "GOLINK_", value: () => "" }
    )
  .description("manage your golinks for https://github.com/tailscale-dev/golink compat API servers")
  .globalOption("-u, --url [url:string]", "the base URL of your golink server", {
    default: "http://go"
  })
  .globalOption("-k, --api-key [apiKey:string]", "API key for some custom golink server implementation")
  .action(() => {
    console.log("I don't usually run without subcommands! See help for hints")
    exit(1)
  })

command.command("set", "create a new golink (or update a existing one)")
  .alias("new").alias("update")
  .arguments("<target:string [golink:string]")
  // @ts-ignore: I know the risks of being not typed here
  .action(async(options, ...args: Array<string>) => {
    const long = args[0]
    const short = args[1] || generateSlug(8)

    if (options.apiKey) {
      headers.Authorization = `bearer ${options.apiKey}`
    }
    headers["Content-Type"] = "application/x-www-form-urlencoded"

    try {
      const data = await fetch(await getBaseGolink(`${options.url}`), {
        method: "POST",
        body: new URLSearchParams({
          long,
          short
        }),
        headers,
        redirect: "follow"
      })

      if (data.ok == true) {
        const json: GoLinkData = await data.json()

        const log =`\
Short: ${json.Short}
Long: ${json.Long}
Created on: ${json.Created}
Owner: ${json.Owner}
Last edited: ${json.LastEdit}`
        console.log(log)
      }
    } catch (error) {
      console.error(error)
      exit(1)
    }
  })

// info
command.command("info", "show details about a golink")
  .arguments("<golink:string>")
  // @ts-ignore: I know the risks of being not typed here
  .action(async (options, args) => {
    if (options.apiKey) {
      headers.Authorization = `bearer ${options.apiKey}`
    }

    try {
      const data = await fetch(`${options.url}/${args}+`, {
        headers,
        redirect: "follow"
      })

      if (data.status === 404) {
        console.error(`error: golink ${args} does not exist`)
        Deno.exit(1)
      }
      const json: GoLinkData = await data.json()

      // print the hell out
      const log = `\
Short: ${json.Short}
Long: ${json.Long}
Created on: ${json.Created}
Owner: ${json.Owner}
Last edited: ${json.LastEdit}
Clicks/opens: ${json.Clicks || 0}`

      console.log(log)
    } catch (error) {
      console.error(error)
      exit(1)
    }
  })

// export
command.command("export", "export your golinks in JSON Lines format")
  .option("-f, --file <file:file>", "path to output file for exports instead of via stdout")
  // @ts-ignore: I know the risks of being not typed here
  .action(async (options) => {
    if (options.apiKey) {
      headers.Authorization = `bearer ${options.apiKey}`
    }

    try {
      const data = await fetch(`${options.url}/.export`, {
        headers,
        redirect: "follow"
      })
      const text = await data.text()

      if (options.file == null) {
        console.log(text)
      } else {
        await Deno.writeTextFile(options.file, text)
        console.log("Successfully written to "+options.file)
      }
    } catch (error) {
      console.error(error)
      exit(1)
    }
  })

command.parse(Deno.args)