const customTabs = {};
const guiClassNames = [
  "net.optifine.gui.GuiChatOF",
  "net.minecraft.client.gui.GuiChat",
  "net.labymod.ingamechat.GuiChatCustom",
];

function addCustomCompletion(command, callback) {
  let commandName = ReflectionHelper.getPrivateValue(
    Java.type("com.chattriggers.ctjs.triggers.OnCommandTrigger"),
    command,
    "commandName",
    "commandName"
  );

  let originalCommand = ReflectionHelper.getPrivateValue(
    Java.type("com.chattriggers.ctjs.triggers.OnCommandTrigger"),
    command,
    "command",
    "command"
  );
  customTabs[commandName] = { callback, originalCommand };
}

function addGuiClassName(classname) {
  if (!guiClassNames.includes(classname)) guiClassNames.push(classname);
}

const CTCommand = Java.type("com.chattriggers.ctjs.commands.Command");

register("guiKey", (key, code, gui) => {
  if (code != Keyboard.KEY_TAB) return;
  if (guiClassNames.includes(gui.class.getName())) {
    let currentMessage = Client.getCurrentChatMessage();
    if (!currentMessage.startsWith("/")) return;
    let args = currentMessage.slice(1).split(/ +/);

    if (!Object.keys(customTabs).includes(args[0])) return;
    const command = args.shift();

    const completions = customTabs[command].callback(args);

    let completionList = new ArrayList(completions.length);
    for (let completion of completions) {
      completionList.add(completion);
    }

    ReflectionHelper.setPrivateValue(
      CTCommand,
      customTabs[command].originalCommand,
      completionList,
      "tabCompletionOptions",
      "tabCompletionOptions"
    );
  }
});

module.exports = { addCustomCompletion, addGuiClassName };
