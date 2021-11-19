/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />
import * as Core from "CorePewPer/index"
//import { addCustomCompletion } from "CustomTabCompletions";

Core.Pdata.autosave()
if (!Core.Pdata?.ignored) Core.Pdata.ignored = []
if (!Core.Pdata?.filter) Core.Pdata.filter = {}
if (!Core.Pdata?.afk) Core.Pdata.afk = {"reasons":["I'm afk!"],"joinleave":true,"guildreply":true,"webhook":""}
if (!Core.Pdata?.aliases) Core.Pdata.aliases = {};
if (!Core.Pdata?.clean) Core.Pdata.clean = [];

Array.prototype.toString = function(){return JSON.stringify(this)}
/* TODO:
OurClean
[OurFriends]
[OurTunes]

Get chat parts by TextComponents, maybe
Add toggleable settings for like everything
Standardize messages, colorize
*/

const emojis = {	
	"hi|hello|wave":"ヾ(＾∇＾)",
	"bye|cya":"(^-^)/",
	"fp|sigh|ugh|facepalm":"( ¬_ლ)",
	"shrug":"¯\\_(ツ)_/¯",
	"nice|yay|+1":"(b＾▽＾)b",
	"sad|cry|sob":"|(╥_╥)\\",
	"huh|hmm|confused":"Σ(-᷅_-᷄๑)?",
	"mad|angry|grr":"p(╬ಠ益ಠ)/",
	"cool|rad|shades":"(▀̿Ĺ̯▀̿ ̿)",
	"bruh":"╭( ๐ _๐)╮",
	"lenny":"( ͡° ͜ʖ ͡°)",
	"blush|uwu":"≧◡≦",
	"amogus|amongus|sus":"ඞ",
	"yep|check":"✔",
	"type|writing":"✎...",
	"spell|magic":"('-')⊃━☆ﾟ.*･｡ﾟ",
	"party":"ヽ(^◇^*)/",
	"blank|empty":"ࠀ",
	"blank2|empty2":"⛬"
} // for emoticons
const ourtools = {
	afk: false,
	afknotif: true
} // random global vars
const helpmsgs = {
	get: type => {
		return ChatLib.addColor(`&c${ChatLib.getChatBreak("=")}\n&r${ChatLib.getCenteredText(Core.prefix(type)+"&6Help:")}\n&r${helpmsgs[type] ?? "Error."}\n&c${ChatLib.getChatBreak("=")}`)
	},
	"OurFilter":`
&r/ourfilter add '<word>' <actions> &9- Adds 'word' to our filter, with actions.
   &aActions:&r ignore &9- OurIgnore player &r/ hide &9- Hide message &r/ censor &9- Censor match&r, pleave &9- Leave Party&r, preport &9- Watchdog Report Player
&r/ourfilter remove <'<word>',index> &9- Removes 'word', or the word at index.
&r/ourfilter list &9- Lists all filters & actions.`,
	"OurIgnore":`
&r/ourignore add <user> &9- Ignores 'user'.
&r/ourignore remove <user> &9- Unignores 'user'.
&r/ourignore list &9- Lists all ignored users. Unpaginated.`,
	"OurClean":`
&r/ourclean add '<msg>' <[block,killfeed,notify]> &9- Adds 'msg' to OurClean, with actions.
   &7Use '&' instead of the section symbol. RegEx filters must be surrounded by '/'.
&r/ourclean remove <'<msg>',num> &9- Removes 'msg' from OurClean, or the msg at num.
&r/ourclean list &9- Lists all messages & actions.
&r/ourclean reload &9- Reloads clean.txt.`,
	"OurAFK":`
&r/ourafk toggle (/afk) &9- Toggle OurAFK.
&r/ourafk debug &9- View OurAFK status.
&r/ourafk config reasons <add/remove/list> <text> &9- Modify & View OurAFK reasons.
&r/ourafk config <joinleave/guildreply> &9- Toggle afk join/leave messages and guild mention afk replies.
&r/ourafk config webhook <get/set> <(Your webhook url)> &9- Get/Set your notification webhook url.
   &7Originally made by BlueSkeppy and xMdP, revamped by AutomaticKiller, rerevamped elaborately by ComPewPer.`,
   "EmoticonZ":`
&r/em &9- Lists all available emojis.
&r/em coords <chat> &9- Sends your current coordinates to <chat>.
&r:<emojiname>: &9- Sends the emoji associated with <emojiname>.
`,
   "OurAliases":`
&r/ouraliases add <aliasname> /<command> &9- Adds /<alias>, which runs /<command>.
&r/ouraliases remove <alias/index> &9- Removes 'alias' or the alias at index.
&r/ouraliases list &9- Lists all aliases. Unpaginated.`
}

