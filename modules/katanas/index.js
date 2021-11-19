import PogObject from "PogData"
import * as Core from "CorePewPer/index"


const Pdata = new PogObject('katanas', {})
Pdata.autosave()
if (!Pdata.purse) Pdata.purse = 0
if (!Pdata.bits) Pdata.bits = 0
if (!Pdata.location) Pdata.location = ''

function katanasCom(choice, subchoice, ...args) {
  switch (choice) {
    case 'purse':
      Pdata.purse = Scoreboard.getLineByIndex(3).toString().split(': ')[1].replace(/(?:[&§][a-f\dk-or])|[^a-z0-9\s']/gi,"")
      ChatLib.chat(Pdata.purse)
      break;
    case 'bits':
      Pdata.bits = Scoreboard.getLineByIndex(2).toString().split(': ')[1].replace(/(?:[&§][a-f\dk-or])|[^a-z0-9\s']/gi,"")
      ChatLib.chat(Pdata.bits)
      break;
    case 'location':
      Pdata.location = Scoreboard.getLineByIndex(5).toString().replace(/(?:[&§][a-f\dk-or])|[^a-z0-9\s']/gi,"").substr(2)
      ChatLib.chat(Pdata.location)
      break;
  }
}
register("command", katanasCom).setCommandName("katanas")
