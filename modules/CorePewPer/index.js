/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

import PogObject from "PogData"
import request from "requestV2/index";
const regex = {
	"message":/^(?:(?:(Guild|Party|Co-op|Officer) > )|(?:\[✌\] (?:\[[\w\s]+\] )??))?(\[\w{3,}\+{0,2}\] )?(\w{1,16})(?: \[\w{1,6}\])??: (.*)$/,
	"directmessage":/^From (\[\w{3,}\+{0,2}\] )?(\w{1,16}): (.*)$/,
	"party":/-{29}\n(?:\[\w{3,}\+{0,2}\] )?(\w{1,16}) has invited you to join (?:(\w{0,16})'s|their) party!\nYou have 60 seconds to accept\. Click here to join!\n-{29}/,
	"visit":/\[SkyBlock\] (\[\w{3,}\+{0,2}\] )?(\w{1,16}) is visiting Your Island!/,
	"joinleave":/^(Friend|Guild) > (\w{1,16}) (joined|left)\.$/
}
function getMessageFromEvent(event){
	return com.chattriggers.ctjs.Reference.MODVERSION === "2.0.0" ? new Message(event) : new Message(ChatLib.getChatMessage(event,true))
}

export function getLoc() {return String(Scoreboard.getLines().find(value => /.*⏣.*/.test(value))).replace(/(?:[&§][a-f\dk-or])|[^a-z\s']/gi,"").trim() ?? "None"}

export function Pregister(type, funct) {
	type = type.toLowerCase() ?? null
	if (!(typeof type === "string" && ["message","directmessage","party","visit","joinleave","test"].includes(type) && typeof funct === "function")) throw new TypeError(`Ya did smth wrong. (${typeof type}, ${typeof funct})`);

	switch (type){
		case "message": //Chat Message
			return register("chat", event => {
				if ((match = regex.message.exec(removeFormatting(ChatLib.getChatMessage(event,true))))) {
					let chattype = match[1]?.trim() ?? ""
					let rank = match[2]?.trim() ?? "" // imagine non L
					let name = match[3].replace(/[&§][a-fk-or\d]/g,"")
					let chat = match[4]
					if (Player.getName() !== name){
						funct(chattype, rank, name, chat, event)
					}
				}
			})
		case "directmessage":
		    return register("chat", (event) => {
                if ((match = regex.directmessage.exec(removeFormatting(ChatLib.getChatMessage(event,true))))) {
                    let rank = match[1]?.trim() ?? "" // non L
                    let name = match[2].replace(/[&§][a-fk-or\d]/g,"")
                    let chat = match[3]
                    if (Player.getName() !== name){
                        funct(rank, name, chat, event)
                    }
                }
            })
		case "party": //Party Invite
			return register("chat", (event) => {
				if ((match = regex.party.exec(removeFormatting(ChatLib.getChatMessage(event,true))))){
					let pinviter = match[1].replace(/[&§][a-fk-or\d]/g,"")
					let powner = match[2] ? match[2].replace(/[&§][a-fk-or\d]/g,"") : pinviter
					funct(pinviter, powner, event)
				}
			})
		case "visit": //Island Visit
			return register("chat", (event) => {
				if ((match = regex.visit.exec(removeFormatting(ChatLib.getChatMessage(event,true))))){
					let visitorrank = match[1]?.trim() ?? ""
					let visitor = match[2]
					funct(visitorrank, visitor, event)
				}
			})
		case "joinleave":
			return register("chat", (event) => {
				if ((match = regex.joinleave.exec(removeFormatting(ChatLib.getChatMessage(event,true))))){
					let type = match[1]
					let name = match[2]
					let action=match[3]
					funct(type,name,action,event)
				}
			})
		case "test":
			return register("chat", (event) => {
				funct(event)
			}).setCriteria("Test.").setContains()
	}
}
export const Pdata = new PogObject("CorePewPer", {})

export function prefix(mode) {return `&6[&c&l${mode}&r&6]&r `}
export function randList(arr) {return arr[Math.ceil(Math.random() * arr.length)-1]}
export function removeFormatting(str) {return str.replace(/[&§][a-fk-or\d]/g,"")}
export function escapeRegex(str) {return str.replace(/([\.*|?+()])/g,"\\$1")}
export function arrayToRegex(arr) {return regex = new RegExp(`:${arr.join("|").replace(/([\.*|?()])/g,"\\$1")}:`,"g")}

export function postWebhook(url,data){
	if (!url) return;
	request({
        url: url,
        method: "POST",
        headers: {
            'Content-type': 'application/json',
            'User-agent':'Mozilla/5.0'
        },
        body: {
            content: data
        }
    }).catch(() => {
    	throw new Error("Fool.")
    });
}

export function userUUID(username) {
	return request({
		url: "https://api.mojang.com/users/profiles/minecraft/"+username,
		json: true
	}).then(data => {
		return data.id
	})
}
export function userName(uuid) {
	return request({
		url:`https://api.mojang.com/user/profiles/${uuid}/names`,
		json: true
	}).then(data => {
		return data[data.length-1].name.trim()
	})
}