import { Setting, SettingsObject } from 'SettingsManager/SettingsManager';
import { blocksPerLevel } from './constants';


const settings = new SettingsObject('CompactProgressTracker', [
	{
        name: 'display settings',
		settings: [
			new Setting.Toggle('Enabled', true),
			new Setting.Toggle('Text Shadow', true),
			new Setting.TextInput('Prefix', '&7[&5Compact&7] &f'),
			new Setting.Slider('x', 0.0015, 0, 1920).setHidden(false),
			new Setting.Slider('y', 0.230, 0, 1080).setHidden(false),
			new Setting.Toggle('CompactClear', true),
		],
	},
]).setCommand('compact').setSize(250, 130);

Setting.register(settings);


const maxLevel = Math.max(...Object.keys(blocksPerLevel));

const getNextBlockCount = blocks => {
	let nextBlockCount;

	for (let index = 1; index <= maxLevel; index++) {
		nextBlockCount = blocksPerLevel[index];
		if (blocks < blocksPerLevel[index]) break;
	}

	return nextBlockCount;
}


const compactDisplay = new Display();

compactDisplay.addLine(1);

compactDisplay.setRenderLoc(
    Renderer.screen.getWidth() * settings.getSetting('display settings', 'x'),
    Renderer.screen.getHeight() * settings.getSetting('display settings', 'y'),
);

// draw display
register('renderOverlay', () => {
    if (!settings.getSetting('display settings', 'Enabled')) return compactDisplay.shouldRender = false;

	compactDisplay.shouldRender = true;
	compactDisplay.setRenderLoc(
        settings.getSetting('display settings', 'x'),
        settings.getSetting('display settings', 'y'),
	);

    let blocks = '-';

	Player
        .getInventory()
        .getItems()
        // .filter(item => item.getID() === 285)
        .reverse()
        .forEach(item => {
            const nbtData = item.getItemNBT().getCompoundTag('tag').getCompoundTag('ExtraAttributes');
            if (!nbtData.get('compact_blocks')) return;
            blocks = nbtData.getInteger('compact_blocks');
        });


    compactDisplay.setLine(1, new DisplayLine(`${settings.getSetting('display settings', 'Prefix')}${blocks}/${isNaN(blocks) ? '-' : getNextBlockCount(blocks)}`).setShadow(settings.getSetting('display settings', 'Text Shadow')));
	compactDisplay.render();
});

cancelCompact = function(block, event) {
    	if(settings.getSetting("display settings", "CompactClear")) {
    	cancel(event);
  	}
}  

compactChat = register("chat", cancelCompact);
    compactChat.setChatCriteria("COMPACT! You found a ${block}!");  