Core.Pregister("message", onMessage);
Core.Pregister("directmessage",onDM);
Core.Pregister("party", onParty);
Core.Pregister("visit", onVisit);
Core.Pregister("joinleave",onJoinLeave)
register("command",() => ChatLib.chat(Core.prefix("OurTools")+"&6Commands:&r &9/ourfilter&r, &9/ourafk&r, &9/ourignore&r, &9/em&r, &9/ouraliases&r")).setName("ourhelp")
register("command",ourFCommands).setName("ourfilter"); //1-1
register("command",ourACommands).setName("ourafk");    //1-2
register("command",ourICommands).setName("ourignore"); //1-3
register("command",ourECommands).setName("em");		   //1-4
register("command",ourZCommands).setName("ouraliases");//1-5
register("command",ourCCommands).setName("ourclean");  //1-6
function onMessage(chattype, rank, name, message, fullmsg) {
	Core.userUUID(name).then(uuid => {
		if (Core.Pdata.ignored.includes(uuid)) return; // hide ignored messages

		//console.log(`${Core.removeFormatting(fullmsg.getFormattedText())} || <${chattype}> [${rank}] ${name}: ${message}`)
		for ([filter,actions] of Object.entries(Core.Pdata.filter)) {
			if (message.toLowerCase().includes(filter.toLowerCase())) {
				if(actions.includes("ignore")) {
					ourICommands('add',name,silent=true);
					fullmsg = undefined;
					break; // exit and hide msg
				}else if (actions.includes("hide")) {
					fullmsg = undefined;
					break; // exit and hide msg
				}else if (actions.includes("censor")) {
					fullmsg = new Message(fullmsg.getFormattedText().replace(filter,"&c"+"*".repeat(filter.length)+"&r"))
				}
				if (chattype.includes("Party")){
					if(actions.includes("pleave")) ChatLib.command("p leave");
					if(actions.includes("preport")) ChatLib.command(`wdr ${name} -b PC_C`);
				}
			}
		}
		if (fullmsg) {ChatLib.chat(fullmsg)}
		else {console.log("Hid message: "+message)}

		if (ourtools.afk && Core.Pdata.afk.guildreply && chattype.includes("Guild") && message.includes(Player.getName())) ChatLib.command(`gc Hey ${name}, ${Core.randList(Core.Pdata.afk.reasons)}`)
	}).catch(e => console.error(e.message))
}
function onDM(rank,name,message,fullmsg){
	Core.userUUID(name).then(uuid => {
		if (Core.Pdata.ignored.includes(uuid)) return; // hide ignored messages

		for ([filter,actions] of Object.entries(Core.Pdata.filter)) {
			if (message.toLowerCase().includes(filter.toLowerCase())) {
				if(actions.includes("ignore")) {
					Core.userUUID(name).then(uuid => {
						if (!Core.Pdata.ignored.includes(uuid)){
							ChatLib.chat(Core.prefix("OurIgnore")+`&e${name}&a was added to the ignore list.`)
							Core.Pdata.ignored.push(uuid)
						}
					}).catch(e => console.error(e.message))
					fullmsg = undefined;
					break; // exit and hide msg
				}else if (actions.includes("hide")) {
					fullmsg = undefined;
					break; // exit and hide msg
				}else if (actions.includes("censor")) {
					fullmsg = new Message(fullmsg.getFormattedText().replace(filter,"&c"+"*".repeat(filter.length)+"&r"))
				}
			}
		}
		if (fullmsg) ChatLib.chat(fullmsg);
	
		if (ourtools.afk) ChatLib.command(`w ${name} ${Core.randList(Core.Pdata.afk.reasons)}`)
	}).catch(e => console.error(e.message))
}
function onParty(inviter, owner, fullmsg) {
	Core.userUUID(inviter).then(inviter => {if (!Core.Pdata.ignored.includes(inviter)){
		Core.userUUID(owner).then(owner => {if (!Core.Pdata.ignored.includes(owner)){
			if (ourtools.afk) {
				new Thread(() => {
					Thread.sleep(2000);
					ChatLib.command("p accept "+inviter)
					Thread.sleep(1000);
					ChatLib.command("pc "+Core.randList(Core.Pdata.afk.reasons))
					Thread.sleep(1000);
					ChatLib.command("p leave")
				}).start()
			}
			ChatLib.chat(fullmsg)
		}}).catch(e => console.error(e.message))
	}}).catch(e => console.error(e.message))
}
function onVisit(rank, visitor, fullmsg) {
	ChatLib.chat(fullmsg)
	if (ourtools.afk){
		if (Core.getLoc().includes("Your Island")){
			ChatLib.command(`ac Hey ${visitor}, ${Core.randList(Core.Pdata.afk.reasons)}`)
		}else{
			ChatLib.command(`w ${visitor} ${Core.randList(Core.Pdata.afk.reasons)}`)
		}
	}
}
function onJoinLeave(type,name,action,fullmsg) {
	if (!(ourtools.afk && Core.Pdata.afk.joinleave)) ChatLib.chat(fullmsg)
}
function ourFCommands(choice, ...args) {
	let prefix = Core.prefix("OurFilter")
	let errors = {syntax:`Incorrect syntax! Use /ourfilter for help!`,alrin:" is already being filtered! Remove it first!",notin:" wasn't a filter! Add it first."}

	let filter = Core.Pdata.filter
	args = args?.join(" ")
	let argz;
	let filterword;
	let filteractions;
	switch (choice){
		case 'add':
			if (((argz = args?.split("'"))?.length !== 3) || !((filteractions = argz[2].replace(/\s/g,"").split(",")) && filteractions[0]?.length > [0] && (filterword = argz[1]).length > 1)) return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			if(Object.keys(filter).includes(filterword)) return new Message(`${prefix}'${filterword}'${errors.alrin}`).setChatLineId(10001).chat()
			Core.Pdata.filter[filterword] = filteractions
			new Message(prefix+`'${filterword}' is now being filtered!`).chat() // no id because i want the messages to stay
		break;
		case 'remove':
			if (!
				(filterword = args?.split("'").length === 3 
					? args.split(`'`)[1] 
					: (!isNaN(args.replace(/\s/g,""))
						? Object.keys(filter)[Number(args.replace(/\s/g,""))-1] 
						: false
					)
				)
			) return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			if(!Object.keys(filter).includes(filterword)) return new Message(`${prefix}'${filterword}'${errors.notin}`).setChatLineId(10001).chat()
			delete Core.Pdata.filter[filterword]
			new Message(prefix+`'${filterword}' is no longer being filtered!`).chat() // message stacking enabled; no id
		break;
		case 'list':
			new Message(prefix+"OurFilter:\n").setChatLineId(1131)
				.addTextComponent(Object.keys(Core.Pdata.filter).length > 0 ? (Object.entries(filter).map(([k,v],i) => `${prefix} ${i+1}> '${k}': ${v.join(", ")}`)).join("\n") : `\n${prefix}None!`)
				.chat()
		break;
		default:
			new Message(helpmsgs.get("OurFilter")).setChatLineId(1140).chat()
		break;
	}
}
function ourICommands(choice, arg1, silent=false){
	let prefix = Core.prefix("OurIgnore")
	let errors = {syntax:`Incorrect syntax! Use /ourignore for help!`,alrin:" is already ignored! Unignore them first.",notin:" wasn't ignored! Ignore them first.",invalid:"Invalid User."}
	switch(choice){
		case 'add':
			if (!arg1) return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			Core.userUUID(arg1).then(uuid => {
				if (Core.Pdata.ignored.includes(uuid) && !silent) return new Message(`${prefix}'${arg1}'${errors.alrin}`).setChatLineId(10001).chat()
				Core.Pdata.ignored.push(uuid)
				ChatLib.chat(prefix+`${arg1} is now being ignored.`) //should stack
			}).catch(e => {
				new Message(prefix+errors.invalid).setChatLineId(10002).chat()
			})
		break;
		case 'remove':
			if (!arg1) return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			Core.userUUID(arg1).then(uuid => {
				if (!Core.Pdata.ignored.includes(uuid) && !silent) return new Message(`${prefix}'${arg1}'${errors.notin}`).setChatLineId(10001).chat()
				Core.Pdata.ignored.splice(Core.Pdata.ignored.indexOf(uuid),1)
				ChatLib.chat(prefix+`${arg1} was removed from the ignore list.`) //should stack
			}).catch(e => {
				new Message(prefix+errors.invalid).setChatLineId(10002).chat()
			})
		break;
		case 'list': // REQUIRES REWORK.
			let imsg = new Message(prefix+"OurIgnored: ").setChatLineId(1331).chat()
			if (!(Core.Pdata.ignored.length > 0)) return ChatLib.chat(prefix+"None!")
			for (let uuid of Core.Pdata.ignored){
				Core.userName(uuid).then(uname => {
					ChatLib.chat(prefix+` - ${uname}`)
				}).catch(console.error)
			}
		break;
		default:
			new Message(helpmsgs.get("OurIgnore")).setChatLineId(1340).chat()
		break;
	}
}
function ourACommands(choice, subchoice, sub2, ...args) {
	let prefix = Core.prefix("OurAFK")
	let errors = {syntax:`Incorrect syntax! Use /ourafk for help!`}
	switch (choice){
        case 'toggle': 
			if (!(ourtools.afk = !ourtools.afk)) ourtools.afknotif = true;
			new Message(prefix+(ourtools.afk ? "&aYou are now AFK!" : "&cYou are no longer AFK!")).setChatLineId(1210).chat()
		break;
		case 'debug':
			new Message(prefix+(ourtools.afk ? "&aYou are currently AFK." : "&cYou are not AFK.")).setChatLineId(1221).chat()
		break;
		case 'config': // requires rework
			let da = Core.Pdata.afk
			switch (subchoice){
				case 'reasons':
					let argz = args.join(" ")
					switch (sub2){
						case 'add':
							if (!da.reasons.includes(argz)){
								da.reasons.push(argz)
								ChatLib.chat(prefix+"Added a message to OurAFK replies.")
							}else{
								ChatLib.chat(prefix+"You already had that message in your replies.")
							}
							break;
						case 'remove':
							if (da.reasons.includes(argz)){
								da.reasons.splice(da.reasons.indexOf(argz),1)
								ChatLib.chat(prefix+"Removed a message from OurAFK replies.")
							}else{
								ChatLib.chat(prefix+"That message wasn't in your replies.")
							}
							break;
						case 'list':
							if (!da.reasons) da.reasons.push("I'm afk!")
							ChatLib.chat(`${prefix}Available Reasons:\n${prefix}- `+da.reasons.join(`\n${prefix}- `))
							break;
					}
					break;
				case 'joinleave':
					da.joinleave = !da.joinleave
					ChatLib.chat(prefix+`&cFriend & Guild Join/Leave Messages will now be ${da.joinleave ? 'hidden' : 'shown'}.`)
					break;
				case 'guildreply':
					da.guildreply = !da.guildreply
					ChatLib.chat(prefix+`&aGuild members who mention you will ${da.guildreply ? '' : 'not '}be notified.`)
					break;
				case 'webhook':
					if (sub2 === "set"){
						da.webhook = args.join(" ").trim()
						new Message(prefix+`&aWebhook URL has been set to ${da.webhook}. `).setChatLineId(1431).chat()
					}else{
						new Message(prefix+`&aYour webhook URL is ${da.webhook}.`).setChatLineId(1432).chat()
					}
					break;
				default:
					ChatLib.chat(prefix+errors.syntax)
					break;
			}
			break;
		default:
			new Message(helpmsgs.get("OurAFK")).setChatLineId(1240).chat()
		break;
	}
}
function ourECommands(choice, chatc) {
	let prefix = Core.prefix("EmoticonZ")
	chat = {"a":"ac", "p":"pc", "g":"gc", "r":"r"}[chatc ?? "a"] ?? "w "+chatc
	if (choice === "coords") return ChatLib.command(`${chat} Coords: (${Math.round(Player.getX(),0)}, ${Math.round(Player.getY(),0)}, ${Math.round(Player.getZ(),0)})`)
	if (choice === "help") return new Message(helpmsgs.get("EmoticonZ")).setChatLineId(1420)

	let msg = new Message(prefix+"&a&lEmoji Options:").setChatLineId(1431)
	Object.entries(emojis).forEach(([key,value]) => {
		msg.addTextComponent(`\n &3-&r &9${key}&f: `)
			.addTextComponent(new TextComponent(`&b${value}`).setClick("run_command", "/ct copy "+value).setHover("show_text", "Copy this emoticon!"))
	})
	msg.chat()
}
function ourZCommands(choice, arg1, ...args){
	let prefix = Core.prefix("OurAliases")
	let errors = {syntax:`Incorrect syntax! Use /ouraliases for help!`,alrin:" is already an alias! Remove it first.",notin:" wasn't an alias! Add it first."}
	switch (choice){
		case "add": //ouraliases add dun /warp dungeon_hub
			let argz = args?.join(" ")
			if (!(arg1 && argz?.startsWith("/"))) return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			if (Object.keys(Core.Pdata.aliases).includes(arg1)) return new Message(prefix+"'/"+arg1+"'"+errors.alrin).setChatLineId(10001).chat()
			Core.Pdata.aliases[arg1] = argz.slice(1)
			new Message(prefix+`'/${arg1}' now runs '/${Core.Pdata.aliases[arg1]}'!`).setChatLineId(1511).chat()
		break;
		case "remove": //ouralises remove dun //ouraliases remove 2
			if (!arg1) return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			if (!isNaN(arg1) && Number(arg1) <= Object.keys(Core.Pdata.aliases).length) arg1 = Object.keys(Core.Pdata.aliases)[Number(arg1)-1]
			if (!Object.keys(Core.Pdata.aliases).includes(arg1)) return new Message(prefix+"'/"+arg1+"'"+errors.notin).setChatLineId(10001).chat()
			delete Core.Pdata.aliases[arg1]
			new Message(prefix+`'/${arg1}' has returned to its default state!`).setChatLineId(1521).chat()
		break;
		case "list": //ouraliases list
			new Message(prefix+"OurAliases:\n").setChatLineId(1530)
				.addTextComponent(Object.keys(Core.Pdata.aliases).length > 0 ? (Object.entries(Core.Pdata.aliases).map(([k,v],i) => `${prefix}${i+1}> /${k} -> /${v}`)).join("\n") : `  None!`)
				.chat();
		break;
		default:
			new Message(helpmsgs.get("OurAliases")).setChatLineId(1540).chat()
		break;
	}
}
function ourCCommands(choice, ...args){ //indev
	return;
	let prefix = Core.prefix("OurClean")
	let errors = {syntax:`Incorrect syntax! Use /ourclean for help!`,alrin:" is already being cleaned!",notin:" wasn't being cleaned!"}
	args = args.join(" ")

	switch (choice){
		case 'add':
			//return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			if(Core.Pdata.clean.includes(filterword)) return new Message(`${prefix}'${args}'${errors.alrin}`).setChatLineId(10001).chat()
			Core.Pdata.clean.push(args)
			new Message(prefix+`'${filterword}' is now being filtered!`).chat() // stack on
		break;
		case 'remove':
			if (!
				(filterword = args?.split("'").length === 3 
					? args.split(`'`)[1] 
					: (!isNaN(args.replace(/\s/g,""))
						? Object.keys(filter)[Number(args.replace(/\s/g,""))-1] 
						: false
					)
				)
			) return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			if(!Object.keys(filter).includes(filterword)) return new Message(`${prefix}'${filterword}'${errors.notin}`).setChatLineId(10001).chat()
			delete Core.Pdata.filter[filterword]
			new Message(prefix+`'${filterword}' is no longer being filtered!`).chat() // message stacking enabled; no id
		break;
		case 'list':
			new Message(prefix+"OurFilter:\n").setChatLineId(1131)
				.addTextComponent(filter.size() > 0 ? (Object.entries(filter).map(([k,v],i) => `${prefix} ${i+1}> '${k}': ${v.join(", ")}`)).join("\n") : `\n${prefix}None!`)
				.chat()
		break;
		default:
			new Message(helpmsgs.get("OurFilter")).setChatLineId(1140).chat()
		break;
	}
}

