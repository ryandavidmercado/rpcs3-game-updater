import axios from 'axios'
import * as https from 'https';
import * as xml2js from 'xml2js';
import * as inquirer from 'inquirer'
import * as cliProgress from 'cli-progress'

const Downloader = require('nodejs-file-downloader')

// TS Definitions --------------------------------------------------
interface Meta {
  titlepatch: {
    $: {
      status: string
      titleid: string
    }
    tag: {
      $: {
        name: string,
        popup: "true" | "false",
        signoff: "true" | "false" 
      },
      package: {
        $: {
          version: string,
          size: string,
          sha1sum: string,
          url: string,
          ps3_system_ver: string
        },
        paramsfo: {
          TITLE: Array<string>
        }[]
      }[]
    }[]
  }
}

type Package = Meta['titlepatch']['tag'][0]['package'][0]['$'];
interface ParsedMeta {
  packages: Package[],
  title: string
}
// -----------------------------------------------------------------

const grabber = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

const idToMeta = async (gameID: string): Promise<ParsedMeta> => {
  const res = await grabber.get(`https://a0.ww.np.dl.playstation.net/tpl/np/${gameID}/${gameID}-ver.xml`)
  const parsed: Meta = await xml2js.parseStringPromise(res.data);

  const packages = parsed.titlepatch.tag[0].package
  const title = packages[packages.length - 1].paramsfo[0].TITLE[0];
  return {
    packages: packages.map(update => update.$),
    title
  }
}

const main = async () => {
  console.clear();

  let gameID: string | undefined;
  const getGameMeta = async (): Promise<ParsedMeta> => {
    const answers = await inquirer.prompt([{
      name: 'gameID',
      message: "Enter the game ID (listed as 'Serial' in the RPCS3 GUI):"
    }])
    gameID = answers.gameID.toUpperCase().trim();

    if(typeof gameID === 'string') return await idToMeta(gameID);
    else throw null;
  }

  let meta: ParsedMeta | undefined;
  while(!meta) {
    try {
      meta = await getGameMeta();
    } catch {
      console.clear();
      console.log('Game update info not found! Please double check your game ID.\n');
    }
  }

  const progressBars = new cliProgress.MultiBar({
    format: '{versionNumber} | [{bar}] | {percentage}%',
    hideCursor: true,
    stopOnComplete: true,
  }, cliProgress.Presets.rect)

  console.clear();
  console.log(`${meta.title} - ${gameID}\n`);

  for(const update of meta.packages) {
    const progressBar = progressBars.create(100, 0, {
      versionNumber: update.version
    })
    const downloader = new Downloader({
      url: update.url,
      directory: `./UPDATES/${meta.title} - ${gameID}`,
      fileName: `${update.version} (${gameID}).pkg`,
      onProgress: (percentage) => {
        progressBar.update(Number(percentage))
      }  
    })
    downloader.download();
  }
}

main();