register("command", () => {
	let prefix = Core.prefix("OurAFK")
	ourtools.afk = !ourtools.afk;
	if (ourtools.afk) {
		ChatLib.chat(prefix+"&aYou are now AFK!");
	} else {
		ourtools.afknotif = true
		ChatLib.chat(prefix+"&cYou are no longer AFK!");
	}
}).setName("afk")
register("chat", () => {
	ourtools.afk = true;
	ChatLib.chat(Core.prefix("OurAFK")+"&aYou are now AFK because you were sent to limbo.")
}).setCriteria("&cYou are AFK. Move around to return from AFK.&r").setParameter("contains");
register("worldLoad", () => {
	if(ourtools.afk) {
		setTimeout(() => {
			if ((!Core.getLoc().includes("Island")) && ourtools.afknotif && Core.Pdata.afk.webhook) {
				Core.postWebhook(Core.Pdata.afk.webhook,"You have been kicked from your island! (AFK Kick)"+` [To '${Core.getLoc()}']`)
				ourtools.afknotif = false
			}
		}, 7*1000)
		new Message(new TextComponent(Core.prefix("OurAFK")+"&cYou are still AFK!"),new TextComponent(" &6Click to toggle AFK.").setClick("run_command", "/ourafk toggle").setHover("show_text", "Runs /ourafk toggle")).setChatLineId(6969).chat()
	}
})
register("worldunload", () => {
	setTimeout(()=>{
		if (Server.getIP() !== "") return;
		if (ourtools.afk) Core.postWebhook(Core.Pdata.afk.webhook,"You have been kicked from your island! (Disconnected)");
	},2000)
})

register("messageSent", (msg,event) => {
	let newmsg = msg

	if (msg.startsWith("/") && (ncmd = Core.Pdata.aliases[msg.slice(1)])) newmsg = "/"+ncmd
	for ([emname,emval] of Object.entries(emojis)){
		emname = `:(?:${emname.replace(/([\.*?+()])/g,"\\$1")}):`
		newmsg = newmsg.replace(new RegExp(emname,"g"),emval)
	}

	if (newmsg === msg) return;
	cancel(event)
	ChatLib.say(newmsg)
}) // alias and emoji magic happens